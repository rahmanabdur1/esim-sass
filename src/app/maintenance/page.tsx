// SSG — statically generated at build time, no revalidation needed
export const dynamic = 'force-static';

import { Globe, Clock, Twitter, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:  'Maintenance — eSIM Platform',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 text-center">
      {/* Animated globe */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" aria-hidden="true" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blue-600/20 border border-blue-400/30">
          <Globe className="h-12 w-12 text-blue-400" aria-hidden="true" />
        </div>
      </div>

      <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">
        Under Maintenance
      </h1>
      <p className="text-slate-300 text-lg mb-2 max-w-md">
        We're upgrading eSIM Platform to serve you better.
      </p>
      <p className="text-slate-400 text-sm mb-10 max-w-sm">
        All your eSIMs and data are safe. We'll be back shortly.
      </p>

      {/* Estimated time */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-4 mb-10">
        <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" aria-hidden="true" />
        <div className="text-left">
          <p className="text-xs text-slate-400">Estimated completion</p>
          <p className="text-sm font-semibold">Within 2 hours</p>
        </div>
      </div>

      {/* What to do */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 max-w-sm mb-8 text-left">
        <h2 className="font-semibold mb-3 text-sm">During maintenance:</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          {[
            'Your active eSIMs will continue to work normally',
            'No purchases can be made temporarily',
            'Your dashboard will be accessible once we\'re back',
            'Follow our Twitter for live updates',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Contact links */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://twitter.com/esimplatform"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Twitter className="h-4 w-4" aria-hidden="true" /> @esimplatform
        </a>
        <a
          href="mailto:support@esimplatform.com"
          className="flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 text-sm hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Mail className="h-4 w-4" aria-hidden="true" /> Contact Support
        </a>
      </div>

      <p className="mt-10 text-xs text-slate-500">
        © {new Date().getFullYear()} eSIM Platform · All systems operational after maintenance
      </p>
    </div>
  );
}
