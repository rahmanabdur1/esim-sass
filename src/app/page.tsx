import type { Metadata } from 'next';
import { HeroSection } from '@/features/home/HeroSection';
import { PopularDestinations } from '@/features/home/PopularDestinations';
import { WhyChooseUs } from '@/features/home/WhyChooseUs';
import { HowItWorks } from '@/features/home/HowItWorks';
import { Testimonials } from '@/features/home/Testimonials';
import { FAQSection } from '@/features/home/FAQSection';
import { NewsletterSection } from '@/features/home/NewsletterSection';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { InteractiveCoverageMap } from '@/features/coverage-map/InteractiveCoverageMap';


export const metadata: Metadata = {
  title: 'eSIM Platform — Stay Connected Worldwide',
  description: 'Get instant eSIM for 190+ countries. No physical SIM needed. Activate in minutes and travel freely.',
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <PopularDestinations />
        <section className="py-20 bg-muted/30" aria-labelledby="coverage-map-heading">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-10 text-center">
              <h2 id="coverage-map-heading" className="mb-3 font-display text-3xl font-bold md:text-4xl">
                Explore Global Coverage
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Click any marker to see local network partners and connection quality before you travel.
              </p>
            </div>
            <InteractiveCoverageMap />
          </div>
        </section>
        <WhyChooseUs />
        <HowItWorks />
        <Testimonials />
        <FAQSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
