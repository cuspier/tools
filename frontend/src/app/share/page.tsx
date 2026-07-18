"use client";

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { FileUp, Copy, Check, Wifi, QrCode } from 'lucide-react';
import { Header } from '@/components/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { useWebRTCShare } from '@/hooks/useWebRTCShare';

export default function StandaloneShare() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { stats, sendFile, connectToPeer, cleanup } = useWebRTCShare(selectedFile);
  const [qrUrl, setQrUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isLinkReady = !!stats.peerId;
  const shareUrl = typeof window !== 'undefined' && isLinkReady
    ? `${window.location.origin}/share#peer=${stats.peerId}`
    : '';

  // Prevent browser from opening dropped files globally
  useEffect(() => {
    const preventDefault = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', preventDefault);
    window.addEventListener('drop', preventDefault);
    return () => {
      window.removeEventListener('dragover', preventDefault);
      window.removeEventListener('drop', preventDefault);
    };
  }, []);

  // Extract hash parameter from URL for auto-connection
  useEffect(() => {
    if (typeof window !== 'undefined' && stats.peerId) {
      const hash = window.location.hash;
      const match = hash.match(/#peer=(.+)/);
      if (match && match[1] && match[1] !== stats.peerId) {
        connectToPeer(match[1]);
        // Clear hash from address bar without page reload
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [stats.peerId, connectToPeer]);

  // Render QR Code
  useEffect(() => {
    let active = true;
    if (stats.peerId) {
      QRCode.toDataURL(shareUrl, { width: 180, margin: 2 })
        .then(url => {
          if (active) setQrUrl(url);
        })
        .catch(err => {
          if (active) console.error(err);
        });
    }
    return () => {
      active = false;
    };
  }, [stats.peerId, shareUrl]);

  // Auto-send when sender ready
  useEffect(() => {
    if (stats.status === 'transferring' && selectedFile && stats.progress === 0) {
      sendFile();
    }
  }, [stats.status, selectedFile, sendFile]);

  // Copy timeout cleanup
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopyLink = () => {
    if (!isLinkReady) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  const handleReset = () => {
    setSelectedFile(null);
    cleanup();
  };

  const showTransferUI = !!selectedFile || (stats.status !== 'idle' && stats.status !== 'ready');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header titleKey="share.title" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          
          {!showTransferUI ? (
            /* File Drop zone */
            <div 
              role="region"
              aria-label="File Upload Dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`py-12 border-2 border-dashed rounded-2xl transition ${
                isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 bg-white'
              }`}
            >
              <h2 className="text-3xl font-bold mb-4 pointer-events-none">{t('share.title')}</h2>
              <p className="text-gray-500 mb-6 pointer-events-none">{t('share.description')}</p>
              
              <div className="mb-6 flex justify-center pointer-events-none">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                  <FileUp className="w-8 h-8" />
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-8 pointer-events-none">{t('share.dragPrompt')}</p>
              
              <label 
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200"
              >
                <FileUp className="w-5 h-5 pointer-events-none" />
                <span className="pointer-events-none">{t('common.selectFiles')}</span>
                <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            /* Transfer UI */
            <div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <span role="img" aria-label="File" className="text-3xl">📄</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-base">
                      {selectedFile ? selectedFile.name : t('share.receiving')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : '-- MB'}
                    </div>
                  </div>
                </div>
                <button onClick={handleReset} className="text-sm font-semibold text-red-500 hover:text-red-600">{t('common.cancel')}</button>
              </div>

              {stats.status === 'connecting' ? (
                /* Connecting status */
                <div className="py-8 max-w-md mx-auto">
                  <div className="relative w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{t('share.connecting')}</h3>
                  <p className="text-xs text-gray-400">{t('share.waiting')}</p>
                </div>
              ) : stats.status === 'transferring' ? (
                /* Progress status */
                <div className="py-8 max-w-md mx-auto">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    {selectedFile ? t('share.sending') : t('share.receiving')}
                  </h3>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-3">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${stats.progress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{stats.progress}%</span>
                    <span>{stats.speed.toFixed(2)} MB/s</span>
                    <span>{stats.remainingTime > 0 ? `${stats.remainingTime}s` : '--'}</span>
                  </div>
                </div>
              ) : stats.status === 'completed' ? (
                /* Complete status */
                <div className="py-8">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">✓</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('share.completed')}</h3>
                  <button onClick={handleReset} className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 font-semibold rounded-full text-sm transition">
                    {t('share.newShare')}
                  </button>
                </div>
              ) : stats.status === 'failed' || stats.status === 'disconnected' ? (
                /* Failed status */
                <div className="py-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">!</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {stats.status === 'disconnected' ? t('share.peerDisconnected') : t('share.failed')}
                  </h3>
                  <button onClick={handleReset} className="mt-4 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 font-semibold rounded-full text-sm transition">
                    {t('share.newShare')}
                  </button>
                </div>
              ) : (
                /* Scanning and QR option cards */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Auto detect */}
                  <div className="border border-gray-100 p-6 rounded-2xl flex flex-col justify-between items-center text-center">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2 justify-center">
                        <Wifi className="w-5 h-5 text-blue-500" />
                        {t('share.radarTitle')}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">{t('share.radarDesc')}</p>
                      
                      <div className="relative w-40 h-40 border border-dashed border-gray-200 rounded-full flex items-center justify-center mx-auto overflow-hidden bg-gray-50">
                        <div className="absolute inset-4 border border-blue-500/10 rounded-full animate-ping"></div>
                        <div className="text-gray-400 text-xs font-semibold">{t('share.detecting')}</div>
                      </div>
                    </div>
                  </div>

                  {/* QR Link */}
                  <div className="border border-gray-100 p-6 rounded-2xl flex flex-col justify-between items-center text-center">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2 justify-center">
                        <QrCode className="w-5 h-5 text-purple-500" />
                        {t('share.qrTitle')}
                      </h3>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">{t('share.qrDesc')}</p>
                      
                      <div className="bg-white p-3 border border-gray-100 rounded-xl mb-4 inline-block">
                        {qrUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={qrUrl} alt="Share QR Code" className="w-40 h-40" />
                        ) : (
                          <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Loading...</div>
                        )}
                      </div>

                      <div className="flex gap-2 w-full max-w-sm mx-auto">
                        <input 
                          type="text" 
                          readOnly 
                          value={isLinkReady ? shareUrl : 'Generating link...'} 
                          aria-label="Share Link"
                          className="flex-1 bg-gray-50 text-xs px-3 py-2 rounded-xl border border-gray-200 text-center text-gray-600 truncate focus:outline-none"
                        />
                        <button 
                          onClick={handleCopyLink} 
                          disabled={!isLinkReady}
                          aria-label={copied ? "Copied" : "Copy share link"}
                          className={`px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${!isLinkReady ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
