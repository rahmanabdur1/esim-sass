/**
 * instrumentation.ts — Next.js instrumentation hook
 * ===================================================
 * Initializes Sentry on the SERVER only.
 * This avoids the client-side Sentry crash in error.tsx.
 * Runs once when the server starts.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry (stable, no client crash)
    if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
      const Sentry = await import('@sentry/nextjs');
      Sentry.init({
        dsn:              process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN,
        environment:      process.env.NODE_ENV,
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
        debug:            false,
        // Ignore common non-actionable errors
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'Network request failed',
          /^AbortError/,
          /ChunkLoadError/,
        ],
      });
    }
  }
}

export const onRequestError = async (
  err:     unknown,
  request: { path: string; method: string },
) => {
  if (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureException(err, {
      extra: { path: request.path, method: request.method },
    });
  }
};
