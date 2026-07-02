"use client";

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import enTranslations from '../locales/en.json';
import koTranslations from '../locales/ko.json';

type Locale = 'en' | 'ko';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: enTranslations,
  ko: koTranslations,
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const storedLocale = localStorage.getItem('localpdf_locale') as Locale;
    let targetLocale: Locale = 'en';
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'ko')) {
      targetLocale = storedLocale;
    } else {
      const browserLang = navigator.language || '';
      targetLocale = browserLang.toLowerCase().startsWith('ko') ? 'ko' : 'en';
    }
    
    // Defer state update to avoid calling setState synchronously within effect body
    setTimeout(() => {
      setLocaleState(targetLocale);
    }, 0);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('localpdf_locale', newLocale);
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    
    const resolve = (obj: unknown): string | null => {
      let current = obj;
      for (const k of keys) {
        if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, k)) {
          current = (current as Record<string, unknown>)[k];
        } else {
          return null;
        }
      }
      return typeof current === 'string' ? current : null;
    };

    const value = resolve(translations[locale]);
    if (value !== null) return value;

    if (locale !== 'en') {
      const fallbackValue = resolve(translations['en']);
      if (fallbackValue !== null) return fallbackValue;
    }

    return key;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
