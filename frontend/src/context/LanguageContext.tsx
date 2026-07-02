"use client";

import React, { createContext, useState, useEffect } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedLocale = localStorage.getItem('localpdf_locale') as Locale;
    let targetLocale: Locale = 'en';
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'ko')) {
      targetLocale = storedLocale;
    } else {
      const browserLang = navigator.language || '';
      targetLocale = browserLang.toLowerCase().startsWith('ko') ? 'ko' : 'en';
    }
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(targetLocale);
    setIsMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('localpdf_locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: unknown = translations[locale];

    for (const k of keys) {
      if (result && typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, k)) {
        result = (result as Record<string, unknown>)[k];
      } else {
        // Fallback to English
        let fallbackResult: unknown = translations['en'];
        for (const fk of keys) {
          if (fallbackResult && typeof fallbackResult === 'object' && Object.prototype.hasOwnProperty.call(fallbackResult, fk)) {
            fallbackResult = (fallbackResult as Record<string, unknown>)[fk];
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
