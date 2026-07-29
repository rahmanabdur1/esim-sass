/**
 * Profile Page — SERVER COMPONENT (SSR)
 * =======================================
 * Pre-fetches user on server. ProfileClient handles form edits.
 */
import type { Metadata } from 'next';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { getCurrentUserServer } from '@/lib/server/data';
import { ProfileClient } from './ProfileClient';

export const dynamic  = 'force-dynamic';
export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const user = await getCurrentUserServer();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="font-display text-2xl font-bold mb-1">Profile</h1>
        <p className="text-muted-foreground text-sm mb-8">Manage your personal information.</p>
        <ProfileClient initialUser={user} />
      </main>
    </div>
  );
}
