import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';

// ─── Navbar ────────────────────────────────────────────────────
const navbarMeta: Meta<typeof Navbar> = {
  title:      'Organisms/Navbar',
  component:  Navbar,
  parameters: { layout: 'fullscreen' },
  tags:       ['autodocs'],
};
export default navbarMeta;

export const Default: StoryObj<typeof Navbar> = {
  render: () => (
    <div className="h-32 bg-muted/30">
      <Navbar />
    </div>
  ),
};

// ─── Footer ────────────────────────────────────────────────────
export const FooterDefault: StoryObj = {
  render: () => <Footer />,
  parameters: { layout: 'fullscreen' },
};

// ─── Dashboard Sidebar ─────────────────────────────────────────
export const SidebarDefault: StoryObj = {
  render: () => (
    <div className="h-screen flex">
      <DashboardSidebar />
      <div className="flex-1 bg-muted/20 p-8 flex items-center justify-center text-muted-foreground text-sm">
        Dashboard content area
      </div>
    </div>
  ),
  parameters: { layout: 'fullscreen' },
};
