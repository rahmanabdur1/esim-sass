import Link from 'next/link';
import { Globe, ArrowLeft, Home } from 'lucide-react';
import { ROUTES } from '@/constants';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 text-center text-white">
      <Globe className="mb-6 h-16 w-16 text-blue-400" aria-hidden="true" />
      <h1 className="mb-2 font-display text-8xl font-bold text-blue-400">404</h1>
      <h2 className="mb-3 font-display text-2xl font-bold">Page Not Found</h2>
      <p className="mb-8 max-w-md text-slate-400">
        Looks like you've wandered off the map. This page doesn't exist — but the world is still
        waiting for you.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Home className="h-4 w-4" aria-hidden="true" /> Go Home
        </Link>
        <Link
          href={ROUTES.PLANS}
          className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse Plans
        </Link>
      </div>
    </div>
  );
}
