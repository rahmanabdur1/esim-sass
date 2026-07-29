/**
 * CLIENT-SIDE CACHE LAYER
 * ========================
 * Lightweight in-memory cache with TTL + LRU eviction.
 * Wraps fetch/API calls to avoid redundant network requests.
 * Complements TanStack Query (server state) for static/semi-static data.
 *
 * Usage:
 *   const plans = await cache.get('plans', () => fetchPlans(), 5 * 60 * 1000);
 */

interface CacheEntry<T> {
  data:      T;
  expiresAt: number;
  hits:      number;
  createdAt: number;
}

class ClientCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private readonly maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /** Get cached value or fetch fresh data */
  async get<T>(
    key:     string,
    fetcher: () => Promise<T>,
    ttl:     number = 5 * 60 * 1000, // 5 minutes default
  ): Promise<T> {
    const cached = this.store.get(key) as CacheEntry<T> | undefined;

    // Cache hit and not expired
    if (cached && Date.now() < cached.expiresAt) {
      cached.hits++;
      return cached.data;
    }

    // Cache miss or expired — fetch fresh
    const data = await fetcher();
    this.set(key, data, ttl);
    return data;
  }

  /** Store value in cache */
  set<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
    // Evict oldest entries if at capacity (LRU-style)
    if (this.store.size >= this.maxSize) {
      const oldest = Array.from(this.store.entries())
        .sort((a, b) => a[1].createdAt - b[1].createdAt)[0];
      if (oldest) this.store.delete(oldest[0]);
    }

    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      hits:      0,
      createdAt: Date.now(),
    });
  }

  /** Check if key exists and is not expired */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  /** Invalidate a specific key */
  invalidate(key: string): void {
    this.store.delete(key);
  }

  /** Invalidate all keys matching a prefix */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /** Clear the entire cache */
  clear(): void {
    this.store.clear();
  }

  /** Get cache statistics */
  stats() {
    const entries = Array.from(this.store.values());
    return {
      size:       this.store.size,
      maxSize:    this.maxSize,
      totalHits:  entries.reduce((sum, e) => sum + e.hits, 0),
      expired:    entries.filter((e) => Date.now() > e.expiresAt).length,
    };
  }
}

// ── Singleton instance ────────────────────────────────────────
export const cache = new ClientCache(100);

// ── TTL constants ─────────────────────────────────────────────
export const TTL = {
  SHORT:   60 * 1000,          // 1 minute
  MEDIUM:  5  * 60 * 1000,    // 5 minutes
  LONG:    30 * 60 * 1000,    // 30 minutes
  HOUR:    60 * 60 * 1000,    // 1 hour
  DAY:     24 * 60 * 60 * 1000, // 24 hours
} as const;

// ── Memoize pure functions ─────────────────────────────────────
export function memoize<TArgs extends unknown[], TReturn>(
  fn:  (...args: TArgs) => TReturn,
  keyFn?: (...args: TArgs) => string,
): (...args: TArgs) => TReturn {
  const map = new Map<string, TReturn>();
  return (...args: TArgs): TReturn => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (map.has(key)) return map.get(key)!;
    const result = fn(...args);
    map.set(key, result);
    return result;
  };
}

// ── Debounce ──────────────────────────────────────────────────
export function debounce<TArgs extends unknown[]>(
  fn:    (...args: TArgs) => void,
  delay: number,
): (...args: TArgs) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: TArgs) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Throttle ──────────────────────────────────────────────────
export function throttle<TArgs extends unknown[]>(
  fn:    (...args: TArgs) => void,
  limit: number,
): (...args: TArgs) => void {
  let lastCall = 0;
  return (...args: TArgs) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      fn(...args);
    }
  };
}
