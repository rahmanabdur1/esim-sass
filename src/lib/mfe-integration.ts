/**
 * MICROFRONTEND INTEGRATION GUIDE
 * ================================
 * How all pieces connect in the eSIM Platform MFE architecture.
 *
 * Communication patterns between microfrontends:
 * 1. Shared packages  → @esim/ui, @esim/types, @esim/utils, @esim/api-client
 * 2. URL-based routing → shell app orchestrates /dashboard/* → dashboard MFE
 * 3. Custom events     → cross-MFE notifications (auth state changes)
 * 4. Shared cookies    → JWT HttpOnly cookie readable by all same-domain MFEs
 */

// ── 1. CROSS-MFE EVENT BUS ────────────────────────────────────
// Lightweight pub/sub for cross-MFE communication without coupling

type MFEEventMap = {
  'auth:login':      { userId: string; email: string };
  'auth:logout':     Record<string, never>;
  'cart:updated':    { itemCount: number };
  'esim:activated':  { esimId: string; country: string };
  'plan:selected':   { planId: string; planName: string };
};

type MFEEventName = keyof MFEEventMap;

class MFEEventBus {
  private handlers = new Map<string, Set<(payload: unknown) => void>>();

  emit<K extends MFEEventName>(event: K, payload: MFEEventMap[K]) {
    this.handlers.get(event)?.forEach((h) => h(payload));
    // Also dispatch as CustomEvent for cross-frame communication
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(`mfe:${event}`, { detail: payload }));
    }
  }

  on<K extends MFEEventName>(event: K, handler: (payload: MFEEventMap[K]) => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler as (p: unknown) => void);
    return () => this.handlers.get(event)?.delete(handler as (p: unknown) => void);
  }
}

export const mfeEvents = new MFEEventBus();

// Usage:
// Shell emits when user logs in:
// mfeEvents.emit('auth:login', { userId: '123', email: 'user@example.com' });
//
// Dashboard MFE listens:
// mfeEvents.on('auth:login', ({ userId }) => loadUserData(userId));

// ── 2. SHARED AUTH STATE ─────────────────────────────────────
// HttpOnly cookie is same-domain accessible to all MFEs.
// Zustand useAuthStore syncs across tabs via BroadcastChannel.

// ── 3. MODULE FEDERATION (future upgrade path) ──────────────
// When teams need runtime composition (not build-time):
//
// next.config.js in shell app:
// const { NextFederationPlugin } = require('@module-federation/nextjs-mf');
// plugins: [
//   new NextFederationPlugin({
//     name: 'shell',
//     remotes: {
//       dashboard: 'dashboard@http://localhost:3001/_next/static/chunks/remoteEntry.js',
//       marketing: 'marketing@http://localhost:3002/_next/static/chunks/remoteEntry.js',
//     },
//     shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
//   }),
// ]
//
// Usage in shell:
// const DashboardApp = dynamic(() => import('dashboard/App'), { ssr: false });

// ── 4. DEPLOYMENT TOPOLOGY ───────────────────────────────────
//
//   Browser → Vercel Edge Network (CDN)
//              ├── / → shell app (port 3000)
//              ├── /dashboard/* → dashboard MFE (port 3001, different deployment)
//              └── /blog, /plans, /countries → marketing MFE (port 3002)
//
//   Each MFE deploys to its own Vercel project.
//   Vercel rewrites (in vercel.json) route traffic to correct MFE.
