'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Badge, Skeleton } from '@/components/atoms/index';
import { DataTable } from '@/components/data-table/DataTable';
import { useActivityLog, useActiveSessions } from '@/hooks';
import type { ActivityEvent } from '@/services/user.service';
import {
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Clock,
  Shield,
  LogIn,
  LogOut,
  Settings,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { formatRelativeDate, formatDate } from '@/utils';
import type { ColumnDef } from '@/components/data-table/DataTable';
import { userService } from '@/services/user.service';

const TYPE_CONFIG: Record<
  ActivityEvent['type'],
  { icon: React.ElementType; color: string; bg: string }
> = {
  login: { icon: LogIn, color: 'text-green-600', bg: 'bg-green-50' },
  logout: { icon: LogOut, color: 'text-gray-600', bg: 'bg-gray-50' },
  settings_change: { icon: Settings, color: 'text-blue-600', bg: 'bg-blue-50' },
  password_change: { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
  security_alert: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
};

function getDeviceIcon(device: string): React.ElementType {
  const d = device.toLowerCase();
  if (d.includes('iphone') || d.includes('android')) return Smartphone;
  if (d.includes('ipad') || d.includes('tablet')) return Tablet;
  return Monitor;
}

const activityColumns: ColumnDef<ActivityEvent>[] = [
  {
    key: 'type',
    header: 'Event',
    cell: (row) => {
      const cfg = TYPE_CONFIG[row.type];
      const Icon = cfg.icon;
      return (
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${cfg.bg} flex-shrink-0`}
          >
            <Icon className={`h-4 w-4 ${cfg.color}`} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium">{row.description}</p>
            <p className="text-xs text-muted-foreground">
              {row.browser} · {row.os}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    key: 'location',
    header: 'Location',
    cell: (row) => (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span>{row.location}</span>
      </div>
    ),
  },
  {
    key: 'ip',
    header: 'IP Address',
    cell: (row) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.ip}</code>,
  },
  {
    key: 'timestamp',
    header: 'When',
    sortable: true,
    getValue: (row) => row.timestamp,
    cell: (row) => (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        <span title={formatDate(row.timestamp)}>{formatRelativeDate(row.timestamp)}</span>
      </div>
    ),
  },
  {
    key: 'success',
    header: 'Status',
    align: 'center' as const,
    cell: (row) => (
      <Badge
        className={
          row.success
            ? 'border-0 bg-green-100 text-xs text-green-700'
            : 'border-0 bg-red-100 text-xs text-red-700'
        }
      >
        {row.success ? 'Success' : 'Failed'}
      </Badge>
    ),
  },
];

export default function ActivityPage() {
  const { data: activityData, isLoading: activityLoading } = useActivityLog();
  const { data: sessionsData, isLoading: sessionsLoading } = useActiveSessions();
  const [revoking, setRevoking] = useState<string | null>(null);

  const activity = activityData ?? [];
  const sessions = sessionsData ?? [];
  const failedLogins = activity.filter((a) => !a.success).length;

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await userService.revokeSession(id);
    } finally {
      setRevoking(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">Account Activity</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Monitor login history, active sessions, and security events.
        </p>

        {/* Security alert */}
        {failedLogins > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
            role="alert"
          >
            <AlertTriangle
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {failedLogins} failed login attempt{failedLogins !== 1 ? 's' : ''} detected
              </p>
              <p className="mt-0.5 text-xs text-red-600">
                If you don't recognise these, consider changing your password and enabling 2FA.
              </p>
            </div>
          </motion.div>
        )}

        {/* Active Sessions */}
        <section aria-labelledby="sessions-heading" className="mb-8">
          <h2 id="sessions-heading" className="mb-4 text-lg font-semibold">
            Active Sessions
          </h2>
          {sessionsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, i) => {
                const DevIcon = getDeviceIcon(session.device);
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`flex items-center justify-between gap-4 rounded-xl border bg-card p-5 ${session.current ? 'border-primary ring-1 ring-primary' : ''}`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${session.current ? 'bg-primary/10' : 'bg-muted'}`}
                      >
                        <DevIcon
                          className={`h-6 w-6 ${session.current ? 'text-primary' : 'text-muted-foreground'}`}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold">{session.device}</p>
                          {session.current && (
                            <Badge className="border-0 bg-primary/10 text-xs text-primary">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {session.browser} · {session.os}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {session.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {formatRelativeDate(session.lastActive)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {!session.current && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRevoke(session.id)}
                        isLoading={revoking === session.id}
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                        aria-label={`Revoke session on ${session.device}`}
                      >
                        Revoke
                      </Button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Activity log */}
        <section aria-labelledby="activity-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="activity-heading" className="text-lg font-semibold">
              Activity Log
            </h2>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          {activityLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <DataTable
              data={activity}
              columns={activityColumns}
              searchable
              exportable
              exportFilename="account-activity"
              pageSize={6}
              caption="Account activity log"
              aria-label="Account activity log"
              emptyMessage="No activity recorded"
              rowClassName={(row) => (!row.success ? 'bg-red-50/30' : '')}
            />
          )}
        </section>
      </main>
    </div>
  );
}
