/**
 * Country Detail Page — SERVER COMPONENT + SSG + JSON-LD
 * =========================================================
 * generateStaticParams → pre-builds all country pages at build time (SSG).
 * JSON-LD structured data for SEO.
 */
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { Button } from '@/components/atoms/Button';
import { getCountryServer, getPlansServer, getCountriesServer } from '@/lib/server/data';
import { SaveCountryButton } from '@/features/personalization/PersonalizationWidgets';
import { PlanCard } from '@/components/molecules/PlanCard';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { Wifi, Signal, Globe } from 'lucide-react';

export const revalidate = 600;

export async function generateStaticParams() {
  const countries = await getCountriesServer();
  return countries.map((c) => ({ code: c.id }));
}

export async function generateMetadata(
  { params }: { params: { code: string } }
): Promise<Metadata> {
  const country = await getCountryServer(params.code);
  if (!country) return { title: 'Country Not Found' };
  return {
    title:       `eSIM Plans for ${country.name}`,
    description: `Get instant eSIM data plans for ${country.name}. Connect to ${country.networks.join(', ')} — no physical SIM needed.`,
    openGraph: {
      title:       `${country.flag} ${country.name} eSIM Plans`,
      description: `Stay connected in ${country.name} with instant eSIM activation.`,
    },
  };
}

export default async function CountryDetailPage({ params }: { params: { code: string } }) {
  const [country, allPlans] = await Promise.all([
    getCountryServer(params.code),
    getPlansServer({ country: params.code }),
  ]);

  if (!country) notFound();

  const plans = allPlans.filter((p) => p.country.code.toLowerCase() === params.code.toLowerCase());

  const jsonLd = {
    '@context':   'https://schema.org',
    '@type':      'Product',
    name:         `eSIM for ${country.name}`,
    description:  `Instant eSIM data plans for ${country.name}`,
    brand:        { '@type': 'Brand', name: 'eSIM Platform' },
    offers:       plans.slice(0, 3).map((p) => ({
      '@type':       'Offer',
      name:          p.name,
      price:         p.price,
      priceCurrency: p.currency,
      availability:  'https://schema.org/InStock',
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen">
        {/* Hero — server-rendered */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-16 text-white">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-6">
              <Link href="/" className="hover:text-white">Home</Link>
              {' / '}
              <Link href={ROUTES.COUNTRIES} className="hover:text-white">Coverage</Link>
              {' / '}
              <span className="text-white">{country.name}</span>
            </nav>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-6xl" role="img" aria-label={country.name}>{country.flag}</span>
                  <div>
                    <h1 className="font-display text-4xl font-bold">{country.name}</h1>
                    <p className="text-slate-400 mt-1 capitalize">{country.coverageQuality} coverage · {country.region}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {country.networks.map((n) => (
                    <span key={n} className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs">
                      <Wifi className="h-3 w-3" /> {n}
                    </span>
                  ))}
                </div>
              </div>
              {/* Client component — needs Zustand */}
              <SaveCountryButton countryCode={country.code} />
            </div>
          </div>
        </div>

        {/* Plans — server-rendered list */}
        <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
          <h2 className="font-display text-2xl font-bold mb-6">
            Available Plans for {country.name}
          </h2>

          {plans.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed py-20 text-center">
              <Globe className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="font-semibold mb-2">No plans available yet</p>
              <p className="text-sm text-muted-foreground mb-4">We're working on adding coverage for {country.name}.</p>
              <Button asChild variant="outline">
                <Link href={ROUTES.PLANS}>Browse All Plans</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((plan) => (
                // PlanCard is a client component — handles Add to Cart
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
