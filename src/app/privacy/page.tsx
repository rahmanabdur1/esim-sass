// SSG — statically generated at build time, no revalidation needed
export const dynamic = 'force-static';

import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'eSIM Platform Privacy Policy.',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen">
        <section className="bg-muted/50 border-b py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 1, 2025</p>
          </div>
        </section>
        <article className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
          {[
            { title: '1. Information We Collect', body: 'We collect information you provide directly (name, email, payment info), information collected automatically (usage data, device info, IP address), and information from third parties (payment processors, analytics providers).' },
            { title: '2. How We Use Information', body: 'We use your information to provide and improve the Service, process transactions, send transactional emails, respond to support requests, detect fraud, and comply with legal obligations. We do not sell your personal data.' },
            { title: '3. Data Sharing', body: 'We share data with: payment processors (Stripe) to handle transactions; mobile network operators to provision eSIM services; analytics providers (anonymized); and law enforcement when legally required.' },
            { title: '4. Cookies', body: 'We use essential cookies for authentication and security, analytics cookies (with your consent) to understand usage patterns, and preference cookies to remember your settings. You can control cookie settings in your browser.' },
            { title: '5. Data Retention', body: 'We retain your data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time from Security Settings.' },
            { title: '6. Security', body: 'We implement industry-standard security measures including TLS encryption, hashed passwords, PCI-DSS compliant payment processing, and regular security audits. No method of transmission is 100% secure.' },
            { title: '7. Your Rights', body: 'Depending on your jurisdiction, you may have rights to access, correct, delete, or export your personal data. To exercise these rights, contact privacy@esimplatform.com.' },
            { title: '8. Children\'s Privacy', body: 'The Service is not directed to children under 13. We do not knowingly collect personal information from children under 13.' },
            { title: '9. Contact', body: 'For privacy-related inquiries, contact our Data Protection Officer at privacy@esimplatform.com or write to: eSIM Platform, 123 Market St, San Francisco, CA 94105, USA.' },
          ].map((section) => (
            <section key={section.title} className="mb-8">
              <h2 className="font-display text-lg font-bold mb-2">{section.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{section.body}</p>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
