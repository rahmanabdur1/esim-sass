/**
 * Contact Page — SERVER COMPONENT + Server Action form
 * ======================================================
 * Uses useFormState (React 19: useActionState) to handle form
 * submission via Server Action — works without JS (progressive enhancement).
 */
'use client';
import React from 'react';
import { useActionState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { Button } from '@/components/atoms/Button';
import { contactFormAction } from '@/lib/server/actions';

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@esimplatform.com',
    href: 'mailto:support@esimplatform.com',
  },
  { icon: Phone, label: 'Phone', value: '+1 (888) 123-4567', href: 'tel:+18881234567' },
  { icon: MapPin, label: 'Address', value: '123 Tech Street, SF, CA', href: null },
];

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(contactFormAction, null);

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen pt-16">
        <div className="border-b bg-muted/50 py-16 text-center">
          <h1 className="mb-3 font-display text-4xl font-bold">Contact Us</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Have a question or need help? We're here 24/7.
          </p>
        </div>

        <div className="container mx-auto max-w-5xl px-4 py-16 md:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Contact info */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Get in Touch</h2>
              {CONTACT_INFO.map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <info.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} className="text-sm transition-colors hover:text-primary">
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-sm">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Server Action form — works without JS */}
            <div className="lg:col-span-2">
              {state?.success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center rounded-xl border bg-green-50 p-12 text-center"
                  role="status"
                >
                  <CheckCircle className="mb-4 h-12 w-12 text-green-600" aria-hidden="true" />
                  <h2 className="mb-2 font-display text-2xl font-bold text-green-800">
                    Message Sent!
                  </h2>
                  <p className="text-green-700">We'll reply within 24 hours.</p>
                </motion.div>
              ) : (
                <form
                  action={formAction}
                  className="space-y-5"
                  aria-label="Contact form"
                  noValidate
                >
                  {state?.error && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                    >
                      {state.error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                        Full Name{' '}
                        <span aria-hidden="true" className="text-destructive">
                          *
                        </span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        aria-required="true"
                        placeholder="Alex Johnson"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium">
                        Email{' '}
                        <span aria-hidden="true" className="text-destructive">
                          *
                        </span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        aria-required="true"
                        placeholder="alex@example.com"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
                      Subject{' '}
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      aria-required="true"
                      placeholder="How can we help?"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium">
                      Message{' '}
                      <span aria-hidden="true" className="text-destructive">
                        *
                      </span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      aria-required="true"
                      rows={5}
                      placeholder="Tell us more about your question…"
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="h-11 w-full"
                    isLoading={isPending}
                    leftIcon={!isPending ? <Send className="h-4 w-4" /> : undefined}
                    aria-disabled={isPending}
                  >
                    {isPending ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
