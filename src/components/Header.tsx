import React, { useState } from 'react';
import { 
  BookMarked, 
  Plus, 
  Layers, 
  Download, 
  Search,
  ListPlus,
  Globe2,
  Cloud,
  CloudCheck,
  LogOut,
  User as UserIcon,
  UploadCloud
} from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  totalBooks: number;
  totalCategories: number;
  favoriteCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  onOpenCategoryModal: () => void;
  onOpenBackupModal: () => void;
  onOpenShamelaSearch: (initialQuery?: string) => void;
  onSyncToCloud?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalBooks,
  totalCategories,
  favoriteCount,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenBulkModal,
  onOpenCategoryModal,
  onOpenBackupModal,
  onOpenShamelaSearch,
  onSyncToCloud,
}) => {
  const { user, login, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header 
      className="border-b sticky top-0 z-30 backdrop-blur-md transition-colors font-nastaleeq"
      style={{
        backgroundColor: 'var(--color-bg-header)',
        borderColor: 'var(--color-border-theme)',
      }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Title in Urdu and Arabic */}
          <div className="flex items-center gap-3.5">
            <div 
              className="relative flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg border text-white transition-transform hover:scale-105 shrink-0"
              style={{
                backgroundColor: 'var(--color-accent)',
                borderColor: 'var(--color-border-theme)',
              }}
            >
              <BookMarked className="w-6 h-6" />
              <div 
                className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full border-2"
                style={{
                  backgroundColor: 'var(--color-accent-hover)',
                  borderColor: 'var(--color-bg-card)',
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 leading-[1.9]">
                  <span>المكتبة الشاملة</span>
                  <span className="text-base sm:text-lg font-normal opacity-85">
                    (مکتبہ شاملہ ویب لائبریری)
                  </span>
                </h1>
                <span 
                  className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold border"
                  style={{
                    backgroundColor: 'var(--color-accent-subtle)',
                    borderColor: 'var(--color-accent)',
                    color: 'var(--color-accent)',
                  }}
                >
                  کلاؤڈ سنک
                </span>
              </div>
              <p className="text-xs sm:text-sm opacity-80 leading-[1.8]">
                مکتبہ شاملہ کی کتب کی فہرست، زمرہ جات کی درجہ بندی اور براہ راست آن لائن مطالعہ
              </p>
            </div>
          </div>

          {/* Quick Stats & Action Buttons */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Quick Stats Pill */}
            <div 
              className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl border text-xs"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-theme)',
              }}
            >
              <span className="flex items-center gap-1.5">
                <span 
                  className="w-2 h-2 rounded-full animate-pulse" 
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
                <span>کتب: <strong className="font-bold">{totalBooks}</strong></span>
              </span>
              <span className="opacity-40">|</span>
              <span>
                زمرہ جات: <strong className="font-bold">{totalCategories}</strong>
              </span>
              <span className="opacity-40">|</span>
              <span className="font-semibold" style={{ color: 'var(--color-accent)' }}>
                پسندیدہ: {favoriteCount}
              </span>
            </div>

            {/* THEME SELECTOR */}
            <ThemeSelector />

            {/* FIREBASE AUTH / CLOUD SYNC BUTTON */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm hover:scale-102"
                  style={{
                    backgroundColor: 'var(--color-bg-card)',
                    borderColor: 'var(--color-accent)',
                  }}
                  title="کلاؤڈ اکاؤنٹ کا نظم کریں"
                >
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="" 
                      className="w-5 h-5 rounded-full object-cover border" 
                      style={{ borderColor: 'var(--color-accent)' }}
                    />
                  ) : (
                    <UserIcon className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                  )}
                  <span className="font-semibold truncate max-w-[90px] sm:max-w-[120px]">
                    {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div 
                      className="absolute left-0 top-full mt-2 w-64 rounded-2xl p-3 border shadow-2xl z-50 text-xs space-y-2.5 animate-in fade-in zoom-in-95"
                      style={{
                        backgroundColor: 'var(--color-bg-card)',
                        borderColor: 'var(--color-border-theme)',
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      <div className="pb-2 border-b" style={{ borderColor: 'var(--color-border-theme)' }}>
                        <p className="font-bold truncate">{user.displayName || 'محترم صارف'}</p>
                        <p className="opacity-70 text-[11px] truncate font-mono">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-500">
                          <CloudCheck className="w-3.5 h-3.5" />
                          <span>فائر بیس فائر اسٹور فعال ہے</span>
                        </div>
                      </div>

                      {onSyncToCloud && (
                        <button
                          onClick={() => {
                            onSyncToCloud();
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-right font-medium transition-colors hover:scale-102 border"
                          style={{
                            backgroundColor: 'var(--color-badge-bg)',
                            borderColor: 'var(--color-accent)',
                            color: 'var(--color-accent)',
                          }}
                        >
                          <UploadCloud className="w-4 h-4 shrink-0" />
                          <span>موجودہ کتب کلاؤڈ پر محفوظ کریں</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-right text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        <span>لاگ آؤٹ (Sign Out)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => login()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-102"
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: 'var(--color-border-theme)',
                  color: 'var(--color-text-primary)',
                }}
                title="گوگل اکاؤنٹ سے داخل ہو کر لائبریری کو کلاؤڈ میں محفوظ رکھیں"
              >
                <Cloud className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
                <span>گوگل کلاؤڈ لاگ ان</span>
              </button>
            )}

            {/* Live Shamela Search Engine Button */}
            <button
              onClick={() => onOpenShamelaSearch(searchQuery)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-102 active:scale-98"
              style={{ backgroundColor: 'var(--color-accent)' }}
              title="مکتبہ شاملہ کے اصل ڈیٹا بیس میں تلاش کریں"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>شاملہ سرچ ↗</span>
            </button>

            {/* Manage Categories Button */}
            <button
              onClick={onOpenCategoryModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:scale-102"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-theme)',
              }}
              title="کتب کے زمرہ جات کی تنظیم کریں"
            >
              <Layers className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span>زمرہ جات</span>
            </button>

            {/* Bulk Add Button */}
            <button
              onClick={onOpenBulkModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors hover:scale-102"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-theme)',
              }}
              title="ایک ساتھ متعدد کتب کے لنکس شامل کریں"
            >
              <ListPlus className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              <span>مجموعی اضافہ</span>
            </button>

            {/* Backup & Import Button */}
            <button
              onClick={onOpenBackupModal}
              className="p-2 rounded-xl border transition-colors opacity-80 hover:opacity-100"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-theme)',
              }}
              title="بیک اپ اور بحالی (Backup / Restore)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Add Book Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-102 active:scale-98"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <Plus className="w-4 h-4" />
              <span>کتاب شامل کریں</span>
            </button>
          </div>

        </div>

        {/* Search Bar Row with Dual Search */}
        <div className="mt-3.5">
          <div className="relative flex items-center">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  onOpenShamelaSearch(searchQuery);
                }
              }}
              placeholder="کتاب کا نام (عربی یا اردو)، مصنف کا نام، یا شاملہ ID درج کریں... (Enter دبا کر براہ راست شاملہ میں تلاش کریں)"
              className="w-full pr-10 pl-32 sm:pl-48 py-2.5 rounded-2xl border text-xs sm:text-sm focus:outline-none focus:ring-2 transition-all shadow-inner font-nastaleeq leading-[1.8]"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--color-border-theme)',
                color: 'var(--color-text-primary)',
              }}
            />
            
            <div className="absolute left-2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-[11px] opacity-60 hover:opacity-100 px-1.5 py-0.5 rounded"
                >
                  صاف کریں
                </button>
              )}

              <button
                onClick={() => onOpenShamelaSearch(searchQuery)}
                className="flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: 'var(--color-accent)' }}
                title="شاملہ کے اصل ڈیٹا بیس میں براہ راست تلاش کریں"
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>شاملہ سرچ ↗</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
