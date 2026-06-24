"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { Type, ArrowLeft, FileUp, Download } from 'lucide-react';

export default function WatermarkPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [isWatermarking, setIsWatermarking] = useState(false);
  const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setWatermarkedPdfUrl(null);
    }
  };

  const applyWatermark = async () => {
    if (!file || !watermarkText) return;
    
    setIsWatermarking(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 2 - (font.widthOfTextAtSize(watermarkText, 60) / 2),
          y: height / 2,
          size: 60,
          font: font,
          color: rgb(0.8, 0.8, 0.8),
          rotate: degrees(45),
          opacity: 0.5,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setWatermarkedPdfUrl(url);
    } catch (error) {
      console.error("Error watermarking PDF:", error);
      alert("An error occurred while adding the watermark.");
    } finally {
      setIsWatermarking(false);
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
            <span className="text-xl font-bold">Add Watermark</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Add Watermark to PDF</h2>
          <p className="text-gray-500 mb-8">Stamp an image or text over your PDF in seconds.</p>

          {!file ? (
            <div className="mb-8">
              <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold transition shadow-lg shadow-purple-200">
                <FileUp className="w-5 h-5" />
                Select PDF File
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : !watermarkedPdfUrl ? (
            <div className="max-w-md mx-auto text-left">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Type className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-800 truncate" title={file.name}>{file.name}</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Text</label>
                  <input 
                    type="text" 
                    value={watermarkText} 
                    onChange={e => setWatermarkText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="e.g. CONFIDENTIAL"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setFile(null)} className="text-gray-500 hover:text-gray-800 font-medium">Cancel</button>
                <button 
                  onClick={applyWatermark} 
                  disabled={isWatermarking || !watermarkText}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition shadow-lg shadow-purple-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isWatermarking ? 'Applying...' : 'Add Watermark'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12">
              <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">Watermark Added Successfully!</h3>
              <a 
                href={watermarkedPdfUrl} 
                download={`watermarked_${file.name}`}
                className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition shadow-lg shadow-purple-200"
              >
                Download PDF
              </a>
              <div className="mt-8">
                <button onClick={() => { setWatermarkedPdfUrl(null); setFile(null); }} className="text-gray-500 hover:text-purple-600 font-medium">
                  Watermark another file
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
