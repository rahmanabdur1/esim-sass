'use client';
import React from 'react';
import { SavedCountriesWidget } from '@/features/personalization/PersonalizationWidgets';
import type { Country } from '@/types';

interface SavedSectionProps {
  allCountries: Pick<Country, 'code' | 'name' | 'flag'>[];
}

export function SavedCountriesSection({ allCountries }: SavedSectionProps) {
  // Cast minimal country data into the shape SavedCountriesWidget expects
  const countries: Country[] = allCountries.map((c) => ({
    ...c,
    id: c.code,
    region: '',
    continent: '',
    networks: [],
    coverageQuality: 'good',
  }));

  return (
    <div className="mb-12">
      <SavedCountriesWidget countries={countries} />
    </div>
  );
}
