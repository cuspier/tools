import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

const CHUNK_SIZE = 16384; // 16KB chunks

interface ShareStats {
  progress: number; // 0 to 100
  speed: number; // MB/s
  remainingTime: number; // seconds
  status: 'idle' | 'ready' | 'connecting' | 'transferring' | 'completed' | 'failed' | 'disconnected';
  peerId: string | null;
  detectedPeers: string[];
}

// 1. Move helper function outside the hook to keep the hook light and dependency-free
const getIPHash = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data.ip);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.slice(0, 12);
  } catch (e) {
    return 'fallback-room-' + Math.random().toString(36).substring(2, 8);
  }
};

export function useWebRTCShare(file: File | Blob | null, filename?: string) {
  const [stats, setStats] = useState<ShareStats>({
    progress: 0,
    speed: 0,
    remainingTime: 0,
    status: 'idle',
    peerId: null,
    detectedPeers: [],
  });

  const fileRef = useRef(file);
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const fileReaderRef = useRef<FileReader | null>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const receivedBytesRef = useRef<number>(0); // O(1) counter ref
  const lastProgressRef = useRef<{ bytes: number; time: number }>({ bytes: 0, time: 0 });
  const isTransferringRef = useRef(false);

  useEffect(() => {
    fileRef.current = file;
  }, [file]);

  useEffect(() => {
    setStats(prev => {
      if (
        prev.status === 'idle' ||
        prev.status === 'ready' ||
        prev.status === 'completed' ||
        prev.status === 'failed' ||
        prev.status === 'disconnected'
      ) {
        return {
          ...prev,
          status: file ? 'ready' : 'idle',
          progress: 0,
          speed: 0,
          remainingTime: 0,
        };
      }
      return prev;
    });
  }, [file]);

  const cleanup = useCallback(() => {
    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
    }
    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
      fileReaderRef.current = null;
    }
    receivedBytesRef.current = 0;
    isTransferringRef.current = false;
    setStats(prev => ({
      ...prev,
      progress: 0,
      speed: 0,
      remainingTime: 0,
      status: fileRef.current ? 'ready' : 'idle',
    }));
  }, []);

  // 2. Wrap handleIncomingData in useCallback
  const handleIncomingData = useCallback((data: any) => {
    if (data.type === 'meta') {
      receivedChunksRef.current = [];
      receivedBytesRef.current = 0;

      // Minor Fix 1: Handle empty file immediately on receiver
      if (data.size === 0) {
        const blob = new Blob([], { type: data.mime || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.name || 'downloaded_file';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        
        isTransferringRef.current = false;
        setStats(prev => ({ ...prev, status: 'completed', progress: 100 }));
        return;
      }

      isTransferringRef.current = true;
      setStats(prev => ({ ...prev, status: 'transferring', progress: 0 }));
      return;
    }

    if (data.type === 'chunk') {
      const buffer = data.chunk as ArrayBuffer;
      receivedChunksRef.current.push(buffer);
      receivedBytesRef.current += buffer.byteLength; // Minor Fix 2: O(1) byte accumulation
      
      const currentBytes = receivedBytesRef.current;
      const totalBytes = data.total || 1;
      const progress = Math.min(100, Math.round((currentBytes / totalBytes) * 100));

      const now = Date.now();
      const elapsed = (now - lastProgressRef.current.time) / 1000;
      let speedUpdate: { speed?: number; remainingTime?: number } = {};

      if (elapsed >= 0.5) {
        const sentSinceLast = currentBytes - lastProgressRef.current.bytes;
        const speed = sentSinceLast / (1024 * 1024 * elapsed);
        const remainingBytes = totalBytes - currentBytes;
        const remainingTime = speed > 0 ? (remainingBytes / (1024 * 1024)) / speed : 999;
        
        // Important Fix 1: Mutate refs outside setStats state updater
        lastProgressRef.current = { bytes: currentBytes, time: now };
        speedUpdate = { speed, remainingTime: Math.max(0, Math.round(remainingTime)) };
      }

      setStats(prev => ({
        ...prev,
        progress,
        ...speedUpdate,
      }));

      if (currentBytes >= totalBytes) {
        const blob = new Blob(receivedChunksRef.current, { type: data.mime || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.name || 'downloaded_file';
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        
        // Clear chunk array and bytes to release memory
        receivedChunksRef.current = [];
        receivedBytesRef.current = 0;
        
        isTransferringRef.current = false;
        setStats(prev => ({ ...prev, status: 'completed', progress: 100 }));
      }
    }
  }, []);

  // 3. Wrap setupConnectionListeners in useCallback
  const setupConnectionListeners = useCallback((conn: DataConnection) => {
    setStats(prev => ({ ...prev, status: 'connecting' }));

    conn.on('open', () => {
      const dc = conn.dataChannel;
      if (dc) {
        dc.bufferedAmountLowThreshold = 65536;
      }
      isTransferringRef.current = true;
      setStats(prev => ({ ...prev, status: 'transferring', progress: 0 }));
      lastProgressRef.current = { bytes: 0, time: Date.now() };
      receivedChunksRef.current = [];
      receivedBytesRef.current = 0;
    });

    conn.on('data', (data: any) => {
      handleIncomingData(data);
    });

    conn.on('close', () => {
      isTransferringRef.current = false;
      setStats(prev => ({ ...prev, status: 'disconnected' }));
    });

    conn.on('error', (err) => {
      isTransferringRef.current = false;
      console.error('Connection error:', err);
      setStats(prev => ({ ...prev, status: 'failed' }));
    });
  }, [handleIncomingData]);

  // 4. Correctly specify dependencies in initial setup effect
  useEffect(() => {
    let active = true;
    const initPeer = async () => {
      const roomKey = await getIPHash();
      if (!active) return;

      const randomId = Math.random().toString(36).substring(2, 8);
      const myId = `${roomKey}-${randomId}`;

      const peer = new Peer(myId, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        if (!active) return;
        setStats(prev => ({ ...prev, peerId: id, status: fileRef.current ? 'ready' : 'idle' }));
      });

      peer.on('connection', (conn) => {
        // Teardown existing connection if any
        if (connRef.current) {
          connRef.current.close();
        }
        connRef.current = conn;
        setupConnectionListeners(conn);
      });

      peer.on('error', (err) => {
        isTransferringRef.current = false;
        console.error('PeerJS error:', err);
        setStats(prev => ({ ...prev, status: 'failed' }));
      });
    };

    initPeer();

    return () => {
      active = false;
      cleanup();
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [cleanup, setupConnectionListeners]);

  // 5. Correctly specify dependencies in connectToPeer
  const connectToPeer = useCallback((targetPeerId: string) => {
    if (!peerRef.current || peerRef.current.destroyed) return;
    cleanup();
    const conn = peerRef.current.connect(targetPeerId);
    connRef.current = conn;
    setupConnectionListeners(conn);
  }, [cleanup, setupConnectionListeners]);

  const sendFile = useCallback(async () => {
    const conn = connRef.current;
    const fileBlob = fileRef.current;
    if (!conn || !conn.open || !fileBlob) return;
    if (isTransferringRef.current) return;

    isTransferringRef.current = true;
    setStats(prev => ({ ...prev, status: 'transferring', progress: 0 }));
    lastProgressRef.current = { bytes: 0, time: Date.now() };

    conn.send({
      type: 'meta',
      name: filename || (fileBlob as File).name || 'shared_file',
      size: fileBlob.size,
      mime: fileBlob.type,
    });

    if (fileReaderRef.current) {
      fileReaderRef.current.abort();
    }

    const fileReader = new FileReader();
    fileReaderRef.current = fileReader;
    let offset = 0;

    const readNextChunk = () => {
      if (!connRef.current || !connRef.current.open) {
        isTransferringRef.current = false;
        return;
      }
      if (offset >= fileBlob.size) {
        isTransferringRef.current = false;
        setStats(prev => ({ ...prev, status: 'completed', progress: 100 }));
        return;
      }

      const slice = fileBlob.slice(offset, offset + CHUNK_SIZE);
      fileReader.readAsArrayBuffer(slice);
    };

    fileReader.onload = (e) => {
      if (!connRef.current || !connRef.current.open) {
        isTransferringRef.current = false;
        return;
      }
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;

      const dc = connRef.current.dataChannel;
      if (dc && dc.bufferedAmount > 1024 * 1024) {
        const handleBufferedAmountLow = () => {
          dc.removeEventListener('bufferedamountlow', handleBufferedAmountLow);
          sendChunk(buffer);
        };
        dc.addEventListener('bufferedamountlow', handleBufferedAmountLow);
        return;
      }

      sendChunk(buffer);
    };

    // Important Fix 2: Add FileReader error handling
    fileReader.onerror = (err) => {
      isTransferringRef.current = false;
      console.error('FileReader error:', err);
      setStats(prev => ({ ...prev, status: 'failed' }));
    };

    const sendChunk = (buffer: ArrayBuffer) => {
      if (!connRef.current || !connRef.current.open) {
        isTransferringRef.current = false;
        return;
      }
      connRef.current.send({
        type: 'chunk',
        chunk: buffer,
        offset: offset,
        total: fileBlob.size,
        name: filename || (fileBlob as File).name || 'shared_file',
        mime: fileBlob.type,
      });

      offset += buffer.byteLength;
      
      const progress = fileBlob.size > 0 ? Math.min(100, Math.round((offset / fileBlob.size) * 100)) : 100;

      const now = Date.now();
      const elapsed = (now - lastProgressRef.current.time) / 1000;
      let speedUpdate: { speed?: number; remainingTime?: number } = {};

      if (elapsed >= 0.5) {
        const sentSinceLast = offset - lastProgressRef.current.bytes;
        const speed = sentSinceLast / (1024 * 1024 * elapsed);
        const remainingBytes = fileBlob.size - offset;
        const remainingTime = speed > 0 ? (remainingBytes / (1024 * 1024)) / speed : 999;
        
        lastProgressRef.current = { bytes: offset, time: now };
        speedUpdate = { speed, remainingTime: Math.max(0, Math.round(remainingTime)) };
      }

      setStats(prev => ({
        ...prev,
        progress,
        ...speedUpdate,
      }));

      readNextChunk();
    };

    readNextChunk();
  }, [filename]);

  return {
    stats,
    connectToPeer,
    sendFile,
    cleanup,
  };
}
