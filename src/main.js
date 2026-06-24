import './style.css';
import { parseFileToHtml } from './parser.js';
import html2pdf from 'html2pdf.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusEl = document.getElementById('status');

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-active');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-active');
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

async function handleFile(file) {
  statusEl.textContent = `Parsing ${file.name}... (This happens locally on your PC)`;
  statusEl.className = 'status-visible';

  try {
    const htmlContent = await parseFileToHtml(file);
    
    statusEl.textContent = 'Parsing complete! Generating PDF...';
    
    const renderContainer = document.createElement('div');
    renderContainer.innerHTML = htmlContent;
    renderContainer.style.padding = '20px';
    renderContainer.style.background = 'white';
    renderContainer.style.color = 'black';

    const opt = {
      margin:       10,
      filename:     file.name.replace(/\.[^/.]+$/, "") + ".pdf",
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(renderContainer).save();
    
    statusEl.textContent = 'Download started!';
    setTimeout(() => {
      statusEl.className = 'status-hidden';
    }, 4000);

  } catch (error) {
    console.error(error);
    statusEl.textContent = `Error: ${error.message}`;
    statusEl.className = 'status-error';
  }
}
