'use client';
/**
 * WebVitalsReporter — Client Component
 * =====================================
 * Initializes Web Vitals monitoring and performance budget checks.
 * Mounted once in root layout — zero overhead on re-renders.
 */
import { useEffect } from 'react';
import { initWebVitals, checkPerformanceBudget, preconnect } from '@/lib/performance';

export function WebVitalsReporter() {
  useEffect(() => {
    // Start Web Vitals monitoring
    initWebVitals();

    // Check navigation timing budget
    checkPerformanceBudget();

    // Preconnect to external origins for faster resource loading
    preconnect('https://api.esimplatform.com');
    preconnect('https://cdn.esimplatform.com');
    preconnect('https://fonts.googleapis.com');
  }, []);

  return null; // No UI — pure side-effect component
}
