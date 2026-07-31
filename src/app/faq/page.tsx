// SSG — statically generated at build time, no revalidation needed
export const dynamic = 'force-static';

import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about eSIM Platform.',
};

const categories = [
  {
    name: 'Getting Started',
    faqs: [
      {
        q: 'What is an eSIM?',
        a: 'An eSIM (embedded SIM) is a digital SIM card built into your device. It lets you activate a cellular plan without inserting a physical SIM card.',
      },
      {
        q: 'Is my device compatible with eSIM?',
        a: 'Most modern smartphones support eSIM, including iPhone XS and later, Samsung Galaxy S20+, Google Pixel 3+, and many more. Check your device settings under "Cellular" or "Mobile Data" to confirm.',
      },
      {
        q: 'How long does activation take?',
        a: 'Activation is nearly instant. After purchase you receive a QR code — simply scan it in your phone settings and your eSIM is ready within minutes.',
      },
    ],
  },
  {
    name: 'Plans & Coverage',
    faqs: [
      {
        q: 'Can I use one plan across multiple countries?',
        a: 'Yes! We offer regional plans that cover entire continents, as well as global plans. Check the coverage tab on each plan page for the full country list.',
      },
      {
        q: 'What happens when I run out of data?',
        a: 'Your connection will slow to a minimal speed. You can top up by purchasing a new plan from your dashboard at any time.',
      },
      {
        q: 'Does my plan include calls and SMS?',
        a: 'Our plans are data-only. Your existing SIM handles calls and texts while the eSIM provides data — both work simultaneously on dual-SIM devices.',
      },
    ],
  },
  {
    name: 'Billing & Payments',
    faqs: [
      {
        q: 'Which payment methods are accepted?',
        a: 'We accept Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Unused eSIMs can be refunded within 30 days of purchase. Once an eSIM has been activated, refunds are evaluated case-by-case by our support team.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes. All transactions use 256-bit SSL encryption and we are fully PCI-DSS compliant. We never store your full card number.',
      },
    ],
  },
  {
    name: 'Technical Support',
    faqs: [
      {
        q: 'My eSIM is not connecting. What should I do?',
        a: 'First ensure data roaming is enabled in your settings. Then try toggling airplane mode on and off. If the issue persists, contact our 24/7 support team from the dashboard.',
      },
      {
        q: 'Can I install the same eSIM on multiple devices?',
        a: 'No. Each eSIM is tied to a single device. Purchasing a new plan is required for a different device.',
      },
      {
        q: 'How do I delete an eSIM from my device?',
        a: 'Go to Settings → Cellular (or Mobile Data) → select the eSIM plan → Remove Cellular Plan. This does not affect any remaining data balance.',
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-16">
        <section className="border-b bg-muted/50 py-16">
          <div className="container mx-auto px-4 text-center md:px-6">
            <h1 className="mb-3 font-display text-4xl font-bold">Frequently Asked Questions</h1>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Everything you need to know about eSIM Platform. Can't find an answer?{' '}
              <a href="/contact" className="text-primary hover:underline">
                Contact us
              </a>
              .
            </p>
          </div>
        </section>

        <div className="container mx-auto max-w-3xl px-4 py-16 md:px-6">
          {categories.map((cat) => (
            <section
              key={cat.name}
              className="mb-12"
              aria-labelledby={`cat-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <h2
                id={`cat-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
                className="mb-5 border-b pb-3 font-display text-xl font-bold"
              >
                {cat.name}
              </h2>
              <dl className="space-y-4">
                {cat.faqs.map((faq, i) => (
                  <div key={i} className="rounded-xl border bg-card p-5">
                    <dt className="mb-2 text-sm font-semibold">{faq.q}</dt>
                    <dd className="text-sm leading-relaxed text-muted-foreground">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
