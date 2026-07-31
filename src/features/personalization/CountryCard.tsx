'use client';
import React from 'react';
import Link from 'next/link';
import { SaveCountryButton } from '@/features/personalization/PersonalizationWidgets';

interface CountryCardProps {
  code: string;
  name: string;
  flag: string;
  plans: number;
  from: string;
}

export function CountryCard({ code, name, flag, plans, from }: CountryCardProps) {
  return (
    <div className="group relative">
      <Link
        href={`/countries/${code}`}
        className="flex flex-col items-center rounded-xl border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${name} – ${plans} plans from ${from}`}
      >
        <span className="mb-3 text-4xl" role="img" aria-label={name}>
          {flag}
        </span>
        <p className="mb-1 text-sm font-semibold transition-colors group-hover:text-primary">
          {name}
        </p>
        <p className="text-xs text-muted-foreground">{plans} plans</p>
        <p className="mt-1 text-xs font-medium text-primary">From {from}</p>
      </Link>
      <div className="absolute right-2 top-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        <SaveCountryButton countryCode={code} className="h-7 w-7 bg-card" />
      </div>
    </div>
  );
}
