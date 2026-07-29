import type { MetadataRoute } from 'next';
import { getCountriesServer, getBlogPostsServer } from '@/lib/server/data';

const BASE_URL = 'https://esimplatform.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [countries, posts] = await Promise.all([
    getCountriesServer().catch(() => []),
    getBlogPostsServer().catch(() => []),
  ]);

  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,          lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE_URL}/plans`,     lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/countries`, lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE_URL}/blog`,      lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE_URL}/about`,     lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`,   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/faq`,       lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/terms`,     lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE_URL}/privacy`,   lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  const countryPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${BASE_URL}/countries/${c.id}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`, lastModified: p.publishedAt, changeFrequency: 'monthly' as const, priority: 0.6,
  }));

  return [...staticPages, ...countryPages, ...blogPages];
}
