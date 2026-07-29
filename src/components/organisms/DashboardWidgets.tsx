'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Progress, Skeleton, Badge } from '@/components/atoms/index';
import { formatDataGB, formatDate, getDataPercentage } from '@/utils';
import { ESIM_STATUS_CONFIG } from '@/constants';
import type { ESIM } from '@/types';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { ArrowRight } from 'lucide-react';

interface ActiveESIMWidgetProps {
  esim: ESIM;
  index?: number;
}

export function ActiveESIMWidget({ esim, index = 0 }: ActiveESIMWidgetProps) {
  const pct = getDataPercentage(esim.dataUsed, esim.dataTotal);
  const cfg = ESIM_STATUS_CONFIG[esim.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={esim.country.name}>
            {esim.country.flag}
          </span>
          <div>
            <p className="font-semibold text-sm">{esim.label}</p>
            <p className="text-xs text-muted-foreground">{esim.country.name}</p>
          </div>
        </div>
        <Badge className={`${cfg.bg} ${cfg.color} border-0 text-xs`}>{cfg.label}</Badge>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Data used</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {formatDataGB(esim.dataRemaining)} left of {formatDataGB(esim.dataTotal)}
        </span>
        <span className="text-muted-foreground">
          Expires {formatDate(esim.validTo)}
        </span>
      </div>

      <Link
        href={`${ROUTES.ESIM_DETAILS}?id=${esim.id}`}
        className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label={`View details for ${esim.label}`}
      >
        View details <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </motion.div>
  );
}

export function ActiveESIMWidgetSkeleton() {
  return <Skeleton className="h-44 rounded-xl" aria-label="Loading eSIM widget" />;
}
