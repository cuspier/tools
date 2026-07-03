# Spec: Swapped Landing Page Layout Order

## Goal
Improve usability and immediately expose the PDF tool cards grid above the fold by placing it at the very top of the landing page, right under the header. The descriptive hero text and client-side security badges will be relocated to the bottom of the page, acting as an trust-building section above the footer.

## Proposed Changes

### Frontend Landing Page
#### [MODIFY] [page.tsx](file:///C:/Users/freee/.gemini/antigravity/worktrees/tools/integrate-pdf-editing-features/frontend/src/app/page.tsx)
- Add a screen-reader-only `h1` element (`sr-only`) at the top of the `<main>` container for SEO and accessibility (semantic heading hierarchy).
- Reorder elements inside the `<main>` tag: place the tool cards grid first.
- Put the hero section wrapper below the cards grid.
- Change the hero section header from `h1` to `h2` to respect proper document outline levels.
- Add a top border divider (`border-t border-gray-200 pt-16 mt-20`) to cleanly separate the card grid and the hero/badges section.

## Verification Plan
- Build the project (`npm run build` or similar) to ensure no compile errors.
- Run Playwright E2E tests (`npx playwright test`) to ensure all tests pass (since the text elements are still present on the page, the tests should still pass, but we'll verify).
