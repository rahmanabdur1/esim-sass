/**
 * useVirtualScroll
 * =================
 * Renders only visible items in a long list.
 * Essential for lists with 100+ items (plans, orders, etc.)
 *
 * Without virtualisation: 1000 DOM nodes rendered
 * With virtualisation:    Only ~15–20 visible nodes rendered
 *
 * Usage:
 *   const { containerRef, visibleItems, totalHeight, offsetY } =
 *     useVirtualScroll({ items, itemHeight: 80, overscan: 3 });
 *
 *   <div ref={containerRef} style={{ height: '500px', overflow: 'auto' }}>
 *     <div style={{ height: totalHeight, position: 'relative' }}>
 *       <div style={{ transform: `translateY(${offsetY}px)` }}>
 *         {visibleItems.map(({ item, index }) => <Row key={index} item={item} />)}
 *       </div>
 *     </div>
 *   </div>
 */
import { useState, useEffect, useRef, useCallback } from 'react';

interface Options<T> {
  items:      T[];
  itemHeight: number;   // Fixed height per item (px)
  overscan?:  number;   // Extra items to render above/below viewport
  containerHeight?: number; // If known (else measured from DOM)
}

interface Result<T> {
  containerRef:  React.RefObject<HTMLDivElement | null>;
  visibleItems:  { item: T; index: number }[];
  totalHeight:   number;
  offsetY:       number;
  scrollTo:      (index: number) => void;
}

export function useVirtualScroll<T>({
  items,
  itemHeight,
  overscan = 3,
  containerHeight: fixedHeight,
}: Options<T>): Result<T> {
  const containerRef       = useRef<HTMLDivElement | null>(null);
  const [scrollTop,   setScrollTop]        = useState(0);
  const [viewportHeight, setViewportHeight] = useState(fixedHeight ?? 600);

  // Measure container height
  useEffect(() => {
    if (fixedHeight || !containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setViewportHeight(entry.contentRect.height);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [fixedHeight]);

  // Listen to scroll events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  // Calculate visible range
  const totalHeight = items.length * itemHeight;
  const startIndex  = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex    = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan,
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    if (items[i] !== undefined) {
      visibleItems.push({ item: items[i] as T, index: i });
    }
  }

  const offsetY = startIndex * itemHeight;

  const scrollTo = useCallback((index: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTop = index * itemHeight;
  }, [itemHeight]);

  return { containerRef, visibleItems, totalHeight, offsetY, scrollTo };
}
