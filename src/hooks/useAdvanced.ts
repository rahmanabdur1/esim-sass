'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ============================================================
// 1. VIRTUAL LIST HOOK — render only visible items
// ============================================================

interface UseVirtualListOptions {
  itemHeight:      number;
  overscan?:       number;
  containerHeight: number;
}

interface VirtualItem {
  index:  number;
  start:  number;
  end:    number;
  size:   number;
}

export function useVirtualList<T>(
  items:   T[],
  options: UseVirtualListOptions
): {
  virtualItems:    VirtualItem[];
  totalHeight:     number;
  containerProps:  { ref: React.RefObject<HTMLDivElement | null>; style: React.CSSProperties };
  scrollTo:        (index: number) => void;
} {
  const { itemHeight, overscan = 5, containerHeight } = options;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop,  setScrollTop]  = useState(0);

  const totalHeight = items.length * itemHeight;

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex   = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const virtualItems: VirtualItem[] = useMemo(() => {
    const result: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      result.push({ index: i, start: i * itemHeight, end: (i + 1) * itemHeight, size: itemHeight });
    }
    return result;
  }, [startIndex, endIndex, itemHeight]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  return {
    virtualItems,
    totalHeight,
    containerProps: {
      ref:   containerRef,
      style: { height: containerHeight, overflow: 'auto' },
    },
    scrollTo,
  };
}

// ============================================================
// 2. INTERSECTION OBSERVER HOOK — lazy loading
// ============================================================

interface UseIntersectionObserverOptions {
  threshold?:   number;
  rootMargin?:  string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): { ref: React.RefObject<HTMLDivElement | null>; isVisible: boolean; hasBeenVisible: boolean } {
  const { threshold = 0.1, rootMargin = '0px', freezeOnceVisible = true } = options;
  const ref          = useRef<HTMLDivElement | null>(null);
  const [isVisible,  setIsVisible]  = useState(false);
  const [hasBeenVisible, setHasBeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible) {
          setHasBeen(true);
          if (freezeOnceVisible) observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, freezeOnceVisible]);

  return { ref, isVisible, hasBeenVisible };
}

// ============================================================
// 3. OPTIMISTIC UPDATE HOOK — instant UI feedback
// ============================================================

export function useOptimistic<T>(
  serverState: T,
  updateFn:    (state: T, update: Partial<T>) => T
) {
  const [optimisticState, setOptimistic] = useState<T>(serverState);
  const [pending, setPending]            = useState(false);

  // Sync with server state when it changes
  useEffect(() => {
    if (!pending) setOptimistic(serverState);
  }, [serverState, pending]);

  const applyOptimistic = useCallback(
    async (update: Partial<T>, serverAction: () => Promise<void>) => {
      const rollback = optimisticState;
      setPending(true);
      setOptimistic((s) => updateFn(s, update));
      try {
        await serverAction();
      } catch {
        setOptimistic(rollback); // rollback on error
        throw new Error('Optimistic update failed — rolled back');
      } finally {
        setPending(false);
      }
    },
    [optimisticState, updateFn]
  );

  return { state: optimisticState, applyOptimistic, pending };
}

// ============================================================
// 4. INFINITE SCROLL HOOK
// ============================================================

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore:    boolean;
  threshold?: number;
}

export function useInfiniteScroll({ onLoadMore, hasMore, threshold = 200 }: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry?.isIntersecting) onLoadMore(); },
      { rootMargin: `0px 0px ${threshold}px 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore, hasMore, threshold]);

  return { sentinelRef };
}

// ============================================================
// 5. FORM AUTO-SAVE HOOK — debounced draft saving
// ============================================================

export function useAutoSave<T>(
  data:      T,
  saveFn:    (data: T) => Promise<void>,
  delay =    2000
) {
  const [status,   setStatus]  = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirst  = useRef(true);

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('idle');
    timerRef.current = setTimeout(async () => {
      setStatus('saving');
      try {
        await saveFn(data);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch {
        setStatus('error');
      }
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [data, saveFn, delay]);

  return { status };
}

// ============================================================
// 6. COPY TO CLIPBOARD HOOK — with timeout reset
// ============================================================

export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), timeout);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  }, [timeout]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return { copied, copy };
}
