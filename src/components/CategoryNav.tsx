import React from 'react';
import { BookCategory, ViewMode } from '../types';
import { 
  BookOpen, 
  Scroll, 
  Scale, 
  Compass, 
  Landmark, 
  Languages, 
  HeartHandshake, 
  Star, 
  FolderPlus,
  LayoutGrid,
  List,
  Library,
  Layers
} from 'lucide-react';

interface CategoryNavProps {
  categories: BookCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  favoriteCount: number;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenAddCategory: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  categoryCounts,
  totalCount,
  favoriteCount,
  viewMode,
  onChangeViewMode,
  onOpenAddCategory,
}) => {
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Scroll':
        return <Scroll className="w-4 h-4" />;
      case 'Scale':
        return <Scale className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      case 'Landmark':
        return <Landmark className="w-4 h-4" />;
      case 'Languages':
        return <Languages className="w-4 h-4" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div 
      className="border-b sticky top-[115px] sm:top-[77px] z-20 backdrop-blur-sm transition-colors font-nastaleeq"
      style={{
        backgroundColor: 'var(--color-bg-card-subtle)',
        borderColor: 'var(--color-border-theme)',
      }}
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Category Tabs Scrollable */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar text-xs font-medium">
            
            {/* All Books Tab */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeCategoryId === 'all'
                  ? 'text-white shadow-md font-bold'
                  : 'opacity-80 hover:opacity-100 hover:scale-102'
              }`}
              style={{
                backgroundColor: activeCategoryId === 'all' ? 'var(--color-accent)' : 'transparent',
              }}
            >
              <Library className="w-3.5 h-3.5" />
              <span className="leading-[1.8]">تمام کتب</span>
              <span 
                className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono"
              >
                {totalCount}
              </span>
            </button>

            {/* Favorites Tab */}
            <button
              onClick={() => onSelectCategory('favorites')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                activeCategoryId === 'favorites'
                  ? 'text-white shadow-md font-bold'
                  : 'opacity-80 hover:opacity-100 hover:scale-102'
              }`}
              style={{
                backgroundColor: activeCategoryId === 'favorites' ? '#f59e0b' : 'transparent',
              }}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="leading-[1.8]">پسندیدہ کتب</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
                {favoriteCount}
              </span>
            </button>

            <span className="h-4 w-[1px] opacity-30 mx-1 bg-current" />

            {/* Dynamic Categories */}
            {categories.map((cat) => {
              const count = categoryCounts[cat.id] || 0;
              const isActive = activeCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-white font-bold shadow-md'
                      : 'opacity-80 hover:opacity-100 hover:scale-102'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                  }}
                  title={`${cat.nameUr || cat.nameAr} (${cat.nameAr})`}
                >
                  <span className={isActive ? 'text-white' : undefined} style={!isActive ? { color: 'var(--color-accent)' } : undefined}>
                    {getCategoryIcon(cat.iconName)}
                  </span>
                  <span className="truncate max-w-[150px] sm:max-w-[210px] leading-[1.8]">
                    {cat.nameUr || cat.nameAr}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white font-mono">
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Quick Add Category Tab */}
            <button
              onClick={onOpenAddCategory}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border whitespace-nowrap transition-colors hover:scale-102"
              style={{
                borderColor: 'var(--color-border-theme)',
                color: 'var(--color-accent)',
              }}
              title="نیا زمرہ بنائیں"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="leading-[1.8]">+ نیا زمرہ</span>
            </button>

          </div>

          {/* View Mode Controls */}
          <div className="flex items-center justify-start gap-1 shrink-0 self-start sm:self-center">
            <span className="text-[11px] opacity-70 ml-1 hidden sm:inline leading-[1.8]">ترتیب:</span>
            
            <button
              onClick={() => onChangeViewMode('shelf')}
              className="p-1.5 rounded-lg border transition-all"
              style={{
                backgroundColor: viewMode === 'shelf' ? 'var(--color-accent-subtle)' : 'transparent',
                borderColor: viewMode === 'shelf' ? 'var(--color-accent)' : 'var(--color-border-theme)',
                color: viewMode === 'shelf' ? 'var(--color-accent)' : 'inherit',
              }}
              title="شیلف کارڈز (Shelf Cards)"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>

            <button
              onClick={() => onChangeViewMode('by-category')}
              className="p-1.5 rounded-lg border transition-all"
              style={{
                backgroundColor: viewMode === 'by-category' ? 'var(--color-accent-subtle)' : 'transparent',
                borderColor: viewMode === 'by-category' ? 'var(--color-accent)' : 'var(--color-border-theme)',
                color: viewMode === 'by-category' ? 'var(--color-accent)' : 'inherit',
              }}
              title="بلحاظ زمرہ جات شیلف (By Category Shelves)"
            >
              <Library className="w-4 h-4" />
            </button>

            <button
              onClick={() => onChangeViewMode('compact')}
              className="p-1.5 rounded-lg border transition-all"
              style={{
                backgroundColor: viewMode === 'compact' ? 'var(--color-accent-subtle)' : 'transparent',
                borderColor: viewMode === 'compact' ? 'var(--color-accent)' : 'var(--color-border-theme)',
                color: viewMode === 'compact' ? 'var(--color-accent)' : 'inherit',
              }}
              title="فہرست جدول (Compact Table List)"
            >
              <List className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
