'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Plane, Calendar, Clock, Wifi,
  CheckCircle, ArrowRight, Star,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { useCountries, usePlans } from '@/hooks';
import { useCartStore } from '@/store';
import { formatCurrency, formatDataGB } from '@/utils';
import { ROUTES } from '@/constants';
import type { Country, Plan } from '@/types';

interface TravelInput {
  countryCode: string;
  startDate: string;
  endDate: string;
  dailyUsageGB: number;
}

const USAGE_PROFILES = [
  { label: 'Light', gb: 0.5, desc: 'Email, maps, messaging' },
  { label: 'Moderate', gb: 1.5, desc: 'Social media, streaming light' },
  { label: 'Heavy', gb: 3, desc: 'Video calls, HD streaming' },
  { label: 'Power', gb: 5, desc: 'Work remotely, hotspot sharing' },
] as const;

function getDurationDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function getBestPlan(plans: Plan[], neededGB: number, days: number): Plan | null {
  if (!plans.length) return null;
  const valid = plans.filter((p) => p.data >= neededGB && p.validity >= days);
  
  if (!valid.length) {
    return plans.reduce((max, current) => (current.data > max.data ? current : max))!;
  }
  
  return valid.reduce((min, current) => (current.price < min.price ? current : min))!;
}

export function TravelPlanner() {
  const router = useRouter();
  const { setItem } = useCartStore();

  const [step, setStep] = useState<'input' | 'result'>('input');
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState<TravelInput>({
    countryCode: '',
    startDate: '',
    endDate: '',
    dailyUsageGB: 1.5,
  });

  // Queries
  const { data: countriesData } = useCountries();
  const countries: Country[] = countriesData ?? [];

  const { data: plansData } = usePlans({
    country: input.countryCode || undefined,
  });
  const plans: Plan[] = plansData?.data ?? [];

  // Derived metrics
  const days = getDurationDays(input.startDate, input.endDate);
  const neededGB = Math.ceil(input.dailyUsageGB * days * 1.15);
  const selectedCountry = countries.find((c) => c.code === input.countryCode);

  const bestPlan = step === 'result' ? getBestPlan(plans, neededGB, days) : null;

  const valuePlan =
    step === 'result' && plans.length > 1
      ? plans.reduce((best, current) =>
          current.price / current.data < best.price / best.data ? current : best,
          plans[0]!
        )
      : null;

  const handleAnalyse = useCallback(async () => {
    if (!input.countryCode || !input.startDate || !input.endDate) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setStep('result');
  }, [input]);

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
    router.push(ROUTES.CHECKOUT);
  };

  return (
    <div className="space-y-6">
      {/* Input Step */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-5">
          <Plane className="h-4 w-4 text-primary" aria-hidden="true" /> Travel Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {/* Country Selection */}
          <div className="sm:col-span-2">
            <label htmlFor="tp-country" className="block text-sm font-medium mb-1.5">
              Destination Country <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <select
              id="tp-country"
              value={input.countryCode}
              onChange={(e) => setInput((p) => ({ ...p, countryCode: e.target.value }))}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-required="true"
            >
              <option value="">Select a country…</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div>
            <label htmlFor="tp-start" className="block text-sm font-medium mb-1.5">
              Departure Date <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                id="tp-start"
                type="date"
                value={input.startDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setInput((p) => ({ ...p, startDate: e.target.value }))}
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-required="true"
              />
            </div>
          </div>

          <div>
            <label htmlFor="tp-end" className="block text-sm font-medium mb-1.5">
              Return Date <span className="text-destructive" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <input
                id="tp-end"
                type="date"
                value={input.endDate}
                min={input.startDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => setInput((p) => ({ ...p, endDate: e.target.value }))}
                className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-required="true"
              />
            </div>
          </div>
        </div>

        {/* Usage Profiles */}
        <fieldset className="mb-5">
          <legend className="block text-sm font-medium mb-2">Daily Data Usage</legend>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {USAGE_PROFILES.map((p) => (
              <label
                key={p.label}
                className={`flex flex-col gap-1 cursor-pointer rounded-lg border p-3 transition-all ${
                  input.dailyUsageGB === p.gb
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name="usage"
                  value={p.gb}
                  checked={input.dailyUsageGB === p.gb}
                  onChange={() => setInput((prev) => ({ ...prev, dailyUsageGB: p.gb }))}
                  className="sr-only"
                />
                <span className="text-sm font-semibold">{p.label}</span>
                <span className="text-xs text-primary font-medium">{p.gb} GB/day</span>
                <span className="text-xs text-muted-foreground">{p.desc}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {days > 0 && (
          <div className="rounded-lg bg-muted/50 p-3 flex flex-wrap gap-4 text-sm mb-5" aria-live="polite">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" /> <strong className="text-foreground">{days}</strong> days
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wifi className="h-4 w-4" aria-hidden="true" /> Estimated: <strong className="text-foreground">{neededGB} GB</strong>
            </span>
          </div>
        )}

        <Button
          onClick={handleAnalyse}
          isLoading={loading}
          variant="gradient"
          className="w-full"
          disabled={!input.countryCode || !input.startDate || !input.endDate || days <= 0}
        >
          {loading ? 'Finding Best Plans…' : 'Find My Perfect Plan'}
        </Button>
      </div>

      {/* Result Step */}
      <AnimatePresence>
        {step === 'result' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Trip Summary Header */}
            <div className="rounded-2xl gradient-brand p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl" role="img" aria-label={selectedCountry?.name}>
                  {selectedCountry?.flag}
                </span>
                <div>
                  <p className="text-sm text-blue-100">Trip to {selectedCountry?.name}</p>
                  <p className="font-display text-xl font-bold">{days} days · ~{neededGB} GB needed</p>
                </div>
              </div>

              {/* Travel Timeline */}
              <div className="relative mt-4" aria-label="Travel timeline">
                <div className="h-1 bg-white/20 rounded-full relative">
                  <div className="absolute inset-y-0 left-0 w-1/4 bg-white rounded-full" aria-hidden="true" />
                </div>
                <div className="grid grid-cols-4 mt-2 text-xs text-blue-100">
                  {['Purchase', 'Activate', 'Travel Start', 'Expiry'].map((label, i) => (
                    <div
                      key={label}
                      className={`flex flex-col gap-1 ${
                        i === 0 ? 'items-start' : i === 3 ? 'items-end' : 'items-center'
                      }`}
                    >
                      <span aria-hidden="true">●</span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Plan */}
            {bestPlan && (
              <div className="rounded-xl border-2 border-primary bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                  <span className="text-sm font-semibold text-primary">Recommended for Your Trip</span>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-lg">{bestPlan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDataGB(bestPlan.data)} · {bestPlan.validity} days validity · {bestPlan.network}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {bestPlan.data >= neededGB && (
                        <li className="flex items-center gap-1.5 text-xs text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> Covers your estimated {neededGB} GB
                        </li>
                      )}
                      <li className="flex items-center gap-1.5 text-xs text-green-600">
                        <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" /> Valid for {bestPlan.validity} days (your trip is {days} days)
                      </li>
                    </ul>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-2xl font-bold">{formatCurrency(bestPlan.price, bestPlan.currency)}</p>
                    <Button
                      size="sm"
                      variant="gradient"
                      className="mt-2"
                      onClick={() => handleSelect(bestPlan)}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Get This Plan
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Best Value Option */}
            {valuePlan && valuePlan.id !== bestPlan?.id && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Best Value per GB
                    </span>
                    <p className="font-bold text-md mt-0.5">{valuePlan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDataGB(valuePlan.data)} · {valuePlan.validity} days · {valuePlan.network}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-bold text-lg">{formatCurrency(valuePlan.price, valuePlan.currency)}</p>
                    <Button size="sm" variant="outline" className="mt-1" onClick={() => handleSelect(valuePlan)}>
                      Select Value
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* All Available Plans */}
            {plans.length > 1 && (
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">All Available Plans</h3>
                <div className="space-y-2">
                  {plans.slice(0, 5).map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow"
                    >
                      <div>
                        <p className="text-sm font-medium">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDataGB(plan.data)} · {plan.validity} days · {plan.network}
                        </p>
                        {plan.data < neededGB && (
                          <p className="text-xs text-yellow-600 mt-0.5">
                            ⚠ May not cover full {neededGB} GB estimate
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold">{formatCurrency(plan.price, plan.currency)}</p>
                        <Button size="sm" variant="outline" className="mt-1" onClick={() => handleSelect(plan)}>
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button variant="outline" className="w-full" onClick={() => setStep('input')}>
              ← Plan a Different Trip
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}