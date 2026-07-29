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
  { icon: Mail,    label: 'Email',   value: 'support@esimplatform.com', href: 'mailto:support@esimplatform.com' },
  { icon: Phone,   label: 'Phone',   value: '+1 (888) 123-4567',         href: 'tel:+18881234567'                },
  { icon: MapPin,  label: 'Address', value: '123 Tech Street, SF, CA',   href: null                              },
];

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(contactFormAction, null);

  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen">
        <div className="bg-muted/50 border-b py-16 text-center">
          <h1 className="font-display text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Have a question or need help? We're here 24/7.
          </p>
        </div>

        <div className="container mx-auto px-4 md:px-6 py-16 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <div className="space-y-6">
              <h2 className="font-semibold text-lg">Get in Touch</h2>
              {CONTACT_INFO.map((info) => (
                <div key={info.label} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <info.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{info.label}</p>
                    {info.href ? (
                      <a href={info.href} className="text-sm hover:text-primary transition-colors">{info.value}</a>
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
                  <CheckCircle className="h-12 w-12 text-green-600 mb-4" aria-hidden="true" />
                  <h2 className="font-display text-2xl font-bold text-green-800 mb-2">Message Sent!</h2>
                  <p className="text-green-700">We'll reply within 24 hours.</p>
                </motion.div>
              ) : (
                <form action={formAction} className="space-y-5" aria-label="Contact form" noValidate>
                  {state?.error && (
                    <div role="alert" aria-live="assertive"
                      className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                      {state.error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                        Full Name <span aria-hidden="true" className="text-destructive">*</span>
                      </label>
                      <input id="name" name="name" type="text" required autoComplete="name"
                        aria-required="true" placeholder="Alex Johnson"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5">
                        Email <span aria-hidden="true" className="text-destructive">*</span>
                      </label>
                      <input id="contact-email" name="email" type="email" required autoComplete="email"
                        aria-required="true" placeholder="alex@example.com"
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
                      Subject <span aria-hidden="true" className="text-destructive">*</span>
                    </label>
                    <input id="subject" name="subject" type="text" required
                      aria-required="true" placeholder="How can we help?"
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                      Message <span aria-hidden="true" className="text-destructive">*</span>
                    </label>
                    <textarea id="message" name="message" required aria-required="true" rows={5}
                      placeholder="Tell us more about your question…"
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full h-11"
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
