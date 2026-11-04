import React, { useState } from 'react';
import { BookCategory } from '../types';
import { 
  X, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  BookOpen, 
  Scroll, 
  Scale, 
  Compass, 
  Landmark, 
  Languages, 
  HeartHandshake
} from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: BookCategory[];
  categoryCounts: Record<string, number>;
  onAddCategory: (category: Omit<BookCategory, 'id'>) => void;
  onUpdateCategory: (category: BookCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const AVAILABLE_ICONS = [
  { name: 'BookOpen', label: 'کتاب (Book)' },
  { name: 'Scroll', label: 'حدیث طومار (Scroll)' },
  { name: 'Scale', label: 'میزان فقہ (Scale)' },
  { name: 'Compass', label: 'قطب نما / عقیدہ (Compass)' },
  { name: 'Landmark', label: 'تاریخی عمارت (Landmark)' },
  { name: 'Languages', label: 'عربی زبان و نحو (Languages)' },
  { name: 'HeartHandshake', label: 'اخلاق و دعائیں (Heart)' },
  { name: 'Layers', label: 'شیلف و طبقات (Layers)' },
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  categoryCounts,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  
  // New Category form state
  const [nameUr, setNameUr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('BookOpen');

  // Edit form state
  const [editNameUr, setEditNameUr] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editDescription, setEditDescription] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (cat: BookCategory) => {
    setEditingCatId(cat.id);
    setEditNameUr(cat.nameUr || cat.nameMm || '');
    setEditNameAr(cat.nameAr);
    setEditDescription(cat.description || '');
  };

  const handleSaveEdit = (cat: BookCategory) => {
    if (!editNameUr.trim()) {
      alert('براہ کرم زمرہ کا اردو نام درج کریں');
      return;
    }
    onUpdateCategory({
      ...cat,
      nameUr: editNameUr.trim(),
      nameMm: editNameUr.trim(),
      nameAr: editNameAr.trim() || editNameUr.trim(),
      description: editDescription.trim(),
    });
    setEditingCatId(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameUr.trim()) {
      alert('براہ کرم زمرہ کا نام درج کریں');
      return;
    }

    onAddCategory({
      nameUr: nameUr.trim(),
      nameMm: nameUr.trim(),
      nameAr: nameAr.trim() || nameUr.trim(),
      description: description.trim(),
      iconName,
      colorTheme: 'emerald',
      order: categories.length + 1,
    });

    setNameUr('');
    setNameAr('');
    setDescription('');
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
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-[1.8]">
                کتب کے زمرہ جات کی تنظیم (Manage Categories)
              </h2>
              <p className="text-xs opacity-75 leading-[1.8]">
                اپنی کتب کو موضوعات اور ابواب کے تحت الگ الگ خانوں میں منظم رکھیں
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

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-right">
          
          {/* Add New Category Box */}
          <form 
            onSubmit={handleCreateCategory}
            className="p-4 rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--color-bg-app)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            <h3 className="text-xs font-bold flex items-center gap-1.5 leading-[1.8]" style={{ color: 'var(--color-accent)' }}>
              <Plus className="w-4 h-4 ml-1" />
              <span>نیا زمرہ بنائیں</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1 leading-[1.8]">
                  زمرہ کا نام (اردو) *
                </label>
                <input
                  type="text"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  placeholder="مثلاً اصول حدیث"
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 leading-[1.8]"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-theme)',
                    color: 'var(--color-text-primary)',
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1 leading-[1.8]">
                  زمرہ کا نام (عربی)
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="أصول الحديث"
                  className="w-full px-3 py-2 rounded-xl border text-base focus:outline-none focus:ring-2 leading-[1.8]"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-theme)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold mb-1 leading-[1.8]">
                  علامت / آئیکن (Icon)
                </label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 leading-[1.8]"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-theme)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {AVAILABLE_ICONS.map((ico) => (
                    <option key={ico.name} value={ico.name}>
                      {ico.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold mb-1 leading-[1.8]">
                  مختصر تعارف / وضاحت
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اس زمرے سے متعلق کتب کی وضاحت..."
                  className="w-full px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 leading-[1.8]"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border-theme)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="flex justify-start pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-colors leading-[1.8]"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                <Plus className="w-3.5 h-3.5 ml-1" />
                <span>زمرہ شامل کریں</span>
              </button>
            </div>
          </form>

          {/* Current Categories List */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold opacity-80 leading-[1.8]">
              موجودہ زمرہ جات کی فہرست ({categories.length})
            </h3>

            <div className="space-y-2">
              {categories.map((cat) => {
                const count = categoryCounts[cat.id] || 0;
                const isEditing = editingCatId === cat.id;

                if (isEditing) {
                  return (
                    <div 
                      key={cat.id}
                      className="p-3 rounded-2xl border space-y-2"
                      style={{
                        backgroundColor: 'var(--color-bg-card-subtle)',
                        borderColor: 'var(--color-accent)',
                      }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editNameUr}
                          onChange={(e) => setEditNameUr(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border text-xs leading-[1.8]"
                          style={{
                            backgroundColor: 'var(--color-bg-app)',
                            borderColor: 'var(--color-border-theme)',
                            color: 'var(--color-text-primary)',
                          }}
                          placeholder="اردو نام"
                        />
                        <input
                          type="text"
                          value={editNameAr}
                          onChange={(e) => setEditNameAr(e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border text-base leading-[1.8]"
                          style={{
                            backgroundColor: 'var(--color-bg-app)',
                            borderColor: 'var(--color-border-theme)',
                            color: 'var(--color-text-primary)',
                          }}
                          placeholder="عربی نام"
                        />
                      </div>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border text-xs leading-[1.8]"
                        style={{
                          backgroundColor: 'var(--color-bg-app)',
                          borderColor: 'var(--color-border-theme)',
                          color: 'var(--color-text-primary)',
                        }}
                        placeholder="وضاحت"
                      />
                      <div className="flex justify-start gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold text-white shadow-sm leading-[1.8]"
                          style={{ backgroundColor: 'var(--color-accent)' }}
                        >
                          <Check className="w-3.5 h-3.5 ml-1" />
                          <span>محفوظ کریں</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-3 py-1 rounded text-xs opacity-70 hover:opacity-100 leading-[1.8]"
                        >
                          منسوخ
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 rounded-2xl border transition-colors"
                    style={{
                      backgroundColor: 'var(--color-bg-app)',
                      borderColor: 'var(--color-border-theme)',
                    }}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs sm:text-sm leading-[1.8]">
                          {cat.nameUr || cat.nameAr}
                        </span>
                        <span className="text-xs font-normal opacity-75 leading-[1.8]">
                          ({cat.nameAr})
                        </span>
                        <span 
                          className="px-2 py-0.2 rounded-full text-[10px] font-mono border"
                          style={{
                            backgroundColor: 'var(--color-badge-bg)',
                            borderColor: 'var(--color-accent)',
                            color: 'var(--color-accent)',
                          }}
                        >
                          {count} کتب
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-[11px] opacity-70 line-clamp-1 leading-[1.8]">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg border opacity-70 hover:opacity-100 transition-colors"
                        style={{ borderColor: 'var(--color-border-theme)' }}
                        title="ترمیم کریں"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (count > 0) {
                            if (!confirm(`اس زمرے میں (${count}) کتابیں موجود ہیں۔ کیا آپ واقعی اسے حذف کرنا چاہتے ہیں؟`)) {
                              return;
                            }
                          }
                          onDeleteCategory(cat.id);
                        }}
                        className="p-1.5 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                        title="حذف کریں"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div 
          className="px-6 py-3.5 border-t flex justify-start"
          style={{
            backgroundColor: 'var(--color-bg-header)',
            borderColor: 'var(--color-border-theme)',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-colors opacity-80 hover:opacity-100 leading-[1.8]"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            بند کریں
          </button>
        </div>

      </div>
    </div>
  );
};
