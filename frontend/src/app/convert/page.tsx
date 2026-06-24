"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { ArrowLeft, FileUp, Download, Image as ImageIcon } from 'lucide-react';

export default function ConvertPDF() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedPdfUrl, setConvertedPdfUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFiles(Array.from(e.target.files));
      setConvertedPdfUrl(null);
    }
  };

  const convertImagesToPdf = async () => {
    if (imageFiles.length === 0) return;
    
    setIsProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of imageFiles) {
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
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setConvertedPdfUrl(url);
    } catch (error) {
      console.error("Error converting to PDF:", error);
      alert("An error occurred while converting images to PDF.");
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
          <h2 className="text-3xl font-bold mb-4">Images to PDF Converter</h2>
          <p className="text-gray-500 mb-8">Convert JPG or PNG images into a single PDF document entirely in your browser.</p>

          {imageFiles.length === 0 ? (
            <div className="mb-8">
              <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold transition shadow-lg shadow-orange-200">
                <FileUp className="w-5 h-5" />
                Select Images
                <input type="file" accept="image/png, image/jpeg" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : !convertedPdfUrl ? (
            <div className="max-w-md mx-auto text-left">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <ImageIcon className="w-6 h-6 text-orange-600" />
                  <span className="font-semibold text-gray-800">Selected Images ({imageFiles.length})</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                  {imageFiles.map((f, i) => (
                    <li key={i} className="truncate">{f.name}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setImageFiles([])} className="text-gray-500 hover:text-gray-800 font-medium">Cancel</button>
                <button 
                  onClick={convertImagesToPdf} 
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
                <button onClick={() => { setConvertedPdfUrl(null); setImageFiles([]); }} className="text-gray-500 hover:text-orange-600 font-medium">
                  Convert more images
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
