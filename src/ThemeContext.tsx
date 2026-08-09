import React, { createContext, useContext, useState, useMemo } from 'react';

export interface ThemeColors {
  // Backgrounds
  background: string;
  card: string;
  cardBorder: string;
  overlayBg: string;
  webOuterBg: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  inputPlaceholder: string;

  // Tab Bar
  tabBarBg: string;
  tabBarBorder: string;
  tabBarInactive: string;

  // Dividers & Borders
  divider: string;
  buttonBg: string;

  // Chips
  chipUnselectedBg: string;
  chipUnselectedBorder: string;
  chipUnselectedText: string;
  chipSelectedTextOnAccent: string;

  // Status Bar
  statusBar: 'light-content' | 'dark-content';

  // Accents (same in both themes)
  accent: string;
  accentAmber: string;
  accentBlue: string;
  accentRed: string;
  accentPurple: string;

  // Accent Backgrounds
  accentBg: string;
  accentBorder: string;
  accentAmberBg: string;
  accentAmberBorder: string;
  accentBlueBg: string;
  accentRedBg: string;
  accentPurpleBg: string;
  accentPurpleBorder: string;

  // Modal / Overlay
  modalOverlay: string;

  // Scoring specific
  scoreBallDefault: string;
  scoreBallDot: string;
}

const darkColors: ThemeColors = {
  background: '#0A0E1A',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.06)',
  overlayBg: '#0A0E1A',
  webOuterBg: '#060911',

  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  inputPlaceholder: '#475569',

  tabBarBg: '#0A0E1A',
  tabBarBorder: '#1E293B',
  tabBarInactive: '#475569',

  divider: 'rgba(255,255,255,0.06)',
  buttonBg: 'rgba(255,255,255,0.08)',

  chipUnselectedBg: 'rgba(255,255,255,0.04)',
  chipUnselectedBorder: 'rgba(255,255,255,0.08)',
  chipUnselectedText: '#94A3B8',
  chipSelectedTextOnAccent: '#0A0E1A',

  statusBar: 'light-content',

  accent: '#10B981',
  accentAmber: '#F59E0B',
  accentBlue: '#3B82F6',
  accentRed: '#EF4444',
  accentPurple: '#8B5CF6',

  accentBg: 'rgba(16,185,129,0.12)',
  accentBorder: 'rgba(16,185,129,0.2)',
  accentAmberBg: 'rgba(245,158,11,0.1)',
  accentAmberBorder: 'rgba(245,158,11,0.15)',
  accentBlueBg: 'rgba(59,130,246,0.1)',
  accentRedBg: 'rgba(239,68,68,0.1)',
  accentPurpleBg: 'rgba(139,92,246,0.08)',
  accentPurpleBorder: 'rgba(139,92,246,0.2)',

  modalOverlay: 'rgba(0,0,0,0.7)',

  scoreBallDefault: 'rgba(255,255,255,0.06)',
  scoreBallDot: '#1E293B',
};

const lightColors: ThemeColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  overlayBg: '#F8FAFC',
  webOuterBg: '#E2E8F0',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  inputPlaceholder: '#94A3B8',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarInactive: '#64748B',

  divider: '#E2E8F0',
  buttonBg: '#F1F5F9',

  chipUnselectedBg: '#F1F5F9',
  chipUnselectedBorder: '#E2E8F0',
  chipUnselectedText: '#475569',
  chipSelectedTextOnAccent: '#FFFFFF',

  statusBar: 'dark-content',

  accent: '#10B981',
  accentAmber: '#F59E0B',
  accentBlue: '#3B82F6',
  accentRed: '#EF4444',
  accentPurple: '#8B5CF6',

  accentBg: 'rgba(16,185,129,0.1)',
  accentBorder: 'rgba(16,185,129,0.25)',
  accentAmberBg: 'rgba(245,158,11,0.1)',
  accentAmberBorder: 'rgba(245,158,11,0.2)',
  accentBlueBg: 'rgba(59,130,246,0.08)',
  accentRedBg: 'rgba(239,68,68,0.08)',
  accentPurpleBg: 'rgba(139,92,246,0.08)',
  accentPurpleBorder: 'rgba(139,92,246,0.2)',

  modalOverlay: 'rgba(15,23,42,0.6)',

  scoreBallDefault: '#E2E8F0',
  scoreBallDot: '#CBD5E1',
};

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
  colors: darkColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(prev => !prev);

  const value = useMemo(() => ({
    isDark,
    toggleTheme,
    colors: isDark ? darkColors : lightColors,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export { darkColors, lightColors };
