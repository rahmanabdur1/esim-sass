'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { Button } from '@/components/atoms/Button';
import { formatRelativeDate } from '@/utils';

type Status = 'operational' | 'degraded' | 'outage' | 'maintenance';

interface ServiceStatus {
  name:        string;
  status:      Status;
  latency?:    number;
  description: string;
}

const MOCK_SERVICES: ServiceStatus[] = [
  { name: 'API Gateway',        status: 'operational',  latency: 42,  description: 'Core API endpoints'          },
  { name: 'Authentication',     status: 'operational',  latency: 38,  description: 'Login & session management'  },
  { name: 'eSIM Provisioning',  status: 'operational',  latency: 120, description: 'eSIM activation service'     },
  { name: 'Payment Processing', status: 'operational',  latency: 85,  description: 'Stripe payment gateway'      },
  { name: 'Notifications',      status: 'operational',  latency: 25,  description: 'Email & push notifications'  },
  { name: 'CDN',                status: 'operational',  latency: 8,   description: 'Global content delivery'     },
  { name: 'Dashboard',          status: 'operational',  latency: 55,  description: 'User dashboard & analytics'  },
  { name: 'Support System',     status: 'operational',  latency: 60,  description: 'Ticket & chat support'       },
];

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string; bg: string; dot: string }> = {
  operational:  { label: 'Operational',  icon: CheckCircle,    color: 'text-green-600',  bg: 'bg-green-50',  dot: 'bg-green-500'  },
  degraded:     { label: 'Degraded',     icon: AlertTriangle,  color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
  outage:       { label: 'Outage',       icon: XCircle,        color: 'text-red-600',    bg: 'bg-red-50',    dot: 'bg-red-500'    },
  maintenance:  { label: 'Maintenance',  icon: Clock,          color: 'text-blue-600',   bg: 'bg-blue-50',   dot: 'bg-blue-500'   },
};

export default function SystemStatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>(MOCK_SERVICES);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [uptimeDays, setUptimeDays] = useState<Array<{ day: number; status: Status }>>([]);

  useEffect(() => {
    // Hydration mismatch রোধ করতে client-side-এ dynamic data set করা হয়েছে
    setLastUpdate(new Date().toISOString());

    const days = Array.from({ length: 90 }, (_, i) => ({
      day: i,
      status: (Math.random() > 0.02 ? 'operational' : Math.random() > 0.5 ? 'degraded' : 'outage') as Status,
    }));
    setUptimeDays(days);
  }, []);

  const allOperational = services.every((s) => s.status === 'operational');
  const overallStatus: Status = allOperational
    ? 'operational'
    : services.some((s) => s.status === 'outage')
    ? 'outage'
    : 'degraded';

  const overallCfg = STATUS_CONFIG[overallStatus];
  const OverallIcon = overallCfg.icon;

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdate(new Date().toISOString());
    setRefreshing(false);
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="pt-16 min-h-screen bg-background">
        {/* Overall Status Banner */}
        <section className={`py-16 ${overallCfg.bg} border-b`} aria-labelledby="overall-status">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <OverallIcon className={`mx-auto mb-4 h-14 w-14 ${overallCfg.color}`} aria-hidden="true" />
              <h1 id="overall-status" className={`font-display text-3xl font-bold mb-2 ${overallCfg.color}`}>
                {allOperational ? 'All Systems Operational' : `Service ${overallCfg.label}`}
              </h1>
              <p className="text-muted-foreground text-sm mb-4">
                {lastUpdate ? `Last updated ${formatRelativeDate(lastUpdate)}` : 'Updating...'}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                isLoading={refreshing}
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Refresh
              </Button>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
          {/* Services */}
          <section aria-labelledby="services-heading" className="mb-12">
            <h2 id="services-heading" className="font-display text-xl font-bold mb-5">Services</h2>
            <div className="rounded-xl border bg-card overflow-hidden">
              {services.map((svc, i) => {
                const cfg  = STATUS_CONFIG[svc.status];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={svc.name}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-5 py-4 border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot} flex-shrink-0`} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold">{svc.name}</p>
                        <p className="text-xs text-muted-foreground">{svc.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {svc.latency && (
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {svc.latency}ms
                        </span>
                      )}
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {cfg.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* 90-day uptime */}
          <section aria-labelledby="uptime-heading" className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 id="uptime-heading" className="font-display text-xl font-bold">90-Day Uptime</h2>
              <span className="text-sm font-semibold text-green-600">99.82% uptime</span>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div
                className="flex gap-0.5 items-end min-h-[32px]"
                role="img"
                aria-label="90-day uptime history. Each bar represents one day."
              >
                {uptimeDays.map((day) => {
                  const color =
                    day.status === 'operational' ? 'bg-green-500'
                    : day.status === 'degraded'  ? 'bg-yellow-500'
                    : 'bg-red-500';
                  return (
                    <div
                      key={day.day}
                      title={`Day ${day.day + 1}: ${STATUS_CONFIG[day.status].label}`}
                      aria-hidden="true"
                      className={`flex-1 rounded-sm h-8 ${color} opacity-80 hover:opacity-100 transition-opacity cursor-default`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
              <div className="flex gap-4 mt-3">
                {[
                  { color: 'bg-green-500',  label: 'Operational' },
                  { color: 'bg-yellow-500', label: 'Degraded'    },
                  { color: 'bg-red-500',    label: 'Outage'      },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`h-2.5 w-2.5 rounded-sm ${l.color}`} aria-hidden="true" />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* No active incidents */}
          <section aria-labelledby="incidents-heading">
            <h2 id="incidents-heading" className="font-display text-xl font-bold mb-5">Recent Incidents</h2>
            <div className="rounded-xl border bg-card p-10 text-center">
              <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" aria-hidden="true" />
              <p className="font-semibold">No incidents in the last 30 days</p>
              <p className="text-sm text-muted-foreground mt-1">All systems have been running smoothly.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}