import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error in Library App:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem('shamela_library_books_v2');
      localStorage.removeItem('shamela_library_categories_v2');
      localStorage.removeItem('maktabah_shamela_theme_id_v2');
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4 bg-[#080808] text-slate-100 font-nastaleeq"
          dir="rtl"
        >
          <div className="max-w-md w-full bg-[#181818] border border-red-900/50 rounded-2xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/60 border border-red-700/50 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white mb-2">
                ایپلی کیشن میں عارضی رکاوٹ پیش آئی ہے
              </h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                صفحہ دوبارہ لوڈ کریں یا اگر مسئلہ برقرار رہے تو عارضی کیشے ری سیٹ کریں۔
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-black/40 rounded-xl text-left font-mono text-xs text-red-300 border border-red-950 overflow-x-auto max-h-28" dir="ltr">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-950/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>دوبارہ لوڈ کریں (Reload)</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm border border-slate-700 transition-all"
                title="کیچ ری سیٹ کریں"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ری سیٹ (Reset)</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
