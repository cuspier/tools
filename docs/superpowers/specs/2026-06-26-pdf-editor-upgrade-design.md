# PDF Editor Upgrade Design Specification

**Date**: 2026-06-26  
**Status**: Approved  

---

## 1. Goal
Upgrade the PDF Edit page (`/edit`) to support full-featured PDF manipulation, including:
1. Deleting individual text annotations.
2. Dragging/moving text annotations to adjust their positions.
3. Viewing and editing multi-page PDFs using a left sidebar for page navigation.
4. Deleting pages from the PDF document.
5. Adding new blank pages to the PDF document.

---

## 2. User Interface Design
We will introduce a double-column layout for the editor area:
- **Left Column**: Page Sidebar (width: `240px`).
  - Lists page thumbnails vertically.
  - Hovering a thumbnail shows a delete (trash) icon.
  - At the bottom of the sidebar, there is an "Add Blank Page" button.
- **Center/Main Area**: Page Editor.
  - Renders the currently selected page on a canvas.
  - Text annotations are overlaid as inputs.
- **Right Column**: Actions Panel (width: `320px`).
  - Shows page metadata (current page, total pages).
  - Actions: "Save Changes" and "Cancel".

---

## 3. Data Structure & State

### 3.1. Text Annotations
Annotations will be mapped by page index:
```typescript
type Annotation = {
  id: string;
  text: string;
  x: number;
  y: number;
};

// Key is page index (0-based)
type PageAnnotations = Record<number, Annotation[]>;
```

### 3.2. Page Operations
We need to track page deletion, addition, and ordering.
Instead of directly mutating the loaded PDF pages in memory every time, we will maintain a list of page objects in React state to represent the virtual document:
```typescript
type PageItem = 
  | { type: 'original'; originalPageIndex: number; id: string }
  | { type: 'blank'; id: string };

const [pages, setPages] = useState<PageItem[]>([]);
const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
```

When a file is loaded:
- We read the page count `N` from `pdf-lib`.
- Initialize `pages` state to: `Array.from({ length: N }, (_, i) => ({ type: 'original', originalPageIndex: i, id: Math.random().toString() }))`.
- Set `currentPageIndex` to `0`.

---

## 4. Components & Interactions

### 4.1. Annotation Interactions
- **Move (Drag)**:
  - Add mouse event listeners (`onMouseDown`, `onMouseMove`, `onMouseUp`) and touch equivalents to annotations.
  - Track `offsetX` and `offsetY` on drag start.
  - Update `x` and `y` in state.
- **Delete**:
  - Show a small circular red delete button (`×`) when hovering over an annotation input.
  - Clicking it deletes the annotation from the active page's state.

### 4.2. Page Operations
- **Delete Page**:
  - Clicking the delete icon on a sidebar thumbnail removes the corresponding `PageItem` from the `pages` state.
  - If the deleted page was the currently selected page, we switch `currentPageIndex` to a valid page.
- **Add Blank Page**:
  - Clicking the "Add Blank Page" button appends a new `PageItem` of `{ type: 'blank', id: Math.random().toString() }` to the end of the `pages` state.
  - Automatically switches view to the new page.

---

## 5. Saving PDF Logic
When the user clicks "Save Changes":
1. Load original PDF bytes using `pdf-lib`.
2. Create a new `pdfDoc` instance: `await PDFDocument.create()`.
3. Loop through `pages` state:
   - If `pageItem.type === 'original'`:
     - Copy the single page from the original document: `const [copiedPage] = await newPdf.copyPages(originalPdf, [pageItem.originalPageIndex]);`
     - Append the copied page: `newPdf.addPage(copiedPage);`
   - If `pageItem.type === 'blank'`:
     - Add a new blank page: `newPdf.addPage();` (default dimensions: e.g., Letter or matching page 1 dimensions).
4. Draw text annotations for each page:
   - For each output page `targetPageIndex` (0-based index in the final document):
     - Look up annotations corresponding to the original page or blank page ID.
     - Embed the font and use `page.drawText(...)` at coordinates: `x`, `y` (adjusted for PDF coordinate origin at bottom-left: `height - y - 16`).
5. Save the document and generate the download URL.

---

## 6. Verification Plan

### 6.1. Automated Tests (Playwright)
- Verify left sidebar is visible and displays correct page thumbnails.
- Verify adding a blank page updates page count and allows navigation to it.
- Verify deleting a page removes it from the sidebar and final saved PDF.
- Verify annotations can be added, dragged, and deleted.
- Verify saving/downloading works.

### 6.2. Manual Verification
- Test with 1-page and multi-page PDFs.
- Verify sidebar navigation switches pages and preserves annotations per page.
- Verify drag-and-drop behaves smoothly on different screen sizes.
