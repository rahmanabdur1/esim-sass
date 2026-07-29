'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Search,
  Download, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Skeleton } from '@/components/atoms/index';
import { cn } from '@/utils';

export interface ColumnDef<T> {
  key:       keyof T | string;
  header:     string;
  sortable?:  boolean;
  filterable?: boolean;
  width?:     string;
  align?:     'left' | 'center' | 'right';
  cell?:      (row: T) => React.ReactNode;
  getValue?:  (row: T) => string | number;
}

interface DataTableProps<T> {
  data:           T[];
  columns:        ColumnDef<T>[];
  isLoading?:     boolean;
  searchable?:    boolean;
  exportable?:    boolean;
  exportFilename?:string;
  pageSize?:      number;
  emptyMessage?:  string;
  caption?:       string;
  onRowClick?:    (row: T) => void;
  rowClassName?:  (row: T) => string;
  stickyHeader?:  boolean;
  'aria-label'?:  string;
}

type SortDir = 'asc' | 'desc' | null;

function exportCSV<T>(
  data: T[],
  columns: ColumnDef<T>[],
  filename: string
): void {
  const header = columns.map((c) => `"${c.header}"`).join(',');
  const rows   = data.map((row) =>
    columns.map((col) => {
      const val = col.getValue
        ? col.getValue(row)
        : String((row as Record<string, any>)[col.key as string] ?? '');
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );
  const csv  = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export function DataTable<T>({
  data, columns, isLoading = false, searchable = true,
  exportable = false, exportFilename = 'export', pageSize = 10,
  emptyMessage = 'No data found', caption, onRowClick,
  rowClassName, stickyHeader = false, 'aria-label': ariaLabel,
}: DataTableProps<T>) {
  const [search,   setSearch]   = useState('');
  const [sortKey,  setSortKey]  = useState<string | null>(null);
  const [sortDir,  setSortDir]  = useState<SortDir>(null);
  const [page,     setPage]     = useState(1);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = col.getValue ? col.getValue(row) : (row as Record<string, any>)[col.key as string];
        return String(val ?? '').toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const col = columns.find((c) => String(c.key) === sortKey);
      const av  = col?.getValue ? col.getValue(a) : (a as Record<string, any>)[sortKey];
      const bv  = col?.getValue ? col.getValue(b) : (b as Record<string, any>)[sortKey];
      const cmp = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, columns]);

  // Paginate
  const totalPages  = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated   = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev !== key) { setSortDir('asc'); return key; }
      setSortDir((d) => { if (d === 'asc') return 'desc'; setSortKey(null); return null; });
      return key;
    });
    setPage(1);
  }, []);

  const SortIcon = ({ col }: { col: ColumnDef<T> }) => {
    if (!col.sortable) return null;
    const active = sortKey === String(col.key);
    if (!active)           return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />;
    if (sortDir === 'asc') return <ChevronUp       className="h-3.5 w-3.5 text-primary"             aria-hidden="true" />;
    return                        <ChevronDown     className="h-3.5 w-3.5 text-primary"             aria-hidden="true" />;
  };

  const alignClass = (a?: 'left' | 'center' | 'right') =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left';

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      {(searchable || exportable) && (
        <div className="flex flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative flex-1 min-w-52" role="search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search table…"
                aria-label="Search table"
                className="h-9 w-full rounded-md border bg-background pl-9 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {search && (
                <button onClick={() => { setSearch(''); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search">
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          )}
          {exportable && (
            <Button size="sm" variant="outline"
              onClick={() => exportCSV(sorted, columns, exportFilename)}
              leftIcon={<Download className="h-3.5 w-3.5" />}>
              Export CSV
            </Button>
          )}
          {search && (
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {filtered.length} of {data.length} results
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <div className={cn('overflow-x-auto', stickyHeader && 'max-h-[500px] overflow-y-auto')}>
          <table className="w-full" aria-label={ariaLabel ?? caption}>
            {caption && <caption className="sr-only">{caption}</caption>}
            <thead className={cn('border-b bg-muted/50', stickyHeader && 'sticky top-0 z-10')}>
              <tr>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      'px-4 py-3 text-xs font-semibold text-muted-foreground',
                      alignClass(col.align),
                      col.sortable && 'cursor-pointer select-none hover:text-foreground transition-colors'
                    )}
                    onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                    aria-sort={
                      sortKey === String(col.key)
                        ? sortDir === 'asc' ? 'ascending' : 'descending'
                        : col.sortable ? 'none' : undefined
                    }
                  >
                    <span className={cn('inline-flex items-center gap-1', alignClass(col.align))}>
                      {col.header}
                      <SortIcon col={col} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    {search ? `No results for "${search}"` : emptyMessage}
                  </td>
                </tr>
              ) : (
                paginated.map((row, rowIdx) => (
                  <motion.tr
                    key={rowIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: rowIdx * 0.02 }}
                    className={cn(
                      'border-b last:border-0 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-muted/50',
                      rowClassName?.(row)
                    )}
                    onClick={() => onRowClick?.(row)}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={onRowClick ? (e) => e.key === 'Enter' && onRowClick(row) : undefined}
                    role={onRowClick ? 'button' : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className={cn('px-4 py-3 text-sm', alignClass(col.align))}
                      >
                        {col.cell
                          ? col.cell(row)
                          : String((row as Record<string, any>)[col.key as string] ?? '—')}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between text-sm"
          aria-label="Table pagination"
        >
          <p className="text-muted-foreground">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            {' '}· <strong>{sorted.length}</strong> total
          </p>
          <div className="flex items-center gap-1">
            <Button
              size="sm" variant="outline"
              onClick={() => setPage(1)}
              disabled={page === 1}
              aria-label="First page"
            >«</Button>
            <Button
              size="sm" variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
            />
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p     = start + i;
              return (
                <Button
                  key={p} size="sm"
                  variant={p === page ? 'default' : 'outline'}
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? 'page' : undefined}
                >{p}</Button>
              );
            })}
            <Button
              size="sm" variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
            />
            <Button
              size="sm" variant="outline"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              aria-label="Last page"
            >»</Button>
          </div>
        </nav>
      )}
    </div>
  );
}