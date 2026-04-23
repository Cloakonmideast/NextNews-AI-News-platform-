// src/LanguageContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('english'); // Default language

  // The 't' function grabs the translated word based on the current language
  const t = (key) => {
    return translations[language]?.[key] || translations['english'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook so we can easily use it in any component
export const useLanguage = () => useContext(LanguageContext);