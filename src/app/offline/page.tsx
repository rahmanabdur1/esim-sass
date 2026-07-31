// SSG — statically generated at build time, no revalidation needed
'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-center text-white">
      <WifiOff className="mb-6 h-16 w-16 text-blue-400" aria-hidden="true" />
      <h1 className="mb-3 font-display text-4xl font-bold">You're Offline</h1>
      <p className="mb-8 max-w-md text-lg text-slate-400">
        No internet connection detected. Some content may still be available from cache.
      </p>

      <div className="mb-12 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Try reconnecting"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Home className="h-4 w-4" aria-hidden="true" /> Go Home
        </Link>
      </div>

      {/* What's available offline */}
      <div className="max-w-sm rounded-xl border border-white/10 bg-white/5 p-6 text-left">
        <h2 className="mb-3 text-sm font-semibold">Available offline:</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          {[
            'Previously visited pages',
            'Your dashboard (cached)',
            'Browse cached eSIM plans',
            'FAQ and help articles',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
