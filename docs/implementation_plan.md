# Goal Description

The goal is to merge our current Next.js PDF toolset (`integrate-pdf-editing-features`) and the existing document converter feature (`feature/frontend-converter`) into the `master` branch. Additionally, we will combine the document conversion logic (TXT, DOCX, XLSX, HWP to PDF) from the `feature/frontend-converter` branch with the Image to PDF converter we just built in the Next.js app.

## Proposed Changes

### 1. Git Merge Operations
- Commit all current changes on `integrate-pdf-editing-features`.
- Checkout the `master` branch.
- Merge `feature/frontend-converter` into `master`.
- Merge `integrate-pdf-editing-features` into `master`.

### 2. Dependency Management
- The `feature/frontend-converter` uses `mammoth`, `xlsx`, `hwp.js`, and `html2pdf.js`.
- We will install these dependencies into our Next.js project inside the `frontend/` directory.

### 3. Combine Convert PDF Features

#### [MODIFY] `frontend/src/app/convert/page.tsx`
- Enhance the UI to accept `.jpg, .png, .txt, .docx, .xlsx, .hwp` files.
- Integrate the parsing logic (from the old `src/parser.js`) to parse documents into HTML.
- Use `html2pdf.js` to convert the generated HTML into a PDF for document files.
- Retain the `pdf-lib` logic for converting images to PDF.

### 4. Cleanup Root Directory
- The `feature/frontend-converter` branch introduced a standalone Vite project at the root level (`index.html`, `src/`, `package.json`, etc.).
- Since we are consolidating everything into the `frontend/` Next.js application, we will **DELETE** the root-level Vite project files to maintain a clean workspace.

#### [DELETE] Root Vite Files
- `/index.html`
- `/src/` (root-level)
- `/package.json`, `/package-lock.json`, `/tsconfig.json` (root-level)
- `/public/` (root-level)

## Verification Plan

### Automated Tests
- Run `npx playwright test` in the `frontend` directory to ensure the existing E2E tests for the Convert PDF page still pass with the new UI.

### Manual Verification
- Verify the combined Next.js app builds successfully (`npm run build`).
- Ensure the `/convert` page can successfully convert both an Image file and a Text/Doc file to PDF.
