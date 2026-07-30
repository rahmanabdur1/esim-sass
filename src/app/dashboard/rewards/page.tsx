'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Skeleton } from '@/components/atoms/index';
import { useRewards } from '@/hooks';
import { formatDate } from '@/utils';
import { Star, TrendingUp, Award } from 'lucide-react';
import { REWARD_TIERS } from '@/constants';
import { AchievementGrid, type UserStats } from '@/features/gamification/Achievements';

export default function RewardsPage() {
  const { data, isLoading } = useRewards();
  const tier = data ? REWARD_TIERS[data.tier] : null;
  const nextTier = data
    ? Object.values(REWARD_TIERS).find((t) => t.minPoints > (tier?.minPoints ?? 0))
    : null;
  const progress =
    tier && nextTier
      ? ((data!.points - tier.minPoints) / (nextTier.minPoints - tier.minPoints)) * 100
      : 100;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="max-w-4xl flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">Rewards Program</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Earn points on every purchase and unlock exclusive benefits
        </p>

        {/* Tier Card */}
        {isLoading ? (
          <Skeleton className="mb-6 h-48 rounded-2xl" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-brand relative mb-6 overflow-hidden rounded-2xl p-8 text-white"
          >
            <div
              className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10"
              aria-hidden="true"
            />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-blue-100">Current Tier</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-7 w-7" aria-hidden="true" />
                    <h2 className="font-display text-3xl font-bold capitalize">{data?.tier}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="mb-1 text-sm text-blue-100">Total Points</p>
                  <p className="font-display text-4xl font-bold">{data?.points.toLocaleString()}</p>
                </div>
              </div>
              {nextTier && (
                <div>
                  <div className="mb-1.5 flex justify-between text-xs text-blue-100">
                    <span>{data?.points.toLocaleString()} pts</span>
                    <span>{nextTier.minPoints.toLocaleString()} pts to next tier</span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full bg-white/20"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Progress to next tier"
                  >
                    <div
                      className="h-full rounded-full bg-white transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-blue-100">
                    {(nextTier.minPoints - (data?.points ?? 0)).toLocaleString()} more points to
                    reach{' '}
                    {Object.keys(REWARD_TIERS).find(
                      (k) =>
                        REWARD_TIERS[k as keyof typeof REWARD_TIERS].minPoints ===
                        nextTier.minPoints,
                    )}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tiers overview */}
        <section aria-labelledby="tiers-heading" className="mb-6 rounded-xl border bg-card p-6">
          <h2 id="tiers-heading" className="mb-4 font-semibold">
            All Tiers
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {Object.entries(REWARD_TIERS).map(([key, t]) => {
              const isActive = data?.tier === key;
              return (
                <div
                  key={key}
                  className={`rounded-lg border p-4 text-center transition-all ${isActive ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'bg-muted/40'}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div className="mb-2 text-2xl" aria-hidden="true" style={{ color: t.color }}>
                    ⬟
                  </div>
                  <p className="text-sm font-semibold capitalize">{key}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.minPoints.toLocaleString()}+ pts
                  </p>
                  {isActive && (
                    <span className="mt-2 inline-block text-xs font-medium text-primary">
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Transaction history */}
        <section aria-labelledby="tx-heading" className="rounded-xl border bg-card p-6">
          <h2 id="tx-heading" className="mb-4 flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" aria-hidden="true" /> Points History
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : !data?.history.length ? (
            <div className="py-10 text-center">
              <Star className="mx-auto mb-2 h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                No transactions yet. Make a purchase to earn your first points!
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {data.history.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${tx.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {tx.type === 'earned' ? '+' : '−'}
                    {tx.points.toLocaleString()} pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Achievements / Gamification */}
        <section
          aria-labelledby="achievements-heading"
          className="mt-6 rounded-xl border bg-card p-6"
        >
          <AchievementGrid
            stats={
              {
                totalPurchases: data?.history.filter((h) => h.type === 'earned').length ?? 0,
                totalCountries: 0,
                totalReferrals: 0,
                accountAgeMonths: 0,
                consecutiveMonths: 0,
                totalSpent: 0,
              } as UserStats
            }
          />
        </section>
      </main>
    </div>
  );
}
