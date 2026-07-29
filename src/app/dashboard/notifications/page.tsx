/**
 * Notifications — SERVER COMPONENT (SSR)
 * ========================================
 * Server pre-fetches notifications. NotificationsClient handles mark-read.
 */
import type { Metadata } from 'next';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { getNotificationsServer } from '@/lib/server/data';
import { NotificationsClient } from './NotificationsClient';

export const dynamic  = 'force-dynamic';
export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const notifications = await getNotificationsServer();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-1">Notifications</h1>
        <p className="text-muted-foreground text-sm mb-8">Stay up to date with your eSIM activity.</p>
        <NotificationsClient initialNotifications={notifications} />
      </main>
    </div>
  );
}
