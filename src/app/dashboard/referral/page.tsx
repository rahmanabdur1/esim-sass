'use client';
import React, { useState } from 'react';
// import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Skeleton, Badge } from '@/components/atoms/index';
import { useReferral } from '@/hooks';
import { formatCurrency, formatDate, copyToClipboard } from '@/utils';
import { Gift, Copy, Check, Users, DollarSign, Share2 } from 'lucide-react';

export default function ReferralPage() {
  const { data, isLoading } = useReferral();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!data?.code) return;
    await copyToClipboard(`https://esimplatform.com/register?ref=${data.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="max-w-4xl flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">Referral Program</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Earn rewards by inviting friends to eSIM Platform
        </p>

        {/* Hero banner */}
        <div className="gradient-brand relative mb-6 overflow-hidden rounded-2xl p-8 text-white">
          <div
            className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/10"
            aria-hidden="true"
          />
          <div className="relative">
            <Gift className="mb-3 h-10 w-10 text-white/80" aria-hidden="true" />
            <h2 className="mb-1 font-display text-2xl font-bold">Give $5, Get $5</h2>
            <p className="max-w-md text-sm text-blue-100">
              Share your referral link. When a friend makes their first purchase, they get $5 off
              and you earn $5 in rewards credit.
            </p>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: Users,
                label: 'Total Referrals',
                value: data?.totalReferrals ?? 0,
                sub: 'Friends invited',
              },
              {
                icon: Check,
                label: 'Successful',
                value: data?.successfulReferrals ?? 0,
                sub: 'Completed purchases',
              },
              {
                icon: DollarSign,
                label: 'Total Earned',
                value: formatCurrency(data?.totalEarned ?? 0, 'USD'),
                sub: 'In rewards credit',
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Referral link */}
        <section aria-labelledby="ref-link-heading" className="mb-6 rounded-xl border bg-card p-6">
          <h2 id="ref-link-heading" className="mb-4 flex items-center gap-2 font-semibold">
            <Share2 className="h-4 w-4 text-primary" aria-hidden="true" /> Your Referral Link
          </h2>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center overflow-hidden rounded-md border bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
              <span className="truncate">
                {isLoading ? 'Loading...' : `https://esimplatform.com/register?ref=${data?.code}`}
              </span>
            </div>
            <Button
              onClick={handleCopy}
              variant={copied ? 'secondary' : 'default'}
              leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              aria-label={copied ? 'Copied!' : 'Copy referral link'}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Share this link via email, social media, or messaging apps.
          </p>
        </section>

        {/* Referral history */}
        <section aria-labelledby="ref-history-heading" className="rounded-xl border bg-card p-6">
          <h2 id="ref-history-heading" className="mb-4 font-semibold">
            Referral History
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : !data?.referrals.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No referrals yet. Start sharing your link!
            </p>
          ) : (
            <ul className="divide-y">
              {data.referrals.map((ref) => (
                <li key={ref.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{ref.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(ref.joinedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-green-600">
                      {ref.status === 'completed' ? `+${formatCurrency(ref.reward, 'USD')}` : '—'}
                    </span>
                    <Badge
                      className={
                        ref.status === 'completed'
                          ? 'border-0 bg-green-100 text-green-700'
                          : 'border-0 bg-yellow-100 text-yellow-700'
                      }
                    >
                      {ref.status === 'completed' ? 'Earned' : 'Pending'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
