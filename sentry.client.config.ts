/**
 * Sentry Client Config
 * ====================
 * Only loads if NEXT_PUBLIC_SENTRY_DSN is set.
 * Safe for client-side — no crash on missing DSN.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Skip Sentry if no DSN configured (dev/demo mode)
if (dsn) {
  Sentry.init({
    dsn,
    environment:             process.env.NODE_ENV,
    tracesSampleRate:        process.env.NODE_ENV === 'production' ? 0.1 : 0,
    replaysSessionSampleRate:0.05,
    replaysOnErrorSampleRate:1.0,
    debug:                   false,
    integrations: [
      Sentry.replayIntegration({
        maskAllText:    true,
        blockAllMedia:  true,
      }),
    ],
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Network request failed',
      /^AbortError/,
      /ChunkLoadError/,
      /Loading chunk \d+ failed/,
    ],
    beforeSend(event) {
      // Strip PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
}
