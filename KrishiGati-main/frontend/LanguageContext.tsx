import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Language } from "./i18n";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("krishigati_language");
    return (saved as Language) || "English";
  });

  useEffect(() => {
    localStorage.setItem("krishigati_language", language);
    // Update document language for accessibility
    document.documentElement.lang = language === "English" ? "en" : "hi";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
