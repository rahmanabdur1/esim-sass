/**
 * useIntersectionObserver
 * ========================
 * Tracks when an element enters/exits the viewport.
 * Used for:
 *   - Lazy loading images and components
 *   - Triggering enter animations
 *   - Infinite scroll triggers
 *   - Analytics "impression" tracking
 *
 * Usage:
 *   const { ref, isIntersecting, hasIntersected } = useIntersectionObserver();
 *   <div ref={ref}>{isIntersecting && <ExpensiveComponent />}</div>
 */
import { useEffect, useRef, useState, useCallback } from 'react';

interface Options extends IntersectionObserverInit {
  /** Only trigger once (unobserve after first intersection) */
  triggerOnce?: boolean;
  /** Delay in ms before reporting intersection */
  delay?: number;
}

interface Result<T extends Element> {
  ref: React.RefCallback<T>;
  isIntersecting: boolean;
  hasIntersected: boolean; // true once element has been seen (sticky)
  entry: IntersectionObserverEntry | null;
}

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: Options = {},
): Result<T> {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    triggerOnce = false,
    delay = 0,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const ref = useCallback(
    (node: T | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      elementRef.current = node;
      if (!node || typeof IntersectionObserver === 'undefined') return;

      observerRef.current = new IntersectionObserver(
        ([e]) => {
          if (!e) return;
          const update = () => {
            setEntry(e);
            setIsIntersecting(e.isIntersecting);
            if (e.isIntersecting) {
              setHasIntersected(true);
              if (triggerOnce) observerRef.current?.unobserve(node);
            }
          };
          if (delay > 0) {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(update, delay);
          } else {
            update();
          }
        },
        { threshold, root, rootMargin },
      );

      observerRef.current.observe(node);
    },
    [threshold, root, rootMargin, triggerOnce, delay],
  );

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      observerRef.current?.disconnect();
    };
  }, []);

  return { ref, isIntersecting, hasIntersected, entry };
}

// ── Convenience hooks ──────────────────────────────────────────

/** Lazy load: render children only when visible */
export function useLazyLoad(options?: Options) {
  return useIntersectionObserver({ triggerOnce: true, rootMargin: '200px', ...options });
}

/** Animate on enter: trigger once when element scrolls into view */
export function useAnimateOnEnter(options?: Options) {
  return useIntersectionObserver({ triggerOnce: true, threshold: 0.15, ...options });
}

/** Infinite scroll: trigger when bottom sentinel is visible */
export function useInfiniteScroll(onLoadMore: () => void, options?: Options) {
  const result = useIntersectionObserver({ rootMargin: '400px', ...options });
  useEffect(() => {
    if (result.isIntersecting) onLoadMore();
  }, [result.isIntersecting, onLoadMore]);
  return result;
}
