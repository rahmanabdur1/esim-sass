import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { TravelPlanner } from '@/features/travel/TravelPlanner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Travel Planner',
  description: 'Get personalised eSIM recommendations based on your destination and trip length.',
};

export default function TravelPlannerPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="max-w-3xl flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">Smart Travel Planner</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          Tell us where you're going and we'll recommend the perfect eSIM plan.
        </p>
        <TravelPlanner />
      </main>
    </div>
  );
}
