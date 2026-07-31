import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { QueryProvider } from '@/lib/query-provider';
import { A11yProvider } from '@/components/accessibility/AccessibilityToolbar';
import AccessibilityToolbarClient from '@/components/accessibility/AccessibilityToolbarClient'; //
import { GlobalOverlays } from '@/components/ui/GlobalOverlays';
import { WebVitalsReporter } from '@/components/performance/WebVitalsReporter';
import CookieBannerClient from '@/components/cookieBanner/CookieBannerClient';

import '@/styles/globals.css';

// Primary sans-serif — subsetted to latin only, preloaded, display: swap
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  adjustFontFallback: true, // reduces CLS during font swap
});

// Monospace — for ICCID codes, activation codes, API keys
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  preload: false, // not critical path
});

export const metadata: Metadata = {
  metadataBase: new URL('https://esimplatform.com'),
  title: { default: 'eSIM Platform — Global Connectivity', template: '%s | eSIM Platform' },
  description:
    'Stay connected worldwide with instant eSIM solutions. No physical SIM needed. Activate instantly, travel freely across 190+ countries.',
  keywords: ['eSIM', 'travel SIM', 'global data', 'international roaming', 'travel connectivity'],
  authors: [{ name: 'eSIM Platform' }],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'eSIM Platform' },
  // Open Graph + OG images
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://esimplatform.com',
    siteName: 'eSIM Platform',
    title: 'eSIM Platform — Global Connectivity',
    description: 'Stay connected worldwide with instant eSIM solutions.',
    images: [
      {
        url: '/og?title=eSIM+Platform&subtitle=Global+Connectivity',
        width: 1200,
        height: 630,
        alt: 'eSIM Platform — Stay Connected Worldwide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eSIM Platform — Global Connectivity',
    description: 'Stay connected worldwide with instant eSIM solutions.',
    images: ['/og?title=eSIM+Platform&subtitle=Global+Connectivity'],
    creator: '@esimplatform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  // Canonical alternate languages (hreflang)
  alternates: {
    canonical: 'https://esimplatform.com',
    languages: {
      'en-US': 'https://esimplatform.com',
      'de-DE': 'https://esimplatform.com/de',
      'fr-FR': 'https://esimplatform.com/fr',
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'light dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <A11yProvider>
            <QueryProvider>
              {/* Skip-to-content for keyboard / screen-reader users */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none"
              >
                Skip to main content
              </a>
              <GlobalOverlays>{children}</GlobalOverlays>
              <CookieBannerClient />
              {/* Web Vitals monitoring — zero render output, pure measurement */}
              <WebVitalsReporter />
              <AccessibilityToolbarClient />
            </QueryProvider>
          </A11yProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
