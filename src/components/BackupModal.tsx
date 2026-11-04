import React, { useRef, useState } from 'react';
import { ShamelaBook, BookCategory } from '../types';
import { exportLibraryToJson } from '../services/storage';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  FileText,
  ShieldCheck
} from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: ShamelaBook[];
  categories: BookCategory[];
  onImport: (importedBooks: ShamelaBook[], importedCategories?: BookCategory[]) => void;
  onResetDefaults: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  books,
  categories,
  onImport,
  onResetDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportLibraryToJson(books, categories);
    setImportStatus('لائبریری کی بیک اپ فائل کامیابی سے ڈاؤن لوڈ ہو گئی ہے!');
    setTimeout(() => setImportStatus(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        let importedBooks: ShamelaBook[] = [];
        let importedCategories: BookCategory[] | undefined = undefined;

        if (Array.isArray(data)) {
          importedBooks = data;
        } else if (data && typeof data === 'object' && Array.isArray(data.books)) {
          importedBooks = data.books;
          if (Array.isArray(data.categories)) {
            importedCategories = data.categories;
          }
        } else {
          throw new Error('فائل کا فارمیٹ درست نہیں ہے');
        }

        if (importedBooks.length === 0) {
          throw new Error('فائل کے اندر کتب کی معلومات نہیں ملیں');
        }

        onImport(importedBooks, importedCategories);
        setImportStatus(`کتب (${importedBooks.length}) کامیابی سے لائبریری میں بحال ہو چکی ہیں!`);
        setErrorMsg(null);
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1500);
      } catch (err: any) {
        setErrorMsg(err.message || 'فائل پڑھنے کے دوران خرابی پیش آئی');
        setImportStatus(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-nastaleeq" dir="rtl">
      <div 
        className="relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-8 border"
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
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-[1.8]">
                ڈیٹا بیک اپ اور بحالی (Backup & Restore)
              </h2>
              <p className="text-xs opacity-75 leading-[1.8]">
                اپنی لائبریری کی فہرست محفوظ رکھیں تاکہ دوسرے آلات پر بھی استعمال ہو سکے
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

        {/* Body */}
        <div className="p-6 space-y-5 text-right">
          {importStatus && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 leading-[1.8]">
              <Check className="w-4 h-4 shrink-0 ml-1" />
              <span>{importStatus}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center gap-2 leading-[1.8]">
              <AlertTriangle className="w-4 h-4 shrink-0 ml-1" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Library Summary */}
          <div 
            className="p-4 rounded-2xl border text-xs flex items-center justify-between"
            style={{
              backgroundColor: 'var(--color-bg-app)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            <div>
              <p className="font-bold leading-[1.8]">لائبریری کا موجودہ خلاصہ</p>
              <p className="opacity-75 mt-0.5 leading-[1.8]">
                کتب: <strong style={{ color: 'var(--color-accent)' }}>{books.length}</strong> • زمرہ جات: <strong style={{ color: 'var(--color-accent)' }}>{categories.length}</strong>
              </p>
            </div>
            <FileText className="w-8 h-8 opacity-40" />
          </div>

          {/* Export Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold leading-[1.8]">۱۔ کتب کی فہرست ڈاؤن لوڈ کریں (Export)</h3>
            <p className="text-[11px] opacity-75 leading-[1.8]">
              اپنی لائبریری کی تمام کتب اور زمرہ جات کو ایک JSON بیک اپ فائل کے طور پر محفوظ کریں
            </p>
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all hover:scale-102 leading-[1.8]"
              style={{
                backgroundColor: 'var(--color-bg-app)',
                borderColor: 'var(--color-border-theme)',
              }}
            >
              <Download className="w-4 h-4 ml-1" style={{ color: 'var(--color-accent)' }} />
              <span>JSON بیک اپ فائل ڈاؤن لوڈ کریں</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold leading-[1.8]">۲۔ محفوظ شدہ فائل سے بحال کریں (Import)</h3>
            <p className="text-[11px] opacity-75 leading-[1.8]">
              پہلے سے ڈاؤن لوڈ کردہ بیک اپ فائل کو منتخب کر کے کتب دوبارہ بحال کریں
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all hover:scale-102 leading-[1.8]"
              style={{
                backgroundColor: 'var(--color-badge-bg)',
                borderColor: 'var(--color-accent)',
                color: 'var(--color-accent)',
              }}
            >
              <Upload className="w-4 h-4 ml-1" />
              <span>بیک اپ فائل منتخب کریں</span>
            </button>
          </div>

          {/* Reset Section */}
          <div 
            className="pt-2 border-t space-y-2"
            style={{ borderColor: 'var(--color-border-theme)' }}
          >
            <h3 className="text-xs font-semibold opacity-75 leading-[1.8]">لائبریری کو اصل ڈیفالٹ حالت پر بحال کریں</h3>
            <button
              onClick={() => {
                if (confirm('کیا آپ واقعی لائبریری کو اصل ڈیفالٹ حالت پر بحال کرنا چاہتے ہیں؟ آپ کی شامل کردہ کتب ختم ہو جائیں گی')) {
                  onResetDefaults();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-xs font-medium border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors leading-[1.8]"
            >
              <RotateCcw className="w-3.5 h-3.5 ml-1" />
              <span>اصل ڈیفالٹ کتب پر بحال کریں (Reset Defaults)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
