/**
 * Dashboard Home — SERVER COMPONENT (SSR + Streaming)
 * =====================================================
 * Pre-fetches user data and eSIMs in parallel on the server.
 * Suspense boundaries stream each section independently.
 * User sees sidebar + heading instantly, data streams in.
 */
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { getCurrentUserServer, getESIMsServer, getOrdersServer } from '@/lib/server/data';
import { DashboardHomeClient } from '@/features/dashboard/DashboardHomeClient';
import { Skeleton } from '@/components/atoms/index';

export const dynamic  = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard' };

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[1,2,3,4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
    </div>
  );
}

export default async function DashboardPage() {
  // Parallel server fetches — all resolve before streaming begins
  const [user, esims, orders] = await Promise.all([
    getCurrentUserServer(),
    getESIMsServer(),
    getOrdersServer(),
  ]);

  const stats = {
    activeESIMs:   esims.filter((e) => e.status === 'active').length,
    totalOrders:   orders.length,
    totalSpent:    orders.reduce((sum, o) => sum + o.totalAmount, 0),
    dataRemaining: esims
      .filter((e) => e.status === 'active')
      .reduce((sum, e) => sum + e.dataRemaining, 0),
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        {/* Heading renders instantly — no suspense needed */}
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold">
            Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening with your eSIMs today.
          </p>
        </div>

        {/* Client island receives pre-fetched data — no loading state */}
        <Suspense fallback={<StatsSkeleton />}>
          <DashboardHomeClient
            initialESIMs={esims}
            initialOrders={orders}
            stats={stats}
            user={user}
          />
        </Suspense>
      </main>
    </div>
  );
}
