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
  exitModalDismissed:   boolean;
  lastPromoShown:       string | null;
  dismissExitModal:     () => void;
  setPromoShown:        (id: string) => void;
}

const useMarketingStore = create<MarketingStore>()(
  persist(
    (set) => ({
      exitModalDismissed: false,
      lastPromoShown:     null,
      dismissExitModal:   () => set({ exitModalDismissed: true }),
      setPromoShown:      (id) => set({ lastPromoShown: id }),
    }),
    { name: 'marketing-prefs', storage: createJSONStorage(() => localStorage) }
  )
);

// ── Exit Intent Modal ─────────────────────────────────────────
export function ExitIntentModal() {
  const [show, setShow]                 = useState(false);
  const { exitModalDismissed, dismissExitModal } = useMarketingStore();

  const handleMouseLeave = useCallback(
    (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitModalDismissed) setShow(true);
    },
    [exitModalDismissed]
  );

  useEffect(() => {
    // Only run on public marketing pages
    const isPublic = !window.location.pathname.startsWith('/dashboard') &&
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
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-modal-title"
            aria-describedby="exit-modal-desc"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden pointer-events-auto">
              {/* Header gradient */}
              <div className="gradient-brand px-8 pt-8 pb-6 text-white text-center relative">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 rounded-full p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  aria-label="Close offer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="flex items-center justify-center mb-3">
                  <span className="text-5xl" role="img" aria-label="Gift">🎁</span>
                </div>
                <h2 id="exit-modal-title" className="font-display text-2xl font-bold mb-1">
                  Wait! Before You Go
                </h2>
                <p className="text-blue-100 text-sm">
                  Get 15% off your first eSIM plan
                </p>
              </div>

              {/* Body */}
              <div className="p-8 text-center">
                <div className="rounded-xl bg-muted/50 border-2 border-dashed border-primary/30 p-4 mb-6">
                  <p className="text-xs text-muted-foreground mb-1">Use code at checkout</p>
                  <p className="font-display text-2xl font-bold text-primary tracking-wider select-all">
                    WELCOME15
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Valid for 24 hours · New customers only</p>
                </div>

                <p id="exit-modal-desc" className="text-sm text-muted-foreground mb-6">
                  Stay connected in 190+ countries with instant eSIM activation.
                  No physical SIM needed — start saving on roaming today.
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
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
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
  id:       string;
  message:  string;
  cta?:     string;
  ctaHref?: string;
  type?:    'info' | 'success' | 'warning';
}

export function PromoBanner({ id, message, cta, ctaHref, type = 'info' }: PromoBannerProps) {
  const { lastPromoShown, setPromoShown } = useMarketingStore();
  const [dismissed, setDismissed]        = useState(lastPromoShown === id);

  const handleDismiss = () => {
    setDismissed(true);
    setPromoShown(id);
  };

  const colorMap = {
    info:    'bg-blue-600',
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
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 justify-center">
            <Bell className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-xs sm:text-sm font-medium text-center">{message}</p>
            {cta && ctaHref && (
              <Link
                href={ctaHref}
                className="ml-2 underline underline-offset-2 text-xs sm:text-sm font-semibold hover:no-underline flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
              >
                {cta} →
              </Link>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
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
export function CouponBanner({ code, discount, expiresAt }: { code: string; discount: number; expiresAt: string }) {
  const [dismissed, setDismissed] = useState(false);
  const [copied,    setCopied]    = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y:  0 }}
      className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 flex items-center gap-4"
      role="region"
      aria-label="Available coupon"
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">You have a discount coupon!</p>
        <p className="text-xs text-muted-foreground">
          Use <strong>{code}</strong> to get {discount}% off · Expires {new Date(expiresAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size="sm" variant="outline" onClick={handleCopy} aria-label={copied ? 'Copied!' : `Copy coupon code ${code}`}>
          {copied ? '✓ Copied!' : 'Copy Code'}
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Dismiss coupon banner"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
