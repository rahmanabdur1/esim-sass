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
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl">
        <h1 className="font-display text-2xl font-bold mb-1">Compare Plans</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Select up to 3 plans to compare side by side.
        </p>
        <PlanComparison />
      </main>
    </div>
  );
}
