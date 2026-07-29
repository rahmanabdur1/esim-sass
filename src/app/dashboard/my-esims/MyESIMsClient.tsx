'use client';
/**
 * My eSIMs Client — CLIENT COMPONENT (island)
 * =============================================
 * Receives server-fetched eSIMs as props.
 * Handles: search, filter, view toggle, QR code modal.
 */
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X, LayoutGrid, List, Wifi, Clock } from 'lucide-react';
import { Badge } from '@/components/atoms/index';
import { Button } from '@/components/atoms/Button';
import { Progress } from '@/components/atoms/index';
import { useESIMs } from '@/hooks';
import { ESIM_STATUS_CONFIG, ROUTES } from '@/constants';
import { formatDataGB, formatDate, getDataPercentage } from '@/utils';
import Link from 'next/link';
import type { ESIM } from '@/types';

interface Props {
  initialESIMs: ESIM[];
}

export function MyESIMsClient({ initialESIMs }: Props) {
  // useESIMs refetches in background — but UI shows initialESIMs instantly
  const { data } = useESIMs();
  const esims = data?.data ?? initialESIMs; // Prefer fresh data if available

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return esims.filter((e) => {
      const matchStatus = filter === 'all' || e.status === filter;
      const matchSearch =
        !search ||
        e.label.toLowerCase().includes(search.toLowerCase()) ||
        e.country.name.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [esims, search, filter]);

  const STATUS_TABS = [
    { key: 'all', label: 'All', count: esims.length },
    { key: 'active', label: 'Active', count: esims.filter((e) => e.status === 'active').length },
    {
      key: 'inactive',
      label: 'Inactive',
      count: esims.filter((e) => e.status === 'inactive').length,
    },
    { key: 'expired', label: 'Expired', count: esims.filter((e) => e.status === 'expired').length },
  ] as const;

  return (
    <>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search eSIMs by name or country…"
            aria-label="Search eSIMs"
            className="h-10 w-full rounded-md border bg-background pl-9 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1 rounded-md border p-1" role="group" aria-label="View mode">
          <button
            onClick={() => setViewMode('grid')}
            aria-pressed={viewMode === 'grid'}
            aria-label="Grid view"
            className={`rounded px-2 py-1 transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
            className={`rounded px-2 py-1 transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <Button asChild variant="gradient">
          <Link href={ROUTES.BUY_PLAN}>+ Buy Plan</Link>
        </Button>
      </div>

      {/* Status tabs */}
      <div className="mb-6 flex gap-2 border-b" role="tablist" aria-label="Filter by status">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={filter === tab.key}
            onClick={() => setFilter(tab.key)}
            className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label} <span className="ml-1 text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* eSIM grid/list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wifi className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden="true" />
          <p className="mb-2 font-semibold">No eSIMs found</p>
          <p className="mb-4 text-sm text-muted-foreground">
            {search
              ? 'Try a different search term.'
              : 'Purchase your first eSIM plan to get started.'}
          </p>
          <Button asChild variant="gradient">
            <Link href={ROUTES.BUY_PLAN}>Browse Plans</Link>
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
              : 'space-y-3'
          }
        >
          {filtered.map((esim, i) => {
            const cfg = ESIM_STATUS_CONFIG[esim.status];
            const pct = getDataPercentage(esim.dataUsed, esim.dataTotal);
            return (
              <motion.div
                key={esim.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" role="img" aria-label={esim.country.name}>
                      {esim.country.flag}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{esim.label}</p>
                      <p className="text-xs text-muted-foreground">{esim.country.name}</p>
                    </div>
                  </div>
                  <Badge className={`${cfg.bg} ${cfg.color} border-0 text-xs`}>{cfg.label}</Badge>
                </div>

                <div className="mb-3">
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{formatDataGB(esim.dataUsed)} used</span>
                    <span>
                      {formatDataGB(esim.dataRemaining)} left of {formatDataGB(esim.dataTotal)}
                    </span>
                  </div>
                  <Progress value={pct} showLabel={false} className="h-1.5" />
                  <p className="mt-1 text-right text-xs text-muted-foreground">{pct}% used</p>
                </div>

                <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    {esim.network}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Expires {formatDate(esim.validTo)}
                  </span>
                </div>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full"
                  aria-label={`View details for ${esim.label}`}
                >
                  <Link href={`${ROUTES.ESIM_DETAILS}?id=${esim.id}`}>View Details</Link>
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </>
  );
}
