import React from 'react';
import { Navbar } from '@/components/organisms/Navbar';
import { Footer } from '@/components/organisms/Footer';

interface MarketingLayoutProps {
  children: React.ReactNode;
  withHeroPadding?: boolean;
}

export function MarketingLayout({ children, withHeroPadding = true }: MarketingLayoutProps) {
  return (
    <>
      <Navbar />
      <main id="main-content" className={withHeroPadding ? 'pt-16' : ''}>
        {children}
      </main>
      <Footer />
    </>
  );
}
