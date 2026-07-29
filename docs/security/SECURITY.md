# eSIM Platform — Security Documentation

## 1. Threat Model

### Assets
| Asset | Sensitivity | Controls |
|-------|-------------|----------|
| User credentials | Critical | Bcrypt hash (backend), HttpOnly cookies, session timeout |
| JWT tokens | High | Short-lived, HttpOnly cookies, refresh rotation |
| Payment data | Critical | Never stored on frontend; Stripe tokenization |
| eSIM QR codes | High | Authenticated routes only; one-time display |
| PII (name, email, phone) | High | Input sanitization; encrypted in transit |
| User session | High | Inactivity timeout (30 min); multi-tab sync |

### Threat Actors
- **Unauthenticated attacker** — attempts login brute-force, scraping
- **Authenticated malicious user** — IDOR, privilege escalation attempts
- **Third-party script supply chain** — compromised CDN resources
- **Network attacker (MITM)** — SSL stripping, cookie theft
- **Automated bots** — credential stuffing, account enumeration

### STRIDE Analysis (Frontend)

| Threat | Example | Mitigation |
|--------|---------|-----------|
| **Spoofing** | Token forgery | JWT signature validation; `alg:none` detection |
| **Tampering** | localStorage manipulation | Sensitive state server-authoritative; Zustand sessionStorage |
| **Repudiation** | Deny malicious actions | Sentry audit trail; server-side logging |
| **Information Disclosure** | Exposed env vars | `NEXT_PUBLIC_` audit; no secrets in client code |
| **Denial of Service** | Rapid form submission | Client-side rate detector; CAPTCHA integration |
| **Elevation of Privilege** | Route bypass | Middleware auth guard + role-aware UI |

---

## 2. Security Checklist

### Authentication
- [x] Password strength meter on registration (Zod schema enforces complexity)
- [x] Show/hide password toggle
- [x] Remember Me persists token in HttpOnly cookie (not localStorage)
- [x] Automatic logout on session expiry (30-min inactivity)
- [x] Session timeout warning modal (2 min before expiry)
- [x] Multi-tab session synchronisation via BroadcastChannel
- [x] Email verification flow before dashboard access
- [x] JWT tampering detection (`alg:none` check)
- [x] Secure token storage (HttpOnly cookies; never localStorage)
- [x] Password reset with signed one-time token

### Authorisation
- [x] Middleware auth guard on all `/dashboard/*` routes
- [x] Unauthenticated users redirected to login with `callbackUrl`
- [x] Authenticated users redirected away from auth pages
- [x] Role-aware UI rendering (user vs admin)
- [x] CSRF validation on all mutating HTTP requests (POST/PUT/PATCH/DELETE)

### Input Security
- [x] Zod schema validation on all forms (client-side)
- [x] HTML escaping utility (`escapeHtml`) before rendering user content
- [x] Script-tag stripping (`sanitizeInput`)
- [x] Field-level max-length enforcement
- [x] File upload: MIME type + extension + size + double-extension validation
- [x] Filename sanitisation (removes traversal chars)
- [x] XSS prevention via Trusted Types policy (browser-enforced)

### Transport & Headers
- [x] HSTS (production only: `max-age=31536000; includeSubDomains; preload`)
- [x] Strict CSP with nonce-based script allowlist
- [x] `X-Frame-Options: DENY` + `frame-ancestors: 'none'`
- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` disabling camera, mic, geolocation

### Dependency Security
- [x] `npm audit` in CI (blocks on HIGH+ vulnerabilities)
- [x] Dependabot weekly auto-PRs for dependency updates
- [x] CodeQL static analysis on every PR
- [x] Semgrep custom rules for OWASP Top 10
- [x] License scanning (no GPL in production dependencies)
- [x] `npm ci` (lockfile-enforced installs)

### Privacy & Compliance
- [x] GDPR cookie consent banner (granular opt-in)
- [x] Privacy Preferences Centre (per-category toggles)
- [x] Data export request UI
- [x] Account deletion workflow UI
- [x] No analytics without explicit consent

---

## 3. Secure Coding Guidelines

### Never Store Sensitive Data Client-Side
```typescript
// ❌ NEVER
localStorage.setItem('auth_token', token);
sessionStorage.setItem('credit_card', card);

// ✅ CORRECT — rely on HttpOnly cookies set by the backend
// Tokens live in HttpOnly cookies; the frontend cannot access them via JS
```

### Always Sanitize Before Rendering User Content
```typescript
// ❌ Dangerous
element.innerHTML = userInput;

// ✅ Safe — escape HTML entities
import { escapeHtml } from '@/lib/security';
element.textContent = userInput;          // safest
element.innerHTML   = escapeHtml(userInput); // when HTML is required
```

### Validate File Uploads Client-Side Before Upload
```typescript
import { validateFile } from '@/lib/security';

const result = await validateFile(file);
if (!result.valid) {
  showError(result.error);
  return;
}
// proceed with upload
```

### Use Zod for All External Input
```typescript
// ❌ Trust nothing from the network without validation
const data = await response.json();
processData(data);

// ✅ Validate shape before use
const parsed = planSchema.safeParse(data);
if (!parsed.success) throw new Error('Invalid API response shape');
processData(parsed.data);
```

### Environment Variable Rules
- Server secrets (`DATABASE_URL`, `JWT_SECRET`, `STRIPE_SECRET_KEY`) — **never** prefixed with `NEXT_PUBLIC_`
- Client-safe values only — use `NEXT_PUBLIC_` prefix
- Run `validateEnvVars()` at startup to catch misconfiguration early
- Rotate secrets every 90 days; revoke immediately on breach

---

## 4. Dependency Policy

| Category | Policy |
|----------|--------|
| Core framework | Only official packages (`next`, `react`, `react-dom`) |
| State management | Zustand (audited); TanStack Query (audited) |
| Third-party scripts | Must be SRI-hashed; loaded only from trusted CDNs |
| No GPL/AGPL | Commercial use requires MIT, Apache 2, or BSD license |
| Version pinning | Lockfile (`package-lock.json`) committed and verified in CI |
| Update cadence | Dependabot weekly; critical security patches within 24 h |
| Evaluation | New dependencies require: security audit, bundle impact review, licence check |

---

## 5. Incident Response Guide

### Severity Levels
| Level | Example | Response Time |
|-------|---------|--------------|
| P0 — Critical | Auth bypass, data breach | Immediate (<1 h) |
| P1 — High | XSS in production, payment failure | <4 h |
| P2 — Medium | UI security warning, degraded auth | <24 h |
| P3 — Low | Non-exploitable finding, best-practice gap | <72 h |

### Response Steps (Frontend)

**1. Detect**
- Sentry alert fires for new error class or security event
- User report via `security@esimplatform.com`
- Automated CI scan in PR catches SAST finding

**2. Triage**
- Assign severity level
- Determine scope: is it client-side only or does it require backend coordination?
- Create private GitHub issue with `security` label

**3. Contain (P0/P1)**
- Feature-flag the affected route/component OFF immediately
- If token compromise suspected: rotate all sessions via backend
- If XSS confirmed: deploy hotfix CSP rule to block vector within 1 h

**4. Fix**
- Patch in private branch; peer-reviewed by ≥2 engineers
- All security tests must pass in CI before merge
- Write regression test that would have caught the issue

**5. Deploy**
- Hotfix deployed to production bypassing standard PR queue (with approval)
- Verify fix with smoke test suite

**6. Post-Mortem**
- Written within 5 business days
- Blameless; focus on system improvements
- Added to security documentation; checklist updated

### Emergency Contacts
- Security email: `security@esimplatform.com`
- Sentry on-call: configured via PagerDuty
- Vercel status: https://vercel-status.com
