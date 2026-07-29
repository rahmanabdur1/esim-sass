import React from 'react';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function DashboardLayout({ children, title, description, action }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8">
          {(title || action) && (
            <div className="mb-8 flex items-start justify-between gap-4">
              {title && (
                <div>
                  <h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>
                  {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
                </div>
              )}
              {action && <div className="flex-shrink-0">{action}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
