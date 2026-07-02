"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ArrowLeft, FileUp, Download, Plus, Save, Trash2, Layers } from 'lucide-react';

type Annotation = {
  id: string;
  text: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};

type PageItem = 
  | { type: 'original'; originalPageIndex: number; id: string }
  | { type: 'blank'; id: string };

type PageAnnotations = Record<string, Annotation[]>;

export default function EditPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [editedPdfUrl, setEditedPdfUrl] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<PageAnnotations>({});
  const [pages, setPages] = useState<PageItem[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  
  // Dragging states
  const [draggedAnnId, setDraggedAnnId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setEditedPdfUrl(null);
      setAnnotations({});
      setPages([]);
      setCurrentPageIndex(0);
      
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        setPdfBytes(arrayBuffer);
        
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        const initialPages: PageItem[] = Array.from({ length: count }, (_, i) => ({
          type: 'original',
          originalPageIndex: i,
          id: `original-${i}-${Date.now()}-${Math.random()}`
        }));
        
        setPages(initialPages);
        setCurrentPageIndex(0);
        await renderPdfPage(initialPages[0], arrayBuffer);
      } catch (error) {
        console.error("Failed to read PDF:", error);
        alert("Could not read this PDF. It might be corrupted or protected.");
        setFile(null);
      }
    }
  };

  const renderPdfPage = async (activePage: PageItem, bytes: ArrayBuffer) => {
    if (activePage.type === 'blank') {
      setPdfDimensions({ width: 595, height: 842 }); // Standard A4 size
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.width = 595;
        canvas.height = 842;
        if (context) {
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, 595, 842);
        }
      }
      return;
    }

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      
      const loadingTask = pdfjsLib.getDocument(new Uint8Array(bytes.slice(0)));
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(activePage.originalPageIndex + 1);

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
          await page.render(renderContext as unknown as Parameters<typeof page.render>[0]).promise;
        }
      }
    } catch (error) {
      console.error("Error rendering PDF:", error);
    }
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent adding annotation when dragging is finishing or active
    if (draggedAnnId) return;
    if (!containerRef.current || !pages[currentPageIndex]) return;
    
    // Check if clicked element is an input or close button
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.closest('.delete-ann-btn')) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pageId = pages[currentPageIndex].id;
    const activeAnnotations = annotations[pageId] || [];

    setAnnotations({
      ...annotations,
      [pageId]: [
        ...activeAnnotations,
        { id: Date.now().toString(), text: 'New Text', x, y }
      ]
    });
  };

  const updateAnnotationText = (id: string, text: string) => {
    const pageId = pages[currentPageIndex]?.id;
    if (!pageId) return;
    const activeAnnotations = annotations[pageId] || [];
    setAnnotations({
      ...annotations,
      [pageId]: activeAnnotations.map(ann => ann.id === id ? { ...ann, text } : ann)
    });
  };

  const deleteAnnotation = (id: string) => {
    const pageId = pages[currentPageIndex]?.id;
    if (!pageId) return;
    const activeAnnotations = annotations[pageId] || [];
    setAnnotations({
      ...annotations,
      [pageId]: activeAnnotations.filter(ann => ann.id !== id)
    });
  };

  const addBlankPage = () => {
    const newPageId = `blank-${Date.now()}-${Math.random()}`;
    const updatedPages = [
      ...pages,
      { type: 'blank' as const, id: newPageId }
    ];
    setPages(updatedPages);
    setCurrentPageIndex(updatedPages.length - 1);
    if (pdfBytes) {
      renderPdfPage({ type: 'blank', id: newPageId }, pdfBytes);
    }
  };

  const deletePage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pages.length <= 1) {
      alert("A PDF must have at least one page.");
      return;
    }
    const updatedPages = pages.filter((_, i) => i !== index);
    setPages(updatedPages);
    
    let newIndex = currentPageIndex;
    if (index <= currentPageIndex) {
      newIndex = Math.max(0, currentPageIndex - 1);
    }
    setCurrentPageIndex(newIndex);
    if (pdfBytes && updatedPages[newIndex]) {
      renderPdfPage(updatedPages[newIndex], pdfBytes);
    }
  };

  const switchPage = (index: number) => {
    setCurrentPageIndex(index);
    if (pdfBytes && pages[index]) {
      renderPdfPage(pages[index], pdfBytes);
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, annId: string) => {
    e.stopPropagation();
    const pageId = pages[currentPageIndex]?.id;
    if (!pageId) return;
    const ann = annotations[pageId]?.find(a => a.id === annId);
    if (!ann) return;

    setDraggedAnnId(annId);
    setDragStartPos({
      x: e.clientX - ann.x,
      y: e.clientY - ann.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedAnnId || !containerRef.current) return;
    const pageId = pages[currentPageIndex]?.id;
    if (!pageId) return;

    const newX = e.clientX - dragStartPos.x;
    const newY = e.clientY - dragStartPos.y;

    // Clamp coordinates to bounds
    const clampedX = Math.max(0, Math.min(newX, pdfDimensions.width - 80));
    const clampedY = Math.max(0, Math.min(newY, pdfDimensions.height - 20));

    const activeAnnotations = annotations[pageId] || [];
    setAnnotations({
      ...annotations,
      [pageId]: activeAnnotations.map(ann => 
        ann.id === draggedAnnId ? { ...ann, x: clampedX, y: clampedY } : ann
      )
    });
  };

  const handleMouseUp = () => {
    setDraggedAnnId(null);
  };

  const handleTextareaMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>, annId: string) => {
    const pageId = pages[currentPageIndex]?.id;
    if (!pageId) return;
    const textarea = e.currentTarget;
    const width = textarea.clientWidth;
    const height = textarea.clientHeight;
    
    const activeAnnotations = annotations[pageId] || [];
    setAnnotations({
      ...annotations,
      [pageId]: activeAnnotations.map(ann => 
        ann.id === annId ? { ...ann, width, height } : ann
      )
    });
  };

  const saveEditedPDF = async () => {
    if (!file || !pdfBytes) return;
    
    setIsProcessing(true);
    try {
      const originalPdf = await PDFDocument.load(pdfBytes);
      const newPdf = await PDFDocument.create();
      const font = await newPdf.embedFont(StandardFonts.Helvetica);

      for (const pageItem of pages) {
        let newPage;
        let originalPageHeight = 842;
        
        if (pageItem.type === 'original') {
          const [copiedPage] = await newPdf.copyPages(originalPdf, [pageItem.originalPageIndex]);
          newPage = newPdf.addPage(copiedPage);
          originalPageHeight = newPage.getSize().height;
        } else {
          newPage = newPdf.addPage([595, 842]);
        }

        const pageAnns = annotations[pageItem.id] || [];
        pageAnns.forEach(ann => {
          newPage.drawText(ann.text, {
            x: ann.x,
            y: originalPageHeight - ann.y - 16,
            size: 16,
            font: font,
            color: rgb(0, 0, 0),
            maxWidth: ann.width || 150,
            lineHeight: 20,
          });
        });
      }

      const pdfBytesOutput = await newPdf.save();
      const blob = new Blob([pdfBytesOutput as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setEditedPdfUrl(url);
    } catch (error) {
      console.error("Error saving PDF:", error);
      alert("An error occurred while saving the edited PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const activePage = pages[currentPageIndex];
  const activeAnnotations = activePage ? (annotations[activePage.id] || []) : [];

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

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!file ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-12">
            <h2 className="text-3xl font-bold mb-4">Edit PDF Content</h2>
            <p className="text-gray-500 mb-8">Add, remove, or rearrange pages, and add text annotations directly to your PDF.</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold transition shadow-lg shadow-emerald-200">
              <FileUp className="w-5 h-5" />
              Select PDF File
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Sidebar with page thumbnails */}
            <div className="w-full lg:w-60 shrink-0 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 self-stretch min-h-[500px]">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-gray-700">Pages ({pages.length})</span>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[600px] pr-1 flex flex-col gap-3">
                {pages.map((pageItem, index) => (
                  <div
                    key={pageItem.id}
                    onClick={() => switchPage(index)}
                    className={`group relative p-3 rounded-lg border-2 cursor-pointer transition flex items-center justify-between ${
                      index === currentPageIndex
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-xs font-semibold text-gray-500 shadow-sm">
                        {pageItem.type === 'original' ? 'PDF' : 'Blank'}
                      </div>
                      <span className="font-medium text-sm text-gray-700">Page {index + 1}</span>
                    </div>
                    
                    <button
                      onClick={(e) => deletePage(index, e)}
                      className="delete-page-btn text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition lg:opacity-0 group-hover:opacity-100"
                      title="Delete Page"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addBlankPage}
                className="w-full py-2.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-semibold rounded-lg transition flex items-center justify-center gap-2 border border-gray-200 border-dashed hover:border-emerald-300"
              >
                <Plus className="w-4 h-4" />
                Add Blank Page
              </button>
            </div>

            {/* Main editing workspace */}
            <div className="flex-1 min-w-0">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-auto">
                <p className="text-sm text-gray-500 mb-4 font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Click anywhere on the document to add text. Drag text to move it.
                </p>
                <div 
                  ref={containerRef}
                  className="relative mx-auto border shadow-sm cursor-crosshair bg-white select-none"
                  style={{ width: pdfDimensions.width || 'auto', height: pdfDimensions.height || 'auto' }}
                  onClick={handleContainerClick}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <canvas ref={canvasRef} className="absolute top-0 left-0 pointer-events-none" />
                  {activeAnnotations.map(ann => (
                    <div
                      key={ann.id}
                      className="absolute group flex items-start pointer-events-auto"
                      style={{ 
                        left: ann.x, 
                        top: ann.y
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <textarea
                        value={ann.text}
                        onChange={(e) => updateAnnotationText(ann.id, e.target.value)}
                        onMouseDown={(e) => handleMouseDown(e, ann.id)}
                        onMouseUp={(e) => handleTextareaMouseUp(e, ann.id)}
                        className="bg-white/80 backdrop-blur-xs border border-blue-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none text-black font-sans px-1 py-0.5 cursor-move text-base min-w-[80px]"
                        style={{ 
                          width: ann.width ? `${ann.width}px` : '150px',
                          height: ann.height ? `${ann.height}px` : '60px',
                          resize: 'both'
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => deleteAnnotation(ann.id)}
                        className="delete-ann-btn ml-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow-sm shrink-0"
                        title="Delete Annotation"
                      >
                        <Plus className="w-3.5 h-3.5 rotate-45" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions panel */}
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
                      onClick={() => { setFile(null); setPdfBytes(null); setAnnotations({}); setPages([]); }} 
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
                      onClick={() => { setFile(null); setEditedPdfUrl(null); setPdfBytes(null); setAnnotations({}); setPages([]); }} 
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
