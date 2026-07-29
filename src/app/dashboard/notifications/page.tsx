// app/dashboard/notifications/page.tsx

import type { Metadata } from 'next';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { getNotificationsServer } from '@/lib/server/data';
import { NotificationsClient } from './NotificationsClient';
import type { Notification } from '@/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  // ✅ Properly typed
  const notifications: Notification[] = (await getNotificationsServer()) as Notification[];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 text-2xl font-bold">Notifications</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Stay up to date with your eSIM activity.
        </p>

        <NotificationsClient initialNotifications={notifications} />
      </main>
    </div>
  );
}
