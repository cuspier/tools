"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { ArrowLeft, FileUp, Download, Plus, Save } from 'lucide-react';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

type Annotation = {
  id: string;
  text: string;
  x: number;
  y: number;
};

export default function EditPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [editedPdfUrl, setEditedPdfUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setEditedPdfUrl(null);
      setAnnotations([]);
      renderPdfPage(selectedFile);
    }
  };

  const renderPdfPage = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.0 });
      setPdfDimensions({ width: viewport.width, height: viewport.height });

      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
        }
      }
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setAnnotations([
      ...annotations,
      { id: Date.now().toString(), text: 'New Text', x, y }
    ]);
  };

  const updateAnnotationText = (id: string, text: string) => {
    setAnnotations(annotations.map(ann => ann.id === id ? { ...ann, text } : ann));
  };

  const saveEditedPDF = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const pages = pdfDoc.getPages();
      const page = pages[0];
      const { height } = page.getSize();

      annotations.forEach(ann => {
        page.drawText(ann.text, {
          x: ann.x,
          y: height - ann.y - 16,
          size: 16,
          font: font,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setEditedPdfUrl(url);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("An error occurred while saving the edited PDF.");
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
            <span className="text-xl font-bold">Edit PDF</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!file ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-12">
            <h2 className="text-3xl font-bold mb-4">Edit PDF Content</h2>
            <p className="text-gray-500 mb-8">Add text annotations directly to your PDF document.</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition shadow-lg shadow-emerald-200">
              <FileUp className="w-5 h-5" />
              Select PDF File
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 overflow-auto">
                <p className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Click anywhere on the document to add text.
                </p>
                <div 
                  ref={containerRef}
                  className="relative mx-auto border shadow-sm cursor-crosshair bg-white"
                  style={{ width: pdfDimensions.width || 'auto', height: pdfDimensions.height || 'auto' }}
                  onClick={handleContainerClick}
                >
                  <canvas ref={canvasRef} className="absolute top-0 left-0" />
                  {annotations.map(ann => (
                    <input
                      key={ann.id}
                      type="text"
                      value={ann.text}
                      onChange={(e) => updateAnnotationText(ann.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bg-transparent border border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-black font-sans px-1"
                      style={{ 
                        left: ann.x, 
                        top: ann.y, 
                        fontSize: '16px',
                        transform: 'translateY(-50%)'
                      }}
                      autoFocus
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Actions</h3>
                
                {!editedPdfUrl ? (
                  <div className="space-y-4">
                    <button 
                      onClick={saveEditedPDF} 
                      disabled={isProcessing}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {isProcessing ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      onClick={() => { setFile(null); setAnnotations([]); }} 
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium mb-4">
                      Document saved successfully!
                    </div>
                    <a 
                      href={editedPdfUrl} 
                      download={`edited_${file.name}`}
                      className="block text-center w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-sm"
                    >
                      Download PDF
                    </a>
                    <button 
                      onClick={() => { setFile(null); setEditedPdfUrl(null); setAnnotations([]); }} 
                      className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
                    >
                      Edit another file
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
