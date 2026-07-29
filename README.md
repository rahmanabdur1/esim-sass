# eSIM Platform — Enterprise Microfrontend Architecture

Production-ready eSIM SaaS built with Next.js 15, pnpm workspaces, Turbopack, and a microfrontend architecture.

## Core Technologies
- **Next.js 15** (App Router) — SSR, SSG, ISR, Streaming, Route Handlers
- **pnpm** — Fast, disk-efficient package manager with workspace support
- **Turbopack** — Ultra-fast dev bundler (`pnpm dev` uses --turbo flag)
- **TypeScript 5** strict mode

## Microfrontend Architecture
```
apps/shell       → Host app (port 3000)
apps/dashboard   → Dashboard MFE (port 3001, independently deployable)
apps/marketing   → Marketing MFE (port 3002, SSG/SSR pages)
packages/ui      → Shared design system (@esim/ui)
packages/types   → Shared TypeScript types (@esim/types)
packages/utils   → Shared utilities (@esim/utils)
packages/api-client → Shared hooks & API client (@esim/api-client)
packages/config  → Shared ESLint/TS/Tailwind configs (@esim/config)
```

## Rendering Strategies
- **SSG** — /about, /faq, /terms (build-time, fastest)
- **ISR** — /plans, /countries (revalidate: 300, fresh every 5min)
- **SSR** — /dashboard/* (force-dynamic, user-specific)
- **Streaming** — Dashboard home (React Suspense, instant shell)
- **Edge** — /api/* route handlers (global low latency)

## Quick Start
```bash
pnpm install           # Install all workspace deps
pnpm dev               # Turbopack dev server
pnpm build             # Production build
pnpm test              # Jest unit tests
pnpm test:e2e          # Playwright E2E
pnpm analyze           # Bundle size analyzer
pnpm storybook         # Component docs
```

## Slot/Slottable Fix
Error: "Slot failed to slot onto its children. Expected a single React element child or Slottable."
Fixed in Button.tsx using `<Slottable>` to designate the clone target when using `asChild`.
See: src/components/atoms/Button.tsx
