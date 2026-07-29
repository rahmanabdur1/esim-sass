/**
 * Plans Page — SERVER COMPONENT + ISR
 * =====================================
 * Server fetches plans data (cached 5 min), passes as props to
 * client component which handles interactive search/filter/sort.
 * Zero loading flicker on first paint — data arrives with HTML.
 */
import type { Metadata } from 'next';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { getPlansServer, getCountriesServer } from '@/lib/server/data';
import { PlansPageClient } from '@/features/plans/PlansPageClient';

export const revalidate = 300; // ISR — revalidate every 5 minutes

export const metadata: Metadata = {
  title:       'Browse eSIM Plans',
  description: 'Find the perfect eSIM plan for your destination. Filter by country, data, validity, and price.',
};

export default async function PlansPage() {
  // Parallel server fetches — cached at edge, no client waterfall
  const [plans, countries] = await Promise.all([
    getPlansServer(),
    getCountriesServer(),
  ]);

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-16">
        <PlansPageClient initialPlans={plans} countries={countries} />
      </main>
      <Footer />
    </>
  );
}
