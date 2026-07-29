'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Globe, UserPlus } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { registerSchema, type RegisterFormValues } from '@/lib/validations';
import { useRegister } from '@/hooks';
import { useAuthStore } from '@/store';
import { getPasswordStrength } from '@/utils';
import { ROUTES } from '@/constants';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { mutate: register, isPending, error } = useRegister();

  const { register: formRegister, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  const strength = getPasswordStrength(password);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 font-display font-bold text-xl text-white">
              <Globe className="h-6 w-6 text-blue-400" aria-hidden="true" />eSIM Platform
            </Link>
            <h1 className="mt-4 text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-slate-400">Start connecting globally in minutes</p>
          </div>

          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400">
              {(error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit((d) => register(d, {
            onSuccess: ({ user }) => {
              setUser(user);
              router.push(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(user.email)}`);
            },
          }))} noValidate aria-label="Registration form" className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input id="name" type="text" autoComplete="name" aria-required="true" aria-invalid={!!errors.name}
                className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                placeholder="John Doe" {...formRegister('name')} />
              {errors.name && <p role="alert" className="mt-1 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-1.5">Email <span className="text-red-400">*</span></label>
              <input id="reg-email" type="email" autoComplete="email" aria-required="true" aria-invalid={!!errors.email}
                className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                placeholder="you@example.com" {...formRegister('email')} />
              {errors.email && <p role="alert" className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-1.5">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" aria-required="true" aria-invalid={!!errors.password}
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                  placeholder="Min. 8 characters" {...formRegister('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength meter */}
              {password && (
                <div className="mt-2" aria-label={`Password strength: ${strength.label}`}>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score / 1.5 ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">Strength: <span className={strength.score >= 5 ? 'text-green-400' : strength.score >= 3 ? 'text-yellow-400' : 'text-red-400'}>{strength.label}</span></p>
                </div>
              )}
              {errors.password && <p role="alert" className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" aria-required="true" aria-invalid={!!errors.confirmPassword}
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 pr-11 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors"
                  placeholder="Repeat password" {...formRegister('confirmPassword')} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200" aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p role="alert" className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" variant="gradient" isLoading={isPending} className="w-full h-11" leftIcon={!isPending ? <UserPlus className="h-4 w-4" /> : undefined}>
              {isPending ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to our{' '}
            <Link href={ROUTES.TERMS} className="text-blue-400 hover:underline">Terms</Link>{' '}and{' '}
            <Link href={ROUTES.PRIVACY} className="text-blue-400 hover:underline">Privacy Policy</Link>.
          </p>
          <p className="mt-3 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link href={ROUTES.LOGIN} className="text-blue-400 font-medium hover:text-blue-300 transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
