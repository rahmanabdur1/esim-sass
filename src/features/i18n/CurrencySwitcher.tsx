'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DollarSign, Check } from 'lucide-react';
import { cn } from '@/utils';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE', flag: '🇪🇺' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB', flag: '🇬🇧' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', flag: '🇯🇵' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', flag: '🇦🇺' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', flag: '🇨🇦' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', flag: '🇸🇬' },
  BDT: { symbol: '৳', name: 'Bangladeshi Taka', locale: 'bn-BD', flag: '🇧🇩' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

// Exchange rates relative to USD (approximate, update via API in production)
const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.53,
  CAD: 1.36,
  SGD: 1.34,
  BDT: 110.5,
};

interface CurrencyStore {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
}

export const useCurrencyStore = create<CurrencyStore>()(
  persist((set) => ({ currency: 'USD', setCurrency: (currency) => set({ currency }) }), {
    name: 'currency-pref',
    storage: createJSONStorage(() => localStorage),
  }),
);

/** Convert USD amount to selected currency */
export function useCurrencyFormatter() {
  const { currency } = useCurrencyStore();
  const cfg = CURRENCIES[currency];

  const format = (usdAmount: number): string => {
    const converted = usdAmount * EXCHANGE_RATES[currency];
    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'JPY' || currency === 'BDT' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' || currency === 'BDT' ? 0 : 2,
    }).format(converted);
  };

  return { format, currency, symbol: cfg.symbol };
}

export function CurrencySwitcher({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency } = useCurrencyStore();
  const cfg = CURRENCIES[currency];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Current currency: ${cfg.name}. Click to change.`}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
        {!compact && (
          <span className="hidden sm:inline">
            {cfg.flag} {currency}
          </span>
        )}
        {compact && <span>{cfg.symbol}</span>}
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
              aria-label="Select currency"
              className="absolute right-0 top-full z-50 mt-1 max-h-72 w-52 overflow-hidden overflow-y-auto rounded-xl border bg-popover py-1 shadow-lg"
            >
              {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                const c = CURRENCIES[code];
                const active = currency === code;
                return (
                  <li key={code} role="option" aria-selected={active}>
                    <button
                      onClick={() => {
                        setCurrency(code);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-accent',
                        active && 'bg-primary/5 text-primary',
                      )}
                    >
                      <span className="w-6 flex-shrink-0 text-base" aria-hidden="true">
                        {c.flag}
                      </span>
                      <span className="flex-1 text-left">
                        <span className="font-medium">{code}</span>
                        <span className="ml-2 text-xs text-muted-foreground">{c.symbol}</span>
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        {c.name.split(' ')[0]}
                      </span>
                      {active && (
                        <Check
                          className="h-3.5 w-3.5 flex-shrink-0 text-primary"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
