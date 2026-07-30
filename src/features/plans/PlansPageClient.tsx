'use client';
/**
 * Plans Page Client — CLIENT COMPONENT
 * ======================================
 * Receives pre-fetched plans from Server Component as props.
 * Handles interactive search, filter, sort — no data fetching here.
 * This is the "client island" in the Server Component architecture.
 */
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal, Globe } from 'lucide-react';
import { PlanCard } from '@/components/molecules/PlanCard';
import { Button } from '@/components/atoms/Button';
import { usePersonalizationStore } from '@/features/personalization/PersonalizationWidgets';
import { useCartStore } from '@/store';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import { cn } from '@/utils';
import type { Plan, Country } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

const REGIONS = ['All', 'Asia', 'Europe', 'Americas', 'Oceania', 'Africa', 'Middle East'];

interface Props {
  initialPlans: Plan[];
  countries?: Country[]; // Optional structured to avoid unused type warnings
}

export function PlansPageClient({ initialPlans }: Props) {
  const router = useRouter();
  const { setItem } = useCartStore();
  const { addRecentlyViewed } = usePersonalizationStore();

  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  const debounced = useDebounce(search, 250);

  // Filter + sort entirely client-side (data already fetched by server)
  const filtered = useMemo(() => {
    let plans = [...initialPlans];

    if (debounced) {
      const q = debounced.toLowerCase();
      plans = plans.filter(
        (p) => p.name.toLowerCase().includes(q) || p.country.name.toLowerCase().includes(q),
      );
    }
    if (region !== 'All') {
      plans = plans.filter((p) => p.country.region === region || p.country.continent === region);
    }
    switch (sortBy) {
      case 'price_asc':
        return plans.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return plans.sort((a, b) => b.price - a.price);
      case 'data_desc':
        return plans.sort((a, b) => b.data - a.data);
      default:
        return plans;
    }
  }, [initialPlans, debounced, region, sortBy]);

  const handleSelect = (plan: Plan) => {
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
  };

  const clearFilters = () => {
    setSearch('');
    setRegion('All');
    setSortBy('popular');
  };
  const hasFilters = !!search || region !== 'All' || sortBy !== 'popular';

  return (
    <div className="container mx-auto px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="mb-3 font-display text-3xl font-bold md:text-4xl">eSIM Plans</h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Instant connectivity in 190+ countries. No contract, no roaming fees.
        </p>
      </div>

      {/* Search + Sort + Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by country or region…"
            aria-label="Search plans"
            className="h-10 w-full rounded-md border bg-background pl-9 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort plans"
          className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="data_desc">Most Data</option>
        </select>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          aria-expanded={showFilters}
        >
          Filter
        </Button>
      </div>

      {/* Region filter */}
      {showFilters && (
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by region">
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                region === r
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'hover:bg-muted',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Results summary */}
      <div className="mb-5 flex items-center justify-between" aria-live="polite">
        <p className="text-sm text-muted-foreground">
          {filtered.length} plan{filtered.length !== 1 ? 's' : ''} available
        </p>
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            leftIcon={<X className="h-3.5 w-3.5" />}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Plan grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Globe className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <h2 className="mb-2 text-lg font-semibold">No plans found</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <PlanCard plan={plan} onSelect={handleSelect} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
