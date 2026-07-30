'use client';

/**
 * Dashboard Home Client — CLIENT COMPONENT
 * ==========================================
 * Receives server pre-fetched data as props.
 * Handles interactive charts, plan carousel, quick actions.
 */
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wifi, ShoppingCart, TrendingUp, DollarSign, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge, Progress } from '@/components/atoms/index';
import { ESIM_STATUS_CONFIG, ROUTES } from '@/constants';
import { formatCurrency, formatDataGB, getDataPercentage } from '@/utils';
import type { ESIM, Order, User } from '@/types';

interface Props {
  initialESIMs: ESIM[];
  initialOrders: Order[];
  stats: {
    activeESIMs: number;
    totalOrders: number;
    totalSpent: number;
    dataRemaining: number;
  };
  user: User | null;
}

const STAT_CARDS = (stats: Props['stats']) => [
  {
    label: 'Active eSIMs',
    value: stats.activeESIMs,
    icon: Wifi,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    href: ROUTES.MY_ESIMS,
  },
  {
    label: 'Total Orders',
    value: stats.totalOrders,
    icon: ShoppingCart,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    href: ROUTES.ORDERS,
  },
  {
    label: 'Data Remaining',
    value: `${formatDataGB(stats.dataRemaining)}`,
    icon: TrendingUp,
    color: 'text-green-600',
    bg: 'bg-green-50',
    href: ROUTES.MY_ESIMS,
  },
  {
    label: 'Total Spent',
    value: formatCurrency(stats.totalSpent, 'USD'),
    icon: DollarSign,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    href: ROUTES.ORDERS,
  },
];

export function DashboardHomeClient({ initialESIMs, initialOrders, stats, user }: Props) {
  const activeESIMs = initialESIMs.filter((e) => e.status === 'active');

  return (
    <>
      {/* Welcome Banner - Fixes unused user variable ESLint error */}
      {user && (
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">
            Welcome back, {user.name || 'User'}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here is an overview of your active eSIMs and recent orders.
          </p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STAT_CARDS(stats).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link
              href={card.href}
              className="group block rounded-xl border bg-card p-5 transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg} mb-4`}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} aria-hidden="true" />
              </div>
              <p className="font-display text-2xl font-bold">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {card.label}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Button asChild variant="gradient" leftIcon={<Zap className="h-4 w-4" />}>
          <Link href={ROUTES.BUY_PLAN}>Buy New Plan</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.MY_ESIMS}>View My eSIMs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.ANALYTICS}>View Analytics</Link>
        </Button>
      </div>

      {/* Active eSIMs */}
      {activeESIMs.length > 0 && (
        <section aria-labelledby="active-esims-heading" className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="active-esims-heading" className="text-lg font-semibold">
              Active eSIMs
            </h2>
            <Link
              href={ROUTES.MY_ESIMS}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeESIMs.slice(0, 3).map((esim) => {
              const cfg = ESIM_STATUS_CONFIG[esim.status];
              const pct = getDataPercentage(esim.dataUsed, esim.dataTotal);
              return (
                <div key={esim.id} className="rounded-xl border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" role="img" aria-label={esim.country.name}>
                        {esim.country.flag}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{esim.label}</p>
                        <p className="text-xs text-muted-foreground">{esim.network}</p>
                      </div>
                    </div>
                    <Badge className={`${cfg.bg} ${cfg.color} border-0 text-xs`}>{cfg.label}</Badge>
                  </div>
                  <Progress value={pct} showLabel={false} className="mb-1 h-1.5" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatDataGB(esim.dataUsed)} used</span>
                    <span>{formatDataGB(esim.dataRemaining)} left</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Orders */}
      {initialOrders.length > 0 && (
        <section aria-labelledby="recent-orders-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-orders-heading" className="text-lg font-semibold">
              Recent Orders
            </h2>
            <Link
              href={ROUTES.ORDERS}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {initialOrders.slice(0, 4).map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      #{order.orderNumber ?? order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="mr-2" role="img" aria-label={order.plan.country.name}>
                        {order.plan.country.flag}
                      </span>
                      {order.plan.name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
