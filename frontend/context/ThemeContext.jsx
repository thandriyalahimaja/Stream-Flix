import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { APP_CONFIG } from '@/constants/config';

/**
 * Theme palettes — cream (light, warm) and berry (dark, immersive)
 */
const palettes = {
  cream: {
    bg: '#FCEDD8',
    textPrimary: '#B0183D',
    textSecondary: '#E23C64',
    accent: '#FFD464',
    button: '#FF5E5E',
    card: '#FFF6EC',
    footer: '#F4C95D',
    footerText: '#8A1B42',
  },
  berry: {
    bg: '#7D1038',
    textPrimary: '#FFE7D6',
    textSecondary: '#FFB3B3',
    accent: '#FFD166',
    button: '#D94C6A',
    card: '#912048',
    footer: '#A42B52',
    footerText: '#FFE7D6',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'cream';
    return localStorage.getItem(APP_CONFIG.auth.themeKey) || 'cream';
  });

  useEffect(() => {
    localStorage.setItem(APP_CONFIG.auth.themeKey, theme);
    const p = palettes[theme];
    const root = document.documentElement;
    root.style.setProperty('--cw-bg', p.bg);
    root.style.setProperty('--cw-text', p.textPrimary);
    root.style.setProperty('--cw-text2', p.textSecondary);
    root.style.setProperty('--cw-accent', p.accent);
    root.style.setProperty('--cw-button', p.button);
    root.style.setProperty('--cw-card', p.card);
    root.style.setProperty('--cw-footer', p.footer);
    root.style.setProperty('--cw-footer-text', p.footerText);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      palette: palettes[theme],
      toggle: () => setTheme((t) => (t === 'cream' ? 'berry' : 'cream')),
      setTheme,
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
