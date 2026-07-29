'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Wifi, Clock, Globe, Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/index';
import { cn, formatCurrency, formatDataGB, formatValidity } from '@/utils';
import { ROUTES } from '@/constants';
import type { Plan } from '@/types';

interface PlanCardProps {
  plan: Plan;
  className?: string;
  onSelect?: (plan: Plan) => void;
}

export function PlanCard({ plan, className, onSelect }: PlanCardProps) {
  return (
    <motion.article
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative flex flex-col rounded-xl border bg-card p-6 transition-colors',
        plan.isBestValue && 'border-primary ring-2 ring-primary ring-offset-2',
        className
      )}
      aria-label={`${plan.name} plan - ${formatDataGB(plan.data)} for ${formatCurrency(plan.price, plan.currency)}`}
    >
      {/* Badges */}
      <div className="absolute -top-3 left-4 flex gap-2">
        {plan.isPopular && (
          <Badge variant="default" className="flex items-center gap-1">
            <Star className="h-3 w-3" aria-hidden="true" /> Popular
          </Badge>
        )}
        {plan.isBestValue && (
          <Badge variant="success" className="flex items-center gap-1">
            <Zap className="h-3 w-3" aria-hidden="true" /> Best Value
          </Badge>
        )}
      </div>

      {/* Country + Plan Name */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl" aria-hidden="true">{plan.country.flag}</span>
          <span className="text-sm text-muted-foreground">{plan.country.name}</span>
        </div>
        <h3 className="text-lg font-semibold">{plan.name}</h3>
      </div>

      {/* Stats */}
      <dl className="mb-6 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Wifi className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
          <dt className="text-muted-foreground">Data:</dt>
          <dd className="font-medium">{formatDataGB(plan.data)}</dd>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
          <dt className="text-muted-foreground">Validity:</dt>
          <dd className="font-medium">{formatValidity(plan.validity)}</dd>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Globe className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
          <dt className="text-muted-foreground">Network:</dt>
          <dd className="font-medium">{plan.network}</dd>
        </div>
      </dl>

      {/* Features */}
      {plan.features.length > 0 && (
        <ul className="mb-6 space-y-1.5" aria-label="Plan features">
          {plan.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Price + CTA */}
      <div className="mt-auto">
        <div className="mb-3">
          <span className="text-3xl font-bold">{formatCurrency(plan.price, plan.currency)}</span>
          <span className="text-sm text-muted-foreground ml-1">/ {formatValidity(plan.validity)}</span>
        </div>
        <Button
          className="w-full"
          variant={plan.isBestValue ? 'gradient' : 'default'}
          onClick={() => onSelect?.(plan)}
          asChild={!onSelect}
        >
          {onSelect ? (
            <span>Get This Plan</span>
          ) : (
            <Link href={`${ROUTES.BUY_PLAN}?planId=${plan.id}`}>Get This Plan</Link>
          )}
        </Button>
      </div>
    </motion.article>
  );
}
