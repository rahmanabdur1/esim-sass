'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Badge, Progress, Skeleton } from '@/components/atoms/index';
import { useESIM } from '@/hooks';
import { ESIM_STATUS_CONFIG } from '@/constants';
import { formatDataGB, formatDate, getDataPercentage, copyToClipboard } from '@/utils';
import { Copy, Check, Wifi, Clock, Globe, Smartphone, Download } from 'lucide-react';

export default function ESIMDetailsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? '';
  const { data: esim, isLoading } = useESIM(id);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!id) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <DashboardSidebar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">No eSIM selected.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="max-w-5xl flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">eSIM Details</h1>
        <p className="mb-8 text-sm text-muted-foreground">Manage and monitor your eSIM</p>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : !esim ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">eSIM not found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left — QR Code & Status */}
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center rounded-xl border bg-card p-6 text-center"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-3xl" role="img" aria-label={esim.country.name}>
                    {esim.country.flag}
                  </span>
                  <div className="text-left">
                    <p className="font-semibold">{esim.label}</p>
                    <p className="text-xs text-muted-foreground">{esim.country.name}</p>
                  </div>
                  <Badge
                    className={`ml-auto ${ESIM_STATUS_CONFIG[esim.status].bg} ${ESIM_STATUS_CONFIG[esim.status].color} border-0`}
                  >
                    {ESIM_STATUS_CONFIG[esim.status].label}
                  </Badge>
                </div>

                {/* QR Code */}
                <div className="mb-4 rounded-xl border-4 border-white bg-white p-3 shadow-md">
                  <QRCodeSVG
                    value={esim.activationCode}
                    size={180}
                    level="H"
                    aria-label="eSIM activation QR code"
                  />
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  Scan this QR code in your phone's eSIM settings to install
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={() => {
                    /* trigger QR download */
                  }}
                >
                  Download QR Code
                </Button>
              </motion.div>

              {/* Data Usage */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 font-semibold">Data Usage</h2>
                <Progress
                  value={getDataPercentage(esim.dataUsed, esim.dataTotal)}
                  showLabel
                  className="mb-3"
                />
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Used', value: formatDataGB(esim.dataUsed) },
                    { label: 'Remaining', value: formatDataGB(esim.dataRemaining) },
                    { label: 'Total', value: formatDataGB(esim.dataTotal) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg bg-muted/50 p-3">
                      <p className="text-sm font-bold">{s.value}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Details */}
            <div className="space-y-5">
              {/* Network Info */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                  <Wifi className="h-4 w-4 text-primary" aria-hidden="true" /> Network Details
                </h2>
                <dl className="space-y-3">
                  {[
                    { label: 'Network', value: esim.network, icon: Globe, key: 'network' },
                    {
                      label: 'Valid From',
                      value: formatDate(esim.validFrom),
                      icon: Clock,
                      key: 'from',
                    },
                    { label: 'Valid To', value: formatDate(esim.validTo), icon: Clock, key: 'to' },
                    { label: 'Coverage', value: esim.country.name, icon: Globe, key: 'country' },
                  ].map(({ label, value, icon: Icon, key }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between border-b py-2 last:border-0"
                    >
                      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        {label}
                      </dt>
                      <dd className="text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Activation Details */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 flex items-center gap-2 font-semibold">
                  <Smartphone className="h-4 w-4 text-primary" aria-hidden="true" /> Activation Info
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'ICCID', value: esim.iccid, key: 'iccid' },
                    { label: 'Activation Code', value: esim.activationCode, key: 'code' },
                  ].map(({ label, value, key }) => (
                    <div key={key}>
                      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
                      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                        <code
                          className="flex-1 select-all break-all font-mono text-xs"
                          aria-label={`${label}: ${value}`}
                        >
                          {value}
                        </code>
                        <button
                          onClick={() => handleCopy(value, key)}
                          className="flex-shrink-0 rounded text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`Copy ${label}`}
                        >
                          {copied === key ? (
                            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                          ) : (
                            <Copy className="h-4 w-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installation Steps */}
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 font-semibold">Quick Setup Guide</h2>
                <ol className="space-y-3">
                  {[
                    'Open your phone Settings',
                    'Go to Cellular / Mobile Data',
                    'Tap "Add Cellular Plan" or "Add eSIM"',
                    'Scan the QR code shown above',
                    'Enable data roaming at your destination',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                        aria-hidden="true"
                      >
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
