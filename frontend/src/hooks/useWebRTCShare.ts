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

export function useWebRTCShare(file: File | Blob | null, filename?: string) {
  const [stats, setStats] = useState<ShareStats>({
    progress: 0,
    speed: 0,
    remainingTime: 0,
    status: 'idle',
    peerId: null,
    detectedPeers: [],
  });

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const receivedChunksRef = useRef<ArrayBuffer[]>([]);
  const lastProgressRef = useRef<{ bytes: number; time: number }>({ bytes: 0, time: 0 });

  // Clean up connections
  const cleanup = useCallback(() => {
    if (connRef.current) {
      connRef.current.close();
      connRef.current = null;
    }
    setStats(prev => ({
      ...prev,
      progress: 0,
      speed: 0,
      remainingTime: 0,
      status: file ? 'ready' : 'idle',
    }));
  }, [file]);

  // Fetch Public IP and return SHA-256 hash
  const getIPHash = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.ip);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex.slice(0, 12); // Use first 12 chars
    } catch (e) {
      // Fallback to random ID room if IP fetch fails
      return 'fallback-room-' + Math.random().toString(36).substring(2, 8);
    }
  };

  // Initialize PeerJS
  useEffect(() => {
    let active = true;
    const initPeer = async () => {
      const roomKey = await getIPHash();
      if (!active) return;

      const randomId = Math.random().toString(36).substring(2, 8);
      // Format: [IP_HASH]-[RANDOM_SUFFIX]
      const myId = `${roomKey}-${randomId}`;

      const peer = new Peer(myId, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
      });

      peerRef.current = peer;

      peer.on('open', (id) => {
        if (!active) return;
        setStats(prev => ({ ...prev, peerId: id, status: file ? 'ready' : 'idle' }));
        
        // Connect to signaling server to search for other peers in same IP room
        fetchPeersInRoom(roomKey, id);
      });

      // Listen for incoming connection
      peer.on('connection', (conn) => {
        connRef.current = conn;
        setupConnectionListeners(conn);
      });

      peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        setStats(prev => ({ ...prev, status: 'failed' }));
      });
    };

    const fetchPeersInRoom = async (roomKey: string, myId: string) => {
      // Direct connection using QR/link is used for P2P connection
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
  }, [cleanup, file]);

  const setupConnectionListeners = (conn: DataConnection) => {
    setStats(prev => ({ ...prev, status: 'connecting' }));

    conn.on('open', () => {
      setStats(prev => ({ ...prev, status: 'transferring', progress: 0 }));
      lastProgressRef.current = { bytes: 0, time: Date.now() };
      receivedChunksRef.current = [];
    });

    conn.on('data', (data: any) => {
      handleIncomingData(data);
    });

    conn.on('close', () => {
      setStats(prev => ({ ...prev, status: 'disconnected' }));
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      setStats(prev => ({ ...prev, status: 'failed' }));
    });
  };

  // Connect to a remote peer (Approach B)
  const connectToPeer = useCallback((targetPeerId: string) => {
    if (!peerRef.current) return;
    cleanup();
    const conn = peerRef.current.connect(targetPeerId);
    connRef.current = conn;
    setupConnectionListeners(conn);
  }, [cleanup]);

  // Handle incoming chunk transfers
  const handleIncomingData = (data: any) => {
    if (data.type === 'meta') {
      // Initialize meta details
      receivedChunksRef.current = [];
      setStats(prev => ({ ...prev, status: 'transferring', progress: 0 }));
      return;
    }

    if (data.type === 'chunk') {
      const buffer = data.chunk as ArrayBuffer;
      receivedChunksRef.current.push(buffer);
      
      const currentBytes = receivedChunksRef.current.reduce((acc, c) => acc + c.byteLength, 0);
      const totalBytes = data.total;
      const progress = Math.min(100, Math.round((currentBytes / totalBytes) * 100));

      // Calculate speed and remaining time
      const now = Date.now();
      const elapsed = (now - lastProgressRef.current.time) / 1000; // in seconds
      let speed = stats.speed;
      let remainingTime = stats.remainingTime;

      if (elapsed >= 0.5) {
        const sentSinceLast = currentBytes - lastProgressRef.current.bytes;
        speed = sentSinceLast / (1024 * 1024 * elapsed); // MB/s
        const remainingBytes = totalBytes - currentBytes;
        remainingTime = speed > 0 ? (remainingBytes / (1024 * 1024)) / speed : 999;
        
        lastProgressRef.current = { bytes: currentBytes, time: now };
      }

      setStats(prev => ({
        ...prev,
        progress,
        speed,
        remainingTime: Math.max(0, Math.round(remainingTime)),
      }));

      // If all chunks received, assemble and download
      if (currentBytes >= totalBytes) {
        const blob = new Blob(receivedChunksRef.current, { type: data.mime || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.name || 'downloaded_file';
        a.click();
        URL.revokeObjectURL(url);
        
        setStats(prev => ({ ...prev, status: 'completed', progress: 100 }));
      }
    }
  };

  // Send file chunks with backpressure handling
  const sendFile = async () => {
    const conn = connRef.current;
    if (!conn || !file) return;

    setStats(prev => ({ ...prev, status: 'transferring', progress: 0 }));
    lastProgressRef.current = { bytes: 0, time: Date.now() };

    // Send metadata packet
    const fileBlob = file as Blob;
    conn.send({
      type: 'meta',
      name: filename || (file as File).name || 'shared_file',
      size: fileBlob.size,
      mime: fileBlob.type,
    });

    const fileReader = new FileReader();
    let offset = 0;

    const readNextChunk = () => {
      if (offset >= fileBlob.size) {
        setStats(prev => ({ ...prev, status: 'completed', progress: 100 }));
        return;
      }

      const slice = fileBlob.slice(offset, offset + CHUNK_SIZE);
      fileReader.readAsArrayBuffer(slice);
    };

    fileReader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) return;

      // Monitor backpressure: wait if buffer exceeds limit
      const dc = (conn as any)._dc as RTCDataChannel;
      if (dc && dc.bufferedAmount > 1024 * 1024) { // 1MB limit
        const handleBufferedAmountLow = () => {
          dc.removeEventListener('bufferedamountlow', handleBufferedAmountLow);
          sendChunk(buffer);
        };
        dc.addEventListener('bufferedamountlow', handleBufferedAmountLow);
        return;
      }

      sendChunk(buffer);
    };

    const sendChunk = (buffer: ArrayBuffer) => {
      conn.send({
        type: 'chunk',
        chunk: buffer,
        offset: offset,
        total: fileBlob.size,
        name: filename || (file as File).name || 'shared_file',
        mime: fileBlob.type,
      });

      offset += buffer.byteLength;
      
      // Update statistics
      const progress = Math.min(100, Math.round((offset / fileBlob.size) * 100));
      const now = Date.now();
      const elapsed = (now - lastProgressRef.current.time) / 1000;
      let speed = stats.speed;
      let remainingTime = stats.remainingTime;

      if (elapsed >= 0.5) {
        const sentSinceLast = offset - lastProgressRef.current.bytes;
        speed = sentSinceLast / (1024 * 1024 * elapsed);
        const remainingBytes = fileBlob.size - offset;
        remainingTime = speed > 0 ? (remainingBytes / (1024 * 1024)) / speed : 999;
        lastProgressRef.current = { bytes: offset, time: now };
      }

      setStats(prev => ({
        ...prev,
        progress,
        speed,
        remainingTime: Math.max(0, Math.round(remainingTime)),
      }));

      readNextChunk();
    };

    readNextChunk();
  };

  return {
    stats,
    connectToPeer,
    sendFile,
    cleanup,
  };
}
