# Multi-Language Support Design Spec (English & Korean)

Date: 2026-07-02
Topic: Multi-Language (i18n) Support
Status: Draft (Pending Approval)

This document outlines the design and architecture for adding bilingual support (English and Korean) to the LocalPDF application. The design maintains the application's key constraints: 100% local client-side processing, no backend server dependency, and robust E2E test coverage.

---

## 1. Requirements & Goals

- **Bilingual Support**: Initial support for English (EN) and Korean (KO), with an architecture that allows adding more languages easily.
- **Client-Side State Management**: Keep routing unchanged (Option A: state-based language switching). Store the preferred language in `localStorage`.
- **Automatic Browser Detection**: Detect the user's browser language on first load using `navigator.language` and set default (default to Korean if browser is KO-based, otherwise default to English).
- **Unified Header Component**: Extract individual page headers into a single common `Header` component. The common header will support:
  - Home style: Logo and translation-friendly navigation links.
  - Tool style: Back button and translation-friendly tool title.
  - Language Switcher: A sleek segmented toggle button (EN / KO) in the upper-right corner.
- **Automated E2E Testing**: Add Playwright test coverage verifying language switching, page translation, and localStorage persistence. Preserve all existing E2E tests by keeping English keys exactly matching current texts.

---

## 2. Technical Architecture

### Translation Dictionaries
Stored as JSON files in `src/locales/`:
- `frontend/src/locales/en.json` (Source of truth for translation keys)
- `frontend/src/locales/ko.json`

### Language State & Context
Created in `frontend/src/context/LanguageContext.tsx`:
- A React Context providing `locale`, `setLocale`, and `t(key)` helper.
- `t(key)` resolves nested translation keys (e.g., `"merge.buttonAction"`) and falls back to English if the key is missing in Korean.
- Automatically handles mounting lifecycle to prevent Next.js hydration issues (hiding content via hidden visibility until client hydration completes).

### Custom Hook
- `frontend/src/hooks/useTranslation.ts` to consume the context.

---

## 3. UI Component Design

### Segmented Language Switcher
Rendered as a styled pills switcher in the header:
```tsx
<div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold border border-gray-200 shadow-inner">
  <button onClick={() => setLocale('en')} ...>EN</button>
  <button onClick={() => setLocale('ko')} ...>KO</button>
</div>
```

### Shared Header Component
Props:
```typescript
interface HeaderProps {
  titleKey?: string; // Translation dictionary key, e.g., "merge.title"
}
```
If `titleKey` is provided, shows the back button and the translated title. Otherwise, shows the brand logo and the home navigation links.

---

## 4. Proposed File Modifications

### [NEW]
- `frontend/src/locales/en.json` (English translation keys)
- `frontend/src/locales/ko.json` (Korean translation keys)
- `frontend/src/context/LanguageContext.tsx` (State provider)
- `frontend/src/hooks/useTranslation.ts` (Convenience hook)
- `frontend/src/components/Header.tsx` (Shared responsive header)
- `frontend/tests/i18n.spec.ts` (Playwright E2E localization test)

### [MODIFY]
- `frontend/src/app/layout.tsx` (Inject the `LanguageProvider` wrapper)
- `frontend/src/app/page.tsx` (Refactor to use `Header` and `t()` translations)
- `frontend/src/app/merge/page.tsx` (Refactor to use `Header` and `t()` translations)
- `frontend/src/app/split/page.tsx` (Refactor to use `Header` and `t()` translations)
- `frontend/src/app/rotate/page.tsx` (Refactor to use `Header` and `t()` translations)
- `frontend/src/app/watermark/page.tsx` (Refactor to use `Header` and `t()` translations)
- `frontend/src/app/edit/page.tsx` (Refactor to use `Header` and `t()` translations)
- `frontend/src/app/ocr/page.tsx` (Refactor to use `Header` and `t()` translations)
- `frontend/src/app/convert/page.tsx` (Refactor to use `Header` and `t()` translations)

---

## 5. Verification Plan

### Automated Tests
- Run existing E2E tests to verify we did not break current behaviors:
  ```bash
  npx playwright test tests/tools.spec.ts
  ```
- Run the new E2E test verifying language switching and state persistence:
  ```bash
  npx playwright test tests/i18n.spec.ts
  ```

### Manual Verification
- Verify initial load default matching browser settings.
- Verify clicking EN/KO button switches UI language immediately without page refresh.
- Verify reload preserves selected language.
