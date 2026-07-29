'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { CommandPalette, useCommandPalette } from '@/features/search/CommandPalette';
import { ExitIntentModal } from '@/features/analytics/MarketingComponents';
import { SessionTimeoutGuard } from '@/components/security/SessionTimeoutGuard';
import { useAuthStore } from '@/store';

/**
 * Mounts all global, client-only overlay UI in one place:
 * - ⌘K Command Palette (available everywhere)
 * - Exit Intent Modal (public marketing pages only)
 * - Session Timeout Guard (wraps children when authenticated)
 */
export function GlobalOverlays({ children }: { children: React.ReactNode }) {
  const { open, setOpen } = useCommandPalette();
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  const content = (
    <>
      {children}
      <CommandPalette open={open} onClose={() => setOpen(false)} />
      {!isDashboard && <ExitIntentModal />}
    </>
  );

  // Only wrap with session timeout logic when authenticated + inside the dashboard
  if (isAuthenticated && isDashboard) {
    return <SessionTimeoutGuard>{content}</SessionTimeoutGuard>;
  }

  return content;
}
