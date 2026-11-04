import React, { useState } from 'react';
import { BookCategory, ShamelaBook } from '../types';
import { parseBulkInput } from '../services/storage';
import { 
  X, 
  ListPlus, 
  Layers, 
  Check, 
  HelpCircle
} from 'lucide-react';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBooks: (newBooks: ShamelaBook[]) => void;
  categories: BookCategory[];
  defaultCategoryId?: string;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  onClose,
  onAddBooks,
  categories,
  defaultCategoryId,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    defaultCategoryId || (categories[0]?.id ?? '')
  );
  const [rawText, setRawText] = useState('');
  const [previewList, setPreviewList] = useState<Partial<ShamelaBook>[]>([]);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setRawText(text);
    if (text.trim()) {
      const parsed = parseBulkInput(text, selectedCategoryId);
      setPreviewList(parsed);
    } else {
      setPreviewList([]);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    if (rawText.trim()) {
      const parsed = parseBulkInput(rawText, catId);
      setPreviewList(parsed);
    }
  };

  const handleInsertSample = () => {
    const sample = `https://shamela.ws/book/1680 | صحيح البخاري | امام بخاری
https://shamela.ws/book/1727 | صحيح مسلم | امام مسلم
https://shamela.ws/book/23608 | تفسير ابن كثير | حافظ ابن کثیر
https://shamela.ws/book/1728 | رياض الصالحين | امام نووی`;
    setRawText(sample);
    const parsed = parseBulkInput(sample, selectedCategoryId);
    setPreviewList(parsed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewList.length === 0) {
      alert('براہ کرم کتب کے لنکس درج کریں');
      return;
    }

    const booksToInsert: ShamelaBook[] = previewList.map((p, idx) => ({
      id: p.id || `book-${Date.now()}-${idx}`,
      titleAr: p.titleAr || 'كتاب شاملة',
      titleUr: p.titleUr || p.titleAr || 'شاملہ کتاب',
      titleMm: p.titleUr || p.titleAr || 'شاملہ کتاب',
      authorAr: p.authorAr,
      authorUr: p.authorUr,
      authorMm: p.authorUr,
      categoryId: selectedCategoryId,
      shamelaId: p.shamelaId,
      url: p.url || 'https://shamela.ws',
      volumes: p.volumes,
      isFavorite: false,
      createdAt: Date.now() + idx,
    }));

    onAddBooks(booksToInsert);
    setRawText('');
    setPreviewList([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-nastaleeq" dir="rtl">
      <div 
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8 border"
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
              <ListPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-[1.8]">
                کتب کے لنکس کا مجموعی اضافہ (Bulk Add Links)
              </h2>
              <p className="text-xs opacity-75 leading-[1.8]">
                مکتبہ شاملہ کے لنکس ایک ایک سطر میں لکھ کر ایک ساتھ اپنی لائبریری میں شامل کریں
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
          
          {/* Target Shelf / Category Selector */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 flex items-center justify-between leading-[1.8]">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 ml-1" style={{ color: 'var(--color-accent)' }} />
                <span>مطلوبہ زمرہ / شیلف منتخب کریں *</span>
              </span>
              <button
                type="button"
                onClick={handleInsertSample}
                className="text-[11px] underline font-semibold"
                style={{ color: 'var(--color-accent)' }}
              >
                نمونہ لنکس درج کریں
              </button>
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
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

          {/* Paste Textarea */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 leading-[1.8]">
              کتابوں کے لنکس درج کریں (ہر سطر میں ایک کتاب)
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={`درج ذیل انداز میں لنکس درج کر سکتے ہیں:
1. https://shamela.ws/book/1680 | صحيح البخاري | امام بخاری
2. https://shamela.ws/book/1727
3. 23608 | تفسير ابن كثير`}
              className="w-full px-3.5 py-2.5 rounded-2xl border text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 leading-relaxed text-left"
              dir="ltr"
              style={{
                backgroundColor: 'var(--color-bg-app)',
                borderColor: 'var(--color-border-theme)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Format Guide */}
          <div 
            className="p-3.5 rounded-2xl border text-xs opacity-85 space-y-1 leading-[1.9]"
            style={{
              backgroundColor: 'var(--color-bg-app)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            <p className="font-semibold flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
              <HelpCircle className="w-3.5 h-3.5 ml-1" />
              <span>طریقہ کار:</span>
            </p>
            <p>• صرف لنک درج کرنا بھی کافی ہے (مثلاً: <code dir="ltr">https://shamela.ws/book/1680</code> یا <code dir="ltr">1680</code>)</p>
            <p>• یا نام اور مصنف کے ساتھ درج کریں: <code dir="ltr">لنک | نام | مصنف</code> (| کی علامت کے ساتھ)</p>
          </div>

          {/* Live Preview Count */}
          {previewList.length > 0 && (
            <div 
              className="p-3 rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-badge-bg)',
                borderColor: 'var(--color-accent)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--color-accent)' }}>
                  <Check className="w-4 h-4 ml-1" />
                  <span className="leading-[1.8]">شناخت شدہ کتب کی تعداد: {previewList.length} کتابیں</span>
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs">
                {previewList.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2 rounded-xl border"
                    style={{
                      backgroundColor: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border-theme)',
                    }}
                  >
                    <span className="font-amiri arabic-title font-bold text-sm sm:text-base truncate max-w-[220px] leading-[1.8]" lang="ar">
                      {item.titleAr || item.titleUr}
                    </span>
                    <span className="font-mono text-[11px] opacity-80 truncate max-w-[220px]" dir="ltr">
                      {item.url}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div 
            className="flex items-center justify-start gap-3 pt-4 border-t"
            style={{ borderColor: 'var(--color-border-theme)' }}
          >
            <button
              type="submit"
              disabled={previewList.length === 0}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:scale-102 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed leading-[1.8]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              {previewList.length > 0 ? `کتب (${previewList.length}) شامل کریں` : 'کتب شامل کریں'}
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
