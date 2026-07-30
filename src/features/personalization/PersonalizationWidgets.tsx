'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Clock, Sparkles, X } from 'lucide-react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { formatCurrency, formatDataGB } from '@/utils';
import { ROUTES } from '@/constants';
import type { Plan, Country } from '@/types';

// ============================================================
// PERSONALIZATION STORE
// ============================================================

interface RecentPlan {
  id: string;
  name: string;
  countryName: string;
  flag: string;
  price: number;
  currency: string;
  data: number;
  viewedAt: number;
}

interface PersonalizationStore {
  savedCountries: string[]; // country codes
  recentlyViewed: RecentPlan[]; // max 10
  toggleSaved: (code: string) => void;
  isSaved: (code: string) => boolean;
  addRecentlyViewed: (plan: RecentPlan) => void;
  clearRecent: () => void;
}

export const usePersonalizationStore = create<PersonalizationStore>()(
  persist(
    (set, get) => ({
      savedCountries: [],
      recentlyViewed: [],
      toggleSaved: (code) =>
        set((s) => ({
          savedCountries: s.savedCountries.includes(code)
            ? s.savedCountries.filter((c) => c !== code)
            : [...s.savedCountries, code],
        })),
      isSaved: (code) => get().savedCountries.includes(code),
      addRecentlyViewed: (plan) =>
        set((s) => ({
          recentlyViewed: [plan, ...s.recentlyViewed.filter((p) => p.id !== plan.id)].slice(0, 10),
        })),
      clearRecent: () => set({ recentlyViewed: [] }),
    }),
    { name: 'personalization', storage: createJSONStorage(() => localStorage) },
  ),
);

// ============================================================
// SAVE COUNTRY BUTTON
// ============================================================

export function SaveCountryButton({
  countryCode,
  className,
}: {
  countryCode: string;
  className?: string;
}) {
  const { toggleSaved, isSaved } = usePersonalizationStore();
  const saved = isSaved(countryCode);

  return (
    <button
      onClick={() => toggleSaved(countryCode)}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved destinations' : 'Save destination'}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        saved
          ? 'border-red-200 bg-red-50 text-red-500'
          : 'border-border text-muted-foreground hover:bg-muted'
      } ${className ?? ''}`}
    >
      <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} aria-hidden="true" />
    </button>
  );
}

// ============================================================
// SAVED COUNTRIES WIDGET
// ============================================================

interface SavedCountriesWidgetProps {
  countries: Country[];
}

export function SavedCountriesWidget({ countries }: SavedCountriesWidgetProps) {
  const { savedCountries, toggleSaved } = usePersonalizationStore();
  const saved = countries.filter((c) => savedCountries.includes(c.code));

  if (saved.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-6 text-center">
        <Heart className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="mb-1 text-sm font-medium">No saved destinations yet</p>
        <p className="text-xs text-muted-foreground">
          Tap the heart icon on any country to save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <Heart className="h-4 w-4 fill-red-500 text-red-500" aria-hidden="true" /> Saved
        Destinations
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {saved.map((c) => (
          <li key={c.code}>
            <div className="group relative flex items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50">
              <Link
                href={`${ROUTES.COUNTRIES}/${c.code.toLowerCase()}`}
                className="flex min-w-0 flex-1 items-center gap-2"
              >
                <span className="flex-shrink-0 text-xl" role="img" aria-label={c.name}>
                  {c.flag}
                </span>
                <span className="truncate text-sm font-medium">{c.name}</span>
              </Link>
              <button
                onClick={() => toggleSaved(c.code)}
                className="flex-shrink-0 rounded text-muted-foreground opacity-0 transition-colors hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100"
                aria-label={`Remove ${c.name} from saved`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// RECENTLY VIEWED PLANS WIDGET
// ============================================================

export function RecentlyViewedWidget() {
  const { recentlyViewed, clearRecent } = usePersonalizationStore();

  if (recentlyViewed.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Clock className="h-4 w-4 text-primary" aria-hidden="true" /> Recently Viewed
        </h2>
        <button
          onClick={clearRecent}
          className="text-xs text-muted-foreground transition-colors hover:text-destructive"
          aria-label="Clear recently viewed history"
        >
          Clear
        </button>
      </div>
      <ul className="space-y-2">
        {recentlyViewed.slice(0, 5).map((plan, i) => (
          <motion.li
            key={`${plan.id}-${plan.viewedAt}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`${ROUTES.BUY_PLAN}?planId=${plan.id}`}
              className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex-shrink-0 text-lg" role="img" aria-label={plan.countryName}>
                  {plan.flag}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDataGB(plan.data)} · {plan.countryName}
                  </p>
                </div>
              </div>
              <span className="flex-shrink-0 text-sm font-semibold">
                {formatCurrency(plan.price, plan.currency)}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================
// RECOMMENDED PLANS WIDGET (based on activity)
// ============================================================

interface RecommendedPlansWidgetProps {
  plans: Plan[];
}

export function RecommendedPlansWidget({ plans }: RecommendedPlansWidgetProps) {
  const { recentlyViewed, savedCountries } = usePersonalizationStore();

  // Simple recommendation: prioritize plans matching saved/recently-viewed countries
  const interestedCountries = new Set([
    ...savedCountries,
    ...recentlyViewed.map((p) => p.countryName),
  ]);

  const recommended = plans
    .filter(
      (p) => interestedCountries.has(p.country.code) || interestedCountries.has(p.country.name),
    )
    .slice(0, 4);

  const fallback = recommended.length > 0 ? recommended : plans.slice(0, 4);

  if (fallback.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-5">
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        <Sparkles className="h-4 w-4 text-yellow-500" aria-hidden="true" /> Recommended For You
      </h2>
      <ul className="space-y-2">
        {fallback.map((plan, i) => (
          <motion.li
            key={plan.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              href={`${ROUTES.BUY_PLAN}?planId=${plan.id}`}
              className="flex items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex-shrink-0 text-lg" role="img" aria-label={plan.country.name}>
                  {plan.country.flag}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDataGB(plan.data)} · {plan.country.name}
                  </p>
                </div>
              </div>
              <span className="flex-shrink-0 text-sm font-semibold">
                {formatCurrency(plan.price, plan.currency)}
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
