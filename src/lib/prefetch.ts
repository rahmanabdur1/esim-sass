/**
 * ROUTE PREFETCHING STRATEGY
 * ===========================
 * Prefetch routes based on:
 * - User hover intent (mouseover / touchstart)
 * - Viewport visibility (Intersection Observer)
 * - Predicted next routes (analytics-driven)
 *
 * Results in near-instant navigation for common paths.
 */
'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// ── Route prediction map ───────────────────────────────────────
// When user is on X, prefetch Y (most common next route)
const ROUTE_PREDICTIONS: Record<string, string[]> = {
  '/': ['/plans', '/countries', '/auth/login'],
  '/plans': ['/dashboard/checkout', '/countries'],
  '/countries': ['/plans'],
  '/auth/login': ['/dashboard', '/auth/forgot-password'],
  '/auth/register': ['/auth/verify-email'],
  '/dashboard': ['/dashboard/my-esims', '/dashboard/orders', '/dashboard/buy-plan'],
  '/blog': ['/plans'],
};

// ── Prefetch on hover intent ───────────────────────────────────
export function usePrefetchOnHover() {
  const router = useRouter();
  const prefetched = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetch = useCallback(
    (href: string) => {
      if (prefetched.current.has(href)) return;
      prefetched.current.add(href);

      // Delay 150ms — only prefetch if user lingers (not accidental hover)
      timer.current = setTimeout(() => {
        router.prefetch(href);
      }, 150);
    },
    [router],
  );

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return { prefetch, cancel };
}

// ── Prefetch predicted next routes ────────────────────────────
export function usePredictivePrefetch() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const routes = ROUTE_PREDICTIONS[pathname] ?? [];
    // Delay prefetch until after page is interactive
    const id = setTimeout(() => {
      routes.forEach((route) => router.prefetch(route));
    }, 1000);
    return () => clearTimeout(id);
  }, [pathname, router]);
}

// ── Prefetch links in viewport ────────────────────────────────
export function usePrefetchInViewport() {
  const router = useRouter();
  const prefetched = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const href = (entry.target as HTMLAnchorElement).href;
          const pathname = new URL(href, window.location.origin).pathname;
          if (prefetched.current.has(pathname)) return;
          prefetched.current.add(pathname);
          router.prefetch(pathname);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px 200px 0px' }, // prefetch 200px before visible
    );

    // Observe all internal links
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="/"]');
    links.forEach((link) => observer.observe(link));

    return () => observer.disconnect();
  }, [router]);
}

// ── Combined prefetch hook ─────────────────────────────────────
export function useSmartPrefetch() {
  usePredictivePrefetch();
  usePrefetchInViewport();
}
