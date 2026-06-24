"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import { Scissors, ArrowLeft, FileUp, Download } from 'lucide-react';

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [startPage, setStartPage] = useState<number>(1);
  const [endPage, setEndPage] = useState<number>(1);
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setSplitPdfUrl(null);
      
      // Load PDF to get page count
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setTotalPages(count);
        setStartPage(1);
        setEndPage(count);
      } catch (error) {
        console.error("Failed to read PDF:", error);
        alert("Could not read this PDF. It might be corrupted or protected.");
        setFile(null);
      }
    }
  };

  const splitPDF = async () => {
    if (!file) return;
    if (startPage < 1 || endPage > totalPages || startPage > endPage) {
      return alert("Invalid page range.");
    }
    
    setIsSplitting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // pdf-lib uses 0-based indices
      const pageIndices = [];
      for (let i = startPage - 1; i < endPage; i++) {
        pageIndices.push(i);
      }

      const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("An error occurred while splitting the PDF.");
    } finally {
      setIsSplitting(false);
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
            <span className="text-xl font-bold">Split PDF</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Extract Pages from PDF</h2>
          <p className="text-gray-500 mb-8">Separate one page or a whole set for easy conversion into independent PDF files.</p>

          {!file ? (
            <div className="mb-8">
              <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-semibold transition shadow-lg shadow-green-200">
                <FileUp className="w-5 h-5" />
                Select PDF File
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : !splitPdfUrl ? (
            <div className="max-w-md mx-auto text-left">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Scissors className="w-6 h-6 text-green-600" />
                  <span className="font-semibold text-gray-800 truncate" title={file.name}>{file.name}</span>
                </div>
                <p className="text-sm text-gray-500 mb-6">Total Pages: {totalPages}</p>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Page</label>
                    <input 
                      type="number" 
                      min={1} 
                      max={endPage} 
                      value={startPage} 
                      onChange={e => setStartPage(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Page</label>
                    <input 
                      type="number" 
                      min={startPage} 
                      max={totalPages} 
                      value={endPage} 
                      onChange={e => setEndPage(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setFile(null)} className="text-gray-500 hover:text-gray-800 font-medium">Cancel</button>
                <button 
                  onClick={splitPDF} 
                  disabled={isSplitting}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition shadow-lg shadow-green-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSplitting ? 'Extracting...' : 'Extract Pages'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">PDF Extracted Successfully!</h3>
              <a 
                href={splitPdfUrl} 
                download={`${file.name.replace('.pdf', '')}_${startPage}-${endPage}.pdf`}
                className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition shadow-lg shadow-green-200"
              >
                Download Extracted PDF
              </a>
              <div className="mt-8">
                <button onClick={() => { setSplitPdfUrl(null); setFile(null); }} className="text-gray-500 hover:text-green-600 font-medium">
                  Split another file
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
