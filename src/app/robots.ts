import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/', // Private pages
          '/api/', // API routes
          '/auth/', // Auth pages
          '/_next/', // Next.js internals
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'], // Block AI training crawlers
      },
    ],
    sitemap: 'https://esimplatform.com/sitemap.xml',
    host: 'https://esimplatform.com',
  };
}
