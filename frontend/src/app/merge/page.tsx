"use client";

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUp, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Header } from '@/components/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { ShareModal } from '@/components/ShareModal';

export default function MergePDF() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (mergedPdfUrl) {
        URL.revokeObjectURL(mergedPdfUrl);
      }
    };
  }, [mergedPdfUrl]);

  const handleReset = () => {
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }
    setMergedPdfUrl(null);
    setMergedBlob(null);
    setIsShareOpen(false);
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (direction === 'up' && index > 0) {
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      }
      return newFiles;
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) return alert(t('merge.alertSelectTwo'));
    
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedBlob(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert(t('merge.alertError'));
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header titleKey="tools.merge.title" />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('merge.selectPrompt')}</h2>
          <p className="text-gray-500 mb-8">{t('tools.merge.description')}</p>

          {!mergedPdfUrl ? (
            <>
              <div className="mb-8">
                <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200">
                  <FileUp className="w-5 h-5" />
                  {t('common.selectFiles')}
                  <input type="file" multiple accept="application/pdf" className="sr-only" onChange={handleFileChange} />
                </label>
              </div>

              {files.length > 0 && (
                <div className="text-left bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                  <h3 className="font-semibold mb-4 text-gray-700">{t('merge.selectedFiles')} ({files.length})</h3>
                  <ul className="space-y-3">
                    {files.map((file, index) => (
                      <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                        <span className="truncate flex-1 font-medium">{file.name}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => moveFile(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30">
                            <ArrowUp className="w-5 h-5" />
                          </button>
                          <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30">
                            <ArrowDown className="w-5 h-5" />
                          </button>
                          <button onClick={() => removeFile(index)} className="p-1 text-gray-400 hover:text-red-500 ml-2">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {files.length >= 2 && (
                <button 
                  onClick={mergePDFs} 
                  disabled={isMerging}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition shadow-lg shadow-green-200 disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {isMerging ? t('merge.merging') : t('merge.buttonAction')}
                </button>
              )}
            </>
          ) : (
            <div className="py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileUp className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('merge.success')}</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href={mergedPdfUrl} 
                  download="merged_document.pdf"
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition shadow-lg shadow-green-200 flex items-center gap-2"
                >
                  <span>⬇️</span> {t('merge.downloadAction')}
                </a>
                <button
                  onClick={() => setIsShareOpen(true)}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition shadow-lg shadow-blue-200 flex items-center gap-2"
                >
                  <span>📱</span> {t('share.buttonAction')}
                </button>
              </div>
              <div className="mt-8">
                <button onClick={handleReset} className="text-gray-500 hover:text-blue-600 font-medium">
                  {t('merge.more')}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Share Modal popup */}
      {isShareOpen && (
        <ShareModal 
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          file={mergedBlob}
          filename="merged_document.pdf"
        />
      )}
    </div>
  );
}
