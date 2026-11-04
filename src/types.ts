export interface BookCategory {
  id: string;
  nameUr: string;
  nameAr: string;
  nameMm?: string;
  description?: string;
  iconName?: string;
  colorTheme?: string;
  order?: number;
}

export interface ShamelaBook {
  id: string;
  titleAr: string;
  titleUr?: string;
  titleMm?: string;
  authorAr?: string;
  authorUr?: string;
  authorMm?: string;
  categoryId: string;
  shamelaId?: string; // e.g. "23608"
  url: string;        // e.g. "https://shamela.ws/book/23608"
  volumes?: string;   // e.g. "۸ جلدیں"
  pages?: string;
  notes?: string;
  tags?: string[];
  isFavorite: boolean;
  createdAt: number;
  lastOpenedAt?: number;
}

export type ViewMode = 'shelf' | 'compact' | 'by-category';

export type BookSortOption = 'recently-added' | 'last-opened' | 'alphabetical';

// ==========================================
// Theme Configurations matching User Screenshots
// ==========================================
export type ThemeId = 
  | 'peach-red'      // Screenshot 1: Pastel Peach + Crimson Red (Light)
  | 'sand-orange'     // Screenshot 2: Warm Desert Sand + Tangerine Orange (Light)
  | 'mint-green'      // Screenshot 3: Pastel Sage Mint + Forest Emerald (Light)
  | 'dark-red'        // Screenshot 4: Pitch Dark Black + Vivid Crimson Red (Dark)
  | 'dark-orange'     // Screenshot 5: Pitch Dark Black + Warm Tangerine Orange (Dark)
  | 'dark-emerald'    // Screenshot 6: Pitch Dark Black + Neon Emerald Green (Dark)
  | 'shamela-classic';// Classic: Navy Slate + Shamela Gold/Teal

export interface ThemeColors {
  id: ThemeId;
  nameUr: string;
  nameMm?: string;
  nameEn: string;
  isDark: boolean;
  previewBg: string;
  previewAccent: string;
  // CSS variables or values
  bgApp: string;
  bgCard: string;
  bgCardSubtle: string;
  bgHeader: string;
  borderTheme: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
  accentText: string;
  badgeBg: string;
}

// ==========================================
// Live Shamela Search Result Types
// ==========================================
export interface ShamelaCitation {
  markdown: string;
  url?: string;
  label?: string;
}

export interface ShamelaSourceItem {
  bookId: number;
  pageId: number;
  citationMarkdown: string;
  shamelaUrl: string;
  cleanCitation: string;
  bookTitle?: string;
  author?: string;
  text: string;
  highlightWords?: string[];
}

export interface ShamelaBookHit {
  bookId: number;
  title: string;
  author: string;
  pageId: number;
  otherPages: number[];
  shamelaUrl: string;
  opened?: boolean;
}

export interface ShamelaSearchResponse {
  query: string;
  keywords: string[];
  totalSources: number;
  totalBooks: number;
  sources: ShamelaSourceItem[];
  books: ShamelaBookHit[];
  notice?: string;
}

export interface ShamelaPageContent {
  bookId: number;
  pageId: number;
  text: string;
  citation: string;
  shamelaUrl: string;
  navigation: {
    previousPageId: number | null;
    nextPageId: number | null;
  };
}
