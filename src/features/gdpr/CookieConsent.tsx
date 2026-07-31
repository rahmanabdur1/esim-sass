'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Types ─────────────────────────────────────
interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface GDPRStore {
  consentGiven: boolean;
  preferences: CookiePreferences;
  consentDate: string | null;
  setConsent: (prefs: Omit<CookiePreferences, 'essential'>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  resetConsent: () => void;
}

// ─── Store (SSR SAFE) ──────────────────────────
export const useGDPRStore = create<GDPRStore>()(
  persist(
    (set) => ({
      consentGiven: false,
      preferences: {
        essential: true,
        analytics: false,
        marketing: false,
        preferences: false,
      },
      consentDate: null,

      setConsent: (prefs) =>
        set({
          consentGiven: true,
          consentDate: typeof window !== 'undefined' ? new Date().toISOString() : null,
          preferences: { essential: true, ...prefs },
        }),

      acceptAll: () =>
        set({
          consentGiven: true,
          consentDate: typeof window !== 'undefined' ? new Date().toISOString() : null,
          preferences: {
            essential: true,
            analytics: true,
            marketing: true,
            preferences: true,
          },
        }),

      rejectAll: () =>
        set({
          consentGiven: true,
          consentDate: typeof window !== 'undefined' ? new Date().toISOString() : null,
          preferences: {
            essential: true,
            analytics: false,
            marketing: false,
            preferences: false,
          },
        }),

      resetConsent: () =>
        set({
          consentGiven: false,
          consentDate: null,
        }),
    }),
    {
      name: 'gdpr-consent',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // 🔥 VERY IMPORTANT
    },
  ),
);

// ─── Component ─────────────────────────────────
export function CookieConsentBanner() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { consentGiven, acceptAll, rejectAll } = useGDPRStore();

  // 🔥 Prevent SSR mismatch
  if (!mounted) return null;

  if (consentGiven) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        role="dialog"
        aria-labelledby="cookie-title"
        className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-4 shadow-xl"
      >
        <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left */}
          <div className="flex items-start gap-3">
            <Cookie className="mt-1 h-5 w-5 text-primary" />
            <div>
              <h2 id="cookie-title" className="text-sm font-semibold">
                We use cookies 🍪
              </h2>
              <p className="text-xs text-muted-foreground">
                We use essential cookies to make our site work. With your consent, we may also use
                analytics and marketing cookies.
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={rejectAll}>
              Reject
            </Button>
            <Button onClick={acceptAll}>Accept All</Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
