/**
 * DSA Layer — Production-Grade Data Structures
 * =============================================
 * Real use-cases in this eSIM frontend:
 *
 *  Trie       → Search autocomplete (plan names, country names)
 *  LRU Cache  → API response caching (plans, countries)
 *  HashMap    → Cart state, notification lookup O(1)
 *  Set        → Unique country filtering, saved plans
 *  Debounce   → Search input optimization (reduce API calls)
 *  Throttle   → Scroll event / analytics tracking
 *  BinarySearch→ Filter by price range on sorted plans
 */

// ── 1. TRIE — Search Autocomplete ─────────────────────────────
// Used in: <SearchBar /> for instant plan/country suggestions
// Time: O(m) insert/search where m = word length
// Space: O(ALPHABET_SIZE * m * n)

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd:    boolean;
  data?:    Record<string, unknown>; // store full item for suggestion
}

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = { children: new Map(), isEnd: false };
  }

  /** Insert a word with optional metadata */
  insert(word: string, data?: Record<string, unknown>): void {
    let node = this.root;
    for (const ch of word.toLowerCase()) {
      if (!node.children.has(ch)) {
        node.children.set(ch, { children: new Map(), isEnd: false });
      }
      node = node.children.get(ch)!;
    }
    node.isEnd = true;
    node.data  = data;
  }

  /** Search: returns true if exact word exists */
  search(word: string): boolean {
    const node = this._find(word);
    return node !== null && node.isEnd;
  }

  /** Starts-with prefix check */
  startsWith(prefix: string): boolean {
    return this._find(prefix) !== null;
  }

  /** Autocomplete: returns up to `limit` suggestions for prefix */
  autocomplete(prefix: string, limit = 8): Array<{ word: string; data?: Record<string, unknown> }> {
    const node = this._find(prefix);
    if (!node) return [];

    const results: Array<{ word: string; data?: Record<string, unknown> }> = [];
    this._dfs(node, prefix, results, limit);
    return results;
  }

  private _find(str: string): TrieNode | null {
    let node = this.root;
    for (const ch of str.toLowerCase()) {
      if (!node.children.has(ch)) return null;
      node = node.children.get(ch)!;
    }
    return node;
  }

  private _dfs(
    node: TrieNode, prefix: string,
    results: Array<{ word: string; data?: Record<string, unknown> }>,
    limit: number,
  ): void {
    if (results.length >= limit) return;
    if (node.isEnd) results.push({ word: prefix, data: node.data });
    for (const [ch, child] of node.children) {
      this._dfs(child, prefix + ch, results, limit);
    }
  }
}

// ── 2. LRU CACHE — API Response Caching ───────────────────────
// Used in: plansService, countriesService — avoid redundant fetches
// Time: O(1) get/put using doubly-linked list + HashMap
// Space: O(capacity)

interface LRUNode<V> {
  key:   string;
  value: V;
  prev:  LRUNode<V> | null;
  next:  LRUNode<V> | null;
}

export class LRUCache<V> {
  private capacity: number;
  private map:      Map<string, LRUNode<V>>;
  private head:     LRUNode<V>; // dummy head
  private tail:     LRUNode<V>; // dummy tail
  private ttl:      number;     // ms — 0 = no expiry
  private timestamps: Map<string, number>;

  constructor(capacity: number, ttlMs = 0) {
    this.capacity   = capacity;
    this.map        = new Map();
    this.timestamps = new Map();
    this.ttl        = ttlMs;
    // Dummy sentinel nodes simplify edge cases
    this.head = { key: '', value: null as V, prev: null, next: null };
    this.tail = { key: '', value: null as V, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: string): V | null {
    const node = this.map.get(key);
    if (!node) return null;
    // TTL check
    if (this.ttl > 0) {
      const ts = this.timestamps.get(key) ?? 0;
      if (Date.now() - ts > this.ttl) {
        this._remove(node);
        this.map.delete(key);
        this.timestamps.delete(key);
        return null;
      }
    }
    this._moveToFront(node);
    return node.value;
  }

  put(key: string, value: V): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this._moveToFront(node);
    } else {
      if (this.map.size >= this.capacity) {
        // Evict LRU (tail.prev)
        const lru = this.tail.prev!;
        this._remove(lru);
        this.map.delete(lru.key);
        this.timestamps.delete(lru.key);
      }
      const node: LRUNode<V> = { key, value, prev: null, next: null };
      this._addToFront(node);
      this.map.set(key, node);
    }
    this.timestamps.set(key, Date.now());
  }

  has(key: string): boolean { return this.get(key) !== null; }
  size(): number            { return this.map.size; }
  clear(): void             { this.map.clear(); this.timestamps.clear(); this.head.next = this.tail; this.tail.prev = this.head; }

  private _remove(node: LRUNode<V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private _addToFront(node: LRUNode<V>): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  private _moveToFront(node: LRUNode<V>): void {
    this._remove(node);
    this._addToFront(node);
  }
}

// ── 3. DEBOUNCE — Input Optimization ──────────────────────────
// Used in: SearchBar, any text input → reduce API calls
// Delays execution until user stops typing for `wait` ms

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T, wait: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

// ── 4. THROTTLE — Scroll / Analytics Optimization ─────────────
// Used in: scroll tracking, resize handlers, analytics events

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T, limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// ── 5. BINARY SEARCH — Price Range Filter ─────────────────────
// Used in: Filter plans by price on a sorted array O(log n)
// Assumes array is sorted by the key

export function binarySearchRange<T>(
  arr: T[],
  getKey: (item: T) => number,
  min: number,
  max: number,
): T[] {
  if (arr.length === 0) return [];

  const findLeft = (target: number): number => {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (getKey(arr[mid]!) < target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  const findRight = (target: number): number => {
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (getKey(arr[mid]!) <= target) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  return arr.slice(findLeft(min), findRight(max));
}

// ── 6. SORTING — Plan list ordering ───────────────────────────
// Used in: Buy Plan page — sort by price/data/validity

export type SortKey   = 'price' | 'data' | 'validity' | 'popular';
export type SortOrder = 'asc' | 'desc';

export function sortPlans<T extends { price: number; data: number; validity: number; isPopular?: boolean }>(
  plans: T[], key: SortKey, order: SortOrder = 'asc',
): T[] {
  return [...plans].sort((a, b) => {
    let diff = 0;
    if (key === 'price')    diff = a.price    - b.price;
    if (key === 'data')     diff = a.data     - b.data;
    if (key === 'validity') diff = a.validity - b.validity;
    if (key === 'popular')  diff = (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    return order === 'asc' ? diff : -diff;
  });
}

// ── 7. SET — Unique Filtering ──────────────────────────────────
// Used in: region filter, unique country codes, saved items

export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const k = item[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function filterBySet<T>(arr: T[], allowed: Set<T>): T[] {
  return arr.filter((item) => allowed.has(item));
}

// ── 8. HASHMAP — O(1) Cart & Notification Lookup ──────────────
// Used in: cart item lookup, notification read-status cache

export class HashMap<K, V> {
  private store: Map<K, V>;

  constructor() { this.store = new Map(); }

  set(key: K, value: V): void  { this.store.set(key, value); }
  get(key: K): V | undefined   { return this.store.get(key); }
  has(key: K): boolean         { return this.store.has(key); }
  delete(key: K): void         { this.store.delete(key); }
  keys(): K[]                  { return [...this.store.keys()]; }
  values(): V[]                { return [...this.store.values()]; }
  entries(): [K, V][]          { return [...this.store.entries()]; }
  size(): number               { return this.store.size; }
  clear(): void                { this.store.clear(); }
  toObject(): Record<string, V> {
    return Object.fromEntries(this.store as Map<string, V>);
  }
}

// ── 9. SLIDING WINDOW — Analytics rolling average ─────────────
// Used in: dashboard analytics — rolling 7-day usage average

export function slidingWindowAverage(data: number[], windowSize: number): number[] {
  if (data.length < windowSize) return [];
  const result: number[] = [];
  let windowSum = data.slice(0, windowSize).reduce((a, b) => a + b, 0);
  result.push(windowSum / windowSize);
  for (let i = windowSize; i < data.length; i++) {
    windowSum += data[i]! - data[i - windowSize]!;
    result.push(windowSum / windowSize);
  }
  return result;
}

// ── 10. TOP-K (MIN HEAP) — Trending Plans ─────────────────────
// Used in: show top-K most popular plans by views

export function topK<T>(arr: T[], k: number, score: (item: T) => number): T[] {
  return [...arr].sort((a, b) => score(b) - score(a)).slice(0, k);
}
