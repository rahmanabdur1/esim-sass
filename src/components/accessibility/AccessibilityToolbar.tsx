'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Type, Sun, Moon, Zap, ZapOff, X } from 'lucide-react';
import { cn } from '@/utils';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── Custom Hook for Hydration Safety ─────────────────────────
function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

// ─── A11y Store ───────────────────────────────────────────────
interface A11yStore {
  fontSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  reduceMotion: boolean;
  setFontSize: (s: 'normal' | 'large' | 'xl') => void;
  toggleContrast: () => void;
  toggleMotion: () => void;
}

export const useA11yStore = create<A11yStore>()(
  persist(
    (set) => ({
      fontSize: 'normal',
      highContrast: false,
      reduceMotion: false,
      setFontSize: (fontSize) => set({ fontSize }),
      toggleContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleMotion: () => set((s) => ({ reduceMotion: !s.reduceMotion })),
    }),
    { name: 'a11y-prefs', storage: createJSONStorage(() => localStorage) },
  ),
);

// ─── Apply preferences to <html> element ─────────────────────
export function A11yProvider({ children }: { children: React.ReactNode }) {
  const { fontSize, highContrast, reduceMotion } = useA11yStore();
  const mounted = useHasMounted();

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    // Font size
    root.classList.remove('text-base-size', 'text-large-size', 'text-xl-size');
    root.classList.add(
      fontSize === 'large'
        ? 'text-large-size'
        : fontSize === 'xl'
          ? 'text-xl-size'
          : 'text-base-size',
    );
    // High contrast
    root.classList.toggle('high-contrast', highContrast);
    // Reduce motion
    root.classList.toggle('reduce-motion', reduceMotion);
  }, [fontSize, highContrast, reduceMotion, mounted]);

  return <>{children}</>;
}

// ─── Accessibility Toolbar Component ─────────────────────────
export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const mounted = useHasMounted();
  const { fontSize, highContrast, reduceMotion, setFontSize, toggleContrast, toggleMotion } =
    useA11yStore();

  const fontOptions: { value: 'normal' | 'large' | 'xl'; label: string; size: string }[] = [
    { value: 'normal', label: 'Normal', size: 'text-sm' },
    { value: 'large', label: 'Large', size: 'text-base' },
    { value: 'xl', label: 'X-Large', size: 'text-lg' },
  ];

  // Client-side mount না হওয়া পর্যন্ত Server Markup-এর সাথে সামঞ্জস্য রাখতে null রিটার্ন করা হবে
  if (!mounted) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 left-6 z-40"
      role="region"
      aria-label="Accessibility toolbar"
      suppressHydrationWarning
    >
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="a11y-toolbar-panel"
        aria-label="Open accessibility toolbar"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Accessibility className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="a11y-toolbar-panel"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            className="absolute bottom-14 left-0 w-64 rounded-2xl border bg-card p-4 shadow-2xl"
            role="dialog"
            aria-label="Accessibility options"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Accessibility className="h-4 w-4 text-primary" aria-hidden="true" />
                Accessibility
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close accessibility toolbar"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Font Size */}
            <fieldset className="mb-4">
              <legend className="mb-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Type className="h-3.5 w-3.5" aria-hidden="true" /> Text Size
              </legend>
              <div className="grid grid-cols-3 gap-1.5">
                {fontOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFontSize(opt.value)}
                    aria-pressed={fontSize === opt.value}
                    className={cn(
                      'rounded-lg border px-1 py-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      opt.size,
                      fontSize === opt.value
                        ? 'border-primary bg-primary/10 font-semibold text-primary'
                        : 'text-muted-foreground hover:bg-muted/50',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Toggle options */}
            <div className="space-y-2">
              {[
                {
                  label: 'High Contrast',
                  desc: 'Increase text & element contrast',
                  icon: highContrast ? Sun : Moon,
                  active: highContrast,
                  toggle: toggleContrast,
                },
                {
                  label: 'Reduce Motion',
                  desc: 'Minimize animations & transitions',
                  icon: reduceMotion ? ZapOff : Zap,
                  active: reduceMotion,
                  toggle: toggleMotion,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.toggle}
                  aria-pressed={item.active}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    item.active ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      item.active ? 'text-primary' : 'text-muted-foreground',
                    )}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <div
                    className={cn(
                      'ml-auto h-5 w-9 flex-shrink-0 rounded-full transition-colors',
                      item.active ? 'bg-primary' : 'bg-muted',
                    )}
                  >
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full bg-white shadow transition-transform',
                        item.active ? 'translate-x-4' : 'translate-x-0',
                      )}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Skip link */}
            <div className="mt-3 border-t pt-3">
              <a
                href="#main-content"
                className="rounded text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ↓ Skip to main content
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
