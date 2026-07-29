import Link from 'next/link';
import { Globe, ArrowLeft, Home } from 'lucide-react';
import { ROUTES } from '@/constants';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-6 text-center">
      <Globe className="h-16 w-16 text-blue-400 mb-6" aria-hidden="true" />
      <h1 className="font-display text-8xl font-bold text-blue-400 mb-2">404</h1>
      <h2 className="font-display text-2xl font-bold mb-3">Page Not Found</h2>
      <p className="text-slate-400 max-w-md mb-8">
        Looks like you've wandered off the map. This page doesn't exist — but the world is still waiting for you.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Home className="h-4 w-4" aria-hidden="true" /> Go Home
        </Link>
        <Link
          href={ROUTES.PLANS}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 hover:bg-white/10 px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse Plans
        </Link>
      </div>
    </div>
  );
}
