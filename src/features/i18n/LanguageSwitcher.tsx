'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/utils';
import { LOCALES, LOCALE_NAMES, LOCALE_FLAGS, type Locale } from '@/lib/i18n/translations';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface I18nStore {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist((set) => ({ locale: 'en', setLocale: (locale) => set({ locale }) }), {
    name: 'i18n-locale',
    storage: createJSONStorage(() => localStorage),
  }),
);

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { locale, setLocale } = useI18nStore();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Current language: ${LOCALE_NAMES[locale]}. Click to change.`}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Globe className="h-4 w-4" aria-hidden="true" />
        {!compact && (
          <span className="hidden sm:inline">
            {LOCALE_FLAGS[locale]} {LOCALE_NAMES[locale]}
          </span>
        )}
        {compact && <span>{LOCALE_FLAGS[locale]}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.ul
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              aria-label="Select language"
              className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border bg-popover py-1 shadow-lg"
            >
              {LOCALES.map((loc) => (
                <li key={loc} role="option" aria-selected={locale === loc}>
                  <button
                    onClick={() => {
                      setLocale(loc);
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent',
                      locale === loc && 'bg-primary/5 text-primary',
                    )}
                    lang={loc}
                    dir={loc === 'ar' ? 'rtl' : 'ltr'}
                  >
                    <span className="text-base" aria-hidden="true">
                      {LOCALE_FLAGS[loc]}
                    </span>
                    <span className="flex-1 text-left">{LOCALE_NAMES[loc]}</span>
                    {locale === loc && (
                      <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
