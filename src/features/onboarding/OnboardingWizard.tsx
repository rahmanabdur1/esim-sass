'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Globe, Wifi, QrCode, CheckCircle, ChevronRight,
  ChevronLeft, Smartphone, CreditCard, Star, X,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/constants';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface OnboardingStore {
  completed:  boolean;
  dismissed:  boolean;
  markDone:   () => void;
  dismiss:    () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      completed: false,
      dismissed: false,
      markDone:  () => set({ completed: true }),
      dismiss:   () => set({ dismissed: true }),
    }),
    { name: 'onboarding', storage: createJSONStorage(() => localStorage) }
  )
);

const STEPS = [
  {
    id:       'welcome',
    icon:     Globe,
    color:    'bg-blue-100 text-blue-600',
    title:    'Welcome to eSIM Platform! 👋',
    subtitle: 'Global connectivity in your pocket',
    content:  'Stay connected in 190+ countries without swapping SIM cards. Your eSIM is activated instantly and works alongside your existing number.',
    tip:      '🌍 Works in Europe, Asia, Americas, Middle East & Africa',
  },
  {
    id:       'choose',
    icon:     Wifi,
    color:    'bg-purple-100 text-purple-600',
    title:    'Choose Your Plan',
    subtitle: 'Flexible data for every trip',
    content:  'Browse plans by country or region. Filter by data size, validity, and price. Compare plans side-by-side to find the best value for your trip.',
    tip:      '💡 Use the Travel Planner to get AI-powered recommendations',
  },
  {
    id:       'pay',
    icon:     CreditCard,
    color:    'bg-green-100 text-green-600',
    title:    'Secure Checkout',
    subtitle: 'Pay in seconds',
    content:  'Add a payment method once and reuse it for all future purchases. We support Visa, Mastercard, PayPal, Apple Pay, and Google Pay.',
    tip:      '🔒 256-bit SSL encryption — your card is always safe',
  },
  {
    id:       'activate',
    icon:     QrCode,
    color:    'bg-orange-100 text-orange-600',
    title:    'Scan & Activate',
    subtitle: 'Ready in under 2 minutes',
    content:  'After purchase, scan the QR code in your phone settings under "Cellular" or "Mobile Data". Your eSIM profile installs automatically.',
    tip:      '📱 Compatible with iPhone XS+, Samsung Galaxy S20+, Pixel 3+',
  },
  {
    id:       'travel',
    icon:     Smartphone,
    color:    'bg-pink-100 text-pink-600',
    title:    'Travel & Connect',
    subtitle: "You're all set!",
    content:  'Enable data roaming when you land and your eSIM connects automatically to local networks. Monitor usage from your dashboard anytime.',
    tip:      '⚡ Monitor usage, top up, or buy new plans from your dashboard',
  },
] as const;

interface OnboardingWizardProps {
  onClose?: () => void;
}

export function OnboardingWizard({ onClose }: OnboardingWizardProps) {
  const [step, setStep]         = useState(0);
  const [direction, setDirection] = useState(1);
  const { markDone, dismiss }   = useOnboardingStore();
  const router                  = useRouter();
  const current                 = STEPS[step] ?? STEPS[0];
  const isLast                  = step === STEPS.length - 1;

  const go = (dir: 1 | -1) => {
    setDirection(dir);
    setStep((s) => Math.min(Math.max(s + dir, 0), STEPS.length - 1));
  };

  const finish = () => {
    markDone();
    onClose?.();
    router.push(ROUTES.BUY_PLAN);
  };

  const handleDismiss = () => { dismiss(); onClose?.(); };

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-describedby="onboarding-content"
      className="w-full max-w-md mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {/* Step dots */}
        <div className="flex gap-1.5" role="tablist" aria-label="Onboarding steps">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}: ${s.title}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-primary' : i < step ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Skip onboarding"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Step content */}
      <div className="overflow-hidden mb-6 min-h-56">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex flex-col items-center text-center"
          >
            {/* Icon */}
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${current.color} mb-5`}>
              <current.icon className="h-10 w-10" aria-hidden="true" />
            </div>

            {/* Text */}
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              {current.subtitle}
            </p>
            <h2 id="onboarding-title" className="font-display text-xl font-bold mb-3">
              {current.title}
            </h2>
            <p id="onboarding-content" className="text-sm text-muted-foreground leading-relaxed mb-4">
              {current.content}
            </p>

            {/* Tip */}
            <div className="rounded-lg bg-muted/50 px-4 py-2.5 text-xs text-muted-foreground w-full">
              {current.tip}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => go(-1)}
          disabled={step === 0}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
          aria-label="Previous step"
        >
          Back
        </Button>
        <div className="flex-1" />
        {isLast ? (
          <Button
            variant="gradient"
            onClick={finish}
            leftIcon={<CheckCircle className="h-4 w-4" />}
          >
            Get Started!
          </Button>
        ) : (
          <Button
            variant="gradient"
            onClick={() => go(1)}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        )}
      </div>

      {/* Skip */}
      <button
        onClick={handleDismiss}
        className="mt-4 w-full text-xs text-muted-foreground hover:text-foreground text-center transition-colors"
      >
        Skip tutorial
      </button>
    </div>
  );
}
