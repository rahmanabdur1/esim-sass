# eSIM Platform — Project Structure

## Directory Tree

```
esim-saas/
├── apps/                          # Microfrontend apps (pnpm workspaces)
│   ├── shell/                     # Host app (port 3000)
│   ├── dashboard/                 # Dashboard MFE (port 3001)
│   └── marketing/                 # Marketing MFE (port 3002)
│
├── packages/                      # Shared workspace packages
│   ├── ui/                        # @esim/ui — design system
│   ├── types/                     # @esim/types — TypeScript types
│   ├── utils/                     # @esim/utils — utilities
│   ├── api-client/                # @esim/api-client — hooks & services
│   └── config/                    # @esim/config — ESLint/TS/Tailwind
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (Server Component)
│   │   ├── page.tsx               # Home page (Server + SSG)
│   │   ├── sitemap.ts             # Dynamic sitemap (SSG)
│   │   ├── robots.ts              # robots.txt
│   │   ├── og/route.tsx           # OG image generation (Edge)
│   │   │
│   │   ├── (auth)/                # Auth pages (Client Components)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   │
│   │   ├── dashboard/             # Dashboard (Server + Client split)
│   │   │   ├── layout.tsx         # Server: auth guard + metadata
│   │   │   ├── page.tsx           # Server: pre-fetch user + eSIMs
│   │   │   ├── my-esims/
│   │   │   │   ├── page.tsx       # Server: SSR data fetch
│   │   │   │   └── MyESIMsClient.tsx  # Client: search/filter UI
│   │   │   ├── notifications/
│   │   │   │   ├── page.tsx       # Server: pre-fetch notifications
│   │   │   │   └── NotificationsClient.tsx
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx       # Server: pre-fetch user
│   │   │   │   └── ProfileClient.tsx
│   │   │   └── [20 more pages...]
│   │   │
│   │   ├── plans/page.tsx         # Server: ISR (5 min) + PlansPageClient
│   │   ├── countries/
│   │   │   ├── page.tsx           # Server: ISR (10 min)
│   │   │   └── [code]/page.tsx    # Server: SSG + JSON-LD
│   │   ├── blog/
│   │   │   ├── page.tsx           # Server: ISR (10 min)
│   │   │   └── [slug]/page.tsx    # Server: SSG + Article JSON-LD
│   │   ├── about/page.tsx         # Static SSG
│   │   ├── faq/page.tsx           # Static SSG
│   │   ├── contact/page.tsx       # Client + Server Action form
│   │   └── api/                   # Route Handlers (Edge Runtime)
│   │       ├── auth/login/route.ts
│   │       ├── auth/logout/route.ts
│   │       ├── plans/route.ts     # ISR proxy
│   │       ├── esims/route.ts
│   │       ├── orders/route.ts
│   │       └── health/route.ts
│   │
│   ├── components/
│   │   ├── atoms/                 # Button, Input, Badge, Skeleton...
│   │   ├── molecules/             # PlanCard, SearchBar, DataTable...
│   │   ├── organisms/             # Navbar, Footer, DashboardSidebar...
│   │   ├── performance/           # ★ NEW
│   │   │   ├── LazyImage.tsx      # Lazy load + animate on scroll
│   │   │   ├── OptimizedImage.tsx # next/image wrapper + fallback
│   │   │   ├── VirtualList.tsx    # Virtual scrolling for large lists
│   │   │   ├── WebVitalsReporter.tsx # CWV monitoring
│   │   │   └── index.ts           # Barrel export
│   │   ├── accessibility/         # A11y toolbar, skip links, ARIA
│   │   ├── security/              # CSP, session timeout
│   │   └── data-table/            # DataTable with sort/filter/export
│   │
│   ├── features/                  # Feature-specific components
│   │   ├── plans/PlansPageClient.tsx   # Client island for plans page
│   │   ├── dashboard/DashboardHomeClient.tsx
│   │   ├── personalization/       # Saved countries, recently viewed
│   │   ├── analytics/             # Charts, usage graphs
│   │   ├── travel/                # Travel planner
│   │   └── gdpr/                  # Cookie consent, privacy
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── index.ts               # All TanStack Query hooks
│   │   ├── useDebounce.ts         # Delay value updates
│   │   ├── useIntersectionObserver.ts  # ★ NEW — viewport detection
│   │   ├── useVirtualScroll.ts    # ★ NEW — virtual list engine
│   │   ├── useMediaQuery.ts       # ★ NEW — responsive breakpoints
│   │   ├── useLocalStorage.ts     # SSR-safe localStorage
│   │   └── useNetworkStatus.ts    # ★ NEW — offline/slow connection
│   │
│   ├── lib/
│   │   ├── server/
│   │   │   ├── data.ts            # ★ server-only data fetching
│   │   │   └── actions.ts         # ★ Server Actions ('use server')
│   │   ├── mock/
│   │   │   ├── data.ts            # 13 mock entities
│   │   │   └── handler.ts         # 66 Axios interceptor routes
│   │   ├── api-client.ts          # Axios instance + mock install
│   │   ├── performance.ts         # ★ NEW — Web Vitals + budget
│   │   ├── cache.ts               # ★ NEW — client-side cache + LRU
│   │   ├── prefetch.ts            # ★ NEW — predictive prefetching
│   │   ├── security/              # CSP, input sanitization
│   │   ├── validations.ts         # Zod schemas
│   │   ├── query-provider.tsx     # TanStack Query client
│   │   └── rendering-strategies.ts # SSG/SSR/ISR documentation
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── esim.service.ts
│   │   ├── plans.service.ts
│   │   ├── orders.service.ts
│   │   └── user.service.ts
│   │
│   ├── store/
│   │   ├── index.ts               # Re-exports all stores
│   │   ├── useCartStore.ts        # Shopping cart (Zustand)
│   │   ├── useAuthStore.ts        # Auth state (Zustand)
│   │   └── security/sessionStore.ts # Session timeout store
│   │
│   ├── types/index.ts             # TypeScript interfaces
│   ├── constants/index.ts         # Routes, query keys, config
│   ├── utils/index.ts             # Utility functions
│   └── styles/globals.css         # Global CSS + CSS variables
│
├── public/
│   ├── manifest.json              # ★ PWA manifest
│   ├── sw.js                      # Service Worker
│   └── icons/                     # PWA icons (all sizes)
│
├── src/tests/
│   ├── unit/                      # Jest unit tests
│   ├── integration/               # Jest integration tests
│   └── e2e/                       # Playwright E2E tests
│       ├── auth.spec.ts
│       ├── plans.spec.ts
│       └── dashboard.spec.ts
│
├── docs/
│   └── PROJECT_STRUCTURE.md      # This file
│
├── next.config.js                 # Next.js 15.3 config
├── tailwind.config.ts             # Tailwind 3.4
├── tsconfig.json                  # TypeScript 5.8 strict
├── jest.config.ts                 # Jest 29
├── playwright.config.ts           # Playwright 1.52
├── pnpm-workspace.yaml            # Microfrontend workspaces
├── .env.local                     # Local env (mock API enabled)
└── vercel.json                    # Deployment + MFE routing
```

## Rendering Strategy Map

| Route | Strategy | Cache | Why |
|-------|----------|-------|-----|
| `/` | SSG | Build-time | Static marketing page |
| `/plans` | ISR | 5 min | Plans change daily |
| `/countries` | ISR | 10 min | Countries rarely change |
| `/countries/[code]` | SSG | Build-time | Pre-built all 18 countries |
| `/blog` | ISR | 10 min | Posts added regularly |
| `/blog/[slug]` | SSG | Build-time | Pre-built all posts |
| `/about`, `/faq`, `/terms` | SSG | Build-time | Truly static |
| `/dashboard/*` | SSR | No cache | User-specific, auth-gated |
| `/api/*` | Edge | Varies | Global low-latency proxy |

## Performance Stack

| Feature | Technology | Impact |
|---------|-----------|--------|
| Font Loading | `next/font/google` | Zero CLS |
| Image Optimisation | `next/image` + AVIF/WebP | 60% smaller images |
| Bundle Splitting | Webpack cacheGroups | Better caching |
| Tree Shaking | `optimizePackageImports` | Smaller bundles |
| Lazy Loading | IntersectionObserver | Faster initial paint |
| Virtual Scroll | Custom hook | 100× faster lists |
| Route Prefetch | `router.prefetch` | Instant navigation |
| Web Vitals | `web-vitals` package | CWV monitoring |
| Client Cache | LRU cache | Fewer API calls |
| CSS | Tailwind JIT | Minimal CSS output |
| Server Actions | `'use server'` | No API round-trip |
| Streaming SSR | React Suspense | Instant shell |
