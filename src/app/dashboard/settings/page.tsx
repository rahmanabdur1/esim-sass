'use client';
import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { useThemeStore } from '@/store';
import { useSettings, useUpdateSettings } from '@/hooks';
import { Skeleton } from '@/components/atoms/index';
import { Sun, Moon, Monitor, Bell, Globe, Mail, Smartphone } from 'lucide-react';
import type { Theme } from '@/types';

interface ToggleProps { label: string; description: string; checked: boolean; onChange: () => void; id: string; }
function Toggle({ label, description, checked, onChange, id }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, setTheme }   = useThemeStore();
  const { data: settings, isLoading } = useSettings();
  const { mutate: saveSettings, isPending: saving } = useUpdateSettings();

  const [notifications, setNotifications] = useState({
    email: true, push: true, sms: false, marketing: false, security: true,
  });

  // Sync from API when loaded
  useEffect(() => {
    if (settings) {
      setNotifications({
        email:     (settings['emailNotifications'] as boolean) ?? true,
        push:      (settings['pushNotifications']  as boolean) ?? true,
        sms:       (settings['smsNotifications']   as boolean) ?? false,
        marketing: (settings['marketingEmails']    as boolean) ?? false,
        security:  (settings['securityAlerts']     as boolean) ?? true,
      });
    }
  }, [settings]);

  const toggle = (k: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [k]: !prev[k] }));

  const handleSave = () => saveSettings({ ...notifications, theme });

  const themes: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'light',  label: 'Light',  icon: Sun     },
    { value: 'dark',   label: 'Dark',   icon: Moon    },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm mb-8">Manage your preferences</p>

        {/* Appearance */}
        <section aria-labelledby="appearance-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="appearance-heading" className="font-semibold mb-4">Appearance</h2>
          <fieldset>
            <legend className="text-sm text-muted-foreground mb-3">Choose your theme</legend>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(({ value, label, icon: Icon }) => (
                <label key={value} className={`flex flex-col items-center gap-2 cursor-pointer rounded-lg border p-4 transition-all ${theme === value ? 'border-primary bg-primary/5 ring-2 ring-primary' : 'hover:bg-muted/50'}`}>
                  <input type="radio" name="theme" value={value} checked={theme === value} onChange={() => setTheme(value)} className="sr-only" />
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-medium">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        {/* Language */}
        <section aria-labelledby="language-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="language-heading" className="font-semibold flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-primary" aria-hidden="true" /> Language & Region
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-1.5">Language</label>
              <select id="language" className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Español</option>
                <option>Français</option>
                <option>Deutsch</option>
                <option>日本語</option>
              </select>
            </div>
            <div>
              <label htmlFor="currency" className="block text-sm font-medium mb-1.5">Currency</label>
              <select id="currency" className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>JPY (¥)</option>
                <option>AUD (A$)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section aria-labelledby="notif-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="notif-heading" className="font-semibold flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-primary" aria-hidden="true" /> Notifications
          </h2>
          <div className="divide-y">
            <Toggle id="email-notif"     label="Email Notifications"     description="Receive order confirmations and updates by email"    checked={notifications.email}     onChange={() => toggle('email')}     />
            <Toggle id="push-notif"      label="Push Notifications"      description="Browser notifications for real-time alerts"          checked={notifications.push}      onChange={() => toggle('push')}      />
            <Toggle id="sms-notif"       label="SMS Notifications"       description="Text messages for critical eSIM status changes"      checked={notifications.sms}       onChange={() => toggle('sms')}       />
            <Toggle id="security-notif"  label="Security Alerts"         description="Always notified about security events"               checked={notifications.security}  onChange={() => toggle('security')}  />
            <Toggle id="marketing-notif" label="Marketing & Promotions"  description="Deals, travel tips, and new plan announcements"      checked={notifications.marketing} onChange={() => toggle('marketing')} />
          </div>
        </section>

        {/* Data & Privacy */}
        <section aria-labelledby="data-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="data-heading" className="font-semibold mb-4">Data & Privacy</h2>
          <div className="space-y-3">
            <Button variant="outline" size="sm" leftIcon={<Mail className="h-4 w-4" />}>Request My Data Export</Button>
            <p className="text-xs text-muted-foreground">Download a copy of all data we have associated with your account.</p>
          </div>
        </section>

        <div className="flex gap-3">
          <Button variant="gradient" onClick={handleSave} isLoading={saving}>Save All Settings</Button>
          <Button variant="outline">Reset Defaults</Button>
        </div>
      </main>
    </div>
  );
}
