'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, ArrowRight, Bell } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import Link from 'next/link';
import { ROUTES } from '@/constants';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Store ─────────────────────────────────────────────────────
interface MarketingStore {
  exitModalDismissed: boolean;
  lastPromoShown: string | null;
  dismissExitModal: () => void;
  setPromoShown: (id: string) => void;
}

const useMarketingStore = create<MarketingStore>()(
  persist(
    (set) => ({
      exitModalDismissed: false,
      lastPromoShown: null,
      dismissExitModal: () => set({ exitModalDismissed: true }),
      setPromoShown: (id) => set({ lastPromoShown: id }),
    }),
    { name: 'marketing-prefs', storage: createJSONStorage(() => localStorage) },
  ),
);

// ── Exit Intent Modal ─────────────────────────────────────────
export function ExitIntentModal() {
  const [show, setShow] = useState(false);
  const { exitModalDismissed, dismissExitModal } = useMarketingStore();

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitModalDismissed) setShow(true);
    },
    [exitModalDismissed],
  );

  useEffect(() => {
    // Only run on public marketing pages
    const isPublic =
      !window.location.pathname.startsWith('/dashboard') &&
      !window.location.pathname.startsWith('/auth');
    if (!isPublic || exitModalDismissed) return;

    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 30_000); // 30 second delay before activating

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitModalDismissed, handleMouseLeave]);

  const handleDismiss = () => {
    setShow(false);
    dismissExitModal();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleDismiss}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
            aria-describedby="exit-modal-desc"
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl bg-card shadow-2xl">
              {/* Header gradient */}
              <div className="gradient-brand relative px-8 pb-6 pt-8 text-center text-white">
                <button
                  onClick={handleDismiss}
                  className="absolute right-4 top-4 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Close offer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="mb-3 flex items-center justify-center">
                  <span className="text-5xl" role="img" aria-label="Gift">
                    🎁
                  </span>
                </div>
                <h2 id="exit-modal-title" className="mb-1 font-display text-2xl font-bold">
                  Wait! Before You Go
                </h2>
                <p className="text-sm text-blue-100">Get 15% off your first eSIM plan</p>
              </div>

              {/* Body */}
              <div className="p-8 text-center">
                <div className="mb-6 rounded-xl border-2 border-dashed border-primary/30 bg-muted/50 p-4">
                  <p className="mb-1 text-xs text-muted-foreground">Use code at checkout</p>
                  <p className="select-all font-display text-2xl font-bold tracking-wider text-primary">
                    WELCOME15
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valid for 24 hours · New customers only
                  </p>
                </div>

                <p id="exit-modal-desc" className="mb-6 text-sm text-muted-foreground">
                  Stay connected in 190+ countries with instant eSIM activation. No physical SIM
                  needed — start saving on roaming today.
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="gradient"
                    className="w-full"
                    asChild
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    onClick={handleDismiss}
                  >
                    <Link href={ROUTES.PLANS}>Claim My 15% Off</Link>
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="py-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    No thanks, I'll pay full price
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Promotional Banner ────────────────────────────────────────
interface PromoBannerProps {
  id: string;
  message: string;
  cta?: string;
  ctaHref?: string;
  type?: 'info' | 'success' | 'warning';
}

export function PromoBanner({ id, message, cta, ctaHref, type = 'info' }: PromoBannerProps) {
  const { lastPromoShown, setPromoShown } = useMarketingStore();
  const [dismissed, setDismissed] = useState(lastPromoShown === id);

  const handleDismiss = () => {
    setDismissed(true);
    setPromoShown(id);
  };

  const colorMap = {
    info: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-orange-500',
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${colorMap[type]} text-white`}
        role="banner"
        aria-label="Promotional announcement"
      >
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex flex-1 items-center justify-center gap-2">
            <Bell className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-center text-xs font-medium sm:text-sm">{message}</p>
            {cta && ctaHref && (
              <Link
                href={ctaHref}
                className="ml-2 flex-shrink-0 rounded text-xs font-semibold underline underline-offset-2 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
              >
                {cta} →
              </Link>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 rounded text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Dismiss announcement"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Coupon Banner (in dashboard) ──────────────────────────────
export function CouponBanner({
  code,
  discount,
  expiresAt,
}: {
  code: string;
  discount: number;
  expiresAt: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-4"
      role="region"
      aria-label="Available coupon"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">You have a discount coupon!</p>
        <p className="text-xs text-muted-foreground">
          Use <strong>{code}</strong> to get {discount}% off · Expires{' '}
          {new Date(expiresAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          aria-label={copied ? 'Copied!' : `Copy coupon code ${code}`}
        >
          {copied ? '✓ Copied!' : 'Copy Code'}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Dismiss coupon banner"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
