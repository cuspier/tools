# Swap Landing Page Layout Order Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorder the landing page layout by placing the tool cards grid at the very top (under navigation) and moving the hero text/badges to the bottom above the footer.

**Architecture:** Update Next.js `page.tsx` rendering order. Move the hero div after the tool grid, adding a divider line. Set the hero title to `h2` and add a screen-reader-only `h1` for accessibility and SEO. Update Playwright i18n tests to target the new heading elements.

**Tech Stack:** React, Next.js, Tailwind CSS, Playwright.

---

### Task 1: Reorder Main Page Layout

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Reorder layout elements inside `<main>`**

In `frontend/src/app/page.tsx`, replace the `<main>` tag content (lines 73 to 94):
```tsx
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```
with:
```tsx
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="sr-only">LocalPDF - 100% Client-Side PDF Tools</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```
And replace the closing tag area of the grid and main:
```tsx
        </div>
      </main>
```
with:
```tsx
        </div>

        <div className="text-center mt-20 mb-10 max-w-3xl mx-auto border-t border-gray-200 pt-16">
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
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 text-gray-900">
            {t('home.heroTitle')}
          </h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
        </div>
      </main>
```

- [ ] **Step 2: Commit page layout changes**

Run:
```bash
git add frontend/src/app/page.tsx
git commit -m "feat: move hero section to bottom of page below tools grid"
```

---

### Task 2: Update and Run E2E Tests

**Files:**
- Modify: `frontend/tests/i18n.spec.ts`

- [ ] **Step 1: Update playwright E2E assertions**

Modify `frontend/tests/i18n.spec.ts` to expect heading level 2 (`h2`) instead of level 1 (`h1`) for the hero title.
Change lines 6, 12, 19, 25, 32:
`page.getByRole('heading', { level: 1 })` to `page.getByRole('heading', { level: 2 })`.

- [ ] **Step 2: Run all Playwright tests**

Run:
```powershell
npx playwright test
```
Expected: All tests pass.

- [ ] **Step 3: Commit E2E test changes**

Run:
```bash
git add frontend/tests/i18n.spec.ts
git commit -m "test: update i18n assertions to check h2 instead of h1"
```
