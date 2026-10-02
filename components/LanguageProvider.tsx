"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Language } from "@/types";
import { translate, type StringKey } from "@/lib/i18n";

const STORAGE_KEY = "healthmate_lang";
const SUPPORTED: Language[] = ["en", "bm", "zh", "ta"];

/** Values for the `<html lang>` attribute so screen readers pick the right voice. */
const HTML_LANG: Record<Language, string> = { en: "en", bm: "ms", zh: "zh-CN", ta: "ta" };

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
});

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && SUPPORTED.includes(saved)) setLanguageState(saved);
    } catch {
      // Storage can be blocked (private mode); the app still works in English.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[language];
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore: the choice still applies for this session.
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
  );
}

/** Returns a translator bound to the current language: `t("reports.summary")`. */
export function useT() {
  const { language } = useLanguage();
  return useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => translate(language, key, vars),
    [language]
  );
}
