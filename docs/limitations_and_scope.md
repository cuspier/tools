# Project Limitations and Scope

Based on the core principle of **100% Local Browser Execution**, this document outlines what features are fully supported and what limitations exist compared to server-based PDF tools.

## Supported Features (Fully Implemented in Browser)
The following features are natively supported using client-side JavaScript (`pdf-lib`, `pdf.js`, `tesseract.js`):
1. **Merge PDFs**: Combine multiple PDF files into one.
2. **Split PDFs**: Extract specific pages or split a PDF into individual files.
3. **Rotate PDFs**: Rotate individual pages or the entire document.
4. **Watermark PDFs**: Overlay text or images on existing PDF pages.
5. **Edit PDFs (Basic)**: Render PDFs on an HTML canvas and allow adding new text, shapes, and images on top of the existing content.
6. **OCR (Image to Text)**: Extract text from images using WASM-based Tesseract.
7. **Extract Text**: Extract raw text from searchable PDFs.

## Limitations (Due to Browser-Only Constraints)
The following features present significant challenges in a purely browser-based environment:

1. **High-Fidelity Office Document Conversion (PDF to Word/Excel)**
   - *Limitation*: Reconstructing complex layouts, tables, and styles into a perfect `.docx` or `.xlsx` file requires massive heuristic engines (like those used by Adobe or Python's `pdf2docx`). Pure JS libraries for this either don't exist or produce very poor results.
   - *Workaround*: We offer raw text extraction or OCR, but layout-perfect Word conversion is currently out of scope for the client-side.

2. **Office Document to PDF Conversion (Word/Excel to PDF)**
   - *Limitation*: Converting `.docx` to `.pdf` while maintaining exact fonts, pagination, and styling typically requires a full word-processing layout engine (like LibreOffice or MS Word). 
   - *Workaround*: Users can "Print to PDF" from their native OS. We cannot easily build a perfect DOCX-to-PDF converter in pure JS.

3. **Performance on Large Files**
   - *Limitation*: Processing massive PDFs (e.g., hundreds of pages) or performing OCR on high-resolution images can block the browser's main thread (if not offloaded to Web Workers) and consume massive amounts of RAM, potentially crashing the tab on low-end devices.

## What Has Been Done So Far
- Initialized Next.js project with Tailwind CSS.
- Established `AGENTS.md` rules enforcing the 100% local execution constraint.
- Deleted the initial backend proposal.
- Created the main dashboard (`/src/app/page.tsx`) listing the tools.
- Implemented the **Merge PDF** tool (`/src/app/merge/page.tsx`) using `pdf-lib`.
- Created this documentation (Limitations and ADR).
