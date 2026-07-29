/**
 * PERFORMANCE MONITORING
 * =======================
 * Web Vitals (CWV) reporting — LCP, CLS, FID, INP, TTFB, FCP.
 * Sends metrics to analytics endpoint (or logs in dev).
 * Imported in app/layout.tsx as a Client Component.
 *
 * Core Web Vitals targets (Google thresholds):
 *   LCP  < 2500ms  (Largest Contentful Paint)
 *   CLS  < 0.1     (Cumulative Layout Shift)
 *   INP  < 200ms   (Interaction to Next Paint — replaces FID)
 *   TTFB < 800ms   (Time to First Byte)
 *   FCP  < 1800ms  (First Contentful Paint)
 */

export type MetricName = 'LCP' | 'CLS' | 'INP' | 'FID' | 'TTFB' | 'FCP';

export interface WebVitalMetric {
  name:       MetricName;
  value:      number;
  rating:     'good' | 'needs-improvement' | 'poor';
  delta:      number;
  id:         string;
  navigationType: string;
}

// ── Thresholds (Google spec) ──────────────────────────────────
const THRESHOLDS: Record<MetricName, [number, number]> = {
  LCP:  [2500,  4000],
  CLS:  [0.1,   0.25],
  INP:  [200,   500],
  FID:  [100,   300],
  TTFB: [800,   1800],
  FCP:  [1800,  3000],
};

function getRating(name: MetricName, value: number): WebVitalMetric['rating'] {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

// ── Send metric to analytics ──────────────────────────────────
function sendMetric(metric: WebVitalMetric) {
  if (process.env.NODE_ENV === 'development') {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.info(`[Web Vitals] ${emoji} ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
    return;
  }

  // Production: send to your analytics endpoint
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
  if (!endpoint) return;

  const body = JSON.stringify({
    name:     metric.name,
    value:    metric.value,
    rating:   metric.rating,
    delta:    metric.delta,
    id:       metric.id,
    page:     window.location.pathname,
    userAgent:navigator.userAgent,
    timestamp:Date.now(),
  });

  // Use sendBeacon for reliability (works even on page unload)
  if (navigator.sendBeacon) {
    navigator.sendBeacon(endpoint, body);
  } else {
    fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {});
  }
}

// ── Initialise Web Vitals reporting ──────────────────────────
export async function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

    const handle = (metric: { name: string; value: number; delta: number; id: string; navigationType?: string }) => {
      const name = metric.name as MetricName;
      sendMetric({
        name,
        value:          metric.value,
        rating:         getRating(name, metric.value),
        delta:          metric.delta,
        id:             metric.id,
        navigationType: metric.navigationType ?? 'navigate',
      });
    };

    onCLS(handle);
    onINP(handle);
    onFCP(handle);
    onLCP(handle);
    onTTFB(handle);
  } catch {
    // web-vitals not available — skip
  }
}

// ── Performance budget check ──────────────────────────────────
export function checkPerformanceBudget() {
  if (typeof window === 'undefined' || !window.performance) return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (!navigation) return;

  const metrics = {
    TTFB:     navigation.responseStart - navigation.requestStart,
    DOMReady: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    Load:     navigation.loadEventEnd - navigation.fetchStart,
  };

  if (process.env.NODE_ENV === 'development') {
    console.group('[Performance Budget]');
    console.log(`TTFB:     ${metrics.TTFB.toFixed(0)}ms  (budget: 800ms)`);
    console.log(`DOM Ready:${metrics.DOMReady.toFixed(0)}ms  (budget: 2000ms)`);
    console.log(`Full Load:${metrics.Load.toFixed(0)}ms  (budget: 3000ms)`);
    console.groupEnd();
  }
}

// ── Resource hints helpers ────────────────────────────────────
export function prefetchRoute(href: string) {
  if (typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel  = 'prefetch';
  link.href = href;
  link.as   = 'document';
  document.head.appendChild(link);
}

export function preconnect(origin: string) {
  if (typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel         = 'preconnect';
  link.href        = origin;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}
