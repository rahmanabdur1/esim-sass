'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X,  WifiOff } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

// ── Service Worker Registration ───────────────────────────────
export function PWAInit() {
  const [installPrompt,  setInstallPrompt]  = useState<Event | null>(null);
  const [showInstall,    setShowInstall]    = useState(false);
  const [isOnline,       setIsOnline]       = useState(true);
  const [showOffline,    setShowOffline]    = useState(false);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered:', reg.scope);
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const worker = reg.installing;
            if (worker) {
              worker.addEventListener('statechange', () => {
                if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available — could show update prompt
                  console.log('[PWA] New version available');
                }
              });
            }
          });
        })
        .catch((err) => console.error('[PWA] Registration failed:', err));
    }
  }, []);

  // Install prompt (PWA Add to Home Screen)
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Show install banner after 30s if user hasn't dismissed
      setTimeout(() => setShowInstall(true), 30_000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Online / Offline detection
  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true);  setShowOffline(false); };
    const handleOffline = () => { setIsOnline(false); setShowOffline(true);  };

    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    const prompt = installPrompt as unknown as { prompt: () => void; userChoice: Promise<{ outcome: string }> };
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') console.log('[PWA] User accepted install');
    setInstallPrompt(null);
    setShowInstall(false);
  };

  return (
    <>
      {/* Offline banner */}
      <AnimatePresence>
        {showOffline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{   y: -60, opacity: 0 }}
            role="status"
            aria-live="assertive"
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-orange-500 text-white text-sm font-medium py-2.5 px-4"
          >
            <WifiOff className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            You're offline. Some features may be unavailable.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back-online toast */}
      <AnimatePresence>
        {isOnline && !showOffline && (
          <></>
        )}
      </AnimatePresence>

      {/* Install prompt banner */}
      <AnimatePresence>
        {showInstall && installPrompt && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{   y: 80, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40 rounded-2xl border bg-card shadow-2xl p-4"
            role="dialog"
            aria-labelledby="pwa-install-title"
            aria-describedby="pwa-install-desc"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg">
                🌍
              </div>
              <div>
                <p id="pwa-install-title" className="font-semibold text-sm">Install eSIM Platform</p>
                <p id="pwa-install-desc"  className="text-xs text-muted-foreground mt-0.5">
                  Add to your home screen for faster access and offline support.
                </p>
              </div>
              <button
                onClick={() => setShowInstall(false)}
                className="ml-auto text-muted-foreground hover:text-foreground flex-shrink-0"
                aria-label="Dismiss install prompt"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setShowInstall(false)}>
                Not now
              </Button>
              <Button size="sm" variant="gradient" className="flex-1" onClick={handleInstall}
                leftIcon={<Download className="h-3.5 w-3.5" />}>
                Install
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
