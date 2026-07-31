'use client';

import dynamic from 'next/dynamic';

const CookieConsentBanner = dynamic(
  () => import('@/features/gdpr/CookieConsent').then((m) => m.CookieConsentBanner),
  { ssr: false },
);

export default function CookieBannerClient() {
  return <CookieConsentBanner />;
}
