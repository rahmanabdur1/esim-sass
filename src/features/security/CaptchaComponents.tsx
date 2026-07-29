'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Shield, RefreshCw, CheckCircle } from 'lucide-react';
import { cn } from '@/utils';

// ── reCAPTCHA v3 hook ─────────────────────────────────────────
declare global {
  interface Window {
    grecaptcha?: {
      ready:    (cb: () => void) => void;
      execute:  (siteKey: string, opts: { action: string }) => Promise<string>;
      render:   (el: HTMLElement, opts: object) => number;
      reset:    (id?: number) => void;
      getResponse: (id?: number) => string;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

/** reCAPTCHA v3 — invisible, token-based */
export function useRecaptchaV3() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || typeof window === 'undefined') return;
    if (document.getElementById('recaptcha-v3-script')) {
      setReady(true);
      return;
    }
    const script    = document.createElement('script');
    script.id       = 'recaptcha-v3-script';
    script.src      = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async    = true;
    script.onload   = () => window.grecaptcha?.ready(() => setReady(true));
    document.head.appendChild(script);
  }, []);

  const getToken = useCallback(
    async (action: string): Promise<string | null> => {
      if (!ready || !window.grecaptcha) return null;
      try {
        return await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      } catch { return null; }
    },
    [ready]
  );

  return { ready, getToken };
}

// ── reCAPTCHA v2 checkbox widget ──────────────────────────────
interface RecaptchaV2Props {
  onVerify:  (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

export function RecaptchaV2({ onVerify, onExpire, className }: RecaptchaV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId     = useRef<number | null>(null);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || !containerRef.current) return;

    const init = () => {
      if (containerRef.current && window.grecaptcha && widgetId.current === null) {
        widgetId.current = window.grecaptcha.render(containerRef.current, {
          sitekey:  RECAPTCHA_SITE_KEY,
          callback: onVerify,
          'expired-callback': () => { onExpire?.(); widgetId.current = null; },
          theme:    'light',
          size:     'normal',
        });
      }
    };

    if (window.grecaptcha) {
      window.grecaptcha.ready(init);
    } else {
      const existing = document.getElementById('recaptcha-v2-script');
      if (!existing) {
        const s  = document.createElement('script');
        s.id     = 'recaptcha-v2-script';
        s.src    = 'https://www.google.com/recaptcha/api.js';
        s.async  = true;
        s.onload = () => window.grecaptcha?.ready(init);
        document.head.appendChild(s);
      }
    }

    return () => {
      if (widgetId.current !== null) {
        window.grecaptcha?.reset(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [onVerify, onExpire]);

  if (!RECAPTCHA_SITE_KEY) {
    return (
      <div className={cn('rounded-lg border border-dashed bg-muted/50 p-4 text-center', className)}>
        <Shield className="mx-auto mb-2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
        <p className="text-xs text-muted-foreground">
          reCAPTCHA requires <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code>
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className={className} aria-label="reCAPTCHA security challenge" />;
}

// ── Simple Math CAPTCHA (no external deps) ────────────────────
interface MathCaptchaProps {
  onVerify:  (verified: boolean) => void;
  className?: string;
}

export function MathCaptcha({ onVerify, className }: MathCaptchaProps) {
  const generate = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    return { a, b, answer: a + b };
  }, []);

  const [challenge,  setChallenge]  = useState(generate);
  const [input,      setInput]      = useState('');
  const [verified,   setVerified]   = useState(false);
  const [error,      setError]      = useState(false);

  const handleSubmit = () => {
    const correct = parseInt(input, 10) === challenge.answer;
    if (correct) {
      setVerified(true);
      setError(false);
      onVerify(true);
    } else {
      setError(true);
      setInput('');
      setChallenge(generate());
      onVerify(false);
    }
  };

  if (verified) {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3', className)}>
        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" aria-hidden="true" />
        <p className="text-sm text-green-700 font-medium">Verification successful</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-muted/50 p-4', className)} role="group" aria-label="Security verification">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
        <p className="text-xs font-medium">Security check: What is {challenge.a} + {challenge.b}?</p>
        <button
          type="button"
          onClick={() => { setChallenge(generate()); setInput(''); setError(false); }}
          className="ml-auto text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Generate new challenge"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Your answer"
          aria-label={`What is ${challenge.a} + ${challenge.b}?`}
          aria-invalid={error}
          aria-describedby={error ? 'captcha-error' : undefined}
          className={cn(
            'h-9 flex-1 rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!input}
          className="h-9 rounded-md bg-primary px-3 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Verify
        </button>
      </div>
      {error && (
        <p id="captcha-error" role="alert" className="mt-1.5 text-xs text-destructive">
          Incorrect answer. Please try again.
        </p>
      )}
    </div>
  );
}

// ── Bot Detection hook ────────────────────────────────────────
export function useBotDetection() {
  const [isBot, setIsBot] = useState<boolean | null>(null);

  useEffect(() => {
    // Heuristics: headless browser detection
    const checks = {
      hasWebdriver:    !!navigator.webdriver,
      noPlugins:       navigator.plugins.length === 0,
      noLanguages:     navigator.languages.length === 0,
      suspiciousUA:    /HeadlessChrome|PhantomJS|Nightmare|Puppeteer/i.test(navigator.userAgent),
      noTouchSupport:  !('ontouchstart' in window) && !navigator.maxTouchPoints && window.innerWidth < 768,
    };

    const botScore = Object.values(checks).filter(Boolean).length;
    // Flag as potential bot if 3+ heuristics match
    setIsBot(botScore >= 3);
  }, []);

  return { isBot };
}
