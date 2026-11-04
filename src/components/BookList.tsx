import React, { useState } from 'react';
import { ShamelaBook, BookCategory } from '../types';
import { 
  ExternalLink, 
  Star, 
  Copy, 
  Check, 
  Edit3, 
  Trash2,
  Layers
} from 'lucide-react';

interface BookListProps {
  books: ShamelaBook[];
  categories: BookCategory[];
  onOpenReader: (book: ShamelaBook) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (book: ShamelaBook) => void;
  onDelete: (id: string) => void;
  onTrackOpen: (id: string) => void;
}

export const BookList: React.FC<BookListProps> = ({
  books,
  categories,
  onOpenReader,
  onToggleFavorite,
  onEdit,
  onDelete,
  onTrackOpen,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getCategory = (catId: string) => {
    return categories.find((c) => c.id === catId);
  };

  const handleCopy = (id: string, url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDirectOpen = (book: ShamelaBook, e: React.MouseEvent) => {
    e.stopPropagation();
    onTrackOpen(book.id);
    window.open(book.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="overflow-x-auto rounded-3xl border shadow-xl font-nastaleeq"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-theme)',
      }}
      dir="rtl"
    >
      <table className="w-full text-right border-collapse text-xs sm:text-sm">
        <thead>
          <tr 
            className="border-b font-medium opacity-80"
            style={{
              backgroundColor: 'var(--color-bg-card-subtle)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            <th className="py-3 px-4 w-10 text-center">★</th>
            <th className="py-3 px-4">کتاب کا نام (عربی / اردو)</th>
            <th className="py-3 px-4">مصنف (Author)</th>
            <th className="py-3 px-4">زمرہ (Category)</th>
            <th className="py-3 px-4">شاملہ ID</th>
            <th className="py-3 px-4 text-left">اقدامات</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--color-border-theme)' }}>
          {books.map((book) => {
            const cat = getCategory(book.categoryId);
            const isCopied = copiedId === book.id;

            return (
              <tr 
                key={book.id}
                onClick={() => onOpenReader(book)}
                className="hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors group"
              >
                {/* Star Favorite */}
                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onToggleFavorite(book.id)}
                    className="p-1 rounded transition-colors"
                    title={book.isFavorite ? 'پسندیدہ سے ہٹائیں' : 'پسندیدہ میں شامل کریں'}
                  >
                    <Star 
                      className={`w-4 h-4 ${book.isFavorite ? 'text-amber-400 fill-amber-400' : 'opacity-40 hover:opacity-100'}`} 
                    />
                  </button>
                </td>

                {/* Title in Jameel Noori Nastaleeq */}
                <td className="py-3 px-4">
                  <div className="text-lg sm:text-xl font-bold leading-[1.9]">
                    {book.titleAr}
                  </div>
                  {(book.titleUr || book.titleMm) && (
                    <div className="text-xs sm:text-sm font-medium opacity-85 leading-[1.8]">
                      {book.titleUr || book.titleMm}
                    </div>
                  )}
                </td>

                {/* Author */}
                <td className="py-3 px-4 opacity-80 leading-[1.8]">
                  <div className="text-sm font-medium">
                    {book.authorAr || '-'}
                  </div>
                  {(book.authorUr || book.authorMm) && (
                    <div className="text-xs opacity-80">
                      {book.authorUr || book.authorMm}
                    </div>
                  )}
                </td>

                {/* Category */}
                <td className="py-3 px-4">
                  {cat ? (
                    <span 
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border leading-[1.8]"
                      style={{
                        backgroundColor: 'var(--color-badge-bg)',
                        borderColor: 'var(--color-accent)',
                        color: 'var(--color-accent)',
                      }}
                    >
                      <Layers className="w-3 h-3 ml-1" />
                      <span>{cat.nameUr || cat.nameAr}</span>
                    </span>
                  ) : (
                    <span className="opacity-40">-</span>
                  )}
                </td>

                {/* Shamela ID */}
                <td className="py-3 px-4">
                  {book.shamelaId ? (
                    <span 
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: 'var(--color-bg-card-subtle)',
                        borderColor: 'var(--color-border-theme)',
                      }}
                    >
                      #{book.shamelaId}
                    </span>
                  ) : (
                    <span className="opacity-40">-</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-left" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-start gap-1.5">
                    {/* Direct Shamela Link */}
                    <button
                      onClick={(e) => handleDirectOpen(book, e)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:scale-105"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      title="شاملہ کی ویب سائٹ پر کھولیں"
                    >
                      <span className="leading-[1.8]">کھولیں ↗</span>
                      <ExternalLink className="w-3 h-3 mr-0.5" />
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={(e) => handleCopy(book.id, book.url, e)}
                      className="p-1.5 rounded-lg border transition-colors opacity-70 hover:opacity-100"
                      style={{ borderColor: 'var(--color-border-theme)' }}
                      title="لنک کاپی کریں"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => onEdit(book)}
                      className="p-1.5 rounded-lg border opacity-70 hover:opacity-100 transition-colors"
                      style={{ borderColor: 'var(--color-border-theme)' }}
                      title="ترمیم کریں"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(book.id)}
                      className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                      title="حذف کریں"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
