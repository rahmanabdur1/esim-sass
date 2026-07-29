'use client';
import React, { useState } from 'react';
import { useExportData, useDeleteAccount } from '@/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import {
  Download, Trash2, AlertTriangle, Shield,
  FileText, User, Package, Wifi, CheckCircle,
} from 'lucide-react';
import { useCurrentUser } from '@/hooks';

type ExportStatus = 'idle' | 'processing' | 'ready';
type DeleteStep   = 'confirm' | 'verify' | 'done';

export default function PrivacyPage() {
  const { data: user }            = useCurrentUser();
  const [exportStatus, setExport] = useState<ExportStatus>('idle');
  const [deleteStep,   setDelete] = useState<DeleteStep | null>(null);
  const [deleteInput,  setInput]  = useState('');

  const { mutate: exportData,  isPending: exporting   } = useExportData();
  const { mutate: deleteAcct,  isPending: deleting     } = useDeleteAccount();

  const handleExport = () => {
    setExport('processing');
    exportData(undefined, {
      onSuccess: () => setExport('ready'),
      onError:   () => setExport('idle'),
    });
  };

  const handleDelete = () => {
    if (deleteInput !== 'DELETE') return;
    deleteAcct(undefined, {
      onSuccess: () => setDelete('done'),
    });
  };

  const dataCategories = [
    { icon: User,     label: 'Profile Data',       desc: 'Name, email, phone, avatar' },
    { icon: Package,  label: 'Order History',       desc: 'All purchases and invoices'  },
    { icon: Wifi,     label: 'eSIM Records',        desc: 'All activated eSIM profiles' },
    { icon: FileText, label: 'Support Tickets',     desc: 'All submitted tickets'       },
    { icon: Shield,   label: 'Activity Log',        desc: 'Login history and security events' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold mb-1">Privacy & Data</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Manage your personal data in compliance with GDPR and privacy regulations.
        </p>

        {/* Data Export */}
        <section aria-labelledby="export-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="export-heading" className="font-semibold flex items-center gap-2 mb-2">
            <Download className="h-4 w-4 text-primary" aria-hidden="true" /> Export My Data
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Download a complete copy of all data associated with your account. The export will be
            delivered as a JSON file within a few minutes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {dataCategories.map((cat) => (
              <div key={cat.label} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <cat.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {exportStatus === 'idle' && !exporting && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Request Data Export
                </Button>
              </motion.div>
            )}
            {(exportStatus === 'processing' || exporting) && exportStatus !== 'ready' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 p-4"
                role="status"
                aria-live="polite"
              >
                <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin flex-shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Preparing your export…</p>
                  <p className="text-xs text-blue-600">This may take a few minutes.</p>
                </div>
              </motion.div>
            )}
            {exportStatus === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 p-4"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Export ready!</p>
                    <p className="text-xs text-green-600">Your data package is ready to download.</p>
                  </div>
                </div>
                <Button size="sm" variant="gradient" leftIcon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Cookie Preferences */}
        <section aria-labelledby="cookies-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="cookies-heading" className="font-semibold flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" aria-hidden="true" /> Cookie Preferences
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Manage which cookies and tracking technologies we use. Essential cookies cannot be disabled
            as they are required for the site to function.
          </p>
          <Button variant="outline" size="sm" onClick={() => {
            // Trigger the GDPR preferences center
            window.dispatchEvent(new CustomEvent('open-privacy-center'));
          }}>
            Manage Cookie Preferences
          </Button>
        </section>

        {/* Data Rights */}
        <section aria-labelledby="rights-heading" className="rounded-xl border bg-card p-6 mb-6">
          <h2 id="rights-heading" className="font-semibold mb-4">Your Data Rights (GDPR)</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            {[
              { right: 'Right to Access',      desc: 'Request a copy of all your personal data at any time.' },
              { right: 'Right to Rectification', desc: 'Correct inaccurate or incomplete personal data.' },
              { right: 'Right to Erasure',      desc: 'Request deletion of your account and personal data.' },
              { right: 'Right to Portability',  desc: 'Export your data in a machine-readable format (JSON).' },
              { right: 'Right to Object',       desc: 'Opt out of processing for marketing or analytics.' },
            ].map(({ right, desc }) => (
              <div key={right} className="flex gap-3">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="font-medium text-foreground">{right}: </span>
                  {desc}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
            For questions about your rights, email{' '}
            <a href="mailto:privacy@esimplatform.com" className="text-primary hover:underline">
              privacy@esimplatform.com
            </a>
          </p>
        </section>

        {/* Account Deletion */}
        <section
          aria-labelledby="delete-heading"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-6"
        >
          <h2 id="delete-heading" className="font-semibold flex items-center gap-2 text-destructive mb-2">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete Account
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Permanently delete your account and all associated data. This action is irreversible.
            Active eSIMs will be deactivated immediately.
          </p>

          <AnimatePresence mode="wait">
            {!deleteStep && (
              <motion.div key="initial" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDelete('confirm')}
                  leftIcon={<Trash2 className="h-4 w-4" />}
                >
                  Delete My Account
                </Button>
              </motion.div>
            )}

            {deleteStep === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-5"
                role="alertdialog"
                aria-labelledby="delete-confirm-title"
              >
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p id="delete-confirm-title" className="font-semibold text-destructive text-sm">
                      Are you absolutely sure?
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This will permanently delete your account, all orders, eSIM history, and personal data.
                      You will lose access immediately and this cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="delete-confirm-input" className="block text-xs font-medium mb-1.5">
                    Type <strong>DELETE</strong> to confirm:
                  </label>
                  <input
                    id="delete-confirm-input"
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setInput(e.target.value.toUpperCase())}
                    placeholder="DELETE"
                    aria-required="true"
                    className="h-9 w-full rounded-md border border-destructive/40 bg-background px-3 text-sm font-mono tracking-widest uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteInput !== 'DELETE' || deleting}
                    isLoading={deleting}
                    onClick={handleDelete}
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Delete Permanently
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setDelete(null); setInput(''); }}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {deleteStep === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-muted p-5 text-center"
                role="status"
                aria-live="assertive"
              >
                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" aria-hidden="true" />
                <p className="font-semibold text-sm">Account deletion scheduled</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your account will be fully deleted within 30 days. You will receive a confirmation email.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
