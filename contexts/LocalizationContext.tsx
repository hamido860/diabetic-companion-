import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { translations } from '../locales/translations';

type Language = 'en' | 'es' | 'ar';
export type TranslationKey = keyof (typeof translations)['en'];

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const isRTL = language === 'ar';
    I18nManager.forceRTL(isRTL);
    I18nManager.allowRTL(isRTL);
    // You might need to restart the app for the changes to take effect
  }, [language]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language]?.[key] || translations['en'][key];
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
