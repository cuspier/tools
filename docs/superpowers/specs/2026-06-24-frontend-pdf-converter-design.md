# Frontend-Only PDF Converter Web Service

## Purpose
A web-based tool that allows users to convert common document formats (HWP, DOCX, PPTX, XLSX, TXT) to PDF entirely within their browser. The service prioritizes privacy (zero data leaves the browser) and zero server operating costs over pixel-perfect layout conversion.

## Architecture & Tech Stack
- **Frontend Architecture**: 100% Client-side processing (Single Page Application). No backend server is required other than static file hosting (e.g., GitHub Pages, Vercel, Netlify).
- **Core Technologies**:
  - HTML5, Vanilla JavaScript, CSS3 (Modern, premium aesthetics).
  - Document parsing libraries (e.g., `mammoth.js` for DOCX, `hwp.js` for HWP, `SheetJS` for XLSX).
  - PDF generation library (e.g., `html2pdf.js`, `jsPDF`, or `pdf-lib` to render parsed HTML/Canvas to PDF).

## User Flow
1. **Access**: User visits the static web service URL.
2. **Upload**: User drags and drops a single document (`.hwp`, `.docx`, etc.) into the central drop zone.
3. **Processing**: 
   - The UI displays a sleek "Converting... (Processed locally for your privacy)" animation.
   - The JavaScript reads the file locally via FileReader.
   - The document is parsed into an HTML DOM representation.
   - The DOM is captured and converted into a PDF Blob.
4. **Download**: The browser automatically triggers the download of the resulting `.pdf` file.

## Trade-offs & Constraints
- **Layout Fidelity**: Because the conversion relies on JavaScript parsing to HTML rather than a native rendering engine like MS Office or LibreOffice, complex layouts, pagination, headers/footers, and advanced styling may not perfectly match the original document.
- **HWP Support**: HWP parsing in the browser relies on community libraries (`hwp.js`), which means support is best-effort and heavily dependent on the file version and complexity. 

## Data Flow
- File -> `FileReader` (ArrayBuffer) -> Format Parser (HTML/Canvas) -> `html2pdf.js` -> PDF Blob -> User Download.

## Testing Strategy
- **Unit Testing**: Test format parsers independently with sample `.docx`, `.hwp`, and `.txt` files to ensure they output valid HTML structures.
- **E2E Testing**: Upload a file via drag-and-drop and verify the download is triggered and the resulting file is a valid PDF.
