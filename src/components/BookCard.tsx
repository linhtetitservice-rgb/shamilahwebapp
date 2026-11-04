import React, { useState } from 'react';
import { ShamelaBook, BookCategory } from '../types';
import { 
  ExternalLink, 
  Star, 
  Copy, 
  Check, 
  BookOpen, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Tag, 
  Layers
} from 'lucide-react';

interface BookCardProps {
  book: ShamelaBook;
  category?: BookCategory;
  onOpenReader: (book: ShamelaBook) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (book: ShamelaBook) => void;
  onDelete: (id: string) => void;
  onTrackOpen: (id: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  category,
  onOpenReader,
  onToggleFavorite,
  onEdit,
  onDelete,
  onTrackOpen,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(book.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDirectOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTrackOpen(book.id);
    window.open(book.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="group relative flex flex-col justify-between rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden font-nastaleeq"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-theme)',
        color: 'var(--color-text-primary)',
      }}
      dir="rtl"
    >
      
      {/* Top Banner & Badges */}
      <div className="p-4 sm:p-5 pb-3">
        {/* Header row with Category, Shamela ID & Star */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {category && (
              <span 
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-badge-bg)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-accent)',
                }}
              >
                <Layers className="w-3 h-3" />
                <span className="truncate max-w-[130px]">{category.nameUr || category.nameAr}</span>
              </span>
            )}
            {book.shamelaId && (
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold border"
                style={{
                  backgroundColor: 'var(--color-bg-card-subtle)',
                  borderColor: 'var(--color-border-theme)',
                }}
              >
                شاملہ #{book.shamelaId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(book.id);
              }}
              className="p-1.5 rounded-xl transition-all hover:scale-110"
              title={book.isFavorite ? 'پسندیدہ سے ہٹائیں' : 'پسندیدہ کتب میں شامل کریں'}
            >
              <Star 
                className={`w-4 h-4 ${
                  book.isFavorite 
                    ? 'text-amber-400 fill-amber-400' 
                    : 'opacity-40 hover:opacity-100'
                }`} 
              />
            </button>

            {/* Menu Trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 rounded-xl border transition-colors opacity-70 hover:opacity-100"
                style={{
                  backgroundColor: 'var(--color-bg-card-subtle)',
                  borderColor: 'var(--color-border-theme)',
                }}
                title="مزید اختیارات"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div 
                    className="absolute left-0 top-full mt-1 w-44 rounded-2xl border shadow-2xl py-1 z-30 text-xs"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border-theme)',
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(book);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-right transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                      <span className="leading-[1.8]">کوائف میں ترمیم کریں</span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-black/5 dark:hover:bg-white/5 text-right transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="leading-[1.8]">ویب لنک کاپی کریں</span>
                    </button>
                    <hr className="border-t my-1 opacity-20" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(book.id);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-red-500/10 text-right text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="leading-[1.8]">کتاب حذف کریں</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Book Title with Jameel Noori Nastaleeq */}
        <div 
          onClick={() => onOpenReader(book)} 
          className="cursor-pointer group/title"
        >
          <h3 
            className="text-xl sm:text-2xl font-bold text-right mb-1 line-clamp-2 leading-[2] transition-colors"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {book.titleAr}
          </h3>

          {/* Urdu Subtitle / Title translation */}
          {(book.titleUr || book.titleMm) && (
            <h4 className="text-xs sm:text-sm font-medium leading-[1.8] line-clamp-1 mb-2 opacity-85">
              {book.titleUr || book.titleMm}
            </h4>
          )}
        </div>

        {/* Author information */}
        <div className="space-y-1 mb-3 text-xs opacity-80 leading-[1.8]">
          {book.authorAr && (
            <p className="text-right text-sm line-clamp-1">
              {book.authorAr}
            </p>
          )}
          {(book.authorUr || book.authorMm) && (
            <p className="text-xs line-clamp-1 flex items-center gap-1">
              <span style={{ color: 'var(--color-accent)' }}>مصنف:</span>
              <span>{book.authorUr || book.authorMm}</span>
            </p>
          )}
        </div>

        {/* Volumes / Pages */}
        {(book.volumes || book.pages) && (
          <div className="flex items-center gap-2 text-[11px] mb-3">
            {book.volumes && (
              <span 
                className="px-2 py-0.5 rounded-lg border font-medium leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-card-subtle)',
                  borderColor: 'var(--color-border-theme)',
                }}
              >
                {book.volumes}
              </span>
            )}
            {book.pages && (
              <span 
                className="px-2 py-0.5 rounded-lg border font-medium leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-card-subtle)',
                  borderColor: 'var(--color-border-theme)',
                }}
              >
                {book.pages}
              </span>
            )}
          </div>
        )}

        {/* Notes */}
        {book.notes && (
          <p 
            className="text-xs line-clamp-2 italic mb-3 p-2.5 rounded-xl border opacity-80 leading-[1.9]"
            style={{
              backgroundColor: 'var(--color-bg-app)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            "{book.notes}"
          </p>
        )}

        {/* Tags */}
        {book.tags && book.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {book.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] border opacity-80 leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-card-subtle)',
                  borderColor: 'var(--color-border-theme)',
                }}
              >
                <Tag className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Actions Footer - DIRECT ACCESS */}
      <div 
        className="p-3 border-t flex items-center justify-between gap-2 mt-auto"
        style={{
          backgroundColor: 'var(--color-bg-card-subtle)',
          borderColor: 'var(--color-border-theme)',
        }}
      >
        {/* Quick In-App Preview Button */}
        <button
          onClick={() => onOpenReader(book)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-102"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-theme)',
          }}
          title="آن لائن مطالعہ کریں"
        >
          <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
          <span className="leading-[1.8]">مطالعہ</span>
        </button>

        {/* Primary Direct Go to Shamela Button */}
        <button
          onClick={handleDirectOpen}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-102 active:scale-98"
          style={{ backgroundColor: 'var(--color-accent)' }}
          title="مکتبہ شاملہ کی ویب سائٹ پر براہ راست کھولیں"
        >
          <span className="leading-[1.8]">شاملہ ویب ↗</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-xl border transition-colors opacity-80 hover:opacity-100"
          style={{
            backgroundColor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border-theme)',
          }}
          title={copied ? 'لنک کاپی ہو گیا!' : 'لنک کاپی کریں'}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );
};
