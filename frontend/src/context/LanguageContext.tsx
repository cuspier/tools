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

const resolveKeyPath = (obj: unknown, keys: string[]): string | null => {
  let current: unknown = obj;
  for (const k of keys) {
    if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, k)) {
      current = (current as Record<string, unknown>)[k];
    } else {
      return null;
    }
  }
  return typeof current === 'string' ? current : null;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    let storedLocale: Locale | null = null;
    try {
      storedLocale = localStorage.getItem('localpdf_locale') as Locale;
    } catch (e) {
      console.warn('Failed to access localStorage:', e);
    }

    let targetLocale: Locale = 'en';
    if (storedLocale && (storedLocale === 'en' || storedLocale === 'ko')) {
      targetLocale = storedLocale;
    } else {
      const browserLang = typeof navigator !== 'undefined' ? navigator.language || '' : '';
      targetLocale = browserLang.toLowerCase().startsWith('ko') ? 'ko' : 'en';
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(targetLocale);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('localpdf_locale', newLocale);
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    
    const value = resolveKeyPath(translations[locale], keys);
    if (value !== null) return value;

    if (locale !== 'en') {
      const fallbackValue = resolveKeyPath(translations['en'], keys);
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
