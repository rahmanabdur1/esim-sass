# eSIM Platform — Production Readiness Checklist

## 🎯 Performance Targets

| Metric            | Target | Status |
|-------------------|--------|--------|
| Lighthouse Perf   | ≥ 95   | ✅ Configured via Lighthouse CI |
| Lighthouse A11y   | ≥ 95   | ✅ axe-core + manual audit      |
| Best Practices    | 100    | ✅ Security headers configured  |
| SEO               | 100    | ✅ Metadata, sitemap, robots    |
| LCP               | < 2.5s | ✅ SSR + next/image             |
| CLS               | < 0.1  | ✅ Stable layouts, no shifts    |
| INP               | < 200ms| ✅ Optimistic updates           |
| TTFB              | < 800ms| ✅ Edge middleware              |
| Initial JS Bundle | < 200KB| ✅ Route splitting + lazy load  |

---

## 🧪 Test Coverage Requirements

| Layer             | Target | Tool                      |
|-------------------|--------|---------------------------|
| Statements        | ≥ 80%  | Jest                      |
| Functions         | ≥ 80%  | Jest                      |
| Branches          | ≥ 75%  | Jest                      |
| Lines             | ≥ 80%  | Jest                      |
| Critical flows    | 100%   | Jest + Playwright         |
| Security flows    | 100%   | Playwright security suite |
| Visual regression | Pass   | Chromatic                 |

### Critical Flows — Must Be 100% Covered
- [x] Login (success + failure + validation)
- [x] Registration (with password strength + confirmation)
- [x] Password Reset (forgot + reset + verify email)
- [x] Plan Purchase (browse → select → checkout → order)
- [x] Dashboard Access (auth guard + redirect)
- [x] Route Protection (all 16 dashboard routes)
- [x] XSS Prevention (form inputs)
- [x] Security Headers (CSP, X-Frame-Options, HSTS)

---

## 🔒 Security Checklist

### Authentication & Session
- [x] JWT stored in HttpOnly cookies only
- [x] Session timeout warning (30 min inactivity, warn at 28 min)
- [x] Multi-tab session sync via BroadcastChannel
- [x] Automatic logout on token expiry
- [x] Active sessions list with revoke capability
- [x] Login history + account activity log
- [x] JWT tampering detection (`alg:none` check)
- [x] Failed login attempt monitoring

### Input Security
- [x] Zod validation on all forms
- [x] HTML escaping (`escapeHtml`)
- [x] Script tag stripping (`sanitizeInput`)
- [x] Field max-length enforcement
- [x] File upload: MIME + extension + size + double-extension check
- [x] Filename sanitisation

### Headers & Transport
- [x] CSP with nonce (no `unsafe-inline` for scripts)
- [x] HSTS (production)
- [x] `X-Frame-Options: DENY`
- [x] Clickjacking detection + framebuster
- [x] CSRF validation (Origin/Referer check)
- [x] Trusted Types policy initialised

### Scanning & Monitoring
- [x] CodeQL static analysis (every PR)
- [x] Semgrep OWASP Top 10 rules
- [x] Gitleaks secret scanning
- [x] npm audit (HIGH+ blocks CI)
- [x] Dependabot weekly updates
- [x] License scanning (MIT/Apache only)
- [x] Sentry error tracking + security events
- [x] Web Vitals reporting to Sentry

---

## ♿ Accessibility Checklist (WCAG 2.2 AA)

- [x] Semantic HTML throughout (headings hierarchy, landmarks)
- [x] ARIA labels on all interactive elements
- [x] Keyboard navigation (Tab, Enter, Space, Escape, Arrow keys)
- [x] Focus management (modals, dialogs trap focus)
- [x] Skip-to-main-content link
- [x] Screen reader announcements (`aria-live`)
- [x] Color contrast ratios met (4.5:1 normal, 3:1 large text)
- [x] `prefers-reduced-motion` respected
- [x] `prefers-color-scheme` respected (dark/light/system)
- [x] Accessibility toolbar (font size, contrast, motion reduction)
- [x] All images have descriptive alt text
- [x] Form labels associated with inputs (`for` + `id`)
- [x] Error messages linked via `aria-describedby`
- [x] Table headers with `scope` attributes
- [x] No content solely conveyed by color
- [x] axe-core automated scan in CI

---

## 🌐 Browser & Device Support

### Desktop Browsers
- [x] Chrome (latest 2 versions)
- [x] Firefox (latest 2 versions)
- [x] Safari (latest 2 versions)
- [x] Microsoft Edge (latest 2 versions)

### Mobile Devices
- [x] iOS Safari (iPhone 12+)
- [x] Android Chrome (Android 10+)
- [x] Samsung Internet

### Responsive Breakpoints
- [x] 320px — Mobile XS
- [x] 640px — Mobile
- [x] 768px — Tablet
- [x] 1024px — Laptop
- [x] 1280px — Desktop
- [x] 1440px — Large Desktop
- [x] 1920px — Ultra Wide

---

## 🚀 Deployment Checklist

### Before Every Deploy
- [x] ESLint passes (zero errors)
- [x] TypeScript strict mode passes
- [x] Unit + Integration tests pass (≥80% coverage)
- [x] E2E smoke tests pass
- [x] Lighthouse CI thresholds met
- [x] Security scan passes
- [x] Bundle size within limits
- [x] No secrets in source code (Gitleaks)

### Environment Variables Validated
- [x] `NEXT_PUBLIC_API_URL` set
- [x] `NEXT_PUBLIC_APP_URL` set
- [x] `SENTRY_DSN` set (production)
- [x] `VERCEL_TOKEN` set
- [x] `STRIPE_PUBLISHABLE_KEY` set

### Post-Deploy Verification
- [x] Home page loads (< 3s)
- [x] Login flow works end-to-end
- [x] Plans listing loads
- [x] Dashboard accessible when logged in
- [x] CSP headers present
- [x] No console errors in production build
- [x] Sentry receiving events

---

## 📦 Feature Completeness

### Pages (26 Total)
| Category | Count | Status |
|----------|-------|--------|
| Public marketing | 9  | ✅ |
| Auth flows       | 5  | ✅ |
| Dashboard        | 16 | ✅ |
| Special (404, error, offline, status) | 4 | ✅ |

### Enterprise Features
| Feature                  | Status |
|--------------------------|--------|
| Command Palette (⌘K)     | ✅ |
| Smart Travel Planner     | ✅ |
| Plan Comparison (3-way)  | ✅ |
| Advanced Data Table      | ✅ |
| Onboarding Wizard        | ✅ |
| PWA (installable + offline) | ✅ |
| Session Timeout Guard    | ✅ |
| Multi-tab Sync           | ✅ |
| GDPR Cookie Consent      | ✅ |
| Privacy Preferences Centre | ✅ |
| Data Export Request      | ✅ |
| Account Deletion Flow    | ✅ |
| Accessibility Toolbar    | ✅ |
| Language Switcher (5 languages) | ✅ |
| Design Token System      | ✅ |
| Storybook Stories        | ✅ |
| Account Activity Log     | ✅ |
| System Status Page       | ✅ |
| Country Detail Pages (SEO) | ✅ |
| Blog Detail Pages (JSON-LD) | ✅ |
| Trusted Types Policy     | ✅ |
| Threat Detection         | ✅ |
| File Upload Security     | ✅ |
| Semgrep Rules (OWASP)    | ✅ |
| security.txt             | ✅ |
| Dependabot Config        | ✅ |
| Web Vitals Tracking      | ✅ |
| Journey Analytics        | ✅ |
| Service Worker (SW)      | ✅ |
| PWA Manifest             | ✅ |
| Lighthouse CI Config     | ✅ |
| Advanced CI/CD (11 jobs) | ✅ |
| Security Documentation   | ✅ |
| i18n (EN/DE/FR/ES/AR)    | ✅ |
