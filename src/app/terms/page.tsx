// SSG — statically generated at build time, no revalidation needed
export const dynamic = 'force-static';

import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'eSIM Platform Terms of Service.',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-16">
        <section className="border-b bg-muted/50 py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="mb-2 font-display text-4xl font-bold">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 1, 2025</p>
          </div>
        </section>
        <article className="prose prose-sm dark:prose-invert container mx-auto max-w-3xl px-4 py-16 md:px-6">
          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By accessing or using eSIM Platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.',
            },
            {
              title: '2. Description of Service',
              body: 'eSIM Platform provides digital SIM (eSIM) services that allow users to activate mobile data plans on compatible devices. We act as a reseller of data plans from licensed mobile network operators worldwide.',
            },
            {
              title: '3. Account Registration',
              body: 'You must create an account to purchase plans. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.',
            },
            {
              title: '4. Purchases & Payments',
              body: 'All purchases are final. eSIM plans begin immediately upon activation. Refunds are available for unused, unactivated eSIMs within 30 days of purchase, subject to our refund policy. We reserve the right to change pricing at any time.',
            },
            {
              title: '5. Acceptable Use',
              body: 'You agree not to use the Service for any unlawful purpose, to resell or redistribute eSIM plans without authorization, to attempt to circumvent usage limits, or to engage in activities that violate the terms of underlying network operators.',
            },
            {
              title: '6. Limitation of Liability',
              body: 'eSIM Platform is not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, revenue, or profits. Our total liability shall not exceed the amount paid for the specific plan in question.',
            },
            {
              title: '7. Changes to Terms',
              body: 'We may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance. We will notify registered users of material changes via email.',
            },
            {
              title: '8. Governing Law',
              body: 'These Terms are governed by the laws of the State of California, USA, without regard to conflict of law provisions. Disputes shall be resolved in the courts of San Francisco County, California.',
            },
            {
              title: '9. Contact',
              body: 'For questions about these Terms, contact us at legal@esimplatform.com.',
            },
          ].map((section) => (
            <section key={section.title} className="mb-8">
              <h2 className="mb-2 font-display text-lg font-bold">{section.title}</h2>
              <p className="leading-relaxed text-muted-foreground">{section.body}</p>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
