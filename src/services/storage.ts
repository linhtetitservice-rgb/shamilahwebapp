import { BookCategory, ShamelaBook } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_BOOKS } from '../data/defaultBooks';

const STORAGE_KEY_BOOKS = 'shamela_library_books_v2';
const STORAGE_KEY_CATEGORIES = 'shamela_library_categories_v2';

export function getStoredCategories(): BookCategory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch (e) {
    console.error('Failed to load categories from storage', e);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: BookCategory[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
}

export function getStoredBooks(): ShamelaBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(DEFAULT_BOOKS));
      return DEFAULT_BOOKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_BOOKS;
  } catch (e) {
    console.error('Failed to load books from storage', e);
    return DEFAULT_BOOKS;
  }
}

export function saveBooks(books: ShamelaBook[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (e) {
    console.error('Failed to save books', e);
  }
}

/**
 * Extracts Shamela Book ID from a raw URL or numeric string
 * Examples:
 *  - "https://shamela.ws/book/23608" -> "23608"
 *  - "shamela.ws/book/23608/50" -> "23608"
 *  - "23608" -> "23608"
 */
export function extractShamelaId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Direct numeric ID
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  // URL matching shamela.ws/book/{id}
  const match = trimmed.match(/shamela\.ws\/book\/(\d+)/i);
  if (match && match[1]) {
    return match[1];
  }

  // Other URLs
  return null;
}

/**
 * Normalizes input to a canonical Shamela URL
 */
export function buildShamelaUrl(input: string): string {
  const trimmed = input.trim();
  const id = extractShamelaId(trimmed);
  if (id) {
    // If it has page info like /book/123/45 preserve it, otherwise clean URL
    const pageMatch = trimmed.match(/shamela\.ws\/book\/\d+\/(\d+)/i);
    if (pageMatch && pageMatch[1]) {
      return `https://shamela.ws/book/${id}/${pageMatch[1]}`;
    }
    return `https://shamela.ws/book/${id}`;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export interface LibraryExportData {
  version: string;
  exportDate: string;
  categories: BookCategory[];
  books: ShamelaBook[];
}

export function exportLibraryToJson(books: ShamelaBook[], categories: BookCategory[]): void {
  const data: LibraryExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    categories,
    books,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `maktabah_shamela_books_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseBulkInput(
  rawText: string,
  defaultCategoryId: string
): Partial<ShamelaBook>[] {
  const lines = rawText.split('\n');
  const results: Partial<ShamelaBook>[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // formats supported:
    // 1. URL | Title | Author
    // 2. URL Title
    // 3. Just URL
    let url = '';
    let title = '';
    let author = '';

    if (trimmed.includes('|')) {
      const parts = trimmed.split('|').map((p) => p.trim());
      url = parts[0] || '';
      title = parts[1] || '';
      author = parts[2] || '';
    } else if (trimmed.includes('\t')) {
      const parts = trimmed.split('\t').map((p) => p.trim());
      url = parts[0] || '';
      title = parts[1] || '';
      author = parts[2] || '';
    } else {
      // Check if line contains URL
      const urlMatch = trimmed.match(/(https?:\/\/[^\s]+|shamela\.ws\/[^\s]+|\b\d{2,6}\b)/);
      if (urlMatch) {
        url = urlMatch[0];
        title = trimmed.replace(urlMatch[0], '').trim();
      } else {
        title = trimmed;
      }
    }

    if (url || title) {
      const shamelaId = extractShamelaId(url);
      const cleanUrl = url ? buildShamelaUrl(url) : (shamelaId ? `https://shamela.ws/book/${shamelaId}` : '');

      results.push({
        id: 'book-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        titleAr: title || (shamelaId ? `كتاب شاملة #${shamelaId}` : 'نئی کتاب'),
        titleUr: title || (shamelaId ? `شاملہ کتاب #${shamelaId}` : 'نئی کتاب'),
        authorAr: author || '',
        authorUr: author || '',
        categoryId: defaultCategoryId,
        shamelaId: shamelaId || undefined,
        url: cleanUrl || 'https://shamela.ws',
        isFavorite: false,
        createdAt: Date.now(),
      });
    }
  }

  return results;
}
