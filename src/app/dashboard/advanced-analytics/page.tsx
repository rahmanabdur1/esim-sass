'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Skeleton } from '@/components/atoms/index';
import { useAnalytics } from '@/hooks';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Wifi, DollarSign, Globe, BarChart2 } from 'lucide-react';

type Period = 'daily' | 'weekly' | 'monthly';

const SPENDING_DATA = [
  { month: 'Aug', spent: 12.99 }, { month: 'Sep', spent: 8.99  },
  { month: 'Oct', spent: 24.97 }, { month: 'Nov', spent: 6.99  },
  { month: 'Dec', spent: 19.98 }, { month: 'Jan', spent: 14.99 },
];

const COUNTRY_DATA = [
  { name: 'Japan',   value: 35, color: '#3b82f6' },
  { name: 'USA',     value: 25, color: '#8b5cf6' },
  { name: 'UK',      value: 20, color: '#10b981' },
  { name: 'France',  value: 12, color: '#f59e0b' },
  { name: 'Other',   value: 8,  color: '#6b7280' },
];

const KPI_CARDS = [
  { label: 'Total Data Used',    value: '47.3 GB', change: '+12%',  up: true,  icon: Wifi,       color: 'bg-blue-100   text-blue-600'   },
  { label: 'Total Spent',        value: '$88.91',  change: '+5%',   up: true,  icon: DollarSign, color: 'bg-green-100  text-green-600'  },
  { label: 'Countries Visited',  value: '6',       change: '+2',    up: true,  icon: Globe,      color: 'bg-purple-100 text-purple-600' },
  { label: 'Active Plans',       value: '2',       change: '-1',    up: false, icon: BarChart2,  color: 'bg-orange-100 text-orange-600' },
];

export default function AdvancedAnalyticsPage() {
  const [period, setPeriod] = useState<Period>('daily');
  const { data, isLoading } = useAnalytics();
  const chartData           = data?.[period] ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-1">Advanced Analytics</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Deep insights into your data usage, spending, and travel patterns.
        </p>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {KPI_CARDS.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border bg-card p-5"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color} mb-3`}>
                <kpi.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className={`text-xs mt-0.5 flex items-center gap-1 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                {kpi.up
                  ? <TrendingUp   className="h-3 w-3" aria-hidden="true" />
                  : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
                {kpi.change} vs last period
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {/* Data Usage Chart */}
          <section className="xl:col-span-2 rounded-xl border bg-card p-6" aria-labelledby="usage-chart-heading">
            <div className="flex items-center justify-between mb-5">
              <h2 id="usage-chart-heading" className="font-semibold">Data Usage</h2>
              <div className="flex gap-1.5" role="tablist" aria-label="Select usage period">
                {(['daily','weekly','monthly'] as Period[]).map((p) => (
                  <button
                    key={p}
                    role="tab"
                    aria-selected={period === p}
                    onClick={() => setPeriod(p)}
                    className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      period === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <Skeleton className="h-56 w-full" aria-label="Loading usage chart" />
            ) : (
              <div className="h-56" role="img" aria-label={`${period} data usage area chart`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} unit=" GB" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border:          '1px solid hsl(var(--border))',
                        borderRadius:    '8px',
                        fontSize:        '12px',
                      }}
                      formatter={(v: number) => [`${v} GB`]}
                    />
                    <Legend />
                    <Area
                      type="monotone" dataKey="used" name="Used (GB)"
                      stroke="#3b82f6" fill="url(#usedGrad)" strokeWidth={2}
                    />
                    <Area
                      type="monotone" dataKey="total" name="Total (GB)"
                      stroke="#e2e8f0" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Country Distribution */}
          <section className="rounded-xl border bg-card p-6" aria-labelledby="country-chart-heading">
            <h2 id="country-chart-heading" className="font-semibold mb-5">Top Destinations</h2>
            <div className="h-44 mb-4" role="img" aria-label="Country usage distribution pie chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COUNTRY_DATA}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {COUNTRY_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, 'Usage']}
                    contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5" aria-label="Country breakdown">
              {COUNTRY_DATA.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} aria-hidden="true" />
                    {c.name}
                  </span>
                  <span className="font-semibold">{c.value}%</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Spending Chart */}
        <section className="rounded-xl border bg-card p-6" aria-labelledby="spending-chart-heading">
          <h2 id="spending-chart-heading" className="font-semibold mb-5">Monthly Spending</h2>
          <div className="h-48" role="img" aria-label="Monthly spending bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPENDING_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Spent']}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                />
                <Bar dataKey="spent" name="Spent ($)" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
