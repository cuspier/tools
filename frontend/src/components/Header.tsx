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
                {t('brand.name')}
              </span>
            </Link>
            <nav className="hidden md:flex gap-6 font-medium text-gray-600">
              <Link href="/" className="hover:text-blue-600 transition">{t('common.allTools')}</Link>
              <Link href="/merge" className="hover:text-blue-600 transition">{t('tools.merge.title')}</Link>
              <Link href="/split" className="hover:text-blue-600 transition">{t('tools.split.title')}</Link>
              <Link href="/convert" className="hover:text-blue-600 transition">{t('tools.convert.title')}</Link>
              <Link href="/edit" className="hover:text-blue-600 transition">{t('tools.edit.title')}</Link>
              <Link href="/id-photo" className="hover:text-blue-600 transition">{t('tools.idPhoto.title')}</Link>
            </nav>
          </div>
        )}

        <div
          role="group"
          aria-label="Language selector"
          className="flex items-center bg-gray-100 rounded-lg p-0.5 text-xs font-semibold border border-gray-200 shadow-inner"
        >
          <button
            onClick={() => setLocale('en')}
            aria-pressed={locale === 'en'}
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
            aria-pressed={locale === 'ko'}
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
