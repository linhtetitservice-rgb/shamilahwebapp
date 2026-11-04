import React, { useState, useEffect } from 'react';
import { ShamelaBook, BookCategory } from '../types';
import { extractShamelaId, buildShamelaUrl } from '../services/storage';
import { 
  X, 
  BookMarked, 
  Link as LinkIcon, 
  Tag, 
  Layers,
  Star
} from 'lucide-react';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookData: Partial<ShamelaBook>) => void;
  bookToEdit?: ShamelaBook | null;
  categories: BookCategory[];
  defaultCategoryId?: string;
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  onSave,
  bookToEdit,
  categories,
  defaultCategoryId,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [titleUr, setTitleUr] = useState('');
  const [authorAr, setAuthorAr] = useState('');
  const [authorUr, setAuthorUr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [volumes, setVolumes] = useState('');
  const [pages, setPages] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [detectedId, setDetectedId] = useState<string | null>(null);

  useEffect(() => {
    if (bookToEdit) {
      setUrlInput(bookToEdit.url || '');
      setTitleAr(bookToEdit.titleAr || '');
      setTitleUr(bookToEdit.titleUr || bookToEdit.titleMm || '');
      setAuthorAr(bookToEdit.authorAr || '');
      setAuthorUr(bookToEdit.authorUr || bookToEdit.authorMm || '');
      setCategoryId(bookToEdit.categoryId || categories[0]?.id || '');
      setVolumes(bookToEdit.volumes || '');
      setPages(bookToEdit.pages || '');
      setNotes(bookToEdit.notes || '');
      setTagsInput(bookToEdit.tags ? bookToEdit.tags.join('، ') : '');
      setIsFavorite(bookToEdit.isFavorite || false);
      setDetectedId(bookToEdit.shamelaId || extractShamelaId(bookToEdit.url));
    } else {
      setUrlInput('');
      setTitleAr('');
      setTitleUr('');
      setAuthorAr('');
      setAuthorUr('');
      setCategoryId(defaultCategoryId || (categories[0]?.id ?? ''));
      setVolumes('');
      setPages('');
      setNotes('');
      setTagsInput('');
      setIsFavorite(false);
      setDetectedId(null);
    }
  }, [bookToEdit, isOpen, categories, defaultCategoryId]);

  if (!isOpen) return null;

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    const id = extractShamelaId(value);
    setDetectedId(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() && !titleUr.trim()) {
      alert('براہ کرم کتاب کا عربی یا اردو نام درج کریں');
      return;
    }

    const cleanUrl = urlInput.trim() ? buildShamelaUrl(urlInput.trim()) : (detectedId ? `https://shamela.ws/book/${detectedId}` : '');
    const cleanTags = tagsInput
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      id: bookToEdit ? bookToEdit.id : undefined,
      url: cleanUrl || 'https://shamela.ws',
      shamelaId: detectedId || undefined,
      titleAr: titleAr.trim() || titleUr.trim(),
      titleUr: titleUr.trim() || titleAr.trim(),
      titleMm: titleUr.trim() || titleAr.trim(),
      authorAr: authorAr.trim() || undefined,
      authorUr: authorUr.trim() || undefined,
      authorMm: authorUr.trim() || undefined,
      categoryId: categoryId || categories[0]?.id,
      volumes: volumes.trim() || undefined,
      pages: pages.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: cleanTags.length > 0 ? cleanTags : undefined,
      isFavorite,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-nastaleeq" dir="rtl">
      <div 
        className="relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-theme)',
          color: 'var(--color-text-primary)',
        }}
      >
        
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            backgroundColor: 'var(--color-bg-header)',
            borderColor: 'var(--color-border-theme)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div 
              className="p-2.5 rounded-2xl text-white shadow-sm"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-[1.8]">
                {bookToEdit ? 'کتاب کے کوائف میں ترمیم کریں' : 'مکتبہ شاملہ کی کتاب کا لنک شامل کریں'}
              </h2>
              <p className="text-xs opacity-75 leading-[1.8]">
                شاملہ ویب سائٹ کا لنک یا کتاب کا شناختی نمبر (ID) آسانی سے درج کریں
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-right">
          
          {/* Section 1: URL / Book ID */}
          <div 
            className="p-4 rounded-2xl border space-y-2"
            style={{
              backgroundColor: 'var(--color-bg-app)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            <div className="flex items-center justify-between">
              <label 
                className="text-xs font-bold flex items-center gap-1.5"
                style={{ color: 'var(--color-accent)' }}
              >
                <LinkIcon className="w-3.5 h-3.5 ml-1" />
                <span className="leading-[1.8]">مکتبہ شاملہ ویب لنک (URL) یا کتاب ID</span>
              </label>
              {detectedId && (
                <span 
                  className="text-[11px] font-mono font-bold px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: 'var(--color-badge-bg)',
                    borderColor: 'var(--color-accent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  شناخت شدہ ID: #{detectedId}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="مثلاً https://shamela.ws/book/1680 یا صرف 1680 درج کریں"
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 text-left"
                dir="ltr"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
            <p className="text-[11px] opacity-70 leading-[1.8]">
              * shamela.ws سے کتاب کا مکمل لنک پیسٹ کریں یا کتاب کا ID نمبر درج کریں
            </p>
          </div>

          {/* Section 2: Category */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5 leading-[1.8]">
              <Layers className="w-3.5 h-3.5 ml-1" style={{ color: 'var(--color-accent)' }} />
              <span>کتاب کا زمرہ / شیلف (Category Shelf) *</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 leading-[1.8]"
              style={{
                backgroundColor: 'var(--color-bg-app)',
                borderColor: 'var(--color-border-theme)',
                color: 'var(--color-text-primary)',
              }}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameUr || c.nameAr} - ({c.nameAr})
                </option>
              ))}
            </select>
          </div>

          {/* Section 3: Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 leading-[1.8]">
                کتاب کا عربی نام (Arabic Title) *
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="صحيح البخاري"
                className="w-full px-3.5 py-2.5 rounded-xl border text-lg sm:text-xl focus:outline-none focus:ring-2 leading-[1.8] font-amiri arabic-title font-bold"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
                lang="ar"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 leading-[1.8]">
                کتاب کا اردو نام / تعارف (Urdu Title) *
              </label>
              <input
                type="text"
                value={titleUr}
                onChange={(e) => setTitleUr(e.target.value)}
                placeholder="صحیح بخاری (جامع المسند الصحیح)"
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
                required
              />
            </div>
          </div>

          {/* Section 4: Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 leading-[1.8]">
                مصنف کا نام (عربی)
              </label>
              <input
                type="text"
                value={authorAr}
                onChange={(e) => setAuthorAr(e.target.value)}
                placeholder="محمد بن إسماعيل البخاري"
                className="w-full px-3.5 py-2 rounded-xl border text-base sm:text-lg focus:outline-none focus:ring-2 leading-[1.8] font-amiri arabic-author font-bold"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
                lang="ar"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 leading-[1.8]">
                مصنف کا نام (اردو)
              </label>
              <input
                type="text"
                value={authorUr}
                onChange={(e) => setAuthorUr(e.target.value)}
                placeholder="امام محمد بن اسماعیل بخاری"
                className="w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Section 5: Volumes & Pages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 leading-[1.8]">
                جلدوں کی تعداد (Volumes)
              </label>
              <input
                type="text"
                value={volumes}
                onChange={(e) => setVolumes(e.target.value)}
                placeholder="مثلاً ۹ جلدیں"
                className="w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 leading-[1.8]">
                صفحات یا احادیث کی تعداد
              </label>
              <input
                type="text"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="مثلاً ۷,۵۶۳ احادیث مبارکہ"
                className="w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
          </div>

          {/* Section 6: Notes */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 leading-[1.8]">
              نوٹس اور خلاصہ (Notes & Summary)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="کتاب کے متعلق ذاتی نوٹس یا مختصر تعارف..."
              className="w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 leading-relaxed"
              style={{
                backgroundColor: 'var(--color-bg-app)',
                borderColor: 'var(--color-border-theme)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Section 7: Tags & Favorite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1 leading-[1.8]">
                <Tag className="w-3 h-3 ml-1" style={{ color: 'var(--color-accent)' }} />
                <span>ٹیگز (کوما سے الگ کریں)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="حدیث، صحیح بخاری، درسی کتاب"
                className="w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>

            <div className="pt-4">
              <label 
                className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border transition-colors leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-bg-app)',
                  borderColor: 'var(--color-border-theme)',
                }}
              >
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="rounded w-4 h-4 ml-1"
                />
                <Star className={`w-4 h-4 ${isFavorite ? 'text-amber-400 fill-amber-400' : 'opacity-50'}`} />
                <span className="text-xs font-semibold">
                  پسندیدہ کتب کی فہرست میں شامل رکھیں (Favorite)
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div 
            className="flex items-center justify-start gap-3 pt-4 border-t"
            style={{ borderColor: 'var(--color-border-theme)' }}
          >
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:scale-102 active:scale-98 leading-[1.8]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {bookToEdit ? 'محفوظ کریں' : 'کتاب شامل کریں'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium opacity-70 hover:opacity-100 transition-colors leading-[1.8]"
            >
              منسوخ کریں
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
