import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  } catch (err) {
    console.error('Fatal initialization error:', err);
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#080808;color:#fff;font-family:sans-serif;padding:20px;text-align:center;">
        <div style="max-width:400px;background:#181818;border:1px solid #ef4444;border-radius:16px;padding:24px;">
          <h2 style="color:#ef4444;margin-bottom:12px;">ابتدائی خرابی پیش آئی ہے</h2>
          <p style="color:#aaa;font-size:14px;margin-bottom:16px;">ایپلی کیشن شروع ہونے میں رکاوٹ آئی ہے۔ براہ کرم صفحہ ریفریش کریں۔</p>
          <button onclick="window.location.reload()" style="background:#22c55e;color:#fff;border:none;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:bold;">دوبارہ لوڈ کریں (Reload)</button>
        </div>
      </div>
    `;
  }
}

