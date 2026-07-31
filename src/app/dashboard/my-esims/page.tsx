/**
 * My eSIMs — SERVER COMPONENT (SSR)
 * ====================================
 * Fetches user eSIMs on server — user sees content instantly.
 * No loading spinner on initial paint. MyESIMsClient handles interactions.
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Skeleton } from '@/components/atoms/index';
import { getESIMsServer } from '@/lib/server/data';
import { MyESIMsClient } from './MyESIMsClient';

export const dynamic = 'force-dynamic'; // SSR — always fresh
export const metadata: Metadata = { title: 'My eSIMs' };

export default async function MyESIMsPage() {
  // Fetched on server — data arrives with HTML, zero client waterfall
  const esims = await getESIMsServer();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">My eSIMs</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Manage your active and past eSIM profiles.
        </p>
        <Suspense fallback={<Skeleton className="h-64 rounded-xl" />}>
          <MyESIMsClient initialESIMs={esims} />
        </Suspense>
      </main>
    </div>
  );
}
