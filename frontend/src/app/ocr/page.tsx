"use client";

import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Image as ImageIcon, Copy, Download } from 'lucide-react';
import { Header } from '@/components/Header';
import { useTranslation } from '@/hooks/useTranslation';

export default function OCRTool() {
  const { t } = useTranslation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(prevUrl => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return URL.createObjectURL(file);
      });
      setExtractedText('');
      setProgress(0);
      setCopied(false);
    }
  };

  const processOCR = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'eng',
        { 
          logger: m => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );
      setExtractedText(text);
    } catch (error) {
      console.error("Error during OCR:", error);
      alert(t('ocr.alertError'));
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = () => {
    const blob = new Blob([extractedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_${imageFile?.name.replace(/\.[^/.]+$/, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleReset = () => {
    setImagePreviewUrl(prevUrl => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return null;
    });
    setImageFile(null);
    setExtractedText('');
    setProgress(0);
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header titleKey="tools.ocr.title" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('ocr.selectPrompt')}</h2>
          <p className="text-gray-500 mb-8">{t('tools.ocr.description')}</p>

          {!imageFile ? (
            <div className="mb-8">
              <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition shadow-lg shadow-indigo-200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500 outline-none">
                <ImageIcon className="w-5 h-5" />
                {t('common.selectFile')}
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>
          ) : !extractedText ? (
            <div className="max-w-lg mx-auto text-left">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 text-center">
                {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-sm mb-4" />}
                <p className="font-semibold text-gray-800 truncate" title={imageFile.name}>{imageFile.name}</p>
              </div>

              {isProcessing && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                  <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              )}

              <div className="flex justify-between items-center">
                <button onClick={handleReset} className="text-gray-500 hover:text-gray-800 font-medium">{t('common.cancel')}</button>
                <button 
                  onClick={processOCR} 
                  disabled={isProcessing}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold transition shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? `${t('ocr.processing')} ${progress}%` : t('ocr.buttonAction')}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-indigo-600" /> {t('ocr.success')}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> {copied ? t('ocr.copied') : t('ocr.copy')}
                  </button>
                  <button 
                    onClick={downloadText}
                    className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> {t('ocr.downloadAction')}
                  </button>
                </div>
              </div>
              <textarea 
                readOnly 
                value={extractedText}
                placeholder={t('ocr.placeholder')}
                className="w-full h-64 p-4 border border-gray-300 rounded-xl bg-gray-50 font-mono text-sm resize-y focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="mt-8 text-center">
                <button onClick={handleReset} className="text-gray-500 hover:text-indigo-600 font-medium">
                  {t('ocr.more')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
