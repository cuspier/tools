"use client";

import React, { useState, useEffect } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { RefreshCw } from 'lucide-react';
import { Header } from '@/components/Header';
import { useTranslation } from '@/hooks/useTranslation';

export default function RotatePDF() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<number>(90);
  const [isRotating, setIsRotating] = useState(false);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (rotatedPdfUrl) {
        URL.revokeObjectURL(rotatedPdfUrl);
      }
    };
  }, [rotatedPdfUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') return;
      setFile(selectedFile);
      setRotatedPdfUrl(null);
    }
  };

  const rotatePDF = async () => {
    if (!file) return alert(t('rotate.alertSelectOne'));

    setIsRotating(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const pages = pdf.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + angle) % 360));
      });

      const rotatedPdfBytes = await pdf.save();
      const blob = new Blob([rotatedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);
    } catch (error) {
      console.error("Error rotating PDF:", error);
      alert(t('rotate.alertError'));
    } finally {
      setIsRotating(false);
    }
  };

  const handleReset = () => {
    if (rotatedPdfUrl) {
      URL.revokeObjectURL(rotatedPdfUrl);
    }
    setRotatedPdfUrl(null);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header titleKey="tools.rotate.title" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('rotate.selectPrompt')}</h2>
          <p className="text-gray-500 mb-8">{t('tools.rotate.description')}</p>

          {!rotatedPdfUrl ? (
            <>
              <div className="mb-8">
                <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200">
                  <RefreshCw className="w-5 h-5" />
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
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">{t('rotate.angle')}</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: t('rotate.angle90'), value: 90 },
                        { label: t('rotate.angle180'), value: 180 },
                        { label: t('rotate.angle270'), value: 270 }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setAngle(option.value)}
                          className={`px-3 py-2 text-sm font-semibold rounded-lg border transition ${
                            angle === option.value
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={rotatePDF} 
                    disabled={isRotating}
                    className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg shadow-green-200 disabled:opacity-50"
                  >
                    {isRotating ? t('rotate.processing') : t('rotate.buttonAction')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 animate-scale-up">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('rotate.success')}</h3>
              <a 
                href={rotatedPdfUrl} 
                download={`rotated_${file?.name}`}
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition shadow-lg shadow-blue-200"
              >
                {t('rotate.downloadAction')}
              </a>
              <div className="mt-8">
                <button onClick={handleReset} className="text-gray-500 hover:text-blue-600 font-medium">
                  {t('rotate.more')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
