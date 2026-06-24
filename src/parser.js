import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Hwp } from 'hwp.js';

export async function parseFileToHtml(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  if (ext === 'txt') {
    const text = await file.text();
    return `<div style="white-space: pre-wrap; font-family: monospace; font-size: 14px;">${text}</div>`;
  }
  
  if (ext === 'docx') {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return `<div style="font-family: sans-serif; font-size: 14px; line-height: 1.5;">${result.value}</div>`;
  }

  if (ext === 'xlsx') {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const html = XLSX.utils.sheet_to_html(worksheet);
    return `<div style="font-family: sans-serif; font-size: 12px;">${html}</div>`;
  }

  if (ext === 'hwp') {
    return new Promise((resolve, reject) => {
      try {
        const container = document.createElement('div');
        container.style.fontFamily = 'sans-serif';
        // Hwp.js expects a file object and a DOM element
        const hwpObj = new Hwp(file, container);
        // Sometimes hwp.js might throw errors on complex files
        hwpObj.render().then(() => {
          resolve(container.innerHTML);
        }).catch(err => {
          reject(new Error("Failed to render HWP file. " + err.message));
        });
      } catch (err) {
        reject(new Error("HWP parsing error: " + err.message));
      }
    });
  }
  
  throw new Error('Unsupported file format: .' + ext);
}
