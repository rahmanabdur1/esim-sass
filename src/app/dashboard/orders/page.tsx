'use client';
/**
 * Orders Page — SERVER COMPONENT (SSR)
 * ======================================
 * Orders fetched on server — instant content, no loading state.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Badge, Skeleton } from '@/components/atoms/index';
import { DataTable } from '@/components/data-table/DataTable';
import { useOrders } from '@/hooks';
import { ORDER_STATUS_CONFIG, ROUTES } from '@/constants';
import { formatCurrency, formatDate } from '@/utils';
import Link from 'next/link';
import { Package, Download, ExternalLink } from 'lucide-react';
import type { ColumnDef } from '@/components/data-table/DataTable';
import type { Order } from '@/types';

export const dynamic = 'force-dynamic';

const columns: ColumnDef<Order>[] = [
  {
    key: 'orderNumber', header: 'Order',
    cell: (row) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{(row.orderNumber ?? row.id.slice(0, 8))}
      </span>
    ),
  },
  {
    key: 'plan', header: 'Plan',
    cell: (row) => (
      <div className="flex items-center gap-2">
        <span className="text-lg" role="img" aria-label={row.plan.country.name}>{row.plan.country.flag}</span>
        <div>
          <p className="text-sm font-medium">{row.plan.name}</p>
          <p className="text-xs text-muted-foreground">{row.plan.country.name}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'totalAmount', header: 'Amount', align: 'right' as const, sortable: true,
    getValue: (row) => row.totalAmount,
    cell: (row) => <span className="font-semibold">{formatCurrency(row.totalAmount, row.currency)}</span>,
  },
  {
    key: 'status', header: 'Status', align: 'center' as const,
    cell: (row) => {
      const cfg = ORDER_STATUS_CONFIG[row.status as keyof typeof ORDER_STATUS_CONFIG] ?? { label: row.status, bg: 'bg-muted', color: 'text-foreground' };
      return <Badge className={`${cfg.bg} ${cfg.color} border-0 text-xs`}>{cfg.label}</Badge>;
    },
  },
  {
    key: 'createdAt', header: 'Date', sortable: true,
    getValue: (row) => row.createdAt,
    cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
  },
];

export default function OrdersPage() {
  const { data, isLoading } = useOrders();
  const orders = data?.data ?? [];
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (id: string) => {
    setDownloading(id);
    await new Promise((r) => setTimeout(r, 800));
    setDownloading(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold">Order History</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <Button asChild variant="gradient" leftIcon={<Package className="h-4 w-4" />}>
            <Link href={ROUTES.BUY_PLAN}>New Plan</Link>
          </Button>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" aria-label="Loading orders" />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="font-semibold mb-2">No orders yet</h2>
            <p className="text-sm text-muted-foreground mb-4">Your purchase history will appear here.</p>
            <Button asChild variant="gradient"><Link href={ROUTES.BUY_PLAN}>Browse Plans</Link></Button>
          </div>
        ) : (
          <DataTable
            data={orders}
            columns={columns}
            searchable exportable
            exportFilename="orders"
            pageSize={10}
            caption="Order history"
            aria-label="Order history table"
            rowClassName={(row) => row.status === 'failed' ? 'bg-red-50/30' : ''}
          />
        )}
      </main>
    </div>
  );
}
