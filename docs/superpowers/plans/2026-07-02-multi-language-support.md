# Multi-Language Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement bilingual support (English and Korean) utilizing React Context, localStorage, and browser auto-detection, with a unified Header component.

**Architecture:** Create a custom React Context provider to manage locale state ('en' | 'ko') and translate keys using JSON dictionary files. Extract duplicate headers into a single adaptive Header component.

**Tech Stack:** React 19, Next.js 16 (App Router), Tailwind CSS v4, Playwright E2E.

---

### Task 1: Create Translation JSON Files

**Files:**
- Create: `frontend/src/locales/en.json`
- Create: `frontend/src/locales/ko.json`

- [ ] **Step 1: Write English translation dictionary (`frontend/src/locales/en.json`)**
  Ensure all keys align with existing strings in pages.
  ```json
  {
    "common": {
      "title": "LocalPDF",
      "allTools": "All Tools",
      "privacyNotice": "100% Private Client-Side Processing. Your files never leave your browser.",
      "selectFiles": "Select PDF Files",
      "selectFile": "Select PDF File",
      "download": "Download",
      "back": "Back"
    },
    "tools": {
      "merge": {
        "title": "Merge PDF",
        "description": "Combine multiple PDFs into a single document effortlessly."
      },
      "split": {
        "title": "Split PDF",
        "description": "Separate one page or a whole set for easy conversion into independent PDF files."
      },
      "rotate": {
        "title": "Rotate PDF",
        "description": "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once."
      },
      "watermark": {
        "title": "Add Watermark",
        "description": "Choose an image or text and stamp it over your PDF."
      },
      "edit": {
        "title": "Edit PDF",
        "description": "Add text, images, shapes or freehand annotations to a PDF document."
      },
      "ocr": {
        "title": "OCR (Image to Text)",
        "description": "Extract text from scanned PDFs or images easily."
      },
      "convert": {
        "title": "Convert to PDF",
        "description": "Convert JPG or PNG images into a PDF document entirely in your browser."
      }
    },
    "home": {
      "heroTitle": "Every tool you need to work with PDFs in one place",
      "heroSubtitle": "100% Free, Secure, and Local. Your files never leave your browser. Edit, merge, split, and convert your PDFs with zero server uploads."
    },
    "merge": {
      "selectPrompt": "Select PDF files to merge",
      "selectedFiles": "Selected Files",
      "buttonAction": "Merge PDFs Now",
      "merging": "Merging...",
      "success": "PDFs Merged Successfully!",
      "downloadAction": "Download Merged PDF",
      "more": "Merge more files",
      "alertSelectTwo": "Please select at least 2 PDFs to merge.",
      "alertError": "An error occurred while merging PDFs."
    },
    "split": {
      "selectPrompt": "Select PDF file to split",
      "pageRange": "Extract Page Range",
      "from": "From Page",
      "to": "To Page",
      "buttonAction": "Extract Pages",
      "processing": "Extracting...",
      "success": "Pages Extracted Successfully!",
      "downloadAction": "Download Extracted PDF",
      "more": "Split another file",
      "alertSelectOne": "Please select a PDF file first.",
      "alertError": "An error occurred while splitting the PDF."
    },
    "rotate": {
      "selectPrompt": "Select PDF file to rotate",
      "angle": "Select Rotation Angle",
      "angle90": "Right 90°",
      "angle180": "Right 180°",
      "angle270": "Right 270°",
      "buttonAction": "Rotate PDF",
      "processing": "Rotating...",
      "success": "PDF Rotated Successfully!",
      "downloadAction": "Download Rotated PDF",
      "more": "Rotate another file",
      "alertSelectOne": "Please select a PDF file first.",
      "alertError": "An error occurred while rotating the PDF."
    },
    "watermark": {
      "selectPrompt": "Select PDF file to watermark",
      "settings": "Watermark Settings",
      "text": "Watermark Text",
      "textPlaceholder": "CONFIDENTIAL",
      "buttonAction": "Add Watermark",
      "processing": "Adding watermark...",
      "success": "Watermark Added Successfully!",
      "downloadAction": "Download PDF",
      "more": "Watermark another file",
      "alertSelectOne": "Please select a PDF file first.",
      "alertError": "An error occurred while adding the watermark."
    },
    "edit": {
      "selectPrompt": "Select PDF file to edit",
      "pages": "Pages",
      "addBlank": "Add Blank Page",
      "buttonAction": "Save Changes",
      "processing": "Saving...",
      "success": "PDF Edited Successfully!",
      "downloadAction": "Download PDF",
      "more": "Edit another file",
      "alertSelectOne": "Please select a PDF file first.",
      "alertError": "An error occurred while loading the PDF."
    },
    "ocr": {
      "selectPrompt": "Select PDF or Image file",
      "buttonAction": "Extract Text",
      "processing": "Extracting text...",
      "success": "Text Extracted Successfully!",
      "downloadAction": "Download Text File",
      "more": "OCR another file",
      "copy": "Copy Text",
      "copied": "Copied!",
      "placeholder": "Extracted text will appear here...",
      "alertSelectOne": "Please select a file first.",
      "alertError": "An error occurred during OCR extraction."
    },
    "convert": {
      "selectPrompt": "Select JPG or PNG images",
      "selectedFiles": "Selected Files",
      "buttonAction": "Convert to PDF",
      "processing": "Converting...",
      "success": "Images Converted Successfully!",
      "downloadAction": "Download PDF",
      "more": "Convert more images",
      "alertSelectOne": "Please select at least 1 image file.",
      "alertError": "An error occurred during conversion."
    }
  }
  ```

- [ ] **Step 2: Write Korean translation dictionary (`frontend/src/locales/ko.json`)**
  ```json
  {
    "common": {
      "title": "LocalPDF",
      "allTools": "모든 도구",
      "privacyNotice": "100% 개인정보 보호 클라이언트 사이드 처리. 파일은 브라우저 외부로 전송되지 않습니다.",
      "selectFiles": "PDF 파일 선택",
      "selectFile": "PDF 파일 선택",
      "download": "다운로드",
      "back": "뒤로 가기"
    },
    "tools": {
      "merge": {
        "title": "PDF 병합",
        "description": "여러 PDF 파일을 하나의 문서로 간편하게 병합합니다."
      },
      "split": {
        "title": "PDF 분할",
        "description": "특정 페이지 또는 전체를 개별 PDF 파일로 손쉽게 나눕니다."
      },
      "rotate": {
        "title": "PDF 회전",
        "description": "필요한 방향으로 PDF를 회전합니다. 여러 PDF를 동시에 회전할 수 있습니다."
      },
      "watermark": {
        "title": "워터마크 추가",
        "description": "텍스트나 이미지를 선택해 PDF 문서에 워터마크를 삽입합니다."
      },
      "edit": {
        "title": "PDF 편집",
        "description": "PDF 문서에 텍스트, 이미지, 도형 또는 자유 서명/그리기를 추가합니다."
      },
      "ocr": {
        "title": "OCR (이미지 텍스트 추출)",
        "description": "스캔된 PDF나 이미지에서 텍스트를 손쉽게 추출합니다."
      },
      "convert": {
        "title": "이미지 PDF 변환",
        "description": "JPG나 PNG 이미지를 브라우저 내에서 직접 PDF로 변환합니다."
      }
    },
    "home": {
      "heroTitle": "PDF 작업에 필요한 모든 도구를 한 곳에서",
      "heroSubtitle": "100% 무료, 안전한 로컬 처리. 파일이 브라우저를 벗어나지 않습니다. 서버 업로드 없이 PDF를 편집, 병합, 분할, 변환하세요."
    },
    "merge": {
      "selectPrompt": "병합할 PDF 파일을 선택하세요",
      "selectedFiles": "선택된 파일",
      "buttonAction": "PDF 병합하기",
      "merging": "병합 중...",
      "success": "PDF 병합 완료!",
      "downloadAction": "병합된 PDF 다운로드",
      "more": "추가 병합하기",
      "alertSelectTwo": "병합할 PDF 파일을 2개 이상 선택해 주세요.",
      "alertError": "PDF 병합 중 오류가 발생했습니다."
    },
    "split": {
      "selectPrompt": "분할할 PDF 파일을 선택하세요",
      "pageRange": "페이지 범위 추출",
      "from": "시작 페이지",
      "to": "끝 페이지",
      "buttonAction": "페이지 추출하기",
      "processing": "추출 중...",
      "success": "페이지 추출 완료!",
      "downloadAction": "추출된 PDF 다운로드",
      "more": "다른 파일 분할하기",
      "alertSelectOne": "먼저 PDF 파일을 선택해 주세요.",
      "alertError": "PDF 분할 중 오류가 발생했습니다."
    },
    "rotate": {
      "selectPrompt": "회전할 PDF 파일을 선택하세요",
      "angle": "회전 각도 선택",
      "angle90": "오른쪽 90°",
      "angle180": "오른쪽 180°",
      "angle270": "오른쪽 270°",
      "buttonAction": "PDF 회전하기",
      "processing": "회전 중...",
      "success": "PDF 회전 완료!",
      "downloadAction": "회전된 PDF 다운로드",
      "more": "다른 파일 회전하기",
      "alertSelectOne": "먼저 PDF 파일을 선택해 주세요.",
      "alertError": "PDF 회전 중 오류가 발생했습니다."
    },
    "watermark": {
      "selectPrompt": "워터마크를 추가할 PDF 파일을 선택하세요",
      "settings": "워터마크 설정",
      "text": "워터마크 텍스트",
      "textPlaceholder": "복사금지",
      "buttonAction": "워터마크 추가하기",
      "processing": "워터마크 추가 중...",
      "success": "워터마크 추가 완료!",
      "downloadAction": "PDF 다운로드",
      "more": "다른 파일에 추가하기",
      "alertSelectOne": "먼저 PDF 파일을 선택해 주세요.",
      "alertError": "워터마크 추가 중 오류가 발생했습니다."
    },
    "edit": {
      "selectPrompt": "편집할 PDF 파일을 선택하세요",
      "pages": "페이지 목록",
      "addBlank": "빈 페이지 추가",
      "buttonAction": "변경사항 저장하기",
      "processing": "저장 중...",
      "success": "PDF 편집 완료!",
      "downloadAction": "PDF 다운로드",
      "more": "다른 파일 편집하기",
      "alertSelectOne": "먼저 PDF 파일을 선택해 주세요.",
      "alertError": "PDF 파일을 불러오는 중 오류가 발생했습니다."
    },
    "ocr": {
      "selectPrompt": "PDF 또는 이미지 파일을 선택하세요",
      "buttonAction": "텍스트 추출하기",
      "processing": "텍스트 추출 중...",
      "success": "텍스트 추출 완료!",
      "downloadAction": "텍스트 파일 다운로드",
      "more": "다른 파일 추출하기",
      "copy": "텍스트 복사",
      "copied": "복사 완료!",
      "placeholder": "추출된 텍스트가 여기에 표시됩니다...",
      "alertSelectOne": "먼저 파일을 선택해 주세요.",
      "alertError": "OCR 텍스트 추출 중 오류가 발생했습니다."
    },
    "convert": {
      "selectPrompt": "JPG 또는 PNG 이미지를 선택하세요",
      "selectedFiles": "선택된 파일",
      "buttonAction": "PDF로 변환하기",
      "processing": "변환 중...",
      "success": "이미지 변환 완료!",
      "downloadAction": "PDF 다운로드",
      "more": "다른 이미지 변환하기",
      "alertSelectOne": "최소 1개 이상의 이미지 파일을 선택해 주세요.",
      "alertError": "변환 중 오류가 발생했습니다."
    }
  }
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/locales/en.json frontend/src/locales/ko.json
  git commit -m "feat: add translation dictionaries for en and ko"
  ```

---

### Task 2: Implement LanguageContext and useTranslation hook

**Files:**
- Create: `frontend/src/context/LanguageContext.tsx`
- Create: `frontend/src/hooks/useTranslation.ts`

- [ ] **Step 1: Write LanguageContext**
  Create `frontend/src/context/LanguageContext.tsx` handling language detection, local storage persistence, translation mappings, and hydration protection.
  ```typescript
  "use client";

  import React, { createContext, useContext, useState, useEffect } from 'react';
  import enTranslations from '../locales/en.json';
  import koTranslations from '../locales/ko.json';

  type Locale = 'en' | 'ko';

  interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
  }

  const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

  const translations = {
    en: enTranslations,
    ko: koTranslations,
  };

  export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [locale, setLocaleState] = useState<Locale>('en');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      const storedLocale = localStorage.getItem('localpdf_locale') as Locale;
      if (storedLocale && (storedLocale === 'en' || storedLocale === 'ko')) {
        setLocaleState(storedLocale);
      } else {
        const browserLang = navigator.language || '';
        const defaultLocale: Locale = browserLang.toLowerCase().startsWith('ko') ? 'ko' : 'en';
        setLocaleState(defaultLocale);
      }
      setIsMounted(true);
    }, []);

    const setLocale = (newLocale: Locale) => {
      setLocaleState(newLocale);
      localStorage.setItem('localpdf_locale', newLocale);
    };

    const t = (key: string): string => {
      const keys = key.split('.');
      let result: any = translations[locale];

      for (const k of keys) {
        if (result && Object.prototype.hasOwnProperty.call(result, k)) {
          result = result[k];
        } else {
          // Fallback to English
          let fallbackResult: any = translations['en'];
          for (const fk of keys) {
            if (fallbackResult && Object.prototype.hasOwnProperty.call(fallbackResult, fk)) {
              fallbackResult = fallbackResult[fk];
            } else {
              return key;
            }
          }
          return typeof fallbackResult === 'string' ? fallbackResult : key;
        }
      }

      return typeof result === 'string' ? result : key;
    };

    return (
      <LanguageContext.Provider value={{ locale, setLocale, t }}>
        {isMounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
      </LanguageContext.Provider>
    );
  };
  ```

- [ ] **Step 2: Write useTranslation Hook**
  Create `frontend/src/hooks/useTranslation.ts`:
  ```typescript
  import { useContext } from 'react';
  import { LanguageContext } from '../context/LanguageContext';

  export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
      throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
  };
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add frontend/src/context/LanguageContext.tsx frontend/src/hooks/useTranslation.ts
  git commit -m "feat: implement LanguageContext and useTranslation hook"
  ```

---

### Task 3: Create unified Header component

**Files:**
- Create: `frontend/src/components/Header.tsx`

- [ ] **Step 1: Write Header component**
  Create `frontend/src/components/Header.tsx` featuring standard style or tool style depending on props, and including the EN/KO pills selector.
  ```typescript
  "use client";

  import React from 'react';
  import Link from 'next/link';
  import { FileUp, ArrowLeft } from 'lucide-react';
  import { useTranslation } from '../hooks/useTranslation';

  interface HeaderProps {
    titleKey?: string;
  }

  export const Header: React.FC<HeaderProps> = ({ titleKey }) => {
    const { locale, setLocale, t } = useTranslation();

    return (
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          {titleKey ? (
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-blue-600 transition" aria-label={t('common.back')}>
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <span className="text-xl font-bold">{t(titleKey)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FileUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  LocalPDF
                </span>
              </Link>
              <nav className="hidden md:flex gap-6 font-medium text-gray-600">
                <Link href="/" className="hover:text-blue-600 transition">{t('common.allTools')}</Link>
                <Link href="/merge" className="hover:text-blue-600 transition">{t('tools.merge.title')}</Link>
                <Link href="/split" className="hover:text-blue-600 transition">{t('tools.split.title')}</Link>
                <Link href="/convert" className="hover:text-blue-600 transition">{t('tools.convert.title')}</Link>
                <Link href="/edit" className="hover:text-blue-600 transition">{t('tools.edit.title')}</Link>
              </nav>
            </div>
          )}

          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold border border-gray-200 shadow-inner">
            <button
              onClick={() => setLocale('en')}
              className={`px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                locale === 'en'
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('ko')}
              className={`px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                locale === 'ko'
                  ? 'bg-white text-blue-600 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              KO
            </button>
          </div>
        </div>
      </header>
    );
  };
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/components/Header.tsx
  git commit -m "feat: add common Header component with language selector"
  ```

---

### Task 4: Integrate LanguageProvider into Layout

**Files:**
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Wrap layout with LanguageProvider**
  Import and wrap child components inside `LanguageProvider`.
  ```typescript
  import type { Metadata } from "next";
  import { Geist, Geist_Mono } from "next/font/google";
  import "./globals.css";
  import { LanguageProvider } from "../context/LanguageContext";

  const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
  });

  const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
  });

  export const metadata: Metadata = {
    title: "LocalPDF",
    description: "100% Client-Side PDF Tools",
  };

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col" suppressHydrationWarning>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </body>
      </html>
    );
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/layout.tsx
  git commit -m "refactor: wrap application with LanguageProvider in layout"
  ```

---

### Task 5: Refactor Homepage (page.tsx)

**Files:**
- Modify: `frontend/src/app/page.tsx`

- [ ] **Step 1: Update page.tsx**
  Add `"use client";` to make it a client component, import `useTranslation` and `Header`, and replace headers, footers, titles, and card translations.
  ```typescript
  "use client";

  import Link from 'next/link';
  import { FileUp, Scissors, FilePlus2, RefreshCw, Type, Image as ImageIcon, FileText } from 'lucide-react';
  import { Header } from '../components/Header';
  import { useTranslation } from '../hooks/useTranslation';

  export default function Home() {
    const { t } = useTranslation();

    const tools = [
      {
        title: t('tools.merge.title'),
        description: t('tools.merge.description'),
        icon: FilePlus2,
        href: '/merge',
        color: 'bg-blue-500',
      },
      {
        title: t('tools.split.title'),
        description: t('tools.split.description'),
        icon: Scissors,
        href: '/split',
        color: 'bg-green-500',
      },
      {
        title: t('tools.rotate.title'),
        description: t('tools.rotate.description'),
        icon: RefreshCw,
        href: '/rotate',
        color: 'bg-yellow-500',
      },
      {
        title: t('tools.watermark.title'),
        description: t('tools.watermark.description'),
        icon: Type,
        href: '/watermark',
        color: 'bg-purple-500',
      },
      {
        title: t('tools.edit.title'),
        description: t('tools.edit.description'),
        icon: FileUp,
        href: '/edit',
        color: 'bg-red-500',
      },
      {
        title: t('tools.ocr.title'),
        description: t('tools.ocr.description'),
        icon: ImageIcon,
        href: '/ocr',
        color: 'bg-indigo-500',
      },
      {
        title: t('tools.convert.title'),
        description: t('tools.convert.description'),
        icon: FileText,
        href: '/convert',
        color: 'bg-orange-500',
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-200">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home.heroSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="group flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
                <div className={`p-4 rounded-full text-white mb-6 ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                  <tool.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{tool.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{tool.description}</p>
              </Link>
            ))}
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-24 py-12 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} LocalPDF. {t('common.privacyNotice')}</p>
        </footer>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/page.tsx
  git commit -m "refactor: refactor homepage to use unified Header and translations"
  ```

---

### Task 6: Add E2E tests for i18n switching and persistence

**Files:**
- Create: `frontend/tests/i18n.spec.ts`

- [ ] **Step 1: Write E2E test file**
  Create `frontend/tests/i18n.spec.ts`:
  ```typescript
  import { test, expect } from '@playwright/test';

  test.describe('LocalPDF i18n Translation Tests', () => {
    test('Should switch language and persist in localStorage', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toContainText('Every tool you need to work with PDFs in one place');
      
      await page.click('button:has-text("KO")');
      await expect(page.locator('h1')).toContainText('PDF 작업에 필요한 모든 도구를 한 곳에서');
      
      await page.reload();
      await expect(page.locator('h1')).toContainText('PDF 작업에 필요한 모든 도구를 한 곳에서');
      
      await page.click('button:has-text("EN")');
      await expect(page.locator('h1')).toContainText('Every tool you need to work with PDFs in one place');
      
      await page.reload();
      await expect(page.locator('h1')).toContainText('Every tool you need to work with PDFs in one place');
    });
  });
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/tests/i18n.spec.ts
  git commit -m "test: add localization E2E test"
  ```

---

### Task 7: Refactor Merge PDF page

**Files:**
- Modify: `frontend/src/app/merge/page.tsx`

- [ ] **Step 1: Update page.tsx**
  Replace local header, add translation functions, translate labels and alerts.
  ```typescript
  "use client";

  import React, { useState } from 'react';
  import { PDFDocument } from 'pdf-lib';
  import { FileUp, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
  import { Header } from '../../components/Header';
  import { useTranslation } from '../../hooks/useTranslation';

  export default function MergePDF() {
    const { t } = useTranslation();
    const [files, setFiles] = useState<File[]>([]);
    const [isMerging, setIsMerging] = useState(false);
    const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
        setFiles(prev => [...prev, ...newFiles]);
      }
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
      const newFiles = [...files];
      if (direction === 'up' && index > 0) {
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      }
      setFiles(newFiles);
    };

    const removeFile = (index: number) => {
      setFiles(files.filter((_, i) => i !== index));
    };

    const mergePDFs = async () => {
      if (files.length < 2) return alert(t('merge.alertSelectTwo'));
      
      setIsMerging(true);
      try {
        const mergedPdf = await PDFDocument.create();

        for (const file of files) {
          const fileBuffer = await file.arrayBuffer();
          const pdf = await PDFDocument.load(fileBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        const blob = new Blob([mergedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setMergedPdfUrl(url);
      } catch (error) {
        console.error("Error merging PDFs:", error);
        alert(t('merge.alertError'));
      } finally {
        setIsMerging(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Header titleKey="tools.merge.title" />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('merge.selectPrompt')}</h2>
            <p className="text-gray-500 mb-8">{t('tools.merge.description')}</p>

            {!mergedPdfUrl ? (
              <>
                <div className="mb-8">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200">
                    <FileUp className="w-5 h-5" />
                    {t('common.selectFiles')}
                    <input type="file" multiple accept="application/pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="text-left bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
                    <h3 className="font-semibold mb-4 text-gray-700">{t('merge.selectedFiles')} ({files.length})</h3>
                    <ul className="space-y-3">
                      {files.map((file, index) => (
                        <li key={`${file.name}-${index}`} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                          <span className="truncate flex-1 font-medium">{file.name}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => moveFile(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30">
                              <ArrowUp className="w-5 h-5" />
                            </button>
                            <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30">
                              <ArrowDown className="w-5 h-5" />
                            </button>
                            <button onClick={() => removeFile(index)} className="p-1 text-gray-400 hover:text-red-500 ml-2">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {files.length >= 2 && (
                  <button 
                    onClick={mergePDFs} 
                    disabled={isMerging}
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition shadow-lg shadow-green-200 disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {isMerging ? t('merge.merging') : t('merge.buttonAction')}
                  </button>
                )}
              </>
            ) : (
              <div className="py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileUp className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('merge.success')}</h3>
                <a 
                  href={mergedPdfUrl} 
                  download="merged_document.pdf"
                  className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition shadow-lg shadow-blue-200"
                >
                  {t('merge.downloadAction')}
                </a>
                <div className="mt-8">
                  <button onClick={() => { setMergedPdfUrl(null); setFiles([]); }} className="text-gray-500 hover:text-blue-600 font-medium">
                    {t('merge.more')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/merge/page.tsx
  git commit -m "refactor: apply multi-language support to Merge PDF page"
  ```

---

### Task 8: Refactor Split PDF page

**Files:**
- Modify: `frontend/src/app/split/page.tsx`

- [ ] **Step 1: Update page.tsx**
  Apply translation context and replace existing UI strings.
  ```typescript
  "use client";

  import React, { useState } from 'react';
  import { PDFDocument } from 'pdf-lib';
  import { Scissors, FileUp } from 'lucide-react';
  import { Header } from '../../components/Header';
  import { useTranslation } from '../../hooks/useTranslation';

  export default function SplitPDF() {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [fromPage, setFromPage] = useState<string>('1');
    const [toPage, setToPage] = useState<string>('1');
    const [totalPages, setTotalPages] = useState<number>(0);
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type !== 'application/pdf') return;

        setFile(selectedFile);
        setSplitPdfUrl(null);
        
        try {
          const fileBuffer = await selectedFile.arrayBuffer();
          const pdf = await PDFDocument.load(fileBuffer);
          const pageCount = pdf.getPageCount();
          setTotalPages(pageCount);
          setFromPage('1');
          setToPage(pageCount.toString());
        } catch (error) {
          console.error("Error loading PDF:", error);
          alert(t('split.alertError'));
        }
      }
    };

    const handleNumberChange = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
      if (value === '') {
        setter('');
        return;
      }
      setter(value);
    };

    const handleBlur = (value: string, setter: React.Dispatch<React.SetStateAction<string>>, defaultValue: number) => {
      if (value === '') {
        setter(defaultValue.toString());
        return;
      }
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 1) {
        setter('1');
      } else if (num > totalPages) {
        setter(totalPages.toString());
      } else {
        setter(num.toString());
      }
    };

    const splitPDF = async () => {
      if (!file) return alert(t('split.alertSelectOne'));
      
      const start = parseInt(fromPage, 10);
      const end = parseInt(toPage, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > totalPages) {
        return alert("Invalid page range.");
      }

      setIsSplitting(true);
      try {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        
        const subPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
        const copiedPages = await subPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => subPdf.addPage(page));

        const subPdfBytes = await subPdf.save();
        const blob = new Blob([subPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setSplitPdfUrl(url);
      } catch (error) {
        console.error("Error splitting PDF:", error);
        alert(t('split.alertError'));
      } finally {
        setIsSplitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Header titleKey="tools.split.title" />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('split.selectPrompt')}</h2>
            <p className="text-gray-500 mb-8">{t('tools.split.description')}</p>

            {!splitPdfUrl ? (
              <>
                <div className="mb-8">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200">
                    <Scissors className="w-5 h-5" />
                    {t('common.selectFile')}
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {file && (
                  <div className="max-w-md mx-auto text-left bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                      <span className="font-semibold text-gray-700 truncate mr-4">{file.name}</span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        {totalPages} Pages
                      </span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">{t('split.pageRange')}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">{t('split.from')}</label>
                          <input 
                            type="number" 
                            min="1" 
                            max={totalPages} 
                            value={fromPage} 
                            onChange={(e) => handleNumberChange(e.target.value, setFromPage)}
                            onBlur={() => handleBlur(fromPage, setFromPage, 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">{t('split.to')}</label>
                          <input 
                            type="number" 
                            min="1" 
                            max={totalPages} 
                            value={toPage} 
                            onChange={(e) => handleNumberChange(e.target.value, setToPage)}
                            onBlur={() => handleBlur(toPage, setToPage, totalPages)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={splitPDF} 
                      disabled={isSplitting}
                      className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg shadow-green-200 disabled:opacity-50"
                    >
                      {isSplitting ? t('split.processing') : t('split.buttonAction')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 animate-scale-up">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scissors className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('split.success')}</h3>
                <a 
                  href={splitPdfUrl} 
                  download={`${file?.name.replace('.pdf', '')}_${fromPage}-${toPage}.pdf`}
                  className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition shadow-lg shadow-blue-200"
                >
                  {t('split.downloadAction')}
                </a>
                <div className="mt-8">
                  <button onClick={() => { setSplitPdfUrl(null); setFile(null); }} className="text-gray-500 hover:text-blue-600 font-medium">
                    {t('split.more')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/split/page.tsx
  git commit -m "refactor: apply multi-language support to Split PDF page"
  ```

---

### Task 9: Refactor Rotate PDF page

**Files:**
- Modify: `frontend/src/app/rotate/page.tsx`

- [ ] **Step 1: Update page.tsx**
  Replace header, translation strings, and selectors.
  ```typescript
  "use client";

  import React, { useState } from 'react';
  import { PDFDocument, degrees } from 'pdf-lib';
  import { RefreshCw, FileUp } from 'lucide-react';
  import { Header } from '../../components/Header';
  import { useTranslation } from '../../hooks/useTranslation';

  export default function RotatePDF() {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [angle, setAngle] = useState<number>(90);
    const [isRotating, setIsRotating] = useState(false);
    const [rotatedPdfUrl, setRotatedPdfUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type !== 'application/pdf') return;
        setFile(selectedFile);
        setRotatedPdfUrl(null);
      }
    };

    const rotatePDF = async () => {
      if (!file) return alert(t('rotate.alertSelectOne'));

      setIsRotating(true);
      try {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        const pages = pdf.getPages();

        pages.forEach((page) => {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + angle) % 360));
        });

        const rotatedPdfBytes = await pdf.save();
        const blob = new Blob([rotatedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setRotatedPdfUrl(url);
      } catch (error) {
        console.error("Error rotating PDF:", error);
        alert(t('rotate.alertError'));
      } finally {
        setIsRotating(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Header titleKey="tools.rotate.title" />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('rotate.selectPrompt')}</h2>
            <p className="text-gray-500 mb-8">{t('tools.rotate.description')}</p>

            {!rotatedPdfUrl ? (
              <>
                <div className="mb-8">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200">
                    <RefreshCw className="w-5 h-5" />
                    {t('common.selectFile')}
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {file && (
                  <div className="max-w-md mx-auto text-left bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 animate-fade-in">
                    <div className="border-b border-gray-200 pb-3 mb-4">
                      <span className="font-semibold text-gray-700 truncate block">{file.name}</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">{t('rotate.angle')}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: t('rotate.angle90'), value: 90 },
                          { label: t('rotate.angle180'), value: 180 },
                          { label: t('rotate.angle270'), value: 270 }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setAngle(option.value)}
                            className={`px-3 py-2 text-sm font-semibold rounded-lg border transition ${
                              angle === option.value
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={rotatePDF} 
                      disabled={isRotating}
                      className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg shadow-green-200 disabled:opacity-50"
                    >
                      {isRotating ? t('rotate.processing') : t('rotate.buttonAction')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 animate-scale-up">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('rotate.success')}</h3>
                <a 
                  href={rotatedPdfUrl} 
                  download={`rotated_${file?.name}`}
                  className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition shadow-lg shadow-blue-200"
                >
                  {t('rotate.downloadAction')}
                </a>
                <div className="mt-8">
                  <button onClick={() => { setRotatedPdfUrl(null); setFile(null); }} className="text-gray-500 hover:text-blue-600 font-medium">
                    {t('rotate.more')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/rotate/page.tsx
  git commit -m "refactor: apply multi-language support to Rotate PDF page"
  ```

---

### Task 10: Refactor Watermark PDF page

**Files:**
- Modify: `frontend/src/app/watermark/page.tsx`

- [ ] **Step 1: Update page.tsx**
  Replace local header, translate settings, labels, buttons and error messages.
  ```typescript
  "use client";

  import React, { useState } from 'react';
  import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
  import { Type, FileUp } from 'lucide-react';
  import { Header } from '../../components/Header';
  import { useTranslation } from '../../hooks/useTranslation';

  export default function AddWatermark() {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [watermarkText, setWatermarkText] = useState('');
    const [isWatermarking, setIsWatermarking] = useState(false);
    const [watermarkedPdfUrl, setWatermarkedPdfUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if (selectedFile.type !== 'application/pdf') return;
        setFile(selectedFile);
        setWatermarkedPdfUrl(null);
      }
    };

    const addWatermark = async () => {
      if (!file) return alert(t('watermark.alertSelectOne'));
      
      setIsWatermarking(true);
      try {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBuffer);
        
        const helveticaFont = await pdf.embedFont(StandardFonts.Helvetica);
        const pages = pdf.getPages();
        const text = watermarkText || t('watermark.textPlaceholder');

        pages.forEach((page) => {
          const { width, height } = page.getSize();
          
          page.drawText(text, {
            x: width / 2 - helveticaFont.widthOfTextAtSize(text, 50) / 2,
            y: height / 2 - 25,
            size: 50,
            font: helveticaFont,
            color: rgb(0.75, 0.75, 0.75),
            opacity: 0.4,
            rotate: { angle: 45, phase: 0 },
          });
        });

        const watermarkedPdfBytes = await pdf.save();
        const blob = new Blob([watermarkedPdfBytes as unknown as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setWatermarkedPdfUrl(url);
      } catch (error) {
        console.error("Error adding watermark:", error);
        alert(t('watermark.alertError'));
      } finally {
        setIsWatermarking(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Header titleKey="tools.watermark.title" />

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t('watermark.selectPrompt')}</h2>
            <p className="text-gray-500 mb-8">{t('tools.watermark.description')}</p>

            {!watermarkedPdfUrl ? (
              <>
                <div className="mb-8">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition shadow-lg shadow-blue-200">
                    <Type className="w-5 h-5" />
                    {t('common.selectFile')}
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {file && (
                  <div className="max-w-md mx-auto text-left bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 animate-fade-in">
                    <div className="border-b border-gray-200 pb-3 mb-4">
                      <span className="font-semibold text-gray-700 truncate block">{file.name}</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-500 uppercase tracking-wider">{t('watermark.settings')}</h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">{t('watermark.text')}</label>
                        <input
                          type="text"
                          placeholder={t('watermark.textPlaceholder')}
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={addWatermark} 
                      disabled={isWatermarking}
                      className="w-full mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition shadow-lg shadow-green-200 disabled:opacity-50"
                    >
                      {isWatermarking ? t('watermark.processing') : t('watermark.buttonAction')}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 animate-scale-up">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Type className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">{t('watermark.success')}</h3>
                <a 
                  href={watermarkedPdfUrl} 
                  download={`watermarked_${file?.name}`}
                  className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition shadow-lg shadow-blue-200"
                >
                  {t('watermark.downloadAction')}
                </a>
                <div className="mt-8">
                  <button onClick={() => { setWatermarkedPdfUrl(null); setFile(null); setWatermarkText(''); }} className="text-gray-500 hover:text-blue-600 font-medium">
                    {t('watermark.more')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/watermark/page.tsx
  git commit -m "refactor: apply multi-language support to Watermark PDF page"
  ```

---

### Task 11: Refactor Edit PDF page

**Files:**
- Modify: `frontend/src/app/edit/page.tsx`

- [ ] **Step 1: Update page.tsx**
  Replace local header, translate labels like Pages, Add Blank Page, Save Changes, Download PDF, alerts, and other UI text.
  Because the edit page contains many lines, we will target specific local headers and buttons for modification.
  Let's verify: we will replace the header tag around line 312-321 and edit text occurrences.
  Let's replace:
  - Header: `<Header titleKey="tools.edit.title" />`
  - "Pages" -> `{t('edit.pages')}`
  - "Add Blank Page" -> `{t('edit.addBlank')}`
  - "Save Changes" -> `{t('edit.buttonAction')}`
  - "Download PDF" -> `{t('edit.downloadAction')}`
  - "Select PDF File" -> `{t('common.selectFile')}`
  - "PDF Edited Successfully!" -> `{t('edit.success')}`
  - `alert("Please select a PDF file first.");` -> `alert(t('edit.alertSelectOne'));`
  - `alert("An error occurred while loading the PDF.");` -> `alert(t('edit.alertError'));`

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/edit/page.tsx
  git commit -m "refactor: apply multi-language support to Edit PDF page"
  ```

---

### Task 12: Refactor OCR page

**Files:**
- Modify: `frontend/src/app/ocr/page.tsx`

- [ ] **Step 1: Update page.tsx**
  Replace header, translation strings for labels, copy state text, action buttons, status labels, and alerts.
  - Header: `<Header titleKey="tools.ocr.title" />`
  - "Select PDF or Image file" -> `{t('ocr.selectPrompt')}`
  - "Extract Text" -> `{t('ocr.buttonAction')}`
  - "Extracting text..." -> `{t('ocr.processing')}`
  - "Download Text File" -> `{t('ocr.downloadAction')}`
  - "Copy Text" -> `{t('ocr.copy')}`
  - "Copied!" -> `{t('ocr.copied')}`
  - "Extracted text will appear here..." -> `placeholder={t('ocr.placeholder')}`
  - `alert("Please select a file first.");` -> `alert(t('ocr.alertSelectOne'));`
  - `alert("An error occurred during OCR extraction.");` -> `alert(t('ocr.alertError'));`

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/ocr/page.tsx
  git commit -m "refactor: apply multi-language support to OCR page"
  ```

---

### Task 13: Refactor Convert to PDF page

**Files:**
- Modify: `frontend/src/app/convert/page.tsx`

- [ ] **Step 1: Update page.tsx**
  Replace header, translate select prompt, buttons, list descriptions, loading status, success titles, and error dialogues.
  - Header: `<Header titleKey="tools.convert.title" />`
  - "Select Files" -> `{t('common.selectFiles')}`
  - "Convert to PDF" -> `{t('convert.buttonAction')}`
  - "Converting..." -> `{t('convert.processing')}`
  - "Download PDF" -> `{t('convert.downloadAction')}`
  - "Images Converted Successfully!" -> `{t('convert.success')}`
  - `alert("Please select at least 1 image file.");` -> `alert(t('convert.alertSelectOne'));`
  - `alert("An error occurred during conversion.");` -> `alert(t('convert.alertError'));`

- [ ] **Step 2: Commit**
  ```bash
  git add frontend/src/app/convert/page.tsx
  git commit -m "refactor: apply multi-language support to Convert page"
  ```

---

### Task 14: Run and Verify All Tests

**Files:**
- Test: `frontend/tests/tools.spec.ts`
- Test: `frontend/tests/i18n.spec.ts`

- [ ] **Step 1: Execute existing tests to ensure no regressions**
  Run: `npx playwright test tests/tools.spec.ts`
  Expected: All 6 tests pass successfully.

- [ ] **Step 2: Execute new translation tests**
  Run: `npx playwright test tests/i18n.spec.ts`
  Expected: Localization, toggle, and persistence verification passes.

- [ ] **Step 3: Run full dev check**
  Run: `npm run build` in the `frontend` directory to ensure no compilation/type errors exist.
  Expected: Zero build compilation errors.

- [ ] **Step 4: Commit all final changes**
  ```bash
  git status
  ```
