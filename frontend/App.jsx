import { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';
import { WatchlistProvider } from '@/context/WatchlistContext';
import { AppRoutes } from '@/routes/AppRoutes';
import { WifiOff } from 'lucide-react';

function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="sticky top-0 left-0 right-0 z-50 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-bounce select-none border-b"
      style={{
        background: 'var(--cw-button, #E23C64)',
        color: '#FFF',
        borderColor: 'color-mix(in srgb, var(--cw-text, #FFF) 15%, transparent)',
        boxShadow: '0 4px 20px rgba(226,60,100,0.3)',
      }}
    >
      <WifiOff size={14} className="animate-pulse" />
      <span>No internet connection. Operating in offline demonstration mode.</span>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <WatchlistProvider>
            <BrowserRouter>
              <OfflineBanner />
              <AppRoutes />
            </BrowserRouter>
          </WatchlistProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
