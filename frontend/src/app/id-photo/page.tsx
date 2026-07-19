"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Download, FileImage, Info, Loader2 } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import { brand } from '@/config/brand';

// ── 규격 정의 (Spec) ─────────────────────────────────────────────────────────
const SPECS = [
  { id: 'passport',       label: '여권',       widthCm: 3.5, heightCm: 4.5, forceWhiteBg: true },
  { id: 'half-card',     label: '반명함',     widthCm: 3.0, heightCm: 4.0, forceWhiteBg: false },
  { id: 'drivers',       label: '운전면허',   widthCm: 3.5, heightCm: 4.5, forceWhiteBg: false },
  { id: 'us-visa',       label: '비자(미국)', widthCm: 5.0, heightCm: 5.0, forceWhiteBg: true },
  { id: 'suneung',       label: '수능/입시',  widthCm: 3.0, heightCm: 4.0, forceWhiteBg: false },
  { id: 'custom',        label: '커스텀',     widthCm: 3.5, heightCm: 4.5, forceWhiteBg: false },
] as const;

type SpecId = typeof SPECS[number]['id'];

// 배경색 프리셋
const BG_PRESETS = [
  { label: '흰색',   value: '#FFFFFF' },
  { label: '파란색', value: '#4A90D9' },
  { label: '회색',   value: '#808080' },
];

// DPI → px 변환 (300 DPI)
const DPI = 300;
const CM_TO_INCH = 1 / 2.54;
const cmToPx = (cm: number) => Math.round(cm * CM_TO_INCH * DPI);

// A4 크기 (mm)
const A4_W_MM = 210;
const A4_H_MM = 297;

type Step = 'upload' | 'processing' | 'adjust' | 'done';

export default function IdPhotoPage() {
  const [step, setStep] = useState<Step>('upload');
  const [modelLoadMsg, setModelLoadMsg] = useState('');
  const [progress, setProgress] = useState(0);

  // 원본 / 배경제거 결과
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [removedBgBlob, setRemovedBgBlob] = useState<Blob | null>(null);

  // 규격 & 배경색
  const [selectedSpecId, setSelectedSpecId] = useState<SpecId>('half-card');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [customW, setCustomW] = useState(3.5);
  const [customH, setCustomH] = useState(4.5);

  // 크롭 조정
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const removedBgImageRef = useRef<HTMLImageElement | null>(null);

  const [error, setError] = useState<string | null>(null);

  const selectedSpec = SPECS.find(s => s.id === selectedSpecId)!;
  const effectiveBg = selectedSpec.forceWhiteBg ? '#FFFFFF' : bgColor;
  const outW = selectedSpecId === 'custom' ? cmToPx(customW) : cmToPx(selectedSpec.widthCm);
  const outH = selectedSpecId === 'custom' ? cmToPx(customH) : cmToPx(selectedSpec.heightCm);

  // ── 업로드 처리 ────────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('JPG 또는 PNG 이미지 파일을 선택해주세요.');
      return;
    }
    setError(null);
    setOriginalUrl(URL.createObjectURL(file));
    setStep('processing');
    setCropOffset({ x: 0, y: 0 });

    try {
      setModelLoadMsg('AI 모델을 처음 로드 중입니다. 이후에는 캐시되어 빠르게 실행됩니다...');
      setProgress(0);

      // dynamic import — 서버 사이드 실행 방지
      const { removeBackground } = await import('@imgly/background-removal');

      setModelLoadMsg('배경 제거 중...');

      const resultBlob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
      });

      setRemovedBgBlob(resultBlob);
      setModelLoadMsg('');
      setStep('adjust');
    } catch (e) {
      console.error(e);
      setError('배경 제거 중 오류가 발생했습니다. 다시 시도해주세요.');
      setStep('upload');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  // ── 캔버스 렌더링 ──────────────────────────────────────────────────────────
  const drawPreview = useCallback(() => {
    const canvas = previewRef.current;
    const img = removedBgImageRef.current;
    if (!canvas || !img) return;

    const PREVIEW_H = 320;
    const ratio = outW / outH;
    const PREVIEW_W = Math.round(PREVIEW_H * ratio);

    canvas.width = PREVIEW_W;
    canvas.height = PREVIEW_H;
    const ctx = canvas.getContext('2d')!;

    // 배경색 채우기
    ctx.fillStyle = effectiveBg;
    ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H);

    // 이미지 피팅 (contain, face centering offset 적용)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawW = PREVIEW_W;
    let drawH = drawW / imgRatio;
    if (drawH < PREVIEW_H) {
      drawH = PREVIEW_H;
      drawW = drawH * imgRatio;
    }
    const baseX = (PREVIEW_W - drawW) / 2;
    const baseY = (PREVIEW_H - drawH) / 2;

    ctx.drawImage(img, baseX + cropOffset.x, baseY + cropOffset.y, drawW, drawH);
  }, [outW, outH, effectiveBg, cropOffset]);

  // removedBgBlob → HTMLImageElement 캐시
  useEffect(() => {
    if (!removedBgBlob) return;
    const url = URL.createObjectURL(removedBgBlob);
    const img = new Image();
    img.onload = () => {
      removedBgImageRef.current = img;
      drawPreview();
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [removedBgBlob, drawPreview]);

  // 규격/배경/오프셋 변경 시 재렌더
  useEffect(() => {
    if (step === 'adjust') drawPreview();
  }, [step, drawPreview, effectiveBg, outW, outH, cropOffset]);

  // ── 드래그로 얼굴 위치 미세 조정 ───────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: cropOffset.x, oy: cropOffset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  };
  const onMouseUp = () => setIsDragging(false);

  // ── 최종 이미지 렌더링 (고해상도) ─────────────────────────────────────────
  const renderFinalCanvas = useCallback((): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d')!;
    const img = removedBgImageRef.current!;

    ctx.fillStyle = effectiveBg;
    ctx.fillRect(0, 0, outW, outH);

    const PREVIEW_H = 320;
    const ratio = outW / outH;
    const PREVIEW_W = Math.round(PREVIEW_H * ratio);
    const scale = outW / PREVIEW_W;

    const imgRatio = img.naturalWidth / img.naturalHeight;
    let drawW = PREVIEW_W;
    let drawH = drawW / imgRatio;
    if (drawH < PREVIEW_H) {
      drawH = PREVIEW_H;
      drawW = drawH * imgRatio;
    }
    const baseX = (PREVIEW_W - drawW) / 2;
    const baseY = (PREVIEW_H - drawH) / 2;

    ctx.drawImage(
      img,
      (baseX + cropOffset.x) * scale,
      (baseY + cropOffset.y) * scale,
      drawW * scale,
      drawH * scale,
    );
    return canvas;
  }, [outW, outH, effectiveBg, cropOffset]);

  // ── 이미지 저장 ────────────────────────────────────────────────────────────
  const downloadImage = useCallback(() => {
    const canvas = renderFinalCanvas();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `id-photo-${selectedSpec.label}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  }, [renderFinalCanvas, selectedSpec.label]);

  // ── 인쇄 레이아웃 PDF 저장 ─────────────────────────────────────────────────
  const downloadPdf = useCallback(async () => {
    const canvas = renderFinalCanvas();
    const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
    const jpegBytes = await fetch(jpegUrl).then(r => r.arrayBuffer());

    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(jpegBytes);

    // A4 크기 (pt, 1pt = 1/72 inch)
    const MM_TO_PT = 72 / 25.4;
    const a4W = A4_W_MM * MM_TO_PT;
    const a4H = A4_H_MM * MM_TO_PT;

    const specW = (selectedSpecId === 'custom' ? customW : selectedSpec.widthCm) * 10; // mm
    const specH = (selectedSpecId === 'custom' ? customH : selectedSpec.heightCm) * 10; // mm
    const imgW = specW * MM_TO_PT;
    const imgH = specH * MM_TO_PT;

    const margin = 10 * MM_TO_PT;
    const cols = Math.floor((a4W - margin) / (imgW + margin));
    const rows = Math.floor((a4H - margin) / (imgH + margin));
    const count = Math.max(1, cols * rows);

    const page = pdfDoc.addPage([a4W, a4H]);

    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = margin + col * (imgW + margin);
      const y = a4H - margin - (row + 1) * imgH - row * margin;
      page.drawImage(jpgImage, { x, y, width: imgW, height: imgH });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `id-photo-${selectedSpec.label}-print.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [renderFinalCanvas, selectedSpec, selectedSpecId, customW, customH]);

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-blue-600 transition">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <span className="text-xl font-bold">증명사진 자동화</span>
          </div>
          <span className="text-sm text-green-600 flex items-center gap-1 font-medium">
            <Info className="w-4 h-4" /> {brand.localBadge}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* ── 업로드 단계 ── */}
        {step === 'upload' && (
          <div
            className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-16 text-center hover:border-blue-400 transition cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
                <FileImage className="w-10 h-10 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold mb-3">증명사진 자동화</h1>
                <p className="text-gray-500 mb-2">
                  사진을 업로드하면 배경이 자동으로 제거되고 원하는 규격에 맞게 저장할 수 있습니다.
                </p>
                <p className="text-sm text-gray-400">여권 · 반명함 · 운전면허 · 비자 · 수능 규격 지원</p>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition shadow-lg shadow-indigo-200">
                <Upload className="w-5 h-5" />
                사진 업로드
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </label>
              <p className="text-xs text-gray-400">JPG, PNG, WebP 지원 · 드래그 앤 드롭 가능</p>
            </div>
            {error && <p className="mt-6 text-red-500 font-medium">{error}</p>}
          </div>
        )}

        {/* ── 처리 중 ── */}
        {step === 'processing' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">배경 제거 중...</h2>
            {modelLoadMsg && (
              <p className="text-gray-500 text-sm mb-4">{modelLoadMsg}</p>
            )}
            {progress > 0 && (
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">{progress}%</p>
              </div>
            )}
          </div>
        )}

        {/* ── 조정 & 다운로드 단계 ── */}
        {step === 'adjust' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 왼쪽: 미리보기 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-700">미리보기</h2>
              <p className="text-xs text-gray-400 mb-3">드래그하여 얼굴 위치를 조정하세요</p>
              <div
                className="flex justify-center"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
              >
                <canvas
                  ref={previewRef}
                  className="rounded-lg shadow border border-gray-200 select-none"
                  style={{ imageRendering: 'crisp-edges', maxWidth: '100%' }}
                />
              </div>
            </div>

            {/* 오른쪽: 규격/배경색/다운로드 */}
            <div className="flex flex-col gap-6">
              {/* 규격 선택 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold mb-4 text-gray-700">규격 선택</h2>
                <div className="grid grid-cols-3 gap-2">
                  {SPECS.map(spec => (
                    <button
                      key={spec.id}
                      onClick={() => setSelectedSpecId(spec.id)}
                      className={`py-2 px-3 rounded-xl text-sm font-medium border transition ${
                        selectedSpecId === spec.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {spec.label}
                      {spec.id !== 'custom' && (
                        <span className="block text-xs opacity-70">
                          {spec.widthCm}×{spec.heightCm}cm
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {selectedSpecId === 'custom' && (
                  <div className="mt-4 flex items-center gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">가로 (cm)</label>
                      <input
                        type="number"
                        value={customW}
                        onChange={e => setCustomW(parseFloat(e.target.value) || 3.5)}
                        step="0.1" min="1" max="20"
                        className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <span className="mt-4 text-gray-400">×</span>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">세로 (cm)</label>
                      <input
                        type="number"
                        value={customH}
                        onChange={e => setCustomH(parseFloat(e.target.value) || 4.5)}
                        step="0.1" min="1" max="20"
                        className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 배경색 선택 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold mb-1 text-gray-700">배경색</h2>
                {selectedSpec.forceWhiteBg && (
                  <p className="text-amber-600 text-xs mb-3 flex items-center gap-1">
                    <Info className="w-3 h-3" /> 여권사진은 흰색 배경만 허용됩니다
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  {BG_PRESETS.map(p => (
                    <button
                      key={p.value}
                      onClick={() => !selectedSpec.forceWhiteBg && setBgColor(p.value)}
                      disabled={selectedSpec.forceWhiteBg}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition ${
                        effectiveBg === p.value
                          ? 'border-indigo-500 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300 inline-block"
                        style={{ backgroundColor: p.value }}
                      />
                      {p.label}
                    </button>
                  ))}
                  {!selectedSpec.forceWhiteBg && (
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium cursor-pointer hover:border-gray-300">
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: bgColor }}
                      />
                      직접 선택
                      <input
                        type="color"
                        value={bgColor}
                        onChange={e => setBgColor(e.target.value)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 다운로드 버튼 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
                <h2 className="text-lg font-bold mb-2 text-gray-700">다운로드</h2>
                <button
                  onClick={downloadImage}
                  className="flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition shadow-md shadow-indigo-100"
                >
                  <Download className="w-5 h-5" />
                  이미지 저장
                </button>
                <button
                  onClick={downloadPdf}
                  className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-50 text-indigo-700 border-2 border-indigo-200 rounded-xl font-semibold transition"
                >
                  <FileImage className="w-5 h-5" />
                  인쇄용 PDF (A4 배열)
                </button>
                <p className="text-xs text-gray-400 text-center">
                  인쇄용 PDF는 A4 한 장에 최대한 많은 사진을 자동 배열합니다
                </p>
              </div>

              {/* 다시 시작 */}
              <button
                onClick={() => { setStep('upload'); setRemovedBgBlob(null); setOriginalUrl(null); setCropOffset({ x: 0, y: 0 }); }}
                className="text-gray-500 hover:text-indigo-600 text-sm font-medium text-center transition"
              >
                다른 사진으로 다시 시작
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-24 py-8 text-center text-gray-400 text-sm">
        <p>{brand.copyright(new Date().getFullYear())}</p>
      </footer>
    </div>
  );
}
