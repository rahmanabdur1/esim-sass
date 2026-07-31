'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap, Shield, Headphones, CreditCard, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/constants';

// ==================== POPULAR DESTINATIONS ====================
const destinations = [
  { name: 'Japan', flag: '🇯🇵', plans: 12, from: '$4.99', code: 'JP' },
  { name: 'USA', flag: '🇺🇸', plans: 8, from: '$6.99', code: 'US' },
  { name: 'UK', flag: '🇬🇧', plans: 10, from: '$5.49', code: 'GB' },
  { name: 'France', flag: '🇫🇷', plans: 9, from: '$4.49', code: 'FR' },
  { name: 'Germany', flag: '🇩🇪', plans: 11, from: '$4.99', code: 'DE' },
  { name: 'Australia', flag: '🇦🇺', plans: 7, from: '$7.99', code: 'AU' },
  { name: 'South Korea', flag: '🇰🇷', plans: 9, from: '$3.99', code: 'KR' },
  { name: 'Thailand', flag: '🇹🇭', plans: 6, from: '$3.49', code: 'TH' },
];

export function PopularDestinations() {
  return (
    <section className="bg-background py-20" aria-labelledby="destinations-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2
            id="destinations-heading"
            className="mb-4 font-display text-3xl font-bold md:text-4xl"
          >
            Popular Destinations
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Connect instantly in the world's most popular travel destinations with our affordable
            eSIM plans.
          </p>
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {destinations.map((dest, i) => (
            <motion.div
              key={dest.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={`${ROUTES.COUNTRIES}/${dest.code.toLowerCase()}`}
                className="group flex flex-col items-center rounded-xl border bg-card p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${dest.name} - ${dest.plans} plans from ${dest.from}`}
              >
                <span className="mb-3 text-4xl" role="img" aria-label={dest.name}>
                  {dest.flag}
                </span>
                <h3 className="mb-1 text-sm font-semibold transition-colors group-hover:text-primary">
                  {dest.name}
                </h3>
                <p className="text-xs text-muted-foreground">{dest.plans} plans</p>
                <p className="mt-1 text-xs font-medium text-primary">From {dest.from}</p>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center">
          <Button asChild variant="outline">
            <Link href={ROUTES.COUNTRIES}>View All Countries</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ==================== WHY CHOOSE US ====================
const features = [
  {
    icon: Zap,
    title: 'Instant Activation',
    description: 'Get your eSIM activated within minutes. No waiting, no physical delivery needed.',
  },
  {
    icon: Globe,
    title: '190+ Countries',
    description: 'Comprehensive coverage across every continent with reliable, fast connections.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description:
      'Enterprise-grade security with 99.9% uptime guarantee for uninterrupted connectivity.',
  },
  {
    icon: CreditCard,
    title: 'Transparent Pricing',
    description: 'No hidden fees, no contracts. Pay only for what you need.',
  },
  {
    icon: Smartphone,
    title: 'Easy Setup',
    description: 'Simple QR code activation. Compatible with all modern eSIM-capable devices.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support in multiple languages whenever you need help.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-muted/50 py-20" aria-labelledby="why-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 id="why-heading" className="mb-4 font-display text-3xl font-bold md:text-4xl">
            Why Choose eSIM Platform?
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            We make global connectivity simple, affordable, and instant for travelers worldwide.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex gap-4 rounded-xl border bg-card p-6"
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10"
                aria-hidden="true"
              >
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== HOW IT WORKS ====================
const steps = [
  {
    step: 1,
    title: 'Choose Your Plan',
    description:
      'Browse our plans and select the best data package for your destination and duration.',
  },
  {
    step: 2,
    title: 'Complete Purchase',
    description: 'Checkout securely. Your eSIM is generated instantly after payment confirmation.',
  },
  {
    step: 3,
    title: 'Scan QR Code',
    description: 'Open your phone settings and scan the QR code to install the eSIM profile.',
  },
  {
    step: 4,
    title: 'Stay Connected',
    description: 'Enable data roaming and enjoy fast, reliable internet at your destination.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-20" aria-labelledby="how-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 id="how-heading" className="mb-4 font-display text-3xl font-bold md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Get connected in 4 simple steps — from purchase to active eSIM in minutes.
          </p>
        </div>
        <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <motion.li
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              <div
                className="gradient-brand mb-4 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg"
                aria-hidden="true"
              >
                {step.step}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="absolute hidden h-0.5 bg-border md:block"
                  style={{ top: '1.75rem', left: `${(i + 1) * 25}%`, width: '25%' }}
                  aria-hidden="true"
                />
              )}
              <h3 className="mb-2 font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// ==================== TESTIMONIALS ====================
const testimonials = [
  {
    name: 'Sarah M.',
    country: 'USA',
    avatar: '👩',
    rating: 5,
    text: 'Activated my eSIM at the airport and was connected within minutes. Incredible service!',
  },
  {
    name: 'James T.',
    country: 'UK',
    avatar: '👨',
    rating: 5,
    text: 'Used this in Japan and the connection was flawless. Much cheaper than roaming.',
  },
  {
    name: 'Priya K.',
    country: 'IN',
    avatar: '👩',
    rating: 5,
    text: "Best eSIM platform I've tried. The app is intuitive and support is excellent.",
  },
  {
    name: 'Marco R.',
    country: 'IT',
    avatar: '👨',
    rating: 5,
    text: 'Traveled across Europe with a single plan. No connection issues at all.',
  },
];

export function Testimonials() {
  return (
    <section className="bg-muted/50 py-20" aria-labelledby="testimonials-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2
            id="testimonials-heading"
            className="mb-4 font-display text-3xl font-bold md:text-4xl"
          >
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">Trusted by 2 million+ travelers worldwide</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border bg-card p-6"
              aria-label={`Review from ${t.name}`}
            >
              <div className="mb-3 flex" role="img" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <span key={j} className="text-yellow-400" aria-hidden="true">
                    ★
                  </span>
                ))}
              </div>
              <blockquote>
                <p className="mb-4 text-sm italic text-muted-foreground">"{t.text}"</p>
              </blockquote>
              <figcaption className="flex items-center gap-2">
                <span className="text-2xl" role="img" aria-label={t.name}>
                  {t.avatar}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.country}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==================== FAQ SECTION ====================
const faqs = [
  {
    q: 'What is an eSIM?',
    a: "An eSIM (embedded SIM) is a digital SIM that allows you to activate a cellular plan without a physical SIM card. It's built into your device.",
  },
  {
    q: 'Is my device compatible?',
    a: 'Most modern smartphones support eSIM, including iPhone XS and later, Samsung Galaxy S20+, Google Pixel 3 and later, and many more.',
  },
  {
    q: 'How long does activation take?',
    a: "Activation is instant. After completing your purchase, you'll receive a QR code to scan, and your eSIM will be ready within minutes.",
  },
  {
    q: 'Can I keep my existing number?',
    a: 'Yes! eSIM works alongside your primary SIM, so you can keep your existing number for calls and texts while using eSIM for data.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return (
    <section className="bg-background py-20" aria-labelledby="faq-heading">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 id="faq-heading" className="mb-4 font-display text-3xl font-bold md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">Everything you need to know about eSIM Platform</p>
        </div>
        <dl className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-card">
              <dt>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  aria-expanded={openIndex === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  {faq.q}
                  <span
                    className={`ml-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${openIndex === i ? 'rotate-45' : ''}`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
              </dt>
              {openIndex === i && (
                <dd
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  className="border-t px-5 pb-5 pt-4 text-sm text-muted-foreground"
                >
                  {faq.a}
                </dd>
              )}
            </div>
          ))}
        </dl>
        <div className="mt-8 text-center">
          <Button asChild variant="outline">
            <Link href={ROUTES.FAQ}>View All FAQs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ==================== NEWSLETTER ====================
export function NewsletterSection() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <section className="gradient-brand py-20" aria-labelledby="newsletter-heading">
      <div className="container mx-auto max-w-2xl px-4 text-center md:px-6">
        <h2
          id="newsletter-heading"
          className="mb-3 font-display text-3xl font-bold text-white md:text-4xl"
        >
          Get Travel Deals & Updates
        </h2>
        <p className="mb-8 text-blue-100">
          Subscribe for exclusive eSIM deals, travel tips, and connectivity news.
        </p>
        {submitted ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-medium text-white"
          >
            ✅ Thank you for subscribing!
          </motion.p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubmitted(true);
            }}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
            aria-label="Newsletter subscription form"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="h-11 flex-1 rounded-md border-0 bg-white/10 px-4 text-white placeholder:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-required="true"
            />
            <Button
              type="submit"
              className="h-11 flex-shrink-0 bg-white text-blue-600 hover:bg-blue-50"
            >
              Subscribe
            </Button>
          </form>
        )}
        <p className="mt-4 text-xs text-blue-200">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </div>
    </section>
  );
}
