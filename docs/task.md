# Integration Tasks

- `[x]` Git Merge Process
- `[x]` Switch to `master` branch.
- `[x]` Merge `feature/frontend-converter` branch.
- `[x]` Merge `integrate-pdf-editing-features` branch.
- `[x]` Install new dependencies (`mammoth`, `xlsx`, `hwp.js`, `html2pdf.js`) into the Next.js `frontend` app.
- `[x]` Migrate `src/parser.js` logic to `frontend/src/app/convert/parser.js`.
- `[x]` Update Next.js config to support browser rendering via turbopack exclusions / webpack fs fallback.
- `[x]` Fix `pdfjs-dist` SSR error by dynamically importing `pdfjsLib`.
- `[x]` Remove root-level Vite files.

### Testing
- `[x]` Update the Convert E2E test to handle new file extensions.
- `[x]` Run `npx playwright test tests/tools.spec.ts` in `frontend` and verify all tests pass.
