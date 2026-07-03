"use client";

import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { Type } from 'lucide-react';
import { Header } from '@/components/Header';
import { useTranslation } from '@/hooks/useTranslation';

export default function AddWatermark() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState('');
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (watermarkedPdfUrl) {
        URL.revokeObjectURL(watermarkedPdfUrl);
      }
    };
  }, [watermarkedPdfUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') return;
      setFile(selectedFile);
      setWatermarkedPdfUrl(null);
    }
  };

  const addWatermark = async () => {
    if (!file) return alert(t('watermark.alertSelectOne'));
    
    setIsWatermarking(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      
      const helveticaFont = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const text = watermarkText || t('watermark.textPlaceholder');

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        
        page.drawText(text, {
          x: width / 2 - helveticaFont.widthOfTextAtSize(text, 50) / 2,
          y: height / 2 - 25,
          size: 50,
          font: helveticaFont,
          color: rgb(0.75, 0.75, 0.75),
          opacity: 0.4,
          rotate: degrees(45),
        });
      });

      const watermarkedPdfBytes = await pdf.save();
      const blob = new Blob([watermarkedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setWatermarkedPdfUrl(url);
    } catch (error) {
      console.error("Error adding watermark:", error);
      alert(t('watermark.alertError'));
    } finally {
      setIsWatermarking(false);
    }
  };

  const handleReset = () => {
    if (watermarkedPdfUrl) {
      URL.revokeObjectURL(watermarkedPdfUrl);
    }
    setWatermarkedPdfUrl(null);
    setFile(null);
    setWatermarkText('');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header titleKey="tools.watermark.title" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('watermark.selectPrompt')}</h2>
          <p className="text-gray-500 mb-8">{t('tools.watermark.description')}</p>

          {!watermarkedPdfUrl ? (
            <>
              <div className="mb-8">
                <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200">
                  <Type className="w-5 h-5" />
                  {t('common.selectFile')}
                  <input type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
                </label>
              </div>

              {file && (
                <div className="max-w-md mx-auto text-left bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 animate-fade-in">
                  <div className="border-b border-gray-200 pb-3 mb-4">
                    <span className="font-semibold text-gray-700 truncate block">{file.name}</span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">{t('watermark.settings')}</h4>
                    <div>
                      <label htmlFor="watermark-text" className="block text-sm font-medium text-gray-600 mb-1">{t('watermark.text')}</label>
                      <input
                        id="watermark-text"
                        type="text"
                        placeholder={t('watermark.textPlaceholder')}
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={addWatermark} 
                    disabled={isWatermarking}
                    className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg shadow-green-200 disabled:opacity-50"
                  >
                    {isWatermarking ? t('watermark.processing') : t('watermark.buttonAction')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 animate-scale-up">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Type className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('watermark.success')}</h3>
              <a 
                href={watermarkedPdfUrl} 
                download={`watermarked_${file?.name}`}
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition shadow-lg shadow-blue-200"
              >
                {t('watermark.downloadAction')}
              </a>
              <div className="mt-8">
                <button onClick={handleReset} className="text-gray-500 hover:text-blue-600 font-medium">
                  {t('watermark.more')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
