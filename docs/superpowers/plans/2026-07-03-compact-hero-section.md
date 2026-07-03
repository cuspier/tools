# Compact Hero Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the large landing page hero section with a compact heading and small, modern client-side security/privacy badges, improving accessibility and visual aesthetics.

**Architecture:** Update Next.js page structure in `page.tsx` to reduce font size and padding, and add a flex row of security badges. Update translations in `ko.json` and `en.json` locale files, and update associated Playwright E2E assertions.

**Tech Stack:** React, Next.js, Tailwind CSS, Playwright.

---

### Task 1: Update Locales Translations

**Files:**
- Modify: `frontend/src/locales/ko.json`
- Modify: `frontend/src/locales/en.json`

- [ ] **Step 1: Modify Korean locale file (`ko.json`)**

Update the `"home"` object in `frontend/src/locales/ko.json` to:
```json
  "home": {
    "heroTitle": "브라우저에서 100% 안전하게 실행되는 로컬 PDF 도구",
    "heroSubtitle": "서버 전송 없이 브라우저 내에서 빠르고 완벽한 개인정보 보호",
    "badgeLocal": "🔒 100% 로컬 처리",
    "badgeSecure": "⚡ 서버 업로드 없음",
    "badgeFree": "✨ 무료 & 무제한"
  },
```

- [ ] **Step 2: Modify English locale file (`en.json`)**

Update the `"home"` object in `frontend/src/locales/en.json` to:
```json
  "home": {
    "heroTitle": "Local PDF Tools running 100% securely in your browser",
    "heroSubtitle": "Fast processing with absolute privacy, zero server uploads",
    "badgeLocal": "🔒 100% Local Processing",
    "badgeSecure": "⚡ Zero Server Uploads",
    "badgeFree": "✨ Free & Unlimited"
  },
```

- [ ] **Step 3: Commit translation changes**

Run:
```bash
git add frontend/src/locales/ko.json frontend/src/locales/en.json
git commit -m "i18n: update translations for compact hero and badges"
```

---

### Task 2: Modify Home Page Component

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Replace hero section in `page.tsx`**

Replace the current hero `div` wrapper (lines 74-81 in `frontend/src/app/page.tsx`):
```tsx
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
            {t('home.heroTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
        </div>
```
With the new compact layout including badges:
```tsx
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {t('home.badgeLocal')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              {t('home.badgeSecure')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
              {t('home.badgeFree')}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-gray-900">
            {t('home.heroTitle')}
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
        </div>
```

- [ ] **Step 2: Commit page changes**

Run:
```bash
git add frontend/src/app/page.tsx
git commit -m "feat: design compact hero section with client-side security badges"
```

---

### Task 3: Update and Run E2E Tests

**Files:**
- Modify: `frontend/tests/i18n.spec.ts`

- [ ] **Step 1: Update text assertions in `i18n.spec.ts`**

Modify `frontend/tests/i18n.spec.ts` to assert the new headings:
- Replace `'Every tool you need to work with PDFs in one place'` with `'Local PDF Tools running 100% securely in your browser'`
- Replace `'PDF 작업에 필요한 모든 도구를 한 곳에서'` with `'브라우저에서 100% 안전하게 실행되는 로컬 PDF 도구'`

- [ ] **Step 2: Run Playwright test suite**

Run the Playwright E2E tests:
```powershell
npx playwright test tests/i18n.spec.ts
```
Expected: All tests pass.

- [ ] **Step 3: Commit test updates**

Run:
```bash
git add frontend/tests/i18n.spec.ts
git commit -m "test: update i18n assertions for compact hero text"
```
