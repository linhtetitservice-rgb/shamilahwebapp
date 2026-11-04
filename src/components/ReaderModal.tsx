import React, { useState, useEffect } from 'react';
import { ShamelaBook, BookCategory, ShamelaPageContent } from '../types';
import { 
  X, 
  ExternalLink, 
  BookOpen, 
  Copy, 
  Check, 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  FileText,
  Globe
} from 'lucide-react';

interface ReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: ShamelaBook | null;
  category?: BookCategory;
  initialPageId?: number;
  onToggleFavorite: (id: string) => void;
  onTrackOpen: (id: string) => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  isOpen,
  onClose,
  book,
  category,
  initialPageId,
  onToggleFavorite,
  onTrackOpen,
}) => {
  const [copied, setCopied] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<number | null>(initialPageId || null);
  const [jumpInput, setJumpInput] = useState('');
  const [viewMode, setViewMode] = useState<'text' | 'web'>('text');
  
  // Loaded content state
  const [pageContent, setPageContent] = useState<ShamelaPageContent | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPageId) {
      setCurrentPageId(initialPageId);
    } else {
      setCurrentPageId(null);
    }
  }, [initialPageId, isOpen]);

  // Fetch page text whenever currentPageId changes and book has shamelaId
  useEffect(() => {
    if (!isOpen || !book || !book.shamelaId) {
      setPageContent(null);
      return;
    }

    const fetchPage = async () => {
      const pageToFetch = currentPageId || 1;
      setIsLoadingPage(true);
      setLoadError(null);

      try {
        const res = await fetch('/api/shamela/page', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: Number(book.shamelaId),
            page_id: pageToFetch,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to load page: HTTP ${res.status}`);
        }

        const data: ShamelaPageContent = await res.json();
        setPageContent(data);
      } catch (err: any) {
        console.error('Error fetching page content:', err);
        setLoadError(err.message || 'صفحہ لوڈ کرنے میں دشواری پیش آئی ہے');
      } finally {
        setIsLoadingPage(false);
      }
    };

    fetchPage();
  }, [book, currentPageId, isOpen]);

  if (!isOpen || !book) return null;

  const handleCopy = () => {
    const textToCopy = pageContent ? `${pageContent.text}\n\n— ${pageContent.citation}` : book.url;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectOpen = () => {
    onTrackOpen(book.id);
    const targetUrl = pageContent?.shamelaUrl || (currentPageId ? `https://shamela.ws/book/${book.shamelaId}/${currentPageId}` : book.url);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput.trim(), 10);
    if (!isNaN(num) && num > 0) {
      setCurrentPageId(num);
      setJumpInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden font-nastaleeq" dir="rtl">
      <div 
        className="relative w-full max-w-5xl h-[94vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-theme)',
          color: 'var(--color-text-primary)',
        }}
      >
        
        {/* Modal Top Bar */}
        <div 
          className="px-5 py-3.5 border-b flex items-center justify-between gap-3 shrink-0"
          style={{
            backgroundColor: 'var(--color-bg-header)',
            borderColor: 'var(--color-border-theme)',
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div 
              className="p-2.5 rounded-2xl text-white shrink-0 shadow-sm"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h2 className="font-amiri text-2xl sm:text-3xl font-bold truncate leading-normal" lang="ar">
                  {book.titleAr}
                </h2>
                {book.shamelaId && (
                  <span 
                    className="hidden sm:inline-block px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold"
                    style={{
                      backgroundColor: 'var(--color-badge-bg)',
                      color: 'var(--color-accent)',
                    }}
                  >
                    ID #{book.shamelaId}
                  </span>
                )}
              </div>
              <p className="font-nastaleeq text-sm opacity-90 truncate leading-[1.8] mt-0.5">
                {book.titleUr || book.titleMm} {book.authorUr ? `• (${book.authorUr})` : ''}
              </p>
            </div>
          </div>

          {/* Action buttons in header */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher (Text vs Web) */}
            <div 
              className="hidden sm:flex items-center p-1 rounded-xl border text-xs"
              style={{
                backgroundColor: 'var(--color-bg-app)',
                borderColor: 'var(--color-border-theme)',
              }}
            >
              <button
                onClick={() => setViewMode('text')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  viewMode === 'text' ? 'text-white shadow-sm font-bold' : 'opacity-70'
                }`}
                style={{
                  backgroundColor: viewMode === 'text' ? 'var(--color-accent)' : 'transparent',
                }}
              >
                <FileText className="w-3.5 h-3.5 ml-1" />
                <span className="leading-[1.8]">متن (Text)</span>
              </button>
              <button
                onClick={() => setViewMode('web')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  viewMode === 'web' ? 'text-white shadow-sm font-bold' : 'opacity-70'
                }`}
                style={{
                  backgroundColor: viewMode === 'web' ? 'var(--color-accent)' : 'transparent',
                }}
              >
                <Globe className="w-3.5 h-3.5 ml-1" />
                <span className="leading-[1.8]">ویب سائٹ (Web)</span>
              </button>
            </div>

            {/* Star Favorite */}
            <button
              onClick={() => onToggleFavorite(book.id)}
              className="p-2 rounded-xl border transition-colors hover:scale-105"
              style={{
                backgroundColor: 'var(--color-bg-card-subtle)',
                borderColor: 'var(--color-border-theme)',
              }}
              title="پسندیدہ فہرست"
            >
              <Star 
                className={`w-4 h-4 ${book.isFavorite ? 'text-amber-400 fill-amber-400' : 'opacity-60'}`} 
              />
            </button>

            {/* Direct Open Button */}
            <button
              onClick={handleDirectOpen}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:scale-102 active:scale-98"
              style={{ backgroundColor: 'var(--color-accent)' }}
              title="مکتبہ شاملہ کی ویب سائٹ پر براہ راست کھولیں"
            >
              <span className="leading-[1.8]">شاملہ ویب پر مطالعہ</span>
              <ExternalLink className="w-4 h-4 mr-0.5" />
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl border transition-colors opacity-80 hover:opacity-100"
              style={{
                backgroundColor: 'var(--color-bg-card-subtle)',
                borderColor: 'var(--color-border-theme)',
              }}
              title="متن یا لنک کاپی کریں"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Navigation & Jump Bar */}
        <div 
          className="px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0"
          style={{
            backgroundColor: 'var(--color-bg-card-subtle)',
            borderColor: 'var(--color-border-theme)',
          }}
        >
          {/* Previous / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              disabled={!pageContent?.navigation.previousPageId || isLoadingPage}
              onClick={() => {
                if (pageContent?.navigation.previousPageId) {
                  setCurrentPageId(pageContent.navigation.previousPageId);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all hover:scale-102"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-theme)',
              }}
            >
              <ChevronRight className="w-4 h-4" />
              <span className="leading-[1.8]">پچھلا صفحہ</span>
            </button>

            {pageContent && (
              <span 
                className="px-3 py-1 rounded-xl font-bold text-sm leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-badge-bg)',
                  color: 'var(--color-accent)',
                }}
              >
                {pageContent.citation}
              </span>
            )}

            <button
              disabled={!pageContent?.navigation.nextPageId || isLoadingPage}
              onClick={() => {
                if (pageContent?.navigation.nextPageId) {
                  setCurrentPageId(pageContent.navigation.nextPageId);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-all hover:scale-102"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-theme)',
              }}
            >
              <span className="leading-[1.8]">اگلا صفحہ</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Page Jump form */}
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-2">
            <span className="opacity-75 hidden sm:inline leading-[1.8]">صفحہ نمبر:</span>
            <input
              type="number"
              min="1"
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder="صفحہ #"
              className="w-24 px-2.5 py-1 rounded-xl border text-xs focus:outline-none focus:ring-1 font-mono text-center"
              style={{
                backgroundColor: 'var(--color-bg-app)',
                borderColor: 'var(--color-border-theme)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              type="submit"
              className="px-3 py-1 rounded-xl text-white font-medium text-xs shadow-sm leading-[1.8]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              جائیں ↗
            </button>
          </form>
        </div>

        {/* Reader Display Area */}
        <div 
          className="relative flex-1 overflow-hidden flex flex-col"
          style={{ backgroundColor: 'var(--color-bg-app)' }}
        >
          {viewMode === 'text' ? (
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 max-w-4xl mx-auto w-full">
              {isLoadingPage ? (
                <div className="py-24 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--color-accent)' }} />
                  <p className="text-sm font-medium leading-[1.8]">صفحہ کا متن حاصل کیا جا رہا ہے...</p>
                </div>
              ) : pageContent ? (
                <div className="space-y-6">
                  {/* Classical Arabic Text in Amiri Typography - BOLD & PROMINENT */}
                  <div 
                    className="font-amiri text-2xl sm:text-3xl lg:text-4xl leading-[2.2] sm:leading-[2.5] text-right font-bold tracking-normal selection:bg-amber-400/30 whitespace-pre-wrap arabic-prominent"
                    style={{ color: 'var(--color-text-primary)' }}
                    lang="ar"
                  >
                    {pageContent.text}
                  </div>

                  {/* Footnote Citation */}
                  <div 
                    className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs opacity-75"
                    style={{ borderColor: 'var(--color-border-theme)' }}
                  >
                    <span className="leading-[1.8]">حوالہ: {pageContent.citation}</span>
                    <button
                      onClick={handleDirectOpen}
                      className="font-semibold underline hover:opacity-100 leading-[1.8]"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      مکتبہ شاملہ کے اصل صفحے پر جائیں ↗
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-3">
                  <p className="text-sm opacity-70 leading-[1.8]">
                    {loadError || 'صفحہ کا متن دیکھنے کے لیے اوپر دیا گیا صفحہ نمبر درج کریں یا "ویب سائٹ" موڈ استعمال کریں'}
                  </p>
                  <button
                    onClick={handleDirectOpen}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md leading-[1.8]"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    <span>شاملہ ویب پر کھولیں</span>
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Web View Mode */
            <div className="relative flex-1 w-full h-full">
              <iframe
                src={pageContent?.shamelaUrl || (currentPageId ? `https://shamela.ws/book/${book.shamelaId}/${currentPageId}` : book.url)}
                title={book.titleAr}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
              <div 
                className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-lg w-full mx-4 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 z-10"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border-theme)',
                }}
              >
                <p className="text-xs font-semibold leading-[1.8]">
                  کیا آپ شاملہ کی اصل ویب سائٹ پر مکمل کتاب پڑھنا چاہتے ہیں؟
                </p>
                <button
                  onClick={handleDirectOpen}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow leading-[1.8]"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  براہ راست کھولیں ↗
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
