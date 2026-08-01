import type { Meta, StoryObj } from '@storybook/react';
import { Navbar } from '../src/components/organisms/Navbar';
import { Footer } from '../src/components/organisms/Footer';
import { DashboardSidebar } from '../src/components/organisms/DashboardSidebar';

// ─── Navbar ────────────────────────────────────────────────────
const navbarMeta: Meta<typeof Navbar> = {
  title: 'Organisms/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
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
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex flex-1 items-center justify-center bg-muted/20 p-8 text-sm text-muted-foreground">
        Dashboard content area
      </div>
    </div>
  ),
  parameters: { layout: 'fullscreen' },
};
