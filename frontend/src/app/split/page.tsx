"use client";

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Scissors } from 'lucide-react';
import { Header } from '@/components/Header';
import { useTranslation } from '@/hooks/useTranslation';

export default function SplitPDF() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [fromPage, setFromPage] = useState<string>('1');
  const [toPage, setToPage] = useState<string>('1');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (splitPdfUrl) {
        URL.revokeObjectURL(splitPdfUrl);
      }
    };
  }, [splitPdfUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') return;

      setFile(selectedFile);
      setSplitPdfUrl(null);
      
      try {
        const fileBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const pageCount = pdf.getPageCount();
        setTotalPages(pageCount);
        setFromPage('1');
        setToPage(pageCount.toString());
      } catch (error) {
        console.error("Error loading PDF:", error);
        alert(t('split.alertError'));
      }
    }
  };

  const handleNumberChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value === '') {
      setter('');
      return;
    }
    setter(value);
  };

  const handleBlur = (value: string, setter: React.Dispatch<React.SetStateAction<string>>, defaultValue: number) => {
    if (value === '') {
      setter(defaultValue.toString());
      return;
    }
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) {
      setter('1');
    } else if (num > totalPages) {
      setter(totalPages.toString());
    } else {
      setter(num.toString());
    }
  };

  const splitPDF = async () => {
    if (!file) return alert(t('split.alertSelectOne'));
    
    const start = parseInt(fromPage, 10);
    const end = parseInt(toPage, 10);

    if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > totalPages) {
      return alert(t('split.invalidRange'));
    }

    setIsSplitting(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      
      const subPdf = await PDFDocument.create();
      const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
      const copiedPages = await subPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => subPdf.addPage(page));

      const subPdfBytes = await subPdf.save() as Uint8Array<ArrayBuffer>;
      const blob = new Blob([subPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert(t('split.alertError'));
    } finally {
      setIsSplitting(false);
    }
  };

  const handleReset = () => {
    setSplitPdfUrl(null);
    setFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header titleKey="tools.split.title" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('split.selectPrompt')}</h2>
          <p className="text-gray-500 mb-8">{t('tools.split.description')}</p>

          {!splitPdfUrl ? (
            <>
              <div className="mb-8">
                <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200">
                  <Scissors className="w-5 h-5" />
                  {t('common.selectFile')}
                  <input type="file" accept="application/pdf" className="sr-only" onChange={handleFileChange} />
                </label>
              </div>

              {file && (
                <div className="max-w-md mx-auto text-left bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                    <span className="font-semibold text-gray-700 truncate mr-4">{file.name}</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                      {totalPages} {t('split.pages')}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">{t('split.pageRange')}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="from-page" className="block text-sm font-medium text-gray-600 mb-1">{t('split.from')}</label>
                        <input 
                          id="from-page"
                          type="number" 
                          min="1" 
                          max={totalPages} 
                          value={fromPage} 
                          onChange={(e) => handleNumberChange(e.target.value, setFromPage)}
                          onBlur={() => handleBlur(fromPage, setFromPage, 1)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="to-page" className="block text-sm font-medium text-gray-600 mb-1">{t('split.to')}</label>
                        <input 
                          id="to-page"
                          type="number" 
                          min="1" 
                          max={totalPages} 
                          value={toPage} 
                          onChange={(e) => handleNumberChange(e.target.value, setToPage)}
                          onBlur={() => handleBlur(toPage, setToPage, totalPages)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={splitPDF} 
                    disabled={isSplitting}
                    className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg shadow-green-200 disabled:opacity-50"
                  >
                    {isSplitting ? t('split.processing') : t('split.buttonAction')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 animate-scale-up">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Scissors className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('split.success')}</h3>
              <a 
                href={splitPdfUrl} 
                download={`${file?.name.replace('.pdf', '')}_${fromPage}-${toPage}.pdf`}
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition shadow-lg shadow-blue-200"
              >
                {t('split.downloadAction')}
              </a>
              <div className="mt-8">
                <button onClick={handleReset} className="text-gray-500 hover:text-blue-600 font-medium">
                  {t('split.more')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
