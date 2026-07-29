'use client';
/**
 * error.tsx — Route-level Error Boundary
 * ========================================
 * Must export default function named 'Error' (not GlobalError).
 * GlobalError is only for app/global-error.tsx.
 * Does NOT use Sentry import — crashes on SSR.
 */
import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/constants';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error — Sentry loaded separately via instrumentation.ts
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
        <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
      </div>
      <h1 className="font-display text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground max-w-md mb-2 text-sm">
        An unexpected error occurred. Please try again or go back to the home page.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono mb-6 bg-muted px-3 py-1 rounded">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-3 flex-wrap justify-center">
        <Button
          onClick={reset}
          variant="gradient"
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Try Again
        </Button>
        <Button asChild variant="outline" leftIcon={<Home className="h-4 w-4" />}>
          <Link href={ROUTES.HOME}>Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
