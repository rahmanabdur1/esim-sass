/**
 * Frontend Observability — Web Vitals + Sentry + Session Analytics
 */
import * as Sentry from '@sentry/nextjs';

// ============================================================
// WEB VITALS TRACKING
// ============================================================

export interface VitalMetric {
  name:  string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id:    string;
}

const THRESHOLDS = {
  LCP:  { good: 2500,  poor: 4000  },
  CLS:  { good: 0.1,   poor: 0.25  },
  INP:  { good: 200,   poor: 500   },
  FCP:  { good: 1800,  poor: 3000  },
  TTFB: { good: 800,   poor: 1800  },
  FID:  { good: 100,   poor: 300   },
} as const;

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const t = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!t) return 'good';
  if (value <= t.good) return 'good';
  if (value <= t.poor) return 'needs-improvement';
  return 'poor';
}

export function reportWebVital(metric: VitalMetric): void {
  const rating = getRating(metric.name, metric.value);

  // Send to Sentry as measurement
  Sentry.setMeasurement(metric.name, metric.value, metric.name === 'CLS' ? '' : 'millisecond');

  // Tag poor vitals as Sentry issues
  if (rating === 'poor') {
    Sentry.captureMessage(`Poor ${metric.name}: ${metric.value.toFixed(2)}`, {
      level: 'warning',
      tags:  { vital: metric.name, rating },
      extra: { value: metric.value, delta: metric.delta, id: metric.id },
    });
  }

  // Send to analytics endpoint
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/analytics/vitals',
      JSON.stringify({ name: metric.name, value: metric.value, rating, page: window.location.pathname })
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`[WebVitals] ${emoji} ${metric.name}: ${metric.value.toFixed(2)} (${rating})`);
  }
}

// ============================================================
// USER JOURNEY TRACKING
// ============================================================

export interface JourneyEvent {
  event:      string;
  properties: Record<string, unknown>;
  timestamp:  number;
  sessionId:  string;
  userId?:    string;
}

class JourneyTracker {
  private sessionId: string;
  private queue:     JourneyEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    if (typeof sessionStorage === 'undefined') return crypto.randomUUID();
    const existing = sessionStorage.getItem('journey_session_id');
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem('journey_session_id', id);
    return id;
  }

  track(event: string, properties: Record<string, unknown> = {}, userId?: string): void {
    const entry: JourneyEvent = {
      event,
      properties: {
        ...properties,
        url:       typeof window !== 'undefined' ? window.location.pathname : '',
        referrer:  typeof document !== 'undefined' ? document.referrer : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : '',
      },
      timestamp:  Date.now(),
      sessionId:  this.sessionId,
      userId,
    };

    this.queue.push(entry);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) clearTimeout(this.flushTimer);
    this.flushTimer = setTimeout(() => this.flush(), 2000);
  }

  private flush(): void {
    if (!this.queue.length) return;
    const batch = [...this.queue];
    this.queue  = [];

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/journey', JSON.stringify({ events: batch }));
    }
  }

  // Convenience methods for common events
  pageView(page: string)        { this.track('page_view',        { page }); }
  planViewed(planId: string)    { this.track('plan_viewed',      { planId }); }
  planSelected(planId: string)  { this.track('plan_selected',    { planId }); }
  checkoutStarted(planId: string) { this.track('checkout_started', { planId }); }
  orderCompleted(orderId: string, amount: number) {
    this.track('order_completed', { orderId, amount });
  }
  searchPerformed(query: string, results: number) {
    this.track('search_performed', { query: query.slice(0, 50), results });
  }
  loginSuccess() { this.track('login_success'); }
  loginFailed()  { this.track('login_failed'); }
}

export const journey = new JourneyTracker();

// ============================================================
// ERROR BOUNDARY REPORTING
// ============================================================

export function reportError(
  error: Error,
  context?: Record<string, unknown>
): void {
  Sentry.captureException(error, {
    extra: context,
    tags:  { source: 'client' },
  });

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', error, context);
  }
}

export function reportApiError(
  endpoint:   string,
  statusCode: number,
  message:    string
): void {
  Sentry.captureMessage(`API Error ${statusCode}: ${endpoint}`, {
    level: statusCode >= 500 ? 'error' : 'warning',
    tags:  { endpoint, statusCode: String(statusCode), source: 'api' },
    extra: { message },
  });
}

// ============================================================
// PERFORMANCE MARKS
// ============================================================

export function markStart(name: string): void {
  if (typeof performance === 'undefined') return;
  performance.mark(`${name}-start`);
}

export function markEnd(name: string): number {
  if (typeof performance === 'undefined') return 0;
  performance.mark(`${name}-end`);
  try {
    const measure = performance.measure(name, `${name}-start`, `${name}-end`);
    if (measure.duration > 1000) {
      Sentry.captureMessage(`Slow operation: ${name} took ${measure.duration.toFixed(0)}ms`, {
        level: 'warning',
        tags:  { operation: name },
      });
    }
    return measure.duration;
  } catch { return 0; }
}

// ============================================================
// BUNDLE SIZE MONITOR
// ============================================================

export function checkBundleSize(): void {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'production') return;

  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const scripts = entries.filter((e) => e.initiatorType === 'script');

  const totalBytes = scripts.reduce((sum, s) => sum + (s.transferSize ?? 0), 0);
  const totalKB    = totalBytes / 1024;

  if (totalKB > 500) {
    Sentry.captureMessage(`Large JS bundle: ${totalKB.toFixed(0)}KB`, {
      level: 'warning',
      tags:  { metric: 'bundle_size' },
      extra: { totalKB, scripts: scripts.length },
    });
  }
}
