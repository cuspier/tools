"use client";

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, QrCode, Wifi, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useWebRTCShare } from '@/hooks/useWebRTCShare';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: Blob | File | null;
  filename: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, file, filename }) => {
  const { t } = useTranslation();
  const { stats, sendFile } = useWebRTCShare(file, filename);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/share#peer=${stats.peerId || ''}` 
    : '';

  // Generate QR Code once peerId is acquired
  useEffect(() => {
    let active = true;
    if (stats.peerId && isOpen) {
      QRCode.toDataURL(shareUrl, { width: 180, margin: 2 })
        .then(url => {
          if (active) setQrDataUrl(url);
        })
        .catch(err => {
          if (active) console.error('Failed to generate QR Code:', err);
        });
    }
    return () => {
      active = false;
    };
  }, [stats.peerId, shareUrl, isOpen]);

  // Handle auto-send once P2P connects
  useEffect(() => {
    if (stats.status === 'transferring' && file && stats.progress === 0) {
      sendFile();
    }
  }, [stats.status, file, sendFile, stats.progress]);

  // Cleanup copied state timeout
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 id="share-modal-title" className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <span>📱</span> {t('share.title')}
          </h2>
          <button 
            onClick={onClose} 
            aria-label="Close"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* File Card info */}
          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-100 dark:border-blue-900 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📄</span>
              <div className="text-left">
                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-xs">{filename}</div>
                <div className="text-xs text-gray-500">{(file?.size ? (file.size / (1024 * 1024)).toFixed(2) : '0.00')} MB</div>
              </div>
            </div>
            {file && file.size > 50 * 1024 * 1024 && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t('share.warningTitle')}</span>
              </div>
            )}
          </div>

          {stats.status === 'transferring' ? (
            /* Progress state view */
            <div className="py-8 text-center">
              <div className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                {t('share.sending')}
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden mb-3">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{stats.progress}%</span>
                <span>{stats.speed.toFixed(2)} MB/s</span>
                <span>{stats.remainingTime > 0 ? `${stats.remainingTime}s` : '--'}</span>
              </div>
            </div>
          ) : stats.status === 'completed' ? (
            /* Success state view */
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl flex items-center justify-center">✓</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('share.completed')}</h3>
              <p className="text-sm text-gray-500">{t('share.description')}</p>
            </div>
          ) : stats.status === 'failed' ? (
            /* Failed state view */
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl flex items-center justify-center">!</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('share.failed')}</h3>
            </div>
          ) : (
            /* Default options view */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Radar Local scan */}
              <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col justify-between items-center text-center">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 flex items-center gap-2 justify-center">
                    <Wifi className="w-4 h-4 text-blue-500" />
                    {t('share.radarTitle')}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-6">{t('share.radarDesc')}</p>
                  
                  {/* Visual Radar scan ring */}
                  <div className="relative w-36 h-36 border border-dashed border-gray-200 dark:border-gray-800 rounded-full flex items-center justify-center mx-auto overflow-hidden bg-gray-50 dark:bg-gray-950/50">
                    <div className="absolute inset-4 border border-blue-500/10 rounded-full animate-ping"></div>
                    <div className="text-gray-400 text-xs font-semibold">{t('share.detecting')}</div>
                  </div>
                </div>
              </div>

              {/* QR Code and link sharing */}
              <div className="border border-gray-100 dark:border-gray-800 p-5 rounded-2xl flex flex-col justify-between items-center text-center">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 flex items-center gap-2 justify-center">
                    <QrCode className="w-4 h-4 text-purple-500" />
                    {t('share.qrTitle')}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{t('share.qrDesc')}</p>
                  
                  {/* QR Image */}
                  <div className="bg-white p-2.5 border border-gray-100 rounded-xl mb-4 inline-block">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrDataUrl} alt="Share QR Code" className="w-36 h-36" />
                    ) : (
                      <div className="w-36 h-36 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">Loading...</div>
                    )}
                  </div>

                  {/* Share Link input */}
                  <div className="flex gap-1.5 w-full">
                    <input 
                      type="text" 
                      readOnly 
                      value={shareUrl} 
                      className="flex-1 bg-gray-50 dark:bg-gray-950 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-center text-gray-600 truncate focus:outline-none"
                    />
                    <button 
                      onClick={handleCopyLink} 
                      aria-label={copied ? "Copied" : "Copy share link"}
                      className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
