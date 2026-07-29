/**
 * Countries Page — SERVER COMPONENT + ISR
 * =========================================
 * Server fetches all countries (cached 10 min).
 * CountryCard (client) adds save/heart interactivity.
 */
import type { Metadata } from 'next';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { getCountriesServer } from '@/lib/server/data';
import { CountryCard } from '@/features/personalization/CountryCard';
import { SavedCountriesSection } from '@/features/personalization/SavedCountriesSection';
import { Globe } from 'lucide-react';

export const revalidate = 600; // 10 minutes

export const metadata: Metadata = {
  title:       'Global eSIM Coverage',
  description: 'Browse eSIM plans for 190+ countries. Instant activation, no roaming fees.',
};

const REGIONS = ['Asia', 'Europe', 'Americas', 'Oceania', 'Africa', 'Middle East'] as const;

export default async function CountriesPage() {
  const countries = await getCountriesServer();

  const byRegion = REGIONS.map((region) => ({
    name:      region,
    countries: countries
      .filter((c) => c.region === region || c.continent === region)
      .map((c) => ({ code: c.code, name: c.name, flag: c.flag, plans: 3, from: '$3.99' })),
  })).filter((r) => r.countries.length > 0);

  const allForSaved = countries.map((c) => ({ code: c.code, name: c.name, flag: c.flag }));

  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen">
        {/* Hero — static, rendered on server */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 text-white text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-blue-400" aria-hidden="true" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
            Global Coverage
          </h1>
          <p className="text-slate-300 max-w-xl mx-auto text-lg">
            Stay connected in <strong>190+ countries</strong> with instant eSIM activation.
          </p>
        </section>

        <div className="container mx-auto px-4 md:px-6 py-16 space-y-14">
          {/* Client component — reads Zustand persisted saved countries */}
          <SavedCountriesSection allCountries={allForSaved} />

          {/* Country grid — Server-rendered HTML, client adds heart button */}
          {byRegion.map((region) => (
            <section
              key={region.name}
              aria-labelledby={`region-${region.name.replace(/\s+/g, '').toLowerCase()}`}
            >
              <h2
                id={`region-${region.name.replace(/\s+/g, '').toLowerCase()}`}
                className="font-display text-2xl font-bold mb-6 pb-3 border-b"
              >
                {region.name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {region.countries.map((c) => (
                  <CountryCard
                    key={c.code}
                    code={c.code}
                    name={c.name}
                    flag={c.flag}
                    plans={c.plans}
                    from={c.from}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
