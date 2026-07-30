'use client';
/**
 * VirtualList — High-Performance List Renderer
 * ==============================================
 * Renders only visible items in viewport.
 * Handles 10,000+ items with constant performance.
 *
 * Before: 500 items = 500 DOM nodes = slow scroll
 * After:  500 items = ~15 DOM nodes = 60fps scroll
 *
 * Usage:
 *   <VirtualList
 *     items={plans}
 *     itemHeight={120}
 *     height={600}
 *     renderItem={(plan, index) => <PlanCard plan={plan} />}
 *   />
 */
import React from 'react';
import { cn } from '@/utils';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  height: number; // Container height in px
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  emptyState?: React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  overscan = 3,
  className,
  emptyState,
  keyExtractor,
}: VirtualListProps<T>) {
  const { containerRef, visibleItems, totalHeight, offsetY } = useVirtualScroll({
    items,
    itemHeight,
    overscan,
    containerHeight: height,
  });

  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
      role="list"
    >
      {/* Total height maintains scrollbar proportions */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Translate instead of top positioning — avoids reflow */}
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index }) => (
            <div
              key={keyExtractor ? keyExtractor(item, index) : index}
              style={{ height: itemHeight }}
              role="listitem"
              aria-setsize={items.length}
              aria-posinset={index + 1}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Virtual Grid (2D virtualisation) ──────────────────────────
interface VirtualGridProps<T> {
  items: T[];
  columns: number;
  itemHeight: number;
  height: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  className?: string;
}

export function VirtualGrid<T>({
  items,
  columns,
  itemHeight,
  height,
  renderItem,
  gap = 16,
  className,
}: VirtualGridProps<T>) {
  // Group items into rows
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  const { containerRef, visibleItems, totalHeight, offsetY } = useVirtualScroll({
    items: rows,
    itemHeight: itemHeight + gap,
    containerHeight: height,
  });

  return (
    <div ref={containerRef} className={cn('overflow-auto', className)} style={{ height }}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item: row, index: rowIndex }) => (
            <div
              key={rowIndex}
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap,
                height: itemHeight,
                marginBottom: gap,
              }}
            >
              {row.map((item, colIndex) => (
                <div key={colIndex}>{renderItem(item, rowIndex * columns + colIndex)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
