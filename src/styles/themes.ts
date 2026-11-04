import { ThemeColors, ThemeId } from '../types';

export const THEMES: Record<ThemeId, ThemeColors> = {
  'peach-red': {
    id: 'peach-red',
    nameUr: 'گلابی اور سرخ (Peach & Red)',
    nameEn: 'Pastel Peach & Crimson Red',
    isDark: false,
    previewBg: '#fae8e8',
    previewAccent: '#dc2626',
    bgApp: '#fdf2f2',
    bgCard: '#ffffff',
    bgCardSubtle: '#fff5f5',
    bgHeader: '#faeae9',
    borderTheme: '#fecdd3',
    textPrimary: '#1c1917',
    textSecondary: '#57534e',
    accent: '#dc2626',
    accentHover: '#b91c1c',
    accentSubtle: '#ffe4e6',
    accentText: '#ffffff',
    badgeBg: '#fee2e2',
  },
  'sand-orange': {
    id: 'sand-orange',
    nameUr: 'ریت اور نارنجی (Sand & Orange)',
    nameEn: 'Warm Sand & Tangerine Orange',
    isDark: false,
    previewBg: '#f4e6de',
    previewAccent: '#ea580c',
    bgApp: '#faf4f0',
    bgCard: '#ffffff',
    bgCardSubtle: '#fdf8f5',
    bgHeader: '#f4e7df',
    borderTheme: '#fed7aa',
    textPrimary: '#1c1917',
    textSecondary: '#57534e',
    accent: '#ea580c',
    accentHover: '#c2410c',
    accentSubtle: '#ffedd5',
    accentText: '#ffffff',
    badgeBg: '#ffedd5',
  },
  'mint-green': {
    id: 'mint-green',
    nameUr: 'سبز پودینہ (Mint & Green)',
    nameEn: 'Sage Mint & Forest Emerald',
    isDark: false,
    previewBg: '#dcf2e3',
    previewAccent: '#16a34a',
    bgApp: '#edf7f0',
    bgCard: '#ffffff',
    bgCardSubtle: '#f6fbf7',
    bgHeader: '#dcf2e3',
    borderTheme: '#bbf7d0',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    accent: '#16a34a',
    accentHover: '#15803d',
    accentSubtle: '#dcfce7',
    accentText: '#ffffff',
    badgeBg: '#dcfce7',
  },
  'dark-red': {
    id: 'dark-red',
    nameUr: 'سیاہ اور سرخ (Dark & Red)',
    nameEn: 'Pitch Dark & Crimson Red',
    isDark: true,
    previewBg: '#0d0d0d',
    previewAccent: '#ef4444',
    bgApp: '#080808',
    bgCard: '#181818',
    bgCardSubtle: '#222222',
    bgHeader: '#121212',
    borderTheme: '#351616',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#ef4444',
    accentHover: '#dc2626',
    accentSubtle: '#450a0a',
    accentText: '#ffffff',
    badgeBg: '#2c0d0d',
  },
  'dark-orange': {
    id: 'dark-orange',
    nameUr: 'سیاہ اور نارنجی (Dark & Orange)',
    nameEn: 'Pitch Dark & Tangerine Orange',
    isDark: true,
    previewBg: '#0d0d0d',
    previewAccent: '#f97316',
    bgApp: '#080808',
    bgCard: '#181818',
    bgCardSubtle: '#222222',
    bgHeader: '#121212',
    borderTheme: '#3b1c0e',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#f97316',
    accentHover: '#ea580c',
    accentSubtle: '#431407',
    accentText: '#ffffff',
    badgeBg: '#2f1406',
  },
  'dark-emerald': {
    id: 'dark-emerald',
    nameUr: 'سیاہ اور زمرد (Dark & Emerald)',
    nameEn: 'Pitch Dark & Neon Emerald',
    isDark: true,
    previewBg: '#0d0d0d',
    previewAccent: '#22c55e',
    bgApp: '#080808',
    bgCard: '#181818',
    bgCardSubtle: '#222222',
    bgHeader: '#121212',
    borderTheme: '#13351d',
    textPrimary: '#ffffff',
    textSecondary: '#a1a1aa',
    accent: '#22c55e',
    accentHover: '#16a34a',
    accentSubtle: '#052e16',
    accentText: '#ffffff',
    badgeBg: '#092d16',
  },
  'shamela-classic': {
    id: 'shamela-classic',
    nameUr: 'شاملہ کلاسک (Shamela Slate)',
    nameEn: 'Midnight Slate & Teal Gold',
    isDark: true,
    previewBg: '#0f172a',
    previewAccent: '#10b981',
    bgApp: '#030712',
    bgCard: '#0f172a',
    bgCardSubtle: '#1e293b',
    bgHeader: '#0b1324',
    borderTheme: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    accent: '#10b981',
    accentHover: '#059669',
    accentSubtle: '#064e3b',
    accentText: '#ffffff',
    badgeBg: '#064e3b',
  },
};

export const DEFAULT_THEME_ID: ThemeId = 'dark-emerald';

export function applyThemeToDocument(theme: ThemeColors) {
  const root = document.documentElement;
  
  root.style.setProperty('--color-bg-app', theme.bgApp);
  root.style.setProperty('--color-bg-card', theme.bgCard);
  root.style.setProperty('--color-bg-card-subtle', theme.bgCardSubtle);
  root.style.setProperty('--color-bg-header', theme.bgHeader);
  root.style.setProperty('--color-border-theme', theme.borderTheme);
  root.style.setProperty('--color-text-primary', theme.textPrimary);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-accent-hover', theme.accentHover);
  root.style.setProperty('--color-accent-subtle', theme.accentSubtle);
  root.style.setProperty('--color-accent-text', theme.accentText);
  root.style.setProperty('--color-badge-bg', theme.badgeBg);

  if (theme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
