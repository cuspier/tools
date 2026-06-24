import './style.css';
import { parseFileToHtml } from './parser.js';
import html2pdf from 'html2pdf.js';

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const statusEl = document.getElementById('status');

// Prevent browser from opening dropped files anywhere on the page
window.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); });
window.addEventListener('drop', (e) => { e.preventDefault(); e.stopPropagation(); });

// Click to open file browser
dropZone.addEventListener('click', () => fileInput.click());

// Drag visual feedback
dropZone.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-active');
});

dropZone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-active');
});

// Drop handler
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-active');
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

// File input handler
fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
    fileInput.value = ''; // Reset so same file can be re-uploaded
  }
});

async function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const supported = ['docx', 'xlsx', 'xls', 'txt', 'hwp'];
  if (!supported.includes(ext)) {
    statusEl.textContent = `Unsupported format: .${ext} (Supported: .docx, .xlsx, .hwp, .txt)`;
    statusEl.className = 'status-error';
    return;
  }

  statusEl.textContent = `Processing "${file.name}"... (locally in your browser)`;
  statusEl.className = 'status-visible';

  try {
    const htmlContent = await parseFileToHtml(file);

    statusEl.textContent = 'Generating PDF...';

    const renderContainer = document.createElement('div');
    renderContainer.innerHTML = htmlContent;
    renderContainer.style.padding = '20px';
    renderContainer.style.background = 'white';
    renderContainer.style.color = 'black';

    const opt = {
      margin:       10,
      filename:     file.name.replace(/\.[^/.]+$/, '') + '.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(opt).from(renderContainer).save();

    statusEl.textContent = '✅ PDF downloaded successfully!';
    statusEl.className = 'status-success';
    setTimeout(() => { statusEl.className = 'status-hidden'; }, 5000);

  } catch (error) {
    console.error(error);
    statusEl.textContent = `❌ Error: ${error.message}`;
    statusEl.className = 'status-error';
  }
}
