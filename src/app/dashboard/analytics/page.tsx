'use client';

export const dynamic = 'force-dynamic';
import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Skeleton } from '@/components/atoms/index';
import { useAnalytics } from '@/hooks';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

type Period = 'daily' | 'weekly' | 'monthly';

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('daily');
  const { data, isLoading } = useAnalytics();
  const chartData = data?.[period] ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">Usage Analytics</h1>
        <p className="mb-6 text-sm text-muted-foreground">Track your data consumption over time</p>

        {/* Period tabs */}
        <div className="mb-6 flex gap-2" role="tablist" aria-label="Select analytics period">
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-4 py-2 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${period === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-6 font-semibold">Data Usage ({period})</h2>
          {isLoading ? (
            <Skeleton className="h-72 w-full" />
          ) : chartData.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="h-72" role="img" aria-label={`${period} data usage chart`}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" unit=" GB" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value} GB`]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="used"
                    name="Used"
                    stroke="#3b82f6"
                    fill="url(#usedGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#e2e8f0"
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
