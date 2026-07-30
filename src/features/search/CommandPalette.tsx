'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  Wifi,
  ShoppingCart,
  Package,
  BarChart2,
  Bell,
  Headphones,
  Gift,
  Star,
  User,
  Shield,
  CreditCard,
  Settings,
  Globe,
  FileText,
  HelpCircle,
  Moon,
  Sun,
  ArrowRight,
  Hash,
} from 'lucide-react';
import { cn } from '@/utils';
import { ROUTES } from '@/constants';
import { useAuthStore, useThemeStore } from '@/store';
import { useDebounce } from '@/hooks/useDebounce';

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
  keywords: string[];
  shortcut?: string;
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debouncedQuery = useDebounce(query, 120);

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      onClose();
    },
    [router, onClose],
  );

  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation
      {
        id: 'home',
        label: 'Home',
        icon: Globe,
        category: 'Navigation',
        action: () => navigate(ROUTES.HOME),
        keywords: ['home', 'landing'],
      },
      {
        id: 'plans',
        label: 'Browse Plans',
        icon: ShoppingCart,
        category: 'Navigation',
        action: () => navigate(ROUTES.PLANS),
        keywords: ['plans', 'buy', 'esim'],
      },
      {
        id: 'countries',
        label: 'Countries',
        icon: Globe,
        category: 'Navigation',
        action: () => navigate(ROUTES.COUNTRIES),
        keywords: ['countries', 'coverage', 'map'],
      },
      {
        id: 'blog',
        label: 'Blog',
        icon: FileText,
        category: 'Navigation',
        action: () => navigate(ROUTES.BLOG),
        keywords: ['blog', 'articles', 'news'],
      },
      {
        id: 'faq',
        label: 'FAQ',
        icon: HelpCircle,
        category: 'Navigation',
        action: () => navigate(ROUTES.FAQ),
        keywords: ['faq', 'help', 'questions'],
      },
      // Dashboard
      ...(isAuthenticated
        ? [
            {
              id: 'dashboard',
              label: 'Dashboard',
              icon: LayoutDashboard,
              category: 'Dashboard',
              action: () => navigate(ROUTES.DASHBOARD),
              keywords: ['dashboard', 'home'],
            },
            {
              id: 'esims',
              label: 'My eSIMs',
              icon: Wifi,
              category: 'Dashboard',
              action: () => navigate(ROUTES.MY_ESIMS),
              keywords: ['esims', 'sim', 'active'],
            },
            {
              id: 'buy',
              label: 'Buy a Plan',
              icon: ShoppingCart,
              category: 'Dashboard',
              action: () => navigate(ROUTES.BUY_PLAN),
              keywords: ['buy', 'purchase', 'plan'],
            },
            {
              id: 'orders',
              label: 'Orders',
              icon: Package,
              category: 'Dashboard',
              action: () => navigate(ROUTES.ORDERS),
              keywords: ['orders', 'history'],
            },
            {
              id: 'analytics',
              label: 'Analytics',
              icon: BarChart2,
              category: 'Dashboard',
              action: () => navigate(ROUTES.ANALYTICS),
              keywords: ['analytics', 'usage', 'data'],
            },
            {
              id: 'notifs',
              label: 'Notifications',
              icon: Bell,
              category: 'Dashboard',
              action: () => navigate(ROUTES.NOTIFICATIONS),
              keywords: ['notifications', 'alerts'],
            },
            {
              id: 'support',
              label: 'Support',
              icon: Headphones,
              category: 'Dashboard',
              action: () => navigate(ROUTES.SUPPORT),
              keywords: ['support', 'ticket', 'help'],
            },
            {
              id: 'referral',
              label: 'Referral',
              icon: Gift,
              category: 'Dashboard',
              action: () => navigate(ROUTES.REFERRAL),
              keywords: ['referral', 'invite', 'earn'],
            },
            {
              id: 'rewards',
              label: 'Rewards',
              icon: Star,
              category: 'Dashboard',
              action: () => navigate(ROUTES.REWARDS),
              keywords: ['rewards', 'points', 'loyalty'],
            },
            {
              id: 'profile',
              label: 'Profile',
              icon: User,
              category: 'Account',
              action: () => navigate(ROUTES.PROFILE),
              keywords: ['profile', 'account'],
            },
            {
              id: 'security',
              label: 'Security',
              icon: Shield,
              category: 'Account',
              action: () => navigate(ROUTES.SECURITY),
              keywords: ['security', 'password', '2fa'],
            },
            {
              id: 'payments',
              label: 'Payment Methods',
              icon: CreditCard,
              category: 'Account',
              action: () => navigate(ROUTES.PAYMENT_METHODS),
              keywords: ['payment', 'card', 'billing'],
            },
            {
              id: 'settings',
              label: 'Settings',
              icon: Settings,
              category: 'Account',
              action: () => navigate(ROUTES.SETTINGS),
              keywords: ['settings', 'preferences'],
            },
          ]
        : []),
      // Quick Actions
      {
        id: 'toggle-theme',
        label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon: theme === 'dark' ? Sun : Moon,
        category: 'Quick Actions',
        shortcut: '⌘⇧L',
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          onClose();
        },
        keywords: ['theme', 'dark', 'light', 'mode'],
      },
    ];
    return items;
  }, [isAuthenticated, navigate, theme, setTheme, onClose]);

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return allItems;
    const q = debouncedQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q)) ||
        item.category.toLowerCase().includes(q),
    );
  }, [allItems, debouncedQuery]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((item) => {
      const cat = map.get(item.category) ?? [];
      cat.push(item);
      map.set(item.category, cat);
    });
    return map;
  }, [filtered]);

  // Keyboard nav
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      filtered[active]?.action();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  let globalIdx = -1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -12 }}
            transition={{ duration: 0.15 }}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border bg-card shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b px-4" role="search">
              <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={handleKey}
                placeholder="Search plans, pages, actions…"
                aria-label="Command search"
                aria-autocomplete="list"
                aria-controls="cmd-list"
                aria-activedescendant={
                  filtered[active] ? `cmd-item-${filtered[active].id}` : undefined
                }
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:inline-flex">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <ul
              id="cmd-list"
              ref={listRef}
              role="listbox"
              aria-label="Search results"
              className="max-h-80 overflow-y-auto py-2"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No results for "{query}"
                </li>
              ) : (
                Array.from(grouped.entries()).map(([category, items]) => (
                  <li key={category} role="group" aria-label={category}>
                    <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Hash className="h-3 w-3" aria-hidden="true" /> {category}
                    </div>
                    <ul>
                      {items.map((item) => {
                        globalIdx++;
                        const idx = globalIdx;
                        const isActive = idx === active;
                        return (
                          <li key={item.id}>
                            <button
                              id={`cmd-item-${item.id}`}
                              data-idx={idx}
                              role="option"
                              aria-selected={isActive}
                              onClick={item.action}
                              onMouseEnter={() => setActive(idx)}
                              className={cn(
                                'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                                isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50',
                              )}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.sublabel && (
                                <span className="text-xs text-muted-foreground">
                                  {item.sublabel}
                                </span>
                              )}
                              {item.shortcut && (
                                <kbd className="rounded bg-muted px-1 text-xs text-muted-foreground">
                                  {item.shortcut}
                                </kbd>
                              )}
                              {isActive && (
                                <ArrowRight
                                  className="h-3.5 w-3.5 text-primary"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))
              )}
            </ul>

            {/* Footer */}
            <div className="flex items-center gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-muted px-1">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-muted px-1">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded bg-muted px-1">ESC</kbd> close
              </span>
              <span className="ml-auto flex items-center gap-1">
                <kbd className="rounded bg-muted px-1">⌘K</kbd> to open
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
