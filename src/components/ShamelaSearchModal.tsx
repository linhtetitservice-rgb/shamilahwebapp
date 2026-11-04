import React, { useState } from 'react';
import { 
  ShamelaSearchResponse, 
  ShamelaSourceItem, 
  ShamelaBookHit,
  BookCategory,
  ShamelaBook
} from '../types';
import { 
  Search, 
  X, 
  BookOpen, 
  ExternalLink, 
  Plus, 
  Check, 
  Copy, 
  Loader2, 
  Sparkles, 
  FileText,
  BookCheck
} from 'lucide-react';

interface ShamelaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BookCategory[];
  onAddBookToShelf: (book: Partial<ShamelaBook>) => void;
  onOpenReaderPage: (bookId: number, pageId: number, title?: string) => void;
  initialQuery?: string;
}

const QUICK_SEARCH_TOPICS = [
  { label: 'إنما الأعمال بالنيات', category: 'hadith', desc: 'نیتوں کے متعلق مشہور حدیث' },
  { label: 'صحيح البخاري', category: 'hadith', desc: 'صحیح بخاری شریف' },
  { label: 'تفسير ابن كثير', category: 'tafsir', desc: 'تفسیر ابن کثیر' },
  { label: 'فضل الصلاة', category: 'fiqh', desc: 'نماز کی فضیلت و مسائل' },
  { label: 'صفة الوضوء', category: 'fiqh', desc: 'مسنون طریقہ وضو' },
  { label: 'العقيدة الواسطية', category: 'aqeedah', desc: 'عقیدہ واسطیہ' },
  { label: 'رياض الصالحين', category: 'adab', desc: 'ریاض الصالحین' },
  { label: 'الرحيق المختوم', category: 'seerah', desc: 'سیرت النبی ﷺ' },
];

export const ShamelaSearchModal: React.FC<ShamelaSearchModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddBookToShelf,
  onOpenReaderPage,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [searchData, setSearchData] = useState<ShamelaSearchResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'sources' | 'books'>('sources');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Feedback states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedBooks, setAddedBooks] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleSearch = async (searchTerm?: string) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/shamela/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          category_id: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Search failed: HTTP ${res.status}`);
      }

      const data: ShamelaSearchResponse = await res.json();
      setSearchData(data);
      if (data.sources.length === 0 && data.books.length > 0) {
        setActiveTab('books');
      } else {
        setActiveTab('sources');
      }
    } catch (err: any) {
      console.error('Shamela search failed', err);
      setErrorMessage(err.message || 'تلاش کے دوران دشواری پیش آئی ہے، براہ کرم دوبارہ کوشش کریں');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTopicClick = (topicText: string) => {
    setQuery(topicText);
    handleSearch(topicText);
  };

  const handleCopyQuote = (key: string, quote: string, citation: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `"${quote}"\n\n— المصدر: ${citation}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSourceToShelf = (item: ShamelaSourceItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `${item.bookId}-${item.pageId}`;
    
    let targetCatId = categories[0]?.id || 'hadith';
    if (selectedCategoryId !== 'all') {
      targetCatId = selectedCategoryId;
    }

    onAddBookToShelf({
      titleAr: item.bookTitle || `كتاب #${item.bookId}`,
      titleUr: item.bookTitle || `شاملہ کتاب #${item.bookId}`,
      titleMm: item.bookTitle || `شاملہ کتاب #${item.bookId}`,
      shamelaId: String(item.bookId),
      url: item.shamelaUrl,
      categoryId: targetCatId,
      notes: `حوالہ صفحہ: ${item.cleanCitation}\nابتدائی عبارت: "${item.text.slice(0, 100)}..."`,
      isFavorite: false,
    });

    setAddedBooks((prev) => ({ ...prev, [key]: true }));
  };

  const handleAddBookHitToShelf = (book: ShamelaBookHit, e: React.MouseEvent) => {
    e.stopPropagation();
    const key = `book-${book.bookId}`;

    let targetCatId = categories[0]?.id || 'hadith';
    if (selectedCategoryId !== 'all') {
      targetCatId = selectedCategoryId;
    }

    onAddBookToShelf({
      titleAr: book.title,
      titleUr: book.title,
      titleMm: book.title,
      authorAr: book.author,
      authorUr: book.author,
      shamelaId: String(book.bookId),
      url: book.shamelaUrl,
      categoryId: targetCatId,
      notes: `شاملہ تلاش سے شامل شدہ (صفحہ ${book.pageId} اور دیگر ${book.otherPages.length} مقامات پر)`,
      isFavorite: false,
    });

    setAddedBooks((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden font-nastaleeq" dir="rtl">
      <div 
        className="relative w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-theme)',
          color: 'var(--color-text-primary)',
        }}
      >
        
        {/* Header Bar */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{
            backgroundColor: 'var(--color-bg-header)',
            borderColor: 'var(--color-border-theme)',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="p-2.5 rounded-2xl shadow-sm text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold leading-[1.8]">
                  مکتبہ شاملہ براہ راست سرچ انجن
                </h2>
                <span 
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold border leading-[1.8]"
                  style={{
                    backgroundColor: 'var(--color-accent-subtle)',
                    borderColor: 'var(--color-accent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  Live Shamela Search
                </span>
              </div>
              <p className="text-xs opacity-75 leading-[1.8]">
                شاملہ کی ویب سائٹ پر جائے بغیر کتب، احادیث اور صفحات براہ راست تلاش کریں
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Controls Row */}
        <div className="p-4 sm:p-6 pb-2 space-y-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row items-center gap-2.5"
          >
            <div className="relative flex-1 w-full">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="عربی یا اردو میں حدیث، آیت، کتاب یا مصنف کا نام درج کریں..."
                className="w-full pr-10 pl-10 py-3 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 border transition-all shadow-inner leading-[1.9]"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 leading-[1.8]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-1" />
                  <span>تلاش جاری ہے...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 ml-1" />
                  <span>شاملہ میں تلاش کریں</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestion Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[11px] opacity-75 shrink-0 ml-1 flex items-center gap-1 leading-[1.8]">
              <Sparkles className="w-3 h-3 ml-0.5" />
              اہم موضوعات:
            </span>
            {QUICK_SEARCH_TOPICS.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickTopicClick(topic.label)}
                className="px-2.5 py-1 rounded-xl border text-[11px] whitespace-nowrap transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--color-bg-card-subtle)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
                title={topic.desc}
              >
                <span className="text-sm font-medium leading-[1.8]">{topic.label}</span>
              </button>
            ))}
          </div>

          {/* Result Tabs & Stats */}
          {searchData && (
            <div 
              className="flex items-center justify-between pt-2 border-t text-xs"
              style={{ borderColor: 'var(--color-border-theme)' }}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('sources')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                    activeTab === 'sources'
                      ? 'text-white shadow-sm font-bold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'sources' ? 'var(--color-accent)' : 'transparent',
                  }}
                >
                  <FileText className="w-3.5 h-3.5 ml-1" />
                  <span className="leading-[1.8]">حوالہ جاتی نصوص و صفحات ({searchData.totalSources})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('books')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                    activeTab === 'books'
                      ? 'text-white shadow-sm font-bold'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: activeTab === 'books' ? 'var(--color-accent)' : 'transparent',
                  }}
                >
                  <BookOpen className="w-3.5 h-3.5 ml-1" />
                  <span className="leading-[1.8]">دستیاب کتب ({searchData.totalBooks})</span>
                </button>
              </div>

              <span className="text-[11px] opacity-75 hidden sm:inline leading-[1.8]">
                تلاش شدہ الفاظ: <code className="px-1.5 py-0.5 rounded border text-xs">{searchData.keywords.join('، ')}</code>
              </span>
            </div>
          )}
        </div>

        {/* Results Scroll Area */}
        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 space-y-4"
          style={{ backgroundColor: 'var(--color-bg-app)' }}
        >
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800 text-red-200 text-xs leading-[1.8]">
              {errorMessage}
            </div>
          )}

          {/* Initial State / No Search Yet */}
          {!searchData && !isLoading && (
            <div className="text-center py-16 px-4">
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-3xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-2 leading-[1.8]">مکتبہ شاملہ میں براہ راست تلاش کریں</h3>
              <p className="text-xs sm:text-sm opacity-70 max-w-lg mx-auto leading-relaxed">
                اوپر دیے گئے سرچ بار میں کوئی بھی حدیث، آیت، لفظ یا کتاب کا نام درج کریں، شاملہ کے اصل ڈیٹا بیس سے متعلقہ عبارات اور مکمل حوالہ جات فوری دستیاب ہوں گے
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-20 text-center space-y-3">
              <Loader2 
                className="w-10 h-10 animate-spin mx-auto" 
                style={{ color: 'var(--color-accent)' }}
              />
              <p className="text-sm font-medium leading-[1.8]">
                مکتبہ شاملہ کے ڈیٹا بیس میں کتب اور صفحات کی تلاش جاری ہے...
              </p>
              <p className="text-xs opacity-60 leading-[1.8]">
                جاري البحث في كتب المكتبة الشاملة...
              </p>
            </div>
          )}

          {/* Tab 1: Exact Sources & Pages */}
          {searchData && activeTab === 'sources' && (
            <div className="space-y-3">
              {searchData.sources.length === 0 ? (
                <div className="py-12 text-center opacity-70 text-xs leading-[1.8]">
                  کوئی عبارت نہیں ملی۔ براہ کرم "دستیاب کتب" والے ٹیب میں دیکھیں۔
                </div>
              ) : (
                searchData.sources.map((item, idx) => {
                  const key = `${item.bookId}-${item.pageId}`;
                  const isAdded = addedBooks[key];
                  const isCopied = copiedId === key;

                  return (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border-theme)',
                      }}
                    >
                      {/* Top Bar: Book Title & Exact Citation */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span 
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-bold text-white leading-[1.8]"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                          >
                            <BookOpen className="w-3.5 h-3.5 ml-1" />
                            <span className="font-amiri arabic-title font-bold" lang="ar">{item.bookTitle}</span>
                          </span>

                          <span 
                            className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold leading-[1.8]"
                            style={{
                              backgroundColor: 'var(--color-badge-bg)',
                              color: 'var(--color-accent)',
                            }}
                          >
                            📍 {item.cleanCitation}
                          </span>
                        </div>

                        {/* Direct Jump Buttons */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          {/* In-app Read Page */}
                          <button
                            onClick={() => onOpenReaderPage(item.bookId, item.pageId, item.bookTitle)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-102"
                            style={{
                              backgroundColor: 'var(--color-bg-card-subtle)',
                              borderColor: 'var(--color-border-theme)',
                              color: 'var(--color-text-primary)',
                            }}
                            title="صفحہ کا براہ راست مطالعہ کریں"
                          >
                            <BookCheck className="w-3.5 h-3.5 ml-1" style={{ color: 'var(--color-accent)' }} />
                            <span className="leading-[1.8]">صفحہ پڑھیں</span>
                          </button>

                          {/* Open in Shamela */}
                          <a
                            href={item.shamelaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-102"
                            style={{ backgroundColor: 'var(--color-accent)' }}
                            title="شاملہ ویب سائٹ پر اصل صفحہ کھولیں"
                          >
                            <span className="leading-[1.8]">شاملہ ویب ↗</span>
                            <ExternalLink className="w-3 h-3 mr-0.5" />
                          </a>

                          {/* Add to Shelf Button */}
                          <button
                            onClick={(e) => handleAddSourceToShelf(item, e)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'border hover:scale-102'
                            }`}
                            style={!isAdded ? {
                              backgroundColor: 'var(--color-bg-card-subtle)',
                              borderColor: 'var(--color-border-theme)',
                              color: 'var(--color-text-primary)',
                            } : undefined}
                            title="لائبریری شیلف میں شامل کریں"
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 ml-1" />
                                <span className="leading-[1.8]">شامل ہو چکی</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 ml-1" style={{ color: 'var(--color-accent)' }} />
                                <span className="leading-[1.8]">شیلف میں شامل کریں</span>
                              </>
                            )}
                          </button>

                          {/* Copy Quote Button */}
                          <button
                            onClick={(e) => handleCopyQuote(key, item.text, item.cleanCitation, e)}
                            className="p-1.5 rounded-xl border transition-colors opacity-70 hover:opacity-100"
                            style={{ borderColor: 'var(--color-border-theme)' }}
                            title={isCopied ? 'کاپی ہو چکا ہے' : 'عبارت اور حوالہ کاپی کریں'}
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Text Quote Snippet in Classical Amiri Arabic Font */}
                      <div 
                        className="font-amiri p-4 sm:p-5 rounded-2xl border text-right text-2xl sm:text-3xl font-bold leading-[2.1] selection:bg-amber-500/30 whitespace-pre-wrap arabic-prominent"
                        style={{
                          backgroundColor: 'var(--color-bg-app)',
                          borderColor: 'var(--color-border-theme)',
                          color: 'var(--color-text-primary)',
                        }}
                        lang="ar"
                      >
                        {item.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Matched Books List */}
          {searchData && activeTab === 'books' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {searchData.books.map((b, idx) => {
                const key = `book-${b.bookId}`;
                const isAdded = addedBooks[key];

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border flex flex-col justify-between shadow-sm transition-all"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border-theme)',
                    }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                          style={{
                            backgroundColor: 'var(--color-badge-bg)',
                            color: 'var(--color-accent)',
                          }}
                        >
                          شاملہ #{b.bookId}
                        </span>
                        {b.otherPages && b.otherPages.length > 0 && (
                          <span className="text-[10px] opacity-75 leading-[1.8]">
                            + {b.otherPages.length} دیگر صفحات
                          </span>
                        )}
                      </div>

                      <h4 className="font-amiri arabic-title text-xl sm:text-2xl font-bold mb-1 text-right leading-[1.8]" lang="ar">
                        {b.title}
                      </h4>
                      {b.author && (
                        <p className="font-amiri arabic-author text-sm sm:text-base opacity-85 text-right mb-3 leading-[1.8]" lang="ar">
                          المؤلف: {b.author}
                        </p>
                      )}
                    </div>

                    <div 
                      className="pt-3 border-t flex items-center justify-between gap-2 mt-2"
                      style={{ borderColor: 'var(--color-border-theme)' }}
                    >
                      <button
                        onClick={() => onOpenReaderPage(b.bookId, b.pageId, b.title)}
                        className="inline-flex items-center gap-1 text-xs font-semibold hover:underline leading-[1.8]"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        <span>صفحہ {b.pageId} پڑھیں ↗</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={b.shamelaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border opacity-80 hover:opacity-100"
                          style={{ borderColor: 'var(--color-border-theme)' }}
                          title="ویب سائٹ پر کھولیں"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={(e) => handleAddBookHitToShelf(b, e)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold ${
                            isAdded
                              ? 'bg-emerald-600 text-white'
                              : 'text-white shadow-sm'
                          }`}
                          style={!isAdded ? { backgroundColor: 'var(--color-accent)' } : undefined}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5 ml-1" />
                              <span className="leading-[1.8]">شامل ہے</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5 ml-1" />
                              <span className="leading-[1.8]">شیلف میں شامل کریں</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
