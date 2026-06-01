import { createContext, useContext, useState } from 'react';
import translations from './translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('1h_lang') || 'en');

  const t = translations[lang] || translations.en;

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('1h_lang', l);
  };

  return (
    <LangContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
