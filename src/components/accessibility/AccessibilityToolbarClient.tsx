'use client';

import dynamic from 'next/dynamic';

// Client Component-এর ভেতর ssr: false সম্পূর্ণ নিরাপদ
const AccessibilityToolbar = dynamic(
  () => import('./AccessibilityToolbar').then((mod) => mod.AccessibilityToolbar),
  { ssr: false },
);

export default function AccessibilityToolbarClient() {
  return <AccessibilityToolbar />;
}
