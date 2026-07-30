'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe, LogIn } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { loginSchema, type LoginFormValues } from '@/lib/validations';
import { useAuthStore } from '@/store';
import { useLogin } from '@/hooks';
import { ROUTES } from '@/constants';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuthStore();

  // Read callbackUrl from middleware redirect (e.g. ?callbackUrl=/dashboard/orders)
  const callbackUrl = searchParams.get('callbackUrl');
  const redirectTo = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : ROUTES.DASHBOARD;

  const { mutate: login, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = (data: LoginFormValues) =>
    login(data, {
      onSuccess: ({ user }) => {
        setUser(user);
        router.push(redirectTo);
      },
    });

  const errorMessage =
    (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
    'Invalid email or password. Please try again.';

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
              <Globe className="h-6 w-6 text-blue-400" aria-hidden="true" />
              eSIM Platform
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-slate-400">Sign in to manage your eSIMs</p>
          </div>

          {/* Demo credentials banner */}
          {process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' && (
            <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300">
              <p className="mb-1 font-semibold">🧪 Demo Mode</p>
              <p>
                Email: <code className="text-blue-200">demo@esimplatform.com</code>
              </p>
              <p>
                Password: <code className="text-blue-200">Demo1234!</code>
              </p>
              <p className="mt-1 text-blue-400/70">Or use any email + 8-char password</p>
            </div>
          )}

          {/* API error alert */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            >
              <span className="flex-shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Login form"
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                Email address{' '}
                <span className="text-red-400" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="you@example.com"
                className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="mt-1 text-xs text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password{' '}
                  <span className="text-red-400" aria-hidden="true">
                    *
                  </span>
                </label>
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  className="text-xs text-blue-400 transition-colors hover:text-blue-300 focus-visible:underline focus-visible:outline-none"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  placeholder="••••••••"
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="mt-1 text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400"
                {...register('rememberMe')}
              />
              <label
                htmlFor="rememberMe"
                className="cursor-pointer select-none text-sm text-slate-300"
              >
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              variant="gradient"
              isLoading={isPending}
              className="h-11 w-full"
              leftIcon={!isPending ? <LogIn className="h-4 w-4" aria-hidden="true" /> : undefined}
            >
              {isPending ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <div className="flex-1 border-t border-white/10" />
            <span className="text-xs text-slate-500">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <p className="text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link
              href={ROUTES.REGISTER}
              className="font-medium text-blue-400 transition-colors hover:text-blue-300 focus-visible:underline focus-visible:outline-none"
            >
              Create one free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
