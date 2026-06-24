# Frontend PDF Converter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 100% frontend-only web service that converts HWP, DOCX, XLSX, and TXT files to PDF locally in the browser.

**Architecture:** A static Single Page Application (SPA) bundled with Vite. It uses client-side parser libraries to extract document contents and render them to HTML, then uses `html2pdf.js` to convert the rendered HTML into a downloadable PDF.

**Tech Stack:** HTML5, Vanilla JavaScript, CSS3, Vite, `html2pdf.js`, `mammoth` (for DOCX), `xlsx` (for Excel), and `hwp.js` (for HWP).

---

### Task 1: Project Initialization & Build Setup

**Files:**
- Create: `package.json`
- Modify: `index.html`
- Modify: `src/main.js`
- Modify: `src/style.css`

- [ ] **Step 1: Scaffold Vite Vanilla Project**
```bash
npm create vite@latest . -- --template vanilla -y
npm install
npm install html2pdf.js mammoth xlsx hwp.js
```

- [ ] **Step 2: Clear boilerplate and verify dev server**
Modify `src/main.js` to contain:
```javascript
console.log('App initialized');
```
Modify `src/style.css` to be empty.
Modify `index.html` body to just `<div id="app"></div>`.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "chore: initialize vite project with dependencies"
```

### Task 2: Core UI & Drag-and-Drop Structure

**Files:**
- Modify: `index.html`
- Modify: `src/style.css`
- Modify: `src/main.js`

- [ ] **Step 1: Write UI Structure**
Modify `index.html`:
```html
<div id="app">
  <div class="container">
    <h1>Local PDF Converter</h1>
    <p>Convert your documents to PDF securely in your browser.</p>
    <div id="drop-zone" class="drop-zone">
      <p>Drag & Drop a file here</p>
      <small>Supports: .docx, .xlsx, .txt, .hwp</small>
      <input type="file" id="file-input" hidden />
    </div>
    <div id="status" class="status-hidden"></div>
  </div>
</div>
```

- [ ] **Step 2: Add Styling**
Add premium styling to `src/style.css` with a nice modern gradient, a large dashed drop zone, hover effects, and transitions.

- [ ] **Step 3: Implement Drag-and-Drop Logic**
Modify `src/main.js`:
```javascript
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

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

function handleFile(file) {
  console.log('File selected:', file.name);
  // Next task will implement parsing
}
```

- [ ] **Step 4: Commit**
```bash
git add index.html src/style.css src/main.js
git commit -m "feat: implement drag and drop UI"
```

### Task 3: File Parsing (DOCX, TXT, XLSX)

**Files:**
- Create: `src/parser.js`
- Modify: `src/main.js`

- [ ] **Step 1: Implement Parsers**
Create `src/parser.js`:
```javascript
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

export async function parseFileToHtml(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  if (ext === 'txt') {
    const text = await file.text();
    return `<div style="white-space: pre-wrap; font-family: monospace;">${text}</div>`;
  }
  
  if (ext === 'docx') {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return `<div>${result.value}</div>`;
  }

  if (ext === 'xlsx') {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const html = XLSX.utils.sheet_to_html(worksheet);
    return `<div>${html}</div>`;
  }
  
  throw new Error('Unsupported file format');
}
```

- [ ] **Step 2: Connect Parser to UI**
Modify `src/main.js`:
```javascript
import { parseFileToHtml } from './parser.js';

async function handleFile(file) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = `Parsing ${file.name}...`;
  statusEl.className = 'status-visible';

  try {
    const htmlContent = await parseFileToHtml(file);
    console.log('Parsed HTML length:', htmlContent.length);
    statusEl.textContent = 'Parsing complete! Generating PDF...';
    // Next task will render PDF
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    statusEl.className = 'status-error';
  }
}
```

- [ ] **Step 3: Commit**
```bash
git add src/parser.js src/main.js
git commit -m "feat: implement docx, xlsx, txt parsers"
```

### Task 4: File Parsing (HWP)

**Files:**
- Modify: `src/parser.js`

- [ ] **Step 1: Implement basic HWP parser**
Modify `src/parser.js` to handle `.hwp` using the `hwp.js` library (or a basic text extractor if rendering fails).
```javascript
// Add import at top
import { Hwp } from 'hwp.js';

// Inside parseFileToHtml:
if (ext === 'hwp') {
  // Setup a hidden container to let hwp.js render
  const container = document.createElement('div');
  const hwpObj = new Hwp(file, container);
  await hwpObj.render();
  return container.innerHTML;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/parser.js
git commit -m "feat: add hwp parsing support"
```

### Task 5: PDF Generation

**Files:**
- Modify: `src/main.js`

- [ ] **Step 1: Implement HTML to PDF logic**
Modify `src/main.js`:
```javascript
import html2pdf from 'html2pdf.js';

// Inside handleFile, replace "// Next task will render PDF" with:
const renderContainer = document.createElement('div');
renderContainer.innerHTML = htmlContent;
renderContainer.style.padding = '20px';
renderContainer.style.background = 'white';

const opt = {
  margin:       10,
  filename:     file.name.replace(/\.[^/.]+$/, "") + ".pdf",
  image:        { type: 'jpeg', quality: 0.98 },
  html2canvas:  { scale: 2 },
  jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
};

await html2pdf().set(opt).from(renderContainer).save();
statusEl.textContent = 'Download started!';
setTimeout(() => {
  statusEl.className = 'status-hidden';
}, 3000);
```

- [ ] **Step 2: Commit**
```bash
git add src/main.js
git commit -m "feat: implement pdf generation using html2pdf"
```

## User Review Required

- **Limitations of HWP in Browser**: `hwp.js` is the only pure JS library for HWP and its support for complex layouts/images can be patchy. We will render its output to PDF. If this proves too unstable during testing, we may need to downgrade HWP support to "text-extraction only" or revisit the LibreOffice backend approach.
- **Vite Setup**: Are you okay with using Vite as the bundler? It makes importing libraries like `mammoth` and `xlsx` trivial compared to setting up raw script tags.
