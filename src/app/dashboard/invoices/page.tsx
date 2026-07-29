'use client';
import React from 'react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Badge, Skeleton } from '@/components/atoms/index';
import { useOrders } from '@/hooks';
import { ordersService } from '@/services/orders.service';
import { formatCurrency, formatDate, downloadBlob } from '@/utils';
import { FileText, Download } from 'lucide-react';
import { useState } from 'react';

export default function InvoicesPage() {
  const { data, isLoading } = useOrders();
  const [downloading, setDownloading] = useState<string | null>(null);
  const completed = data?.data.filter(o => o.status === 'completed') ?? [];

  const handleDownload = async (orderId: string) => {
    setDownloading(orderId);
    try {
      const blob = await ordersService.downloadInvoice(orderId);
      downloadBlob(blob, `invoice-${orderId}.pdf`);
    } finally { setDownloading(null); }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl">
        <h1 className="font-display text-2xl font-bold mb-1">Invoices</h1>
        <p className="text-muted-foreground text-sm mb-6">{completed.length} invoice{completed.length !== 1 ? 's' : ''} available</p>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        ) : !completed.length ? (
          <div className="py-20 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-muted-foreground" aria-hidden="true" />
            <p className="font-semibold mb-1">No invoices yet</p>
            <p className="text-sm text-muted-foreground">Completed orders will generate downloadable invoices here.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full" aria-label="Invoice history">
              <thead className="border-b bg-muted/50">
                <tr>
                  {['Invoice #', 'Plan', 'Date', 'Amount', 'Download'].map(h => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {completed.map(order => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">INV-{order.id.slice(0,8).toUpperCase()}</td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium">{order.plan.name}</p>
                      <p className="text-xs text-muted-foreground">{order.plan.country.name}</p>
                    </td>
                    <td className="px-4 py-4 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-4 text-sm font-semibold">{formatCurrency(order.totalAmount, order.currency)}</td>
                    <td className="px-4 py-4">
                      <Button size="sm" variant="outline" onClick={() => handleDownload(order.id)} isLoading={downloading === order.id}
                        leftIcon={<Download className="h-3.5 w-3.5" />} aria-label={`Download invoice ${order.id.slice(0,8)}`}>
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
