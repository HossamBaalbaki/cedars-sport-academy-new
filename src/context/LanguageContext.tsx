"use client";

/**
 * Language Context — Cedars Sport Academy
 * Provides AR/EN language switching across the entire app.
 * Supports RTL layout for Arabic.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (en: string, ar: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load saved language preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cedars_language") as Language | null;
    if (saved && (saved === "en" || saved === "ar")) {
      setLanguageState(saved);
    }
  }, []);

  // Apply RTL direction and font to document
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
    document.body.style.fontFamily =
      language === "ar"
        ? "'Cairo', system-ui, sans-serif"
        : "'Inter', system-ui, sans-serif";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("cedars_language", lang);
  };

  const isRTL = language === "ar";

  /**
   * Translation helper — returns the correct string based on current language.
   * Usage: t("English text", "النص العربي")
   */
  const t = (en: string, ar: string): string => {
    return language === "ar" ? ar : en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook to use language context in any component */
export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
