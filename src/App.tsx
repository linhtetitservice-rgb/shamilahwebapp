import React, { useState, useEffect, useMemo } from 'react';
import { ShamelaBook, BookCategory, ViewMode, BookSortOption } from './types';
import { 
  getStoredCategories, 
  saveCategories, 
  getStoredBooks, 
  saveBooks,
  buildShamelaUrl 
} from './services/storage';
import { DEFAULT_BOOKS, DEFAULT_CATEGORIES } from './data/defaultBooks';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  db, 
  saveBookToCloud, 
  deleteBookFromCloud, 
  saveCategoryToCloud, 
  deleteCategoryFromCloud,
  handleFirestoreError,
  OperationType 
} from './services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { BookCard } from './components/BookCard';
import { BookList } from './components/BookList';
import { BookModal } from './components/BookModal';
import { BulkAddModal } from './components/BulkAddModal';
import { CategoryModal } from './components/CategoryModal';
import { ReaderModal } from './components/ReaderModal';
import { BackupModal } from './components/BackupModal';
import { ShamelaSearchModal } from './components/ShamelaSearchModal';

import { 
  Plus, 
  ExternalLink, 
  Layers, 
  Library,
  BookOpen,
  ArrowUpLeft,
  Globe2,
  Check,
  BookMarked
} from 'lucide-react';

function LibraryApp() {
  const { theme } = useTheme();
  const { user, syncLocalToCloud } = useAuth();

  const [categories, setCategories] = useState<BookCategory[]>(() => getStoredCategories());
  const [books, setBooks] = useState<ShamelaBook[]>(() => getStoredBooks());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('shelf');
  const [sortBy, setSortBy] = useState<BookSortOption>('recently-added');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isShamelaSearchOpen, setIsShamelaSearchOpen] = useState(false);
  const [shamelaSearchInitialQuery, setShamelaSearchInitialQuery] = useState<string>('');
  
  const [editingBook, setEditingBook] = useState<ShamelaBook | null>(null);
  const [readerBook, setReaderBook] = useState<ShamelaBook | null>(null);
  const [readerInitialPageId, setReaderInitialPageId] = useState<number | undefined>(undefined);
  const [targetCategoryForAdd, setTargetCategoryForAdd] = useState<string | undefined>(undefined);

  // Quick lookup input state
  const [quickIdInput, setQuickIdInput] = useState('');
  const [shelfNotification, setShelfNotification] = useState<string | null>(null);

  // Local persistence
  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveBooks(books);
  }, [books]);

  // Firestore Real-time Sync listeners when user is logged in
  useEffect(() => {
    if (!user) return;

    // Listen to Books
    const booksPath = `users/${user.uid}/books`;
    const unsubBooks = onSnapshot(
      collection(db, 'users', user.uid, 'books'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudBooks: ShamelaBook[] = [];
          snapshot.forEach((docSnap) => {
            cloudBooks.push(docSnap.data() as ShamelaBook);
          });
          // Merge with local books
          setBooks((prev) => {
            const map = new Map<string, ShamelaBook>();
            for (const b of prev) map.set(b.id, b);
            for (const b of cloudBooks) map.set(b.id, b);
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, booksPath);
      }
    );

    // Listen to Categories
    const categoriesPath = `users/${user.uid}/categories`;
    const unsubCats = onSnapshot(
      collection(db, 'users', user.uid, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudCats: BookCategory[] = [];
          snapshot.forEach((docSnap) => {
            cloudCats.push(docSnap.data() as BookCategory);
          });
          setCategories((prev) => {
            const map = new Map<string, BookCategory>();
            for (const c of prev) map.set(c.id, c);
            for (const c of cloudCats) map.set(c.id, c);
            return Array.from(map.values());
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, categoriesPath);
      }
    );

    return () => {
      unsubBooks();
      unsubCats();
    };
  }, [user]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of books) {
      counts[b.categoryId] = (counts[b.categoryId] || 0) + 1;
    }
    return counts;
  }, [books]);

  const favoriteCount = useMemo(() => {
    return books.filter((b) => b.isFavorite).length;
  }, [books]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    let result = [...books];

    if (activeCategory === 'favorites') {
      result = result.filter((b) => b.isFavorite);
    } else if (activeCategory !== 'all') {
      result = result.filter((b) => b.categoryId === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => {
        return (
          b.titleAr.toLowerCase().includes(q) ||
          (b.titleUr && b.titleUr.toLowerCase().includes(q)) ||
          (b.titleMm && b.titleMm.toLowerCase().includes(q)) ||
          (b.authorAr && b.authorAr.toLowerCase().includes(q)) ||
          (b.authorUr && b.authorUr.toLowerCase().includes(q)) ||
          (b.shamelaId && b.shamelaId.includes(q)) ||
          (b.notes && b.notes.toLowerCase().includes(q)) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
        );
      });
    }

    // Apply Sorting
    if (sortBy === 'recently-added') {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } else if (sortBy === 'last-opened') {
      result.sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0));
    } else if (sortBy === 'alphabetical') {
      result.sort((a, b) => {
        const titleA = (a.titleUr || a.titleAr || '').trim();
        const titleB = (b.titleUr || b.titleAr || '').trim();
        return titleA.localeCompare(titleB, 'ur', { sensitivity: 'base' });
      });
    }

    return result;
  }, [books, activeCategory, searchQuery, sortBy]);

  // Book Handlers
  const handleSaveBook = async (bookData: Partial<ShamelaBook>) => {
    if (bookData.id) {
      // update
      const updated = {
        ...books.find((b) => b.id === bookData.id),
        ...bookData,
      } as ShamelaBook;

      setBooks((prev) =>
        prev.map((b) => (b.id === bookData.id ? updated : b))
      );

      if (user) {
        saveBookToCloud(user.uid, updated).catch(console.error);
      }
      showNotification('کتاب کے کوائف محفوظ کر لیے گئے ہیں');
    } else {
      // create
      const newBook: ShamelaBook = {
        id: `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        titleAr: bookData.titleAr || 'كتاب شاملة',
        titleUr: bookData.titleUr || bookData.titleAr || 'شاملہ کتاب',
        titleMm: bookData.titleUr || bookData.titleAr || 'شاملہ کتاب',
        authorAr: bookData.authorAr,
        authorUr: bookData.authorUr,
        authorMm: bookData.authorUr,
        categoryId: bookData.categoryId || categories[0]?.id || 'tafsir',
        shamelaId: bookData.shamelaId,
        url: bookData.url || 'https://shamela.ws',
        volumes: bookData.volumes,
        pages: bookData.pages,
        notes: bookData.notes,
        tags: bookData.tags,
        isFavorite: bookData.isFavorite || false,
        createdAt: Date.now(),
      };
      setBooks((prev) => [newBook, ...prev]);

      if (user) {
        saveBookToCloud(user.uid, newBook).catch(console.error);
      }
      showNotification('نئی کتاب شیلف میں شامل کر دی گئی ہے');
    }
    setEditingBook(null);
  };

  const handleToggleFavorite = (id: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, isFavorite: !b.isFavorite };
          if (user) saveBookToCloud(user.uid, updated).catch(console.error);
          return updated;
        }
        return b;
      })
    );
  };

  const handleDeleteBook = async (id: string) => {
    if (confirm('کیا آپ واقعی اس کتاب کو لائبریری سے حذف کرنا چاہتے ہیں؟')) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
      if (readerBook?.id === id) {
        setReaderBook(null);
      }
      if (user) {
        deleteBookFromCloud(user.uid, id).catch(console.error);
      }
      showNotification('کتاب لائبریری سے حذف کر دی گئی ہے');
    }
  };

  const handleTrackOpen = (id: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, lastOpenedAt: Date.now() };
          if (user) saveBookToCloud(user.uid, updated).catch(console.error);
          return updated;
        }
        return b;
      })
    );
  };

  const handleBulkAddBooks = async (newBooks: ShamelaBook[]) => {
    setBooks((prev) => [...newBooks, ...prev]);
    if (user) {
      for (const b of newBooks) {
        saveBookToCloud(user.uid, b).catch(console.error);
      }
    }
    showNotification(`کتب (${newBooks.length}) کامیابی سے شامل کر دی گئیں`);
  };

  // Category Handlers
  const handleAddCategory = async (newCatData: Omit<BookCategory, 'id'>) => {
    const newCat: BookCategory = {
      ...newCatData,
      id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    setCategories((prev) => [...prev, newCat]);
    if (user) {
      saveCategoryToCloud(user.uid, newCat).catch(console.error);
    }
    showNotification('نیا زمرہ بنا دیا گیا ہے');
  };

  const handleUpdateCategory = async (updatedCat: BookCategory) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
    if (user) {
      saveCategoryToCloud(user.uid, updatedCat).catch(console.error);
    }
    showNotification('زمرہ میں ترمیم محفوظ کر دی گئی ہے');
  };

  const handleDeleteCategory = async (catId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    if (activeCategory === catId) {
      setActiveCategory('all');
    }
    if (user) {
      deleteCategoryFromCloud(user.uid, catId).catch(console.error);
    }
    showNotification('زمرہ حذف کر دیا گیا ہے');
  };

  // Sync all local to cloud
  const handleSyncAllToCloud = async () => {
    if (!user) return;
    await syncLocalToCloud(books, categories);
    showNotification('تمام کتب اور زمرہ جات کلاؤڈ پر محفوظ ہو چکے ہیں');
  };

  // Backup & Import
  const handleImport = (importedBooks: ShamelaBook[], importedCategories?: BookCategory[]) => {
    if (importedCategories && importedCategories.length > 0) {
      setCategories(importedCategories);
    }
    setBooks(importedBooks);
    showNotification('کتب کامیابی سے بحال کر لی گئیں');
  };

  const handleResetDefaults = () => {
    setCategories(DEFAULT_CATEGORIES);
    setBooks(DEFAULT_BOOKS);
    setActiveCategory('all');
    showNotification('لائبریری ڈیفالٹ حالت پر بحال کر دی گئی ہے');
  };

  const handleQuickLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdInput.trim()) return;
    const cleanUrl = buildShamelaUrl(quickIdInput);
    window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    setQuickIdInput('');
  };

  const handleOpenShamelaSearch = (queryParam?: string) => {
    setShamelaSearchInitialQuery(queryParam || searchQuery || '');
    setIsShamelaSearchOpen(true);
  };

  const handleOpenReaderPage = (bookId: number, pageId: number, title?: string) => {
    const existing = books.find((b) => b.shamelaId === String(bookId));
    if (existing) {
      setReaderBook(existing);
      setReaderInitialPageId(pageId);
    } else {
      const tempBook: ShamelaBook = {
        id: `temp-${bookId}`,
        titleAr: title || `كتاب #${bookId}`,
        titleUr: title || `شاملہ کتاب #${bookId}`,
        titleMm: title || `شاملہ کتاب #${bookId}`,
        shamelaId: String(bookId),
        url: `https://shamela.ws/book/${bookId}/${pageId}`,
        categoryId: categories[0]?.id || 'hadith',
        isFavorite: false,
        createdAt: Date.now(),
      };
      setReaderBook(tempBook);
      setReaderInitialPageId(pageId);
    }
  };

  const showNotification = (msg: string) => {
    setShelfNotification(msg);
    setTimeout(() => setShelfNotification(null), 3000);
  };

  const getCategoryById = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div 
      className="min-h-screen flex flex-col font-nastaleeq transition-colors duration-300"
      style={{
        backgroundColor: 'var(--color-bg-app)',
        color: 'var(--color-text-primary)',
      }}
      dir="rtl"
    >
      
      {/* Toast Notification */}
      {shelfNotification && (
        <div 
          className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-200"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-accent)',
            color: 'var(--color-text-primary)',
          }}
        >
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold leading-[1.8]">{shelfNotification}</span>
        </div>
      )}

      {/* Top Header with Firebase Cloud Sync */}
      <Header
        totalBooks={books.length}
        totalCategories={categories.length}
        favoriteCount={favoriteCount}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => {
          setTargetCategoryForAdd(activeCategory !== 'all' && activeCategory !== 'favorites' ? activeCategory : undefined);
          setEditingBook(null);
          setIsAddModalOpen(true);
        }}
        onOpenBulkModal={() => {
          setTargetCategoryForAdd(activeCategory !== 'all' && activeCategory !== 'favorites' ? activeCategory : undefined);
          setIsBulkModalOpen(true);
        }}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenShamelaSearch={handleOpenShamelaSearch}
        onSyncToCloud={handleSyncAllToCloud}
      />

      {/* Category Navigation & Shelf Switcher */}
      <CategoryNav
        categories={categories}
        activeCategoryId={activeCategory}
        onSelectCategory={setActiveCategory}
        categoryCounts={categoryCounts}
        totalCount={books.length}
        favoriteCount={favoriteCount}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onOpenAddCategory={() => setIsCategoryModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Banner with Live Shamela Search Spotlight */}
        <div 
          className="mb-6 p-4 sm:p-5 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-theme)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div 
              className="p-3 rounded-2xl text-white shadow-md shrink-0"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold leading-[1.8]">
                  مکتبہ شاملہ براہ راست سرچ انجن
                </h2>
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full font-bold border leading-[1.8]"
                  style={{
                    backgroundColor: 'var(--color-badge-bg)',
                    borderColor: 'var(--color-accent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  Direct Search
                </span>
                {user && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 leading-[1.8]">
                    کلاؤڈ سنک ({books.length} کتب)
                  </span>
                )}
              </div>
              <p className="text-xs opacity-75 leading-[1.8]">
                شاملہ کی ویب سائٹ پر جائے بغیر کتب، احادیث اور متون کے حوالہ جاتی صفحات براہ راست تلاش کریں
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenShamelaSearch(searchQuery)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95 leading-[1.8]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Globe2 className="w-4 h-4 ml-1" />
              <span>شاملہ میں تلاش کریں ↗</span>
            </button>

            <form onSubmit={handleQuickLookup} className="flex items-center gap-1.5">
              <input
                type="text"
                value={quickIdInput}
                onChange={(e) => setQuickIdInput(e.target.value)}
                placeholder="ID درج کریں (مثلاً 1680)"
                className="w-36 sm:w-44 px-3 py-1.5 rounded-xl border text-xs focus:outline-none focus:ring-1 font-mono text-center"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
              />
              <button
                type="submit"
                className="p-1.5 rounded-xl border opacity-80 hover:opacity-100 transition-all hover:scale-105"
                style={{ borderColor: 'var(--color-border-theme)' }}
                title="ID کے ذریعے براہ راست کھولیں"
              >
                <ArrowUpLeft className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Status / Filter Title */}
        <div 
          className="flex items-center justify-between mb-4 pb-2 border-b"
          style={{ borderColor: 'var(--color-border-theme)' }}
        >
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 ml-1" style={{ color: 'var(--color-accent)' }} />
            <h3 className="text-base sm:text-lg font-bold leading-[1.8]">
              {activeCategory === 'all' && 'تمام کتب کی فہرست (All Books)'}
              {activeCategory === 'favorites' && 'پسندیدہ کتب کی فہرست (Favorite Books)'}
              {activeCategory !== 'all' && activeCategory !== 'favorites' && (
                <span>
                  {getCategoryById(activeCategory)?.nameUr || getCategoryById(activeCategory)?.nameAr}{' '}
                  <span className="text-xs sm:text-sm font-normal opacity-75">
                    ({getCategoryById(activeCategory)?.nameAr})
                  </span>
                </span>
              )}
            </h3>
            <span className="text-xs opacity-70 mr-1 leading-[1.8]">
              ({filteredBooks.length} کتب)
            </span>
          </div>

          {searchQuery && (
            <div className="flex items-center gap-2">
              <span 
                className="text-xs px-2.5 py-1 rounded-xl border font-medium leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-badge-bg)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-accent)',
                }}
              >
                تلاش شدہ لفظ: "{searchQuery}"
              </span>
              <button
                onClick={() => handleOpenShamelaSearch(searchQuery)}
                className="text-xs underline font-semibold leading-[1.8]"
                style={{ color: 'var(--color-accent)' }}
              >
                شاملہ میں تلاش جاری رکھیں ↗
              </button>
            </div>
          )}
        </div>

        {/* View Mode 1: Table List */}
        {viewMode === 'compact' && filteredBooks.length > 0 && (
          <BookList
            books={filteredBooks}
            categories={categories}
            onOpenReader={(b) => setReaderBook(b)}
            onToggleFavorite={handleToggleFavorite}
            onEdit={(b) => {
              setEditingBook(b);
              setIsAddModalOpen(true);
            }}
            onDelete={handleDeleteBook}
            onTrackOpen={handleTrackOpen}
          />
        )}

        {/* View Mode 2: Shelf Grid (Standard) */}
        {viewMode === 'shelf' && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                category={getCategoryById(book.categoryId)}
                onOpenReader={(b) => setReaderBook(b)}
                onToggleFavorite={handleToggleFavorite}
                onEdit={(b) => {
                  setEditingBook(b);
                  setIsAddModalOpen(true);
                }}
                onDelete={handleDeleteBook}
                onTrackOpen={handleTrackOpen}
              />
            ))}
          </div>
        )}

        {/* View Mode 3: Grouped By Category Shelves */}
        {viewMode === 'by-category' && (
          <div className="space-y-10">
            {categories.map((cat) => {
              const catBooks = filteredBooks.filter((b) => b.categoryId === cat.id);
              if (catBooks.length === 0 && searchQuery) return null;

              return (
                <section 
                  key={cat.id} 
                  className="rounded-3xl border p-5 sm:p-6 shadow-sm space-y-4"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-theme)',
                  }}
                >
                  {/* Category Shelf Header */}
                  <div 
                    className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-2"
                    style={{ borderColor: 'var(--color-border-theme)' }}
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="p-1.5 rounded-xl border"
                          style={{
                            backgroundColor: 'var(--color-badge-bg)',
                            borderColor: 'var(--color-accent)',
                            color: 'var(--color-accent)',
                          }}
                        >
                          <Layers className="w-4 h-4" />
                        </span>
                        <h4 className="text-base sm:text-lg font-bold flex items-center gap-2 leading-[1.8]">
                          <span>{cat.nameUr || cat.nameAr}</span>
                          <span className="text-xs sm:text-sm font-normal opacity-75">
                            ({cat.nameAr})
                          </span>
                        </h4>
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-mono font-bold border"
                          style={{
                            backgroundColor: 'var(--color-bg-card-subtle)',
                            borderColor: 'var(--color-border-theme)',
                          }}
                        >
                          {catBooks.length} کتب
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs opacity-75 mt-1 pr-8 leading-[1.8]">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    {/* Quick Add into this section button */}
                    <button
                      onClick={() => {
                        setTargetCategoryForAdd(cat.id);
                        setEditingBook(null);
                        setIsAddModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border self-start sm:self-auto transition-colors hover:scale-102 leading-[1.8]"
                      style={{
                        backgroundColor: 'var(--color-badge-bg)',
                        borderColor: 'var(--color-accent)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 ml-1" />
                      <span>اس زمرے میں کتاب شامل کریں</span>
                    </button>
                  </div>

                  {/* Books inside shelf */}
                  {catBooks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {catBooks.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          category={cat}
                          onOpenReader={(b) => setReaderBook(b)}
                          onToggleFavorite={handleToggleFavorite}
                          onEdit={(b) => {
                            setEditingBook(b);
                            setIsAddModalOpen(true);
                          }}
                          onDelete={handleDeleteBook}
                          onTrackOpen={handleTrackOpen}
                        />
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="py-8 text-center rounded-2xl border border-dashed"
                      style={{ borderColor: 'var(--color-border-theme)' }}
                    >
                      <p className="text-xs opacity-70 leading-[1.8]">اس زمرے میں فی الحال کوئی کتاب موجود نہیں ہے</p>
                      <button
                        onClick={() => {
                          setTargetCategoryForAdd(cat.id);
                          setEditingBook(null);
                          setIsAddModalOpen(true);
                        }}
                        className="mt-2 text-xs font-semibold hover:underline inline-flex items-center gap-1 leading-[1.8]"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        <Plus className="w-3.5 h-3.5 ml-1" />
                        <span>کتاب کا لنک شامل کریں</span>
                      </button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div 
            className="text-center py-16 px-4 rounded-3xl border my-8"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-3xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2 leading-[1.8]">کوئی کتاب نہیں ملی</h3>
            <p className="text-xs sm:text-sm opacity-75 max-w-md mx-auto mb-6 leading-relaxed">
              {searchQuery
                ? `"${searchQuery}" کے مطابق لائبریری میں کوئی کتاب موجود نہیں ہے۔ مکتبہ شاملہ کے اصل ڈیٹا بیس میں تلاش کریں`
                : 'اس زمرے میں فی الحال کوئی کتاب نہیں ہے۔ آپ شاملہ کی کتب کے لنکس شامل کرنا شروع کر سکتے ہیں'}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {searchQuery && (
                <button
                  onClick={() => handleOpenShamelaSearch(searchQuery)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 leading-[1.8]"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  <Globe2 className="w-4 h-4 ml-1" />
                  <span>شاملہ میں براہ راست تلاش کریں ↗</span>
                </button>
              )}
              <button
                onClick={() => {
                  setTargetCategoryForAdd(activeCategory !== 'all' && activeCategory !== 'favorites' ? activeCategory : undefined);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 leading-[1.8]"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <Plus className="w-4 h-4 ml-1" />
                <span>کتاب کا نیا لنک شامل کریں</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer 
        className="mt-auto border-t py-6 text-xs transition-colors"
        style={{
          backgroundColor: 'var(--color-bg-card-subtle)',
          borderColor: 'var(--color-border-theme)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <BookMarked className="w-4 h-4 ml-1" style={{ color: 'var(--color-accent)' }} />
            <span className="leading-[1.8]">المكتبة الشاملة - ویب لائبریری (جامع کتب و مراجع)</span>
          </div>

          <div className="flex items-center gap-4 text-xs opacity-80 leading-[1.8]">
            <button
              onClick={() => handleOpenShamelaSearch()}
              className="font-semibold hover:opacity-100 flex items-center gap-1 transition-colors"
              style={{ color: 'var(--color-accent)' }}
            >
              <Globe2 className="w-3.5 h-3.5 ml-1" />
              <span>شاملہ تلاش</span>
            </button>
            <a 
              href="https://shamela.ws" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-100 flex items-center gap-1 transition-colors"
            >
              <span>shamela.ws</span>
              <ExternalLink className="w-3 h-3 mr-1" />
            </a>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="hover:opacity-100 transition-colors"
            >
              زمرہ جات کی تنظیم
            </button>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:opacity-100 transition-colors"
            >
              بیک اپ اور بحالی
            </button>
          </div>
        </div>
      </footer>

      {/* Shamela Live Search Modal */}
      <ShamelaSearchModal
        isOpen={isShamelaSearchOpen}
        onClose={() => setIsShamelaSearchOpen(false)}
        categories={categories}
        initialQuery={shamelaSearchInitialQuery}
        onAddBookToShelf={handleSaveBook}
        onOpenReaderPage={handleOpenReaderPage}
      />

      {/* Add / Edit Book Modal */}
      <BookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBook(null);
        }}
        onSave={handleSaveBook}
        bookToEdit={editingBook}
        categories={categories}
        defaultCategoryId={targetCategoryForAdd}
      />

      {/* Bulk Add Links Modal */}
      <BulkAddModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onAddBooks={handleBulkAddBooks}
        categories={categories}
        defaultCategoryId={targetCategoryForAdd}
      />

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        categoryCounts={categoryCounts}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      {/* Reader Modal */}
      <ReaderModal
        isOpen={!!readerBook}
        onClose={() => {
          setReaderBook(null);
          setReaderInitialPageId(undefined);
        }}
        book={readerBook}
        initialPageId={readerInitialPageId}
        category={readerBook ? getCategoryById(readerBook.categoryId) : undefined}
        onToggleFavorite={handleToggleFavorite}
        onTrackOpen={handleTrackOpen}
      />

      {/* Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        books={books}
        categories={categories}
        onImport={handleImport}
        onResetDefaults={handleResetDefaults}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LibraryApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
