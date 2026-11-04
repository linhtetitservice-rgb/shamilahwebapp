import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Check, Moon, Sun } from 'lucide-react';

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const { themeId, theme, setThemeId, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Group into Light & Dark
  const lightThemes = availableThemes.filter((t) => !t.isDark);
  const darkThemes = availableThemes.filter((t) => t.isDark);

  return (
    <div className="relative font-nastaleeq" dir="rtl">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-sm border"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-border-theme)',
          color: 'var(--color-text-primary)',
        }}
        title="تھیم کا رنگ تبدیل کریں (Change Color Theme)"
      >
        {/* Color preview duo circles matching screenshots */}
        <div className="flex items-center -space-x-1.5">
          <span
            className="w-4 h-4 rounded-full border border-black/20 shadow-sm"
            style={{ backgroundColor: theme.previewBg }}
          />
          <span
            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
            style={{ backgroundColor: theme.previewAccent }}
          />
        </div>

        <span className="hidden sm:inline font-medium text-xs leading-[1.8]">
          {compact ? 'رنگین تھیم' : (theme.nameUr || theme.nameEn)}
        </span>
        <Palette className="w-3.5 h-3.5 opacity-70" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute left-0 top-full mt-2 w-72 sm:w-80 rounded-2xl p-4 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150"
            style={{
              backgroundColor: 'var(--color-bg-card)',
              borderColor: 'var(--color-border-theme)',
              color: 'var(--color-text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b" style={{ borderColor: 'var(--color-border-theme)' }}>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                <h4 className="text-xs font-bold leading-[1.8]">
                  رنگین تھیمز منتخب کریں (Themes)
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--color-accent-subtle)', color: 'var(--color-accent)' }}>
                {availableThemes.length} انداز
              </span>
            </div>

            {/* Light Themes Section (From Screenshots 1, 2, 3) */}
            <div className="mb-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
                <Sun className="w-3 h-3 text-amber-500" />
                <span>روشن تھیمز (Light Themes)</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {lightThemes.map((t) => {
                  const isSelected = themeId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeId(t.id);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all border text-right"
                      style={{
                        backgroundColor: isSelected ? t.bgApp : 'transparent',
                        borderColor: isSelected ? t.accent : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shadow-sm"
                            style={{ backgroundColor: t.previewBg }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shadow-sm"
                            style={{ backgroundColor: t.previewAccent }}
                          />
                        </div>
                        <span className="font-medium text-xs leading-[1.8]">
                          {t.nameUr || t.nameEn}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: t.accent }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dark Themes Section (From Screenshots 4, 5, 6 & Shamela) */}
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-2">
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>ڈارک تھیمز (Dark Themes)</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {darkThemes.map((t) => {
                  const isSelected = themeId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setThemeId(t.id);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all border text-right"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
                        borderColor: isSelected ? t.accent : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: t.previewBg }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: t.previewAccent }}
                          />
                        </div>
                        <span className="font-medium text-xs leading-[1.8]">
                          {t.nameUr || t.nameEn}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: t.accent }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Urdu Jameel Noori Nastaleeq Calligraphy Indicator */}
            <div 
              className="mt-3 pt-2.5 border-t flex items-center justify-between text-[11px]" 
              style={{ borderColor: 'var(--color-border-theme)' }}
            >
              <span className="opacity-75">خطاطی (Calligraphy):</span>
              <span 
                className="font-nastaleeq text-sm font-bold px-2.5 py-0.5 rounded-lg border leading-[1.8]"
                style={{
                  backgroundColor: 'var(--color-badge-bg)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-accent)',
                }}
              >
                جمیل نوری نستعلیق
              </span>
            </div>

          </div>
        </>
      )}
    </div>
  );
};
