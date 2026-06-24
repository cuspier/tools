import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import init, { HwpDocument } from '@rhwp/core';

let wasmInitialized = false;

// Register measureTextWidth globally (required by @rhwp/core for text layout)
let ctx = null;
let lastFont = '';
if (typeof globalThis !== 'undefined') {
  globalThis.measureTextWidth = (font, text) => {
    if (!ctx && typeof document !== 'undefined') {
      ctx = document.createElement('canvas').getContext('2d');
    }
    if (!ctx) return 0;
    if (font !== lastFont) { ctx.font = font; lastFont = font; }
    return ctx.measureText(text).width;
  };
}

async function ensureWasmInit() {
  if (!wasmInitialized) {
    await init({ module_or_path: '/rhwp_bg.wasm' });
    wasmInitialized = true;
  }
}

export async function parseFileToHtml(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  if (ext === 'txt') {
    const text = await file.text();
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<div style="white-space: pre-wrap; font-family: monospace; font-size: 14px; line-height: 1.6;">${escaped}</div>`;
  }
  
  if (ext === 'docx') {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;">${result.value}</div>`;
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const html = XLSX.utils.sheet_to_html(worksheet);
    return `<div style="font-family: sans-serif; font-size: 12px;">${html}</div>`;
  }

  if (ext === 'hwp' || ext === 'hwpx') {
    await ensureWasmInit();
    try {
      const uint8 = new Uint8Array(arrayBuffer);
      const doc = new HwpDocument(uint8);
      const totalPages = doc.pageCount();

      // Render all pages as SVG
      let svgParts = [];
      for (let i = 0; i < totalPages; i++) {
        const svg = doc.renderPageSvg(i);
        svgParts.push(`<div class="hwp-page" style="margin-bottom: 20px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 4px; overflow: hidden;">${svg}</div>`);
      }

      doc.free();
      return `<style>.hwp-page svg { width: 100% !important; height: auto !important; display: block; }</style><div>${svgParts.join('')}</div>`;
    } catch (err) {
      throw new Error('HWP rendering failed: ' + err.message);
    }
  }
  
  throw new Error('Unsupported file format: .' + ext);
}
