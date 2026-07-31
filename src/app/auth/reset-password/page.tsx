'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Globe, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations';
import { authService } from '@/services/auth.service';
import { getPasswordStrength } from '@/utils';
import { ROUTES } from '@/constants';

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
    error,
  } = useMutation({
    mutationFn: (data: ResetPasswordFormValues) => authService.resetPassword(data),
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const password = watch('password', '');
  const strength = getPasswordStrength(password);

  const onSubmit = (data: ResetPasswordFormValues) => resetPassword(data);

  const apiError =
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    (error ? 'This reset link is invalid or has expired.' : '');

  // ── No token in URL ─────────────────────────────────────────
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-400" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">Invalid Reset Link</h1>
          <p className="mb-6 text-sm text-slate-400">
            This password reset link is missing or invalid. Please request a new one.
          </p>
          <Button asChild variant="gradient" className="h-11 w-full">
            <Link href={ROUTES.FORGOT_PASSWORD}>Request New Link</Link>
          </Button>
          <div className="mt-4">
            <Link
              href={ROUTES.LOGIN}
              className="text-sm text-blue-400 transition-colors hover:text-blue-300"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center gap-2 rounded-sm font-display text-xl font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Globe className="h-6 w-6 text-blue-400" aria-hidden="true" /> eSIM Platform
            </Link>
          </div>

          {/* ── SUCCESS STATE ── */}
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-400" aria-hidden="true" />
              </div>
              <h1 className="mb-2 text-2xl font-bold text-white" aria-live="polite">
                Password updated! 🎉
              </h1>
              <p className="mb-8 text-sm text-slate-400">
                Your password has been reset successfully. You can now sign in with your new
                password.
              </p>
              <Button asChild variant="gradient" className="h-11 w-full">
                <Link href={ROUTES.LOGIN}>Sign In Now →</Link>
              </Button>
            </motion.div>
          ) : (
            <>
              {/* ── FORM STATE ── */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Lock className="h-5 w-5 text-blue-400" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Set new password</h1>
                  <p className="text-xs text-slate-400">
                    Must be 8+ chars with uppercase and number
                  </p>
                </div>
              </div>

              {/* API error */}
              {apiError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>{apiError}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                aria-label="Reset password form"
                className="space-y-4"
              >
                <input type="hidden" {...register('token')} />

                {/* New password */}
                <div>
                  <label
                    htmlFor="new-password"
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                  >
                    New Password{' '}
                    <span className="text-red-400" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-required="true"
                      aria-invalid={!!errors.password}
                      aria-describedby="pw-strength new-password-error"
                      placeholder="Create a strong password"
                      className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div
                      id="pw-strength"
                      className="mt-2"
                      aria-label={`Password strength: ${strength.label}`}
                    >
                      <div className="mb-1 flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= Math.ceil(strength.score / 1.5) ? strength.color : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        Strength:{' '}
                        <span
                          className={
                            strength.score >= 5
                              ? 'text-green-400'
                              : strength.score >= 3
                                ? 'text-yellow-400'
                                : 'text-red-400'
                          }
                        >
                          {strength.label}
                        </span>
                      </p>
                    </div>
                  )}
                  {errors.password && (
                    <p id="new-password-error" role="alert" className="mt-1 text-xs text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="mb-1.5 block text-sm font-medium text-slate-300"
                  >
                    Confirm Password{' '}
                    <span className="text-red-400" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-required="true"
                      aria-invalid={!!errors.confirmPassword}
                      aria-describedby={
                        errors.confirmPassword ? 'confirm-password-error' : undefined
                      }
                      placeholder="Repeat your password"
                      className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                      aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      id="confirm-password-error"
                      role="alert"
                      className="mt-1 text-xs text-red-400"
                    >
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="h-11 w-full"
                  isLoading={isPending}
                  aria-disabled={isPending}
                >
                  {isPending ? 'Updating password…' : 'Update Password'}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  href={ROUTES.LOGIN}
                  className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
