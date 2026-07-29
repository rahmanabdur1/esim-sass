'use client';
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Trash2, Scale, ArrowRight } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/index';
import { usePlans } from '@/hooks';
import { useCartStore } from '@/store';
import { formatCurrency, formatDataGB, formatValidity, cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useRouter } from 'next/navigation';
import type { Plan } from '@/types';

const MAX_COMPARE = 3;

interface CompareRow {
  label: string;
  getValue: (plan: Plan) => React.ReactNode;
  highlight?: boolean;
}

const COMPARE_ROWS: CompareRow[] = [
  {
    label: 'Price',
    getValue: (p) => <span className="font-bold text-lg">{formatCurrency(p.price, p.currency)}</span>,
    highlight: true,
  },
  {
    label: 'Data',
    getValue: (p) => <span className="font-semibold text-primary">{formatDataGB(p.data)}</span>,
    highlight: true,
  },
  {
    label: 'Validity',
    getValue: (p) => formatValidity(p.validity),
  },
  {
    label: 'Network',
    getValue: (p) => p.network,
  },
  {
    label: 'Price/GB',
    getValue: (p) => formatCurrency(p.price / (p.data || 1), p.currency),
  },
  {
    label: 'Coverage',
    getValue: (p) => p.country.name,
  },
  {
    label: 'Popular',
    getValue: (p) =>
      p.isPopular
        ? <Check className="h-4 w-4 text-green-500 mx-auto" aria-label="Yes" />
        : <X     className="h-4 w-4 text-muted-foreground mx-auto" aria-label="No" />,
  },
  {
    label: 'Best Value',
    getValue: (p) =>
      p.isBestValue
        ? <Check className="h-4 w-4 text-green-500 mx-auto" aria-label="Yes" />
        : <X     className="h-4 w-4 text-muted-foreground mx-auto" aria-label="No" />,
  },
];

export function PlanComparison() {
  const router = useRouter();
  const { setItem } = useCartStore();
  const { data: plansData, isLoading } = usePlans();
  const [selected, setSelected] = useState<Plan[]>([]);
  const [search,   setSearch]   = useState('');

  const plans = plansData?.data ?? [];

  const filteredPlans = plans.filter(
    (p) =>
      !selected.find((s) => s.id === p.id) &&
      (search === '' ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.country.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addPlan = useCallback(
    (plan: Plan) => {
      if (selected.length >= MAX_COMPARE) return;
      setSelected((prev) => [...prev, plan]);
    },
    [selected.length]
  );

  const removePlan = useCallback((id: string) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleSelect = (plan: Plan) => {
    setItem({
      planId:      plan.id,
      planName:    plan.name,
      price:       plan.price,
      currency:    plan.currency,
      data:        plan.data,
      validity:    plan.validity,
      countryName: plan.country.name,
    });
    router.push(ROUTES.CHECKOUT);
  };

  // Cheapest price per GB for highlighting
  const bestPricePerGB = selected.length > 1
    ? Math.min(...selected.map((p) => p.price / (p.data || 1)))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Scale className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 className="font-display text-xl font-bold">Compare Plans</h2>
        <Badge variant="secondary" className="ml-auto">
          {selected.length}/{MAX_COMPARE} selected
        </Badge>
      </div>

      {/* Plan picker */}
      {selected.length < MAX_COMPARE && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium mb-3">
            Add a plan to compare ({MAX_COMPARE - selected.length} slot{MAX_COMPARE - selected.length !== 1 ? 's' : ''} remaining)
          </p>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plans…"
            aria-label="Search plans to compare"
            className="h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mb-3"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                ))
              : filteredPlans.slice(0, 10).map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => addPlan(plan)}
                    className="flex items-center justify-between rounded-lg border bg-background p-3 text-left hover:border-primary hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Add ${plan.name} to comparison`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {plan.country.flag} {plan.country.name} · {formatDataGB(plan.data)} · {formatCurrency(plan.price, plan.currency)}
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-primary flex-shrink-0 ml-2" aria-hidden="true" />
                  </button>
                ))}
          </div>
        </div>
      )}

      {/* Comparison table */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Plan comparison table">
              <caption className="sr-only">
                Comparing {selected.length} eSIM plans side by side
              </caption>

              {/* Plan headers */}
              <thead>
                <tr className="border-b">
                  <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-muted-foreground w-32">
                    Feature
                  </th>
                  {selected.map((plan) => (
                    <th key={plan.id} scope="col" className="px-4 py-4 text-center min-w-44">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl" role="img" aria-label={plan.country.name}>
                          {plan.country.flag}
                        </span>
                        <p className="text-sm font-semibold">{plan.name}</p>
                        <div className="flex gap-1 flex-wrap justify-center">
                          {plan.isPopular   && <Badge variant="default"  className="text-xs">Popular</Badge>}
                          {plan.isBestValue && <Badge variant="success"  className="text-xs">Best Value</Badge>}
                          {bestPricePerGB !== null && (plan.price / (plan.data || 1)) === bestPricePerGB && (
                            <Badge variant="info" className="text-xs">Cheapest/GB</Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePlan(plan.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${plan.name} from comparison`}
                          leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        >
                          Remove
                        </Button>
                      </div>
                    </th>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: MAX_COMPARE - selected.length }).map((_, i) => (
                    <th key={`empty-${i}`} scope="col" className="px-4 py-4 text-center min-w-44">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                        <div className="h-8 w-8 rounded-full border-2 border-dashed flex items-center justify-center">
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <p className="text-xs text-muted-foreground">Add a plan</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Rows */}
              <tbody>
                {COMPARE_ROWS.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={cn(
                      'border-b last:border-0',
                      idx % 2 === 0 ? 'bg-background' : 'bg-muted/20',
                      row.highlight && 'bg-primary/5'
                    )}
                  >
                    <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">
                      {row.label}
                    </td>
                    {selected.map((plan) => (
                      <td key={plan.id} className="px-4 py-3 text-sm text-center">
                        {row.getValue(plan)}
                      </td>
                    ))}
                    {Array.from({ length: MAX_COMPARE - selected.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="px-4 py-3 text-center text-muted-foreground/30">—</td>
                    ))}
                  </tr>
                ))}

                {/* CTA row */}
                <tr className="bg-muted/30">
                  <td className="px-4 py-4 text-xs font-semibold text-muted-foreground">Buy</td>
                  {selected.map((plan) => (
                    <td key={plan.id} className="px-4 py-4 text-center">
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => handleSelect(plan)}
                        rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        aria-label={`Buy ${plan.name} for ${formatCurrency(plan.price, plan.currency)}`}
                      >
                        Buy Now
                      </Button>
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE - selected.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="px-4 py-4" />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {selected.length === 0 && (
        <div className="rounded-xl border-2 border-dashed py-16 text-center">
          <Scale className="mx-auto mb-3 h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold mb-1">No plans selected</p>
          <p className="text-sm text-muted-foreground">Add up to {MAX_COMPARE} plans above to compare them side by side.</p>
        </div>
      )}
    </div>
  );
}
