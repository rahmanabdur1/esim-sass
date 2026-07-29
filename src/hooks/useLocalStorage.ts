/**
 * useLocalStorage — Production-Ready SSR-safe hook
 * ==================================================
 *
 * ⚠️  IMPORTANT: localStorage is CLIENT-ONLY + DEVICE-SPECIFIC
 *
 * USE localStorage FOR:
 *   ✅ UI preferences (theme, language, sidebar state)
 *   ✅ Guest cart items (before login)
 *   ✅ Recently viewed items
 *   ✅ Cookie consent, onboarding state
 *   ✅ Form draft (auto-save)
 *
 * NEVER use localStorage FOR:
 *   ❌ Auth tokens → Use HttpOnly Cookie
 *   ❌ User profile, orders → Use Database (API)
 *   ❌ Payment info → Never client-side
 *   ❌ Sensitive PII → Never client-side
 *
 * PRODUCTION behaviour:
 *   - Data stays in THIS browser only
 *   - Cleared on: browser cache clear, private mode, new device
 *   - Max storage: ~5MB per origin
 *   - For cross-device sync: use Database + API
 */
import { useState, useEffect, useCallback, useRef } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;
type RemoveValue  = () => void;

interface Options {
  /** Sync changes to server (for cross-device persistence) */
  syncToServer?: (key: string, value: unknown) => Promise<void>;
  /** Load initial value from server (overrides localStorage) */
  loadFromServer?: (key: string) => Promise<unknown>;
  /** Expire localStorage value after N milliseconds */
  expiresIn?: number;
}

interface StoredItem<T> {
  value:     T;
  expiresAt: number | null;
  version:   number;
}

const STORAGE_VERSION = 1;

export function useLocalStorage<T>(
  key:          string,
  initialValue: T,
  options:      Options = {},
): [T, SetValue<T>, RemoveValue, { isLoading: boolean; isSynced: boolean }] {
  const { syncToServer, loadFromServer, expiresIn } = options;

  const [isLoading, setIsLoading] = useState(!!loadFromServer);
  const [isSynced,  setIsSynced]  = useState(!loadFromServer);
  const initRef = useRef(false);

  // ── Read from localStorage (with expiry check) ─────────────
  const read = useCallback((): T => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initialValue;

      const parsed: StoredItem<T> = JSON.parse(raw);

      // Check version compatibility
      if (parsed.version !== STORAGE_VERSION) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      // Check expiry
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(read);

  // ── Load from server on mount (cross-device sync) ──────────
  useEffect(() => {
    if (!loadFromServer || initRef.current) return;
    initRef.current = true;

    loadFromServer(key)
      .then((serverValue) => {
        if (serverValue !== undefined && serverValue !== null) {
          // Server value takes priority (most recent, cross-device)
          setStoredValue(serverValue as T);
          // Update localStorage with server value
          const item: StoredItem<T> = {
            value:     serverValue as T,
            expiresAt: expiresIn ? Date.now() + expiresIn : null,
            version:   STORAGE_VERSION,
          };
          window.localStorage.setItem(key, JSON.stringify(item));
        }
      })
      .catch(() => { /* use localStorage fallback */ })
      .finally(() => { setIsLoading(false); setIsSynced(true); });
  }, [key, loadFromServer, expiresIn]);

  // ── Write to localStorage + optional server sync ───────────
  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const next = value instanceof Function ? value(storedValue) : value;

        // Write to localStorage with metadata
        const item: StoredItem<T> = {
          value:     next,
          expiresAt: expiresIn ? Date.now() + expiresIn : null,
          version:   STORAGE_VERSION,
        };
        window.localStorage.setItem(key, JSON.stringify(item));
        setStoredValue(next);

        // Optional: sync to server for cross-device persistence
        if (syncToServer) {
          setIsSynced(false);
          syncToServer(key, next)
            .then(() => setIsSynced(true))
            .catch(() => {
              // Server sync failed — localStorage still updated
              // Will retry on next save
              setIsSynced(false);
            });
        }

        // Notify other tabs
        window.dispatchEvent(
          new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(item),
          }),
        );
      } catch (e) {
        // QuotaExceededError — storage full
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          console.warn(`[useLocalStorage] Storage quota exceeded for key: ${key}`);
          // Try to clear expired entries and retry
          clearExpiredEntries();
          try {
            const item: StoredItem<T> = {
              value: value instanceof Function ? value(storedValue) : value,
              expiresAt: null,
              version:   STORAGE_VERSION,
            };
            window.localStorage.setItem(key, JSON.stringify(item));
          } catch {
            // Still failing — fail silently
          }
        }
      }
    },
    [key, storedValue, syncToServer, expiresIn],
  );

  // ── Remove from localStorage ──────────────────────────────
  const removeValue: RemoveValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch { /* empty */ }
  }, [key, initialValue]);

  // ── Cross-tab synchronization ─────────────────────────────
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setStoredValue(initialValue);
        return;
      }
      try {
        const parsed: StoredItem<T> = JSON.parse(e.newValue);
        if (parsed.version === STORAGE_VERSION) {
          setStoredValue(parsed.value);
        }
      } catch { /* empty */ }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, { isLoading, isSynced }];
}

// ── Helper: clear expired entries to free space ────────────────
function clearExpiredEntries() {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const keys = Object.keys(window.localStorage);
  for (const key of keys) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { expiresAt?: number };
      if (parsed.expiresAt && now > parsed.expiresAt) {
        window.localStorage.removeItem(key);
      }
    } catch { /* not our format, skip */ }
  }
}

// ── Simple version (no options) for backward compatibility ─────
export function useSimpleLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue, removeValue] = useLocalStorage(key, initialValue);
  return [value, setValue, removeValue] as const;
}
