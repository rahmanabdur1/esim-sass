'use client';
import React from 'react';
import Link from 'next/link';
import { Globe, Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { ROUTES, SOCIAL_LINKS } from '@/constants';

const footerLinks = {
  Product: [
    { label: 'Plans', href: ROUTES.PLANS },
    { label: 'Coverage', href: ROUTES.COUNTRIES },
    { label: 'How It Works', href: `${ROUTES.HOME}#how-it-works` },
    { label: 'Blog', href: ROUTES.BLOG },
  ],
  Company: [
    { label: 'About Us', href: ROUTES.ABOUT },
    { label: 'Contact', href: ROUTES.CONTACT },
    { label: 'FAQ', href: ROUTES.FAQ },
    { label: 'System Status', href: ROUTES.SYSTEM_STATUS },
    { label: 'Affiliate Program', href: ROUTES.AFFILIATE },
  ],
  Legal: [
    { label: 'Terms of Service', href: ROUTES.TERMS },
    { label: 'Privacy Policy', href: ROUTES.PRIVACY },
  ],
  Account: [
    { label: 'Sign In', href: ROUTES.LOGIN },
    { label: 'Register', href: ROUTES.REGISTER },
    { label: 'Dashboard', href: ROUTES.DASHBOARD },
  ],
};

const socialLinks = [
  { icon: Twitter, href: SOCIAL_LINKS.twitter, label: 'Twitter' },
  { icon: Facebook, href: SOCIAL_LINKS.facebook, label: 'Facebook' },
  { icon: Instagram, href: SOCIAL_LINKS.instagram, label: 'Instagram' },
  { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background" role="contentinfo">
      <div className="container mx-auto px-4 md:px-6">
        {/* Main Footer */}
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              href={ROUTES.HOME}
              className="mb-4 flex items-center gap-2 font-display text-xl font-bold"
            >
              <Globe className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-gradient">eSIM Platform</span>
            </Link>
            <p className="mb-6 max-w-xs text-sm text-muted-foreground">
              Stay connected worldwide with our instant eSIM solutions. No physical SIM needed —
              activate instantly, travel freely.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a
                href="mailto:support@esimplatform.com"
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                support@esimplatform.com
              </a>
              <a
                href="tel:+18005551234"
                className="flex items-center gap-2 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                +1 (800) 555-1234
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                San Francisco, CA, USA
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t py-6 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} eSIM Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => {
              const hasValidLink = Boolean(social.href);

              return (
                <a
                  key={social.label}
                  href={social.href || '#'}
                  target={hasValidLink ? '_blank' : undefined}
                  rel={hasValidLink ? 'noopener noreferrer' : undefined}
                  suppressHydrationWarning
                  aria-label={`Visit our ${social.label} page`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                >
                  <social.icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
