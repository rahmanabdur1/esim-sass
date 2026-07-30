'use client';
import React, { useMemo } from 'react';

/**
 * Feature Flag System
 * Runtime feature toggling without deployments.
 * Reads from env vars + remote config (if available).
 */

export interface FeatureFlags {
  enableBlog: boolean;
  enableReferral: boolean;
  enableRewards: boolean;
  enable2FA: boolean;
  enableComparePlans: boolean;
  enableTravelPlanner: boolean;
  enablePWA: boolean;
  enableI18n: boolean;
  enableCommandPalette: boolean;
  enableAdvancedAnalytics: boolean;
  enableMaintenanceMode: boolean;
  enableCaptcha: boolean;
  enableDevtools: boolean;
  enableMathCaptcha: boolean;
}

/** Read feature flags from environment variables */
function readEnvFlags(): FeatureFlags {
  const bool = (key: string, fallback = true): boolean => {
    const val = process.env[key];
    if (val === undefined) return fallback;
    return val === 'true' || val === '1';
  };

  return {
    enableBlog: bool('NEXT_PUBLIC_ENABLE_BLOG', true),
    enableReferral: bool('NEXT_PUBLIC_ENABLE_REFERRAL', true),
    enableRewards: bool('NEXT_PUBLIC_ENABLE_REWARDS', true),
    enable2FA: bool('NEXT_PUBLIC_ENABLE_2FA', false),
    enableComparePlans: bool('NEXT_PUBLIC_ENABLE_COMPARE_PLANS', true),
    enableTravelPlanner: bool('NEXT_PUBLIC_ENABLE_TRAVEL_PLANNER', true),
    enablePWA: bool('NEXT_PUBLIC_ENABLE_PWA', true),
    enableI18n: bool('NEXT_PUBLIC_ENABLE_I18N', true),
    enableCommandPalette: bool('NEXT_PUBLIC_ENABLE_COMMAND_PALETTE', true),
    enableAdvancedAnalytics: bool('NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS', true),
    enableMaintenanceMode: bool('NEXT_PUBLIC_MAINTENANCE_MODE', false),
    enableCaptcha: bool('NEXT_PUBLIC_ENABLE_CAPTCHA', false),
    enableDevtools: bool('NEXT_PUBLIC_ENABLE_DEVTOOLS', false),
    enableMathCaptcha: bool('NEXT_PUBLIC_ENABLE_MATH_CAPTCHA', false),
  };
}

// Singleton flags instance
let _flags: FeatureFlags | null = null;

export function getFeatureFlags(): FeatureFlags {
  if (!_flags) _flags = readEnvFlags();
  return _flags;
}

export function useFeatureFlags(): FeatureFlags {
  return useMemo(() => getFeatureFlags(), []);
}

interface FeatureGateProps {
  flag: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const flags = useFeatureFlags();
  return <>{flags[flag] ? children : fallback}</>;
}

/** HOC version */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flag: keyof FeatureFlags,
  Fallback?: React.ComponentType<P>,
) {
  return function FeatureFlagged(props: P) {
    const flags = useFeatureFlags();
    if (!flags[flag]) return Fallback ? <Fallback {...props} /> : null;
    return <Component {...props} />;
  };
}

/** Log active flags in development */
export function logFeatureFlags(): void {
  if (process.env.NODE_ENV !== 'development') return;
  const flags = getFeatureFlags();
  console.info('[FeatureFlags] Active flags:');
  Object.entries(flags).forEach(([key, val]) => {
    console.info(`  ${val ? '✅' : '❌'} ${key}`);
  });
}
