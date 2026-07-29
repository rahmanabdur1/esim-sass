'use client';
import React from 'react';
import Link from 'next/link';
import { SaveCountryButton } from '@/features/personalization/PersonalizationWidgets';

interface CountryCardProps {
  code:  string;
  name:  string;
  flag:  string;
  plans: number;
  from:  string;
}

export function CountryCard({ code, name, flag, plans, from }: CountryCardProps) {
  return (
    <div className="group relative">
      <Link
        href={`/countries/${code}`}
        className="flex flex-col items-center rounded-xl border bg-card p-5 text-center hover:border-primary hover:shadow-md hover:-translate-y-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${name} – ${plans} plans from ${from}`}
      >
        <span className="text-4xl mb-3" role="img" aria-label={name}>{flag}</span>
        <p className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors">{name}</p>
        <p className="text-xs text-muted-foreground">{plans} plans</p>
        <p className="text-xs font-medium text-primary mt-1">From {from}</p>
      </Link>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <SaveCountryButton countryCode={code} className="h-7 w-7 bg-card" />
      </div>
    </div>
  );
}
