import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeId, ThemeColors } from '../types';
import { THEMES, DEFAULT_THEME_ID, applyThemeToDocument } from '../styles/themes';

interface ThemeContextType {
  themeId: ThemeId;
  theme: ThemeColors;
  setThemeId: (id: ThemeId) => void;
  availableThemes: ThemeColors[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_THEME_KEY = 'maktabah_shamela_theme_id_v2';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_THEME_KEY) as ThemeId;
      if (saved && THEMES[saved]) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_THEME_ID;
  });

  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME_ID];

  const setThemeId = (newId: ThemeId) => {
    if (THEMES[newId]) {
      setThemeIdState(newId);
      try {
        localStorage.setItem(STORAGE_THEME_KEY, newId);
      } catch (e) {
        // ignore
      }
    }
  };

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const availableThemes = Object.values(THEMES);

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
