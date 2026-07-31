'use client';
import React, { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/atoms/Button';
import {
  useSessionSecurityStore,
  SESSION_TIMEOUT_MS,
  WARN_BEFORE_MS,
  SESSION_CHANNEL,
} from '@/store/security/sessionStore';
import { useLogout } from '@/hooks';
import { useAuthStore } from '@/store';
import { ROUTES } from '@/constants';

function formatSeconds(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}s`;
}

export function SessionTimeoutGuard({ children }: { children: React.ReactNode }) {
  const {
    lastActivity,
    isWarning,
    isTimedOut,
    warningDismissed,
    recordActivity,
    setWarning,
    setTimedOut,
  } = useSessionSecurityStore();

  const { mutate: logoutMutate } = useLogout();
  const { logout: clearStore } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [remaining, setRemaining] = React.useState(0);

  // Perform full logout: clear store + cache + navigate
  const logout = useCallback(() => {
    logoutMutate(undefined, {
      onSettled: () => {
        clearStore();
        queryClient.clear();
        router.push(ROUTES.LOGIN);
      },
    });
  }, [logoutMutate, clearStore, queryClient, router]);

  // BroadcastChannel for multi-tab sync
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      channelRef.current = new BroadcastChannel(SESSION_CHANNEL);
      channelRef.current.onmessage = (e) => {
        if (e.data?.type === 'ACTIVITY') recordActivity();
        if (e.data?.type === 'LOGOUT') logout();
      };
    } catch {}
    return () => channelRef.current?.close();
  }, [recordActivity, logout]);

  // Activity listeners
  const handleActivity = useCallback(() => {
    recordActivity();
    channelRef.current?.postMessage({ type: 'ACTIVITY', ts: Date.now() });
  }, [recordActivity]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, handleActivity));
  }, [handleActivity]);

  // Tick
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const idle = Date.now() - lastActivity;
      const timeLeft = SESSION_TIMEOUT_MS - idle;

      setRemaining(Math.max(0, timeLeft));

      if (timeLeft <= 0 && !isTimedOut) {
        setTimedOut(true);
        logout();
      } else if (timeLeft <= WARN_BEFORE_MS && !isWarning && !warningDismissed) setWarning(true);
      else if (timeLeft > WARN_BEFORE_MS && isWarning) setWarning(false);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lastActivity, isWarning, isTimedOut, warningDismissed, setWarning, setTimedOut, logout]);

  const handleExtend = () => {
    recordActivity();
    channelRef.current?.postMessage({ type: 'ACTIVITY' });
  };
  const handleLogout = () => {
    channelRef.current?.postMessage({ type: 'LOGOUT' });
    logout();
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {isWarning && !warningDismissed && (
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="session-warn-title"
            aria-describedby="session-warn-desc"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border bg-card p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" aria-hidden="true" />
              </div>
              <div>
                <h2 id="session-warn-title" className="text-sm font-semibold">
                  Session Expiring
                </h2>
                <p id="session-warn-desc" className="mt-0.5 text-xs text-muted-foreground">
                  Your session expires in{' '}
                  <strong className="text-yellow-600">{formatSeconds(remaining)}</strong>. Continue?
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="gradient"
                className="flex-1"
                onClick={handleExtend}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Continue
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleLogout}
                leftIcon={<LogOut className="h-3.5 w-3.5" />}
              >
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
