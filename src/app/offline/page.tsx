// SSG — statically generated at build time, no revalidation needed
export const dynamic = 'force-static';

import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 text-center">
      <WifiOff className="h-16 w-16 text-blue-400 mb-6" aria-hidden="true" />
      <h1 className="font-display text-4xl font-bold mb-3">You're Offline</h1>
      <p className="text-slate-400 max-w-md mb-8 text-lg">
        No internet connection detected. Some content may still be available from cache.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-12">
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label="Try reconnecting"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 hover:bg-white/10 px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Home className="h-4 w-4" aria-hidden="true" /> Go Home
        </Link>
      </div>

      {/* What's available offline */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 max-w-sm text-left">
        <h2 className="font-semibold mb-3 text-sm">Available offline:</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          {[
            'Previously visited pages',
            'Your dashboard (cached)',
            'Browse cached eSIM plans',
            'FAQ and help articles',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
