// src/context/LanguageContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  t: typeof translations.es;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Por defecto iniciamos en español para evitar problemas de servidor
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    // 🌍 Detecta el idioma del sistema operativo o navegador (ej: "en-US", "es-HN")
    const systemLang = navigator.language || (navigator as any).userLanguage;
    
    // Si el idioma del sistema empieza con "en", cambiamos a inglés
    if (systemLang && systemLang.startsWith('en')) {
      setLanguageState('en');
    } else {
      setLanguageState('es');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  return context;
}