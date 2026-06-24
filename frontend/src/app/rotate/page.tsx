"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { PDFDocument, degrees } from 'pdf-lib';
import { RefreshCw, ArrowLeft, FileUp, Download } from 'lucide-react';

export default function RotatePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [isRotating, setIsRotating] = useState(false);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setRotatedPdfUrl(null);
    }
  };

  const rotatePDF = async () => {
    if (!file) return;
    
    setIsRotating(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + rotationAngle));
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setRotatedPdfUrl(url);
    } catch (error) {
      console.error("Error rotating PDF:", error);
      alert("An error occurred while rotating the PDF.");
    } finally {
      setIsRotating(false);
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
            <span className="text-xl font-bold">Rotate PDF</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Rotate PDF Pages</h2>
          <p className="text-gray-500 mb-8">Rotate your PDFs the way you need them. All pages will be rotated at once.</p>

          {!file ? (
            <div className="mb-8">
              <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-semibold transition shadow-lg shadow-yellow-200">
                <FileUp className="w-5 h-5" />
                Select PDF File
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : !rotatedPdfUrl ? (
            <div className="max-w-md mx-auto text-left">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <RefreshCw className="w-6 h-6 text-yellow-600" />
                  <span className="font-semibold text-gray-800 truncate" title={file.name}>{file.name}</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Rotation Angle</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[90, 180, 270].map((angle) => (
                      <button
                        key={angle}
                        onClick={() => setRotationAngle(angle)}
                        className={`py-2 px-4 rounded-lg border font-medium transition ${
                          rotationAngle === angle 
                            ? 'bg-yellow-500 text-white border-yellow-500 shadow-md' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                        }`}
                      >
                        Right {angle}°
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setFile(null)} className="text-gray-500 hover:text-gray-800 font-medium">Cancel</button>
                <button 
                  onClick={rotatePDF} 
                  disabled={isRotating}
                  className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-bold transition shadow-lg shadow-yellow-200 disabled:opacity-50 flex items-center gap-2"
                >
                  {isRotating ? 'Rotating...' : 'Rotate PDF'}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12">
              <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Download className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-gray-900">PDF Rotated Successfully!</h3>
              <a 
                href={rotatedPdfUrl} 
                download={`rotated_${file.name}`}
                className="inline-block px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full font-bold transition shadow-lg shadow-yellow-200"
              >
                Download Rotated PDF
              </a>
              <div className="mt-8">
                <button onClick={() => { setRotatedPdfUrl(null); setFile(null); }} className="text-gray-500 hover:text-yellow-600 font-medium">
                  Rotate another file
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
