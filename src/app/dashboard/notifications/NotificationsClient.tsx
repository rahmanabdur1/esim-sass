'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/index';
import { useNotifications } from '@/hooks';
import { userService } from '@/services/user.service';
import { formatRelativeDate } from '@/utils';
import type { Notification } from '@/types';

const TYPE_ICON: Record<Notification['type'], { icon: React.ElementType; color: string; bg: string }> = {
  info:    { icon: Info,          color: 'text-blue-600',  bg: 'bg-blue-50'  },
  success: { icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  error:   { icon: XCircle,       color: 'text-red-600',   bg: 'bg-red-50'   },
};

export function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const { data } = useNotifications();
  const notifications = data?.data ?? initialNotifications;
  const [marking, setMarking] = useState(false);

  const unread = notifications.filter((n) => !n.isRead).length;

  const handleMarkAll = async () => {
    setMarking(true);
    await userService.markAllNotificationsRead();
    setMarking(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <span className="text-sm text-muted-foreground">{unread} unread</span>
        </div>
        {unread > 0 && (
          <Button size="sm" variant="outline" onClick={handleMarkAll} isLoading={marking}
            leftIcon={<CheckCheck className="h-4 w-4" />}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3" role="list" aria-label="Notifications">
        <AnimatePresence>
          {notifications.map((n, i) => {
            const cfg  = TYPE_ICON[n.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                role="listitem"
                className={`flex items-start gap-4 rounded-xl border p-4 transition-all ${!n.isRead ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
              >
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    {!n.isRead && <span className="flex h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" aria-label="Unread" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <time className="text-xs text-muted-foreground mt-2 block" dateTime={n.createdAt}>
                    {formatRelativeDate(n.createdAt)}
                  </time>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
