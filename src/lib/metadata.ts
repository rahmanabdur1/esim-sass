import type { Metadata } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://esimplatform.com';

export function generateMetadata(options: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const { title, description, path = '', image = '/og-image.jpg', noIndex = false } = options;
  const url = `${APP_URL}${path}`;

  return {
    title,
    description,
    metadataBase: new URL(APP_URL),
    openGraph: {
      title,
      description,
      url,
      siteName: 'eSIM Platform',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    alternates: { canonical: url },
  };
}

export const jsonLd = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'eSIM Platform',
    url: APP_URL,
    logo: `${APP_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/esimplatform',
      'https://facebook.com/esimplatform',
      'https://linkedin.com/company/esimplatform',
    ],
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'eSIM Platform',
    url: APP_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${APP_URL}/plans?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
};
