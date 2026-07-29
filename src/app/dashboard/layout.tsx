/**
 * Dashboard Layout — SERVER COMPONENT
 * =====================================
 * Runs on the server — no JS sent to browser for this shell.
 * Server-side auth guard reads HttpOnly cookie without exposing token to JS.
 * Each child page decides its own Server/Client boundary.
 */
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

export const metadata: Metadata = {
  title:    { default: 'Dashboard', template: '%s | Dashboard — eSIM Platform' },
  robots:   { index: false, follow: false }, // No indexing for authenticated pages
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Server-side auth guard ────────────────────────────────────
  // Reads HttpOnly cookie on the server — token never exposed to JS
  const cookieStore = await cookies();
  const token = cookieStore.get('esim_access_token');

  if (!token?.value) {
    redirect(`${ROUTES.LOGIN}?callbackUrl=/dashboard`);
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
