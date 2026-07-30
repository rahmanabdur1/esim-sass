'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================================
// SESSION SECURITY STORE
// ============================================================

export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min
export const WARN_BEFORE_MS = 2 * 60 * 1000; // warn 2 min before
export const SESSION_CHANNEL = 'esim_session_sync';

export interface SessionDevice {
  id: string;
  name: string;
  os: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: number;
  current: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: number;
  ip: string;
  location: string;
  browser: string;
  os: string;
  success: boolean;
}

interface SessionSecurityStore {
  // Inactivity timeout
  lastActivity: number;
  isWarning: boolean;
  isTimedOut: boolean;
  warningDismissed: boolean;

  // Session info
  sessionId: string | null;
  loginAt: number | null;
  devices: SessionDevice[];
  loginHistory: LoginHistoryEntry[];

  // Actions
  recordActivity: () => void;
  setWarning: (v: boolean) => void;
  setTimedOut: (v: boolean) => void;
  dismissWarning: () => void;
  setSessionId: (id: string) => void;
  setDevices: (d: SessionDevice[]) => void;
  setLoginHistory: (h: LoginHistoryEntry[]) => void;
  revokeDevice: (id: string) => void;
  resetSession: () => void;
}

export const useSessionSecurityStore = create<SessionSecurityStore>()(
  persist(
    (set) => ({
      lastActivity: Date.now(),
      isWarning: false,
      isTimedOut: false,
      warningDismissed: false,
      sessionId: null,
      loginAt: null,
      devices: [],
      loginHistory: [],

      recordActivity: () =>
        set({
          lastActivity: Date.now(),
          isWarning: false,
          isTimedOut: false,
          warningDismissed: false,
        }),
      setWarning: (v) => set({ isWarning: v }),
      setTimedOut: (v) => set({ isTimedOut: v }),
      dismissWarning: () => set({ warningDismissed: true, isWarning: false }),
      setSessionId: (id) => set({ sessionId: id, loginAt: Date.now() }),
      setDevices: (d) => set({ devices: d }),
      setLoginHistory: (h) => set({ loginHistory: h }),
      revokeDevice: (id) => set((s) => ({ devices: s.devices.filter((d) => d.id !== id) })),
      resetSession: () =>
        set({
          lastActivity: Date.now(),
          isWarning: false,
          isTimedOut: false,
          warningDismissed: false,
          sessionId: null,
          loginAt: null,
        }),
    }),
    {
      name: 'session-security',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        lastActivity: s.lastActivity,
        sessionId: s.sessionId,
        loginAt: s.loginAt,
      }),
    },
  ),
);
