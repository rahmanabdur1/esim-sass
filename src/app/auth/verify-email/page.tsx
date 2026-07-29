'use client';
/**
 * Verify Email Page — 4 states: idle | loading | success | error
 * ================================================================
 * idle    → No token in URL: show "check inbox" + resend button
 * loading → Token in URL: verifying...
 * success → Token valid: show success + Go to Dashboard
 * error   → Token invalid/expired: show error + resend button
 *
 * Resend has 60-second cooldown to prevent spam.
 */
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Globe, CheckCircle, AlertCircle, Mail, Loader2, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants';

type Status = 'idle' | 'loading' | 'success' | 'error';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';
  const email        = searchParams.get('email') ?? '';

  const [status,      setStatus]      = useState<Status>(token ? 'loading' : 'idle');
  const [resending,   setResending]   = useState(false);
  const [resent,      setResent]      = useState(false);
  const [resendError, setResendError] = useState('');
  const [cooldown,    setCooldown]    = useState(0); // seconds remaining

  // ── Auto-verify when token is in URL ──────────────────────
  useEffect(() => {
    if (!token) { setStatus('idle'); return; }

    setStatus('loading');
    authService.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  // ── Resend cooldown timer ─────────────────────────────────
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(id); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  // ── Resend handler ────────────────────────────────────────
  const handleResend = useCallback(async () => {
    if (!email) {
      setResendError('Email address not found. Please register again.');
      return;
    }
    if (cooldown > 0) return; // Still in cooldown

    setResending(true);
    setResendError('');
    setResent(false);
    try {
      await authService.resendVerification(email);
      setResent(true);
      setCooldown(RESEND_COOLDOWN); // Start 60s cooldown
    } catch {
      setResendError('Failed to resend. Please wait a moment and try again.');
    } finally {
      setResending(false);
    }
  }, [email, cooldown]);

  // ── Shared Resend Button ──────────────────────────────────
  const ResendSection = () => (
    <div className="mt-2">
      {!resent ? (
        <Button
          onClick={handleResend}
          isLoading={resending}
          disabled={cooldown > 0}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10 w-full"
          leftIcon={!resending ? <RefreshCw className="h-4 w-4" /> : undefined}
        >
          {resending
            ? 'Sending…'
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : 'Resend verification email'}
        </Button>
      ) : (
        <div role="status" className="rounded-lg bg-green-500/10 border border-green-500/30 p-3 text-center">
          <p className="text-green-400 text-sm font-medium">✅ Email resent!</p>
          <p className="text-green-500 text-xs mt-1">
            Check your inbox{email ? ` at ${email}` : ''}.
          </p>
          {cooldown > 0 && (
            <p className="text-green-600 text-xs mt-1 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Can resend again in {cooldown}s
            </p>
          )}
        </div>
      )}
      {resendError && (
        <p role="alert" className="mt-2 text-xs text-red-400 text-center">{resendError}</p>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl text-center">

          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="inline-flex items-center gap-2 font-display font-bold text-xl text-white mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-sm"
          >
            <Globe className="h-6 w-6 text-blue-400" aria-hidden="true" />
            eSIM Platform
          </Link>

          {/* ── STATE: idle — check inbox ──────────────────── */}
          {status === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 mx-auto mb-5">
                <Mail className="h-8 w-8 text-blue-400" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check your inbox</h1>
              {email ? (
                <p className="text-slate-400 text-sm mb-1">
                  We sent a verification link to:
                </p>
              ) : (
                <p className="text-slate-400 text-sm mb-1">
                  We sent a verification link to your email.
                </p>
              )}
              {email && (
                <p className="text-white font-semibold text-sm mb-2">{email}</p>
              )}
              <p className="text-slate-500 text-xs mb-6">
                Click the link in the email to activate your account.
                Check your spam folder if you don't see it.
              </p>

              <ResendSection />

              <div className="mt-6 border-t border-white/10 pt-5">
                <Link href={ROUTES.LOGIN} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── STATE: loading — verifying ─────────────────── */}
          {status === 'loading' && (
            <div aria-live="polite" aria-label="Verifying your email">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 mx-auto mb-5">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verifying your email…</h1>
              <p className="text-slate-400 text-sm">This will only take a moment.</p>
            </div>
          )}

          {/* ── STATE: success ────────────────────────────── */}
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              aria-live="polite"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-green-400" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Email verified! 🎉</h1>
              <p className="text-slate-400 text-sm mb-8">
                Your account is now active. Welcome to eSIM Platform!
              </p>
              <Button asChild variant="gradient" className="w-full h-11">
                <Link href={ROUTES.DASHBOARD}>Go to Dashboard →</Link>
              </Button>
            </motion.div>
          )}

          {/* ── STATE: error ─────────────────────────────── */}
          {status === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} aria-live="polite">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mx-auto mb-5">
                <AlertCircle className="h-8 w-8 text-red-400" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Verification failed</h1>
              <p className="text-slate-400 text-sm mb-6">
                This link is invalid or has expired. Request a new one below.
              </p>

              <ResendSection />

              <div className="mt-5 border-t border-white/10 pt-5">
                <Link href={ROUTES.LOGIN} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
