'use client';
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { PlanCard } from '@/components/molecules/PlanCard';
import { Skeleton } from '@/components/atoms/index';
import { Button } from '@/components/atoms/Button';
import { usePlans, useCountries } from '@/hooks';
import { useCartStore } from '@/store';
import { ROUTES, SORT_OPTIONS } from '@/constants';
import { Search, X } from 'lucide-react';
import type { PlanFilters, Plan } from '@/types';
import { usePersonalizationStore } from '@/features/personalization/PersonalizationWidgets';

export default function BuyPlanPage() {
  const router = useRouter();
  const { setItem } = useCartStore();
  const { addRecentlyViewed } = usePersonalizationStore();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<PlanFilters>({});

  const { data: plansData, isLoading: plansLoading } = usePlans({
    ...filters,
    search: search || undefined,
  });
  const { data: countries, isLoading: countriesLoading } = useCountries();

  const handleSelect = useCallback(
    (plan: Plan) => {
      setItem({
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        currency: plan.currency,
        data: plan.data,
        validity: plan.validity,
        countryName: plan.country.name,
      });
      addRecentlyViewed({
        id: plan.id,
        name: plan.name,
        countryName: plan.country.name,
        flag: plan.country.flag,
        price: plan.price,
        currency: plan.currency,
        data: plan.data,
        viewedAt: Date.now(),
      });
      router.push(ROUTES.CHECKOUT);
    },
    [setItem, router, addRecentlyViewed],
  );

  const handleFilter = (key: keyof PlanFilters, value: string | number | undefined) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clear = () => {
    setFilters({});
    setSearch('');
  };
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          <h1 className="mb-1 font-display text-2xl font-bold">Buy a Plan</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Choose the perfect data plan for your destination
          </p>

          {/* Search & Filters */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="relative min-w-56 flex-1">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries or plans..."
                aria-label="Search plans"
                className="h-10 w-full rounded-md border bg-background pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <select
              value={filters.country || ''}
              onChange={(e) => handleFilter('country', e.target.value || undefined)}
              aria-label="Filter by country"
              className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Countries</option>
              {countriesLoading ? (
                <option disabled>Loading...</option>
              ) : (
                countries?.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))
              )}
            </select>

            <select
              value={filters.sortBy || ''}
              onChange={(e) =>
                handleFilter('sortBy', (e.target.value as PlanFilters['sortBy']) || undefined)
              }
              aria-label="Sort plans"
              className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sort: Default</option>
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                leftIcon={<X className="h-3 w-3" />}
              >
                Clear ({activeCount})
              </Button>
            )}
          </div>

          {/* Results count */}
          {plansData && (
            <p className="mb-5 text-sm text-muted-foreground" aria-live="polite">
              {plansData.total} plans available
            </p>
          )}

          {/* Plans Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {plansLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-80 rounded-xl" />
                ))
              : plansData?.data.map((plan, i) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <PlanCard plan={plan} onSelect={handleSelect} />
                  </motion.div>
                ))}
          </div>

          {!plansLoading && plansData?.data.length === 0 && (
            <div className="py-24 text-center">
              <p className="mb-3 text-4xl" aria-hidden="true">
                🔍
              </p>
              <h2 className="mb-2 text-lg font-semibold">No plans found</h2>
              <p className="mb-5 text-sm text-muted-foreground">
                Try different search terms or clear your filters.
              </p>
              <Button onClick={clear}>Clear Filters</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
