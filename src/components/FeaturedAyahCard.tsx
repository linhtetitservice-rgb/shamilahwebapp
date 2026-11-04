import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Share2,
  Bookmark
} from 'lucide-react';

interface DailyInspiration {
  arabic: string;
  urdu: string;
  referenceAr: string;
  referenceUr: string;
  source: string;
  shamelaUrl: string;
  bookId?: number;
  pageId?: number;
}

const INSPIRATIONS: DailyInspiration[] = [
  {
    arabic: 'وَقَاسَمَهُمَا إِنِّي لَكُمَا لَمِنَ النَّاصِحِينَ',
    urdu: 'اور ان دونوں کے سامنے قسم کھائی کہ یقین جانیے میں تم دونوں کا خیر خواہ ہوں',
    referenceAr: 'سُورَةُ الأَعْرَاف: ٢١',
    referenceUr: 'سورۃ الاعراف: آیت ۲۱',
    source: 'القرآن الكريم',
    shamelaUrl: 'https://shamela.ws/book/23608/1340',
    bookId: 23608,
    pageId: 1340,
  },
  {
    arabic: 'يَوْمَ يَأْتِ لَا تَكَلَّمُ نَفْسٌ إِلَّا بِإِذْنِهِ ۚ فَمِنْهُمْ شَقِيٌّ وَسَعِيدٌ',
    urdu: 'جب وہ دن آئے گا تو کوئی شخص اللہ کی اجازت کے بغیر بات نہ کر سکے گا، پھر ان میں سے کچھ بدبخت ہوں گے اور کچھ نیک بخت',
    referenceAr: 'سُورَةُ هُود: ١٠٥',
    referenceUr: 'سورۃ ہود: آیت ۱۰۵',
    source: 'القرآن الكريم',
    shamelaUrl: 'https://shamela.ws/book/23608/2105',
    bookId: 23608,
    pageId: 2105,
  },
  {
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    urdu: 'تمام اعمال کا دار و مدار نیتوں پر ہے، اور ہر انسان کے لیے وہی ہے جس کی اس نے نیت کی',
    referenceAr: 'صَحِيحُ البُخَارِيّ: ١',
    referenceUr: 'صحیح بخاری: حدیث ۱',
    source: 'صحیح البخاري',
    shamelaUrl: 'https://shamela.ws/book/1680/1',
    bookId: 1680,
    pageId: 1,
  },
  {
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ القُرْآنَ وَعَلَّمَهُ',
    urdu: 'تم میں سے سب سے بہتر وہ شخص ہے جس نے قرآن سیکھا اور دوسروں کو سکھایا',
    referenceAr: 'صَحِيحُ البُخَارِيّ: ٥٠٢٧',
    referenceUr: 'صحیح بخاری: حدیث ۵۰۲۷',
    source: 'صحیح البخاري',
    shamelaUrl: 'https://shamela.ws/book/1680/5027',
    bookId: 1680,
    pageId: 5027,
  },
  {
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللهُ لَهُ بِهِ طَرِيقًا إِلَى الجَنَّةِ',
    urdu: 'جو شخص علم کی تلاش کے راستے پر چلا، اللہ تعالیٰ اس کے بدلے اس کے لیے جنت کا راستہ آسان فرما دیتا ہے',
    referenceAr: 'صَحِيحُ مُسْلِم: ٢٦٩٩',
    referenceUr: 'صحیح مسلم: حدیث ۲۶۹۹',
    source: 'صحیح مسلم',
    shamelaUrl: 'https://shamela.ws/book/1727/2699',
    bookId: 1727,
    pageId: 2699,
  },
];

interface FeaturedAyahCardProps {
  onOpenReader?: (bookId: number, pageId: number, title: string) => void;
}

export const FeaturedAyahCard: React.FC<FeaturedAyahCardProps> = ({ onOpenReader }) => {
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = INSPIRATIONS[index];

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % INSPIRATIONS.length);
  };

  const handleCopy = () => {
    const text = `${current.arabic}\n\n${current.urdu}\n\n[${current.referenceAr} - ${current.source}]\n${current.shamelaUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="mb-8 rounded-3xl border shadow-lg overflow-hidden transition-all duration-300 relative"
      style={{
        backgroundColor: 'var(--color-bg-card)',
        borderColor: 'var(--color-border-theme)',
      }}
      dir="rtl"
    >
      {/* Top Banner Header */}
      <div 
        className="px-6 py-3 border-b flex items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--color-bg-card-subtle)',
          borderColor: 'var(--color-border-theme)',
        }}
      >
        <div className="flex items-center gap-2">
          <span 
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-90 flex items-center gap-2 leading-[1.8]">
            <Sparkles className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
            <span>آیت و حدیث مبارکہ (Ayah & Hadith of the Moment)</span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl border opacity-75 hover:opacity-100 transition-colors"
            style={{ borderColor: 'var(--color-border-theme)' }}
            title="عبارت کاپی کریں"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--color-badge-bg)',
              borderColor: 'var(--color-accent)',
              color: 'var(--color-accent)',
            }}
            title="اگلی آیت یا حدیث دیکھیں"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تبدیل کریں</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 text-center space-y-5">
        {/* Arabic Calligraphy in Classical Amiri Font - BOLD & LARGE */}
        <div lang="ar" className="space-y-3">
          <p 
            className="font-amiri text-2xl sm:text-3xl lg:text-4xl font-bold leading-[2] sm:leading-[2.4] tracking-wide select-text arabic-prominent"
            style={{ color: 'var(--color-accent)' }}
          >
            {current.arabic}
          </p>
        </div>

        {/* Urdu Translation in Spacious Nastaleeq */}
        <div className="max-w-3xl mx-auto pt-2">
          <p 
            className="font-nastaleeq text-base sm:text-lg lg:text-xl font-medium leading-[2.2] sm:leading-[2.4] opacity-90 select-text"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {current.urdu}
          </p>
        </div>

        {/* Reference & Citation Badges */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold">
          <span 
            className="font-amiri font-bold px-3.5 py-1.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--color-bg-app)',
              borderColor: 'var(--color-border-theme)',
              color: 'var(--color-accent)',
            }}
            lang="ar"
          >
            {current.referenceAr}
          </span>

          <span 
            className="font-nastaleeq px-3.5 py-1.5 rounded-xl border opacity-80"
            style={{
              backgroundColor: 'var(--color-bg-app)',
              borderColor: 'var(--color-border-theme)',
            }}
          >
            {current.referenceUr}
          </span>

          <span 
            className="font-amiri font-bold px-3 py-1.5 rounded-xl border opacity-85"
            style={{
              backgroundColor: 'var(--color-badge-bg)',
              borderColor: 'var(--color-accent)',
            }}
          >
            {current.source}
          </span>

          {current.bookId && current.pageId && onOpenReader && (
            <button
              onClick={() => onOpenReader(current.bookId!, current.pageId!, current.source)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              <BookOpen className="w-3.5 h-3.5 ml-1" />
              <span>شاملہ میں مطالعہ کریں</span>
            </button>
          )}

          <a
            href={current.shamelaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold opacity-80 hover:opacity-100 transition-all"
            style={{ borderColor: 'var(--color-border-theme)' }}
          >
            <span>shamela.ws ↗</span>
            <ExternalLink className="w-3.5 h-3.5 mr-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
