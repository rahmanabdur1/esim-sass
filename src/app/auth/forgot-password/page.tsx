'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Globe, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validations';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/constants';

export default function ForgotPasswordPage() {
  const [sentEmail, setSentEmail] = useState('');

  const { mutate: sendReset, isPending, error } = useMutation({
    mutationFn: (data: ForgotPasswordFormValues) => authService.forgotPassword(data),
  });

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    sendReset(data, {
      onSuccess: () => setSentEmail(data.email),
    });
  };

  const apiError = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message || (error ? 'Something went wrong. Please try again.' : '');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="mb-8 text-center">
            <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 font-display font-bold text-xl text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-sm">
              <Globe className="h-6 w-6 text-blue-400" aria-hidden="true" /> eSIM Platform
            </Link>
          </div>

          {/* Success state */}
          {sentEmail ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mx-auto mb-5">
                <CheckCircle className="h-8 w-8 text-green-400" aria-hidden="true" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-slate-400 text-sm mb-2">
                We sent a password reset link to:
              </p>
              <p className="text-white font-semibold text-sm mb-6">{sentEmail}</p>
              <p className="text-slate-500 text-xs mb-8">
                Didn't receive it? Check your spam folder. The link expires in 15 minutes.
              </p>
              <Button
                variant="outline"
                className="border-white/10 text-white hover:bg-white/10 w-full mb-3"
                onClick={() => setSentEmail('')}
              >
                Try a different email
              </Button>
              <Link href={ROUTES.LOGIN} className="flex items-center justify-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-1">Forgot your password?</h1>
              <p className="text-slate-400 text-sm mb-6">
                Enter your registered email and we'll send you a secure reset link.
              </p>

              {/* API error */}
              {apiError && (
                <div role="alert" aria-live="assertive" className="mb-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Forgot password form" className="space-y-4">
                <div>
                  <label htmlFor="fp-email" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email address <span className="text-red-400" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
                    <input
                      id="fp-email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'fp-email-error' : undefined}
                      placeholder="you@example.com"
                      className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p id="fp-email-error" role="alert" className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full h-11"
                  isLoading={isPending}
                  leftIcon={!isPending ? <Mail className="h-4 w-4" /> : undefined}
                >
                  {isPending ? 'Sending reset link…' : 'Send Reset Link'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href={ROUTES.LOGIN} className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors focus-visible:outline-none focus-visible:underline">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
