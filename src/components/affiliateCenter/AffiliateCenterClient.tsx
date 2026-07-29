'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Link2, MousePointerClick, DollarSign, TrendingUp,
  Download, Copy, Check,
} from 'lucide-react';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { Button } from '@/components/atoms/Button';
import { DataTable, type ColumnDef } from '@/components/data-table/DataTable';
import { formatCurrency, copyToClipboard } from '@/utils';

const CLICK_DATA = [
  { day: 'Mon', clicks: 42  }, { day: 'Tue', clicks: 38  },
  { day: 'Wed', clicks: 65  }, { day: 'Thu', clicks: 51  },
  { day: 'Fri', clicks: 89  }, { day: 'Sat', clicks: 102 },
  { day: 'Sun', clicks: 76  },
];

interface AffiliateLink {
  id:          string;
  campaign:    string;
  url:         string;
  clicks:      number;
  conversions: number;
  earnings:    number;
  createdAt:   string;
}

const LINKS: AffiliateLink[] = [
  { id: '1', campaign: 'Blog — Japan Guide',     url: 'esimplatform.com/r/abc123', clicks: 1240, conversions: 87,  earnings: 217.50, createdAt: '2025-11-01' },
  { id: '2', campaign: 'YouTube — Travel Vlog',  url: 'esimplatform.com/r/def456', clicks: 3890, conversions: 234, earnings: 585.00, createdAt: '2025-10-15' },
  { id: '3', campaign: 'Instagram Bio',          url: 'esimplatform.com/r/ghi789', clicks: 890,  conversions: 41,  earnings: 102.50, createdAt: '2025-12-01' },
  { id: '4', campaign: 'Newsletter — Dec Promo', url: 'esimplatform.com/r/jkl012', clicks: 567,  conversions: 29,  earnings: 72.50,  createdAt: '2025-12-10' },
];

export default function AffiliateCenterPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const totalClicks      = LINKS.reduce((s, l) => s + l.clicks, 0);
  const totalConversions = LINKS.reduce((s, l) => s + l.conversions, 0);
  const totalEarnings    = LINKS.reduce((s, l) => s + l.earnings, 0);
  const conversionRate   = ((totalConversions / totalClicks) * 100).toFixed(2);

  const handleCopy = async (link: AffiliateLink) => {
    await copyToClipboard(`https://${link.url}`);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Memoize column definitions to read `copiedId` reactively
  const linkColumns: ColumnDef<AffiliateLink>[] = useMemo(
    () => [
      { key: 'campaign', header: 'Campaign', sortable: true, getValue: (r) => r.campaign },
      {
        key: 'url',
        header: 'Link',
        cell: (row) => (
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.url}</code>
        ),
      },
      { key: 'clicks', header: 'Clicks', sortable: true, align: 'right', getValue: (r) => r.clicks },
      {
        key: 'conversions',
        header: 'Conversions',
        sortable: true,
        align: 'right',
        getValue: (r) => r.conversions,
        cell: (row) => (
          <span>
            {row.conversions}{' '}
            <span className="text-xs text-muted-foreground">
              ({((row.conversions / row.clicks) * 100).toFixed(1)}%)
            </span>
          </span>
        ),
      },
      {
        key: 'earnings',
        header: 'Earnings',
        sortable: true,
        align: 'right',
        getValue: (r) => r.earnings,
        cell: (row) => (
          <span className="font-semibold text-green-600">
            {formatCurrency(row.earnings)}
          </span>
        ),
      },
      {
        key: 'action',
        header: '',
        align: 'right',
        cell: (row) => {
          const isCopied = copiedId === row.id;
          return (
            <Button
              size="sm"
              variant={isCopied ? 'default' : 'ghost'}
              onClick={(e) => {
                e.stopPropagation(); // prevent triggering row click twice
                handleCopy(row);
              }}
              leftIcon={
                isCopied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          );
        },
      },
    ],
    [copiedId]
  );

  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen">
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-16 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <Link2 className="mx-auto mb-4 h-12 w-12 text-blue-400" aria-hidden="true" />
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Affiliate Center</h1>
            <p className="text-slate-300 max-w-xl mx-auto">
              Earn commission for every customer you refer. Create custom links, track performance, and grow your earnings.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 py-12 max-w-5xl">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Clicks',     value: totalClicks.toLocaleString(), icon: MousePointerClick, color: 'bg-blue-100 text-blue-600'   },
              { label: 'Conversions',      value: totalConversions.toLocaleString(), icon: TrendingUp,    color: 'bg-purple-100 text-purple-600' },
              { label: 'Conversion Rate',  value: `${conversionRate}%`,         icon: TrendingUp,        color: 'bg-green-100 text-green-600'  },
              { label: 'Total Earnings',   value: formatCurrency(totalEarnings), icon: DollarSign,       color: 'bg-orange-100 text-orange-600' },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border bg-card p-5"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color} mb-3`}>
                  <kpi.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Click chart */}
          <section className="rounded-xl border bg-card p-6 mb-8" aria-labelledby="clicks-chart-heading">
            <h2 id="clicks-chart-heading" className="font-semibold mb-5">Clicks — Last 7 Days</h2>
            <div className="h-56" role="img" aria-label="Weekly click analytics bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CLICK_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Bar dataKey="clicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Generate new link */}
          <section className="rounded-xl border bg-card p-6 mb-8" aria-labelledby="generate-heading">
            <h2 id="generate-heading" className="font-semibold mb-4">Generate New Affiliate Link</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Campaign name (e.g. 'Twitter Bio')"
                aria-label="Campaign name"
                className="h-10 flex-1 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button variant="gradient" leftIcon={<Link2 className="h-4 w-4" />}>
                Generate Link
              </Button>
            </div>
          </section>

          {/* Links table */}
          <section aria-labelledby="links-heading">
            <h2 id="links-heading" className="font-semibold mb-4">Your Affiliate Links</h2>
            <DataTable
              data={LINKS}
              columns={linkColumns}
              searchable
              exportable
              exportFilename="affiliate-links"
              pageSize={10}
              caption="Affiliate link performance"
              aria-label="Affiliate link performance table"
              onRowClick={(row) => handleCopy(row)}
            />
            <p className="text-xs text-muted-foreground mt-2">Click any row to copy its link.</p>
          </section>

          {/* Payout info */}
          <div className="mt-8 rounded-xl border bg-muted/30 p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold text-sm">Next payout</p>
              <p className="text-xs text-muted-foreground">Payouts are processed monthly via PayPal or bank transfer, minimum $50.</p>
            </div>
            <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
              Download Statement
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}