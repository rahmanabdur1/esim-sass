'use client';
import React, { useState } from 'react';
import { useChangePassword } from '@/hooks';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/validations';
import { userService } from '@/services/user.service';
import { Shield, Eye, EyeOff, KeyRound, Trash2, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew,     setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [success,     setSuccess]       = useState(false);
  const [apiError,    setApiError]      = useState('');
  const { mutate: changePassword, isPending } = useChangePassword();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormValues) => {
    setApiError(''); setSuccess(false);
    changePassword(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => { setSuccess(true); reset(); },
        onError:   () => setApiError('Current password is incorrect. Please try again.'),
      }
    );
  };

  const pwField = (id: string, label: string, reg: 'currentPassword'|'newPassword'|'confirmPassword', show: boolean, toggle: ()=>void, error?: string) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-1.5">{label} <span className="text-destructive" aria-hidden="true">*</span></label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} autoComplete={reg === 'currentPassword' ? 'current-password' : 'new-password'}
          aria-required="true" aria-invalid={!!error}
          className="flex h-10 w-full rounded-md border bg-background px-3 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register(reg)} />
        <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? 'Hide' : 'Show'}>
          {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold mb-1">Account Security</h1>
        <p className="text-muted-foreground text-sm mb-8">Manage your password and account security settings</p>

        {/* Change Password */}
        <section aria-labelledby="change-pw-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="change-pw-heading" className="font-semibold flex items-center gap-2 mb-5">
            <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" /> Change Password
          </h2>
          {success  && <div role="status"  className="mb-4 rounded-lg bg-green-100 border border-green-200 p-3 text-sm text-green-700">✅ Password updated successfully!</div>}
          {apiError && <div role="alert"   className="mb-4 rounded-lg bg-red-100 border border-red-200 p-3 text-sm text-red-700">{apiError}</div>}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {pwField('currentPassword', 'Current Password', 'currentPassword', showCurrent, () => setShowCurrent(!showCurrent), errors.currentPassword?.message)}
            {pwField('newPassword',     'New Password',     'newPassword',     showNew,     () => setShowNew(!showNew),         errors.newPassword?.message)}
            {pwField('confirmPassword', 'Confirm New Password', 'confirmPassword', showConfirm, () => setShowConfirm(!showConfirm), errors.confirmPassword?.message)}
            <Button type="submit" isLoading={isPending} variant="gradient" className="mt-2">
              {isPending ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </section>

        {/* Two-Factor Auth */}
        <section aria-labelledby="2fa-heading" className="rounded-xl border bg-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="2fa-heading" className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" aria-hidden="true" /> Two-Factor Authentication
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Add an extra layer of security to your account.</p>
            </div>
            <Button variant="outline" size="sm">Enable 2FA</Button>
          </div>
        </section>

        {/* Active Sessions */}
        <section aria-labelledby="sessions-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="sessions-heading" className="font-semibold mb-4">Active Sessions</h2>
          {[
            { device: 'Chrome on macOS', location: 'San Francisco, US', current: true,  time: 'Now'      },
            { device: 'Safari on iPhone', location: 'New York, US',      current: false, time: '2h ago'   },
          ].map((s, i) => (
            <div key={i} className={`flex items-center justify-between py-3 ${i > 0 ? 'border-t' : ''}`}>
              <div>
                <p className="text-sm font-medium">{s.device} {s.current && <span className="ml-2 text-xs text-green-600 font-medium">Current</span>}</p>
                <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
              </div>
              {!s.current && <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Revoke</Button>}
            </div>
          ))}
        </section>

        {/* Danger Zone */}
        <section aria-labelledby="danger-heading" className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 id="danger-heading" className="font-semibold flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" /> Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
          <Button variant="destructive" size="sm" leftIcon={<Trash2 className="h-4 w-4" />}>Delete My Account</Button>
        </section>
      </main>
    </div>
  );
}
