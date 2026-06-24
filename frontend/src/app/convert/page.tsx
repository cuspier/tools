"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { ArrowLeft, FileUp, Download, FileText } from 'lucide-react';
import { parseFileToHtml } from './parser';

export default function ConvertPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setConvertedPdfUrl(null);
    }
  };

  const convertFilesToPdf = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    try {
      const hasDocument = files.some(f => !f.type.startsWith('image/'));
      
      if (hasDocument) {
        // Document conversion (only takes the first file for simplicity if mixed)
        const file = files.find(f => !f.type.startsWith('image/')) || files[0];
        const htmlContent = await parseFileToHtml(file);
        
        const renderContainer = document.createElement('div');
        renderContainer.innerHTML = htmlContent;
        renderContainer.style.padding = '20px';
        renderContainer.style.background = 'white';
        renderContainer.style.color = 'black';

        // Dynamic import for html2pdf to avoid SSR issues
        const html2pdf = (await import('html2pdf.js')).default;
        
        const opt = {
          margin:       10,
          filename:     file.name.replace(/\.[^/.]+$/, "") + ".pdf",
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        // Output as blob url
        const worker = html2pdf().set(opt).from(renderContainer);
        const pdfBlobUrl = await worker.outputPdf('bloburl');
        setConvertedPdfUrl(pdfBlobUrl as unknown as string); // html2pdf typings can be weird
      } else {
        // Image to PDF conversion using pdf-lib
        const pdfDoc = await PDFDocument.create();

        for (const file of files) {
          const imageBytes = await file.arrayBuffer();
          let image;
          
          if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            image = await pdfDoc.embedJpg(imageBytes);
          } else if (file.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            continue; // skip unsupported
          }

          const { width, height } = image.scale(1);
          const page = pdfDoc.addPage([width, height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width,
            height,
          });
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setConvertedPdfUrl(url);
      }
    } catch (error: any) {
      console.error("Error converting to PDF:", error);
      alert("An error occurred: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <span className="text-xl font-bold">Convert to PDF</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Document & Image to PDF</h2>
          <p className="text-gray-500 mb-8">Convert JPG, PNG, TXT, DOCX, XLSX, or HWP files into a PDF document entirely in your browser.</p>

          {files.length === 0 ? (
            <div className="mb-8">
              <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition shadow-lg shadow-orange-200">
                <FileUp className="w-5 h-5" />
                Select Files
                <input type="file" accept="image/png, image/jpeg, .txt, .docx, .xlsx, .hwp" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : !convertedPdfUrl ? (
            <div className="max-w-md mx-auto text-left">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-orange-600" />
                  <span className="font-semibold text-gray-800">Selected Files ({files.length})</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                  {files.map((f, i) => (
                    <li key={i} className="truncate">{f.name}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setFiles([])} className="text-gray-500 hover:text-gray-800 font-medium">Cancel</button>
                <button 
                  onClick={convertFilesToPdf} 
                  disabled={isProcessing}
                  className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? 'Converting...' : 'Convert to PDF'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Converted Successfully!</h3>
              <a 
                href={convertedPdfUrl} 
                download={`converted_document.pdf`}
                className="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition shadow-lg shadow-orange-200"
              >
                Download PDF
              </a>
              <div className="mt-8">
                <button onClick={() => { setConvertedPdfUrl(null); setFiles([]); }} className="text-gray-500 hover:text-orange-600 font-medium">
                  Convert more files
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
