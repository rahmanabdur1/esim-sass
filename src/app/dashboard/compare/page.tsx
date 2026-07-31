import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { PlanComparison } from '@/features/compare/PlanComparison';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Plans',
  description: 'Compare eSIM plans side by side to find the best value.',
};

export default function ComparePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="max-w-5xl flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">Compare Plans</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Select up to 3 plans to compare side by side.
        </p>
        <PlanComparison />
      </main>
    </div>
  );
}
