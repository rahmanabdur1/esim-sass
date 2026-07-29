'use client';

/**
 * Orders Page — CLIENT COMPONENT
 * ==============================
 * Orders fetched via client hook (useOrders)
 */

import React from 'react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Badge, Skeleton } from '@/components/atoms/index';
import { DataTable } from '@/components/data-table/DataTable';
import { useOrders } from '@/hooks';
import { ORDER_STATUS_CONFIG, ROUTES } from '@/constants';
import { formatCurrency, formatDate } from '@/utils';
import Link from 'next/link';
import { Package } from 'lucide-react';
import type { ColumnDef } from '@/components/data-table/DataTable';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

const columns: ColumnDef<Order>[] = [
  {
    key: 'orderNumber',
    header: 'Order',
    cell: (row) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{row.orderNumber ?? row.id.slice(0, 8)}
      </span>
    ),
  },
  {
    key: 'plan',
    header: 'Plan',
    cell: (row) => (
      <div className="flex items-center gap-2">
        <span role="img" aria-label={row.plan.country.name}>
          {row.plan.country.flag}
        </span>
        <div>
          <p className="text-sm font-medium">{row.plan.name}</p>
          <p className="text-xs text-muted-foreground">{row.plan.country.name}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'totalAmount',
    header: 'Amount',
    align: 'right' as const,
    sortable: true,
    getValue: (row) => row.totalAmount,
    cell: (row) => (
      <span className="font-semibold">{formatCurrency(row.totalAmount, row.currency)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    align: 'center' as const,
    cell: (row) => {
      const cfg = ORDER_STATUS_CONFIG[row.status as keyof typeof ORDER_STATUS_CONFIG] ?? {
        label: row.status,
        bg: 'bg-muted',
        color: 'text-foreground',
      };

      return <Badge className={`${cfg.bg} ${cfg.color} border-0 text-xs`}>{cfg.label}</Badge>;
    },
  },
  {
    key: 'createdAt',
    header: 'Date',
    sortable: true,
    getValue: (row) => row.createdAt,
    cell: (row) => (
      <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
    ),
  },
];

export default function OrdersPage() {
  const { data, isLoading } = useOrders();
  const orders = data?.data ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Order History</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>

          <Button asChild variant="gradient" leftIcon={<Package className="h-4 w-4" />}>
            <Link href={ROUTES.BUY_PLAN}>New Plan</Link>
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 font-semibold">No orders yet</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Your purchase history will appear here.
            </p>
            <Button asChild variant="gradient">
              <Link href={ROUTES.BUY_PLAN}>Browse Plans</Link>
            </Button>
          </div>
        ) : (
          <DataTable
            data={orders}
            columns={columns}
            searchable
            exportable
            exportFilename="orders"
            pageSize={10}
            caption="Order history"
            aria-label="Order history table"
            rowClassName={(row) => (row.status === 'failed' ? 'bg-red-50/30' : '')}
          />
        )}
      </main>
    </div>
  );
}
