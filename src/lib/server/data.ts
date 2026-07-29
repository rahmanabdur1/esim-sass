/**
 * SERVER-ONLY DATA FETCHING
 * ==========================
 * 'server-only' import prevents this from being bundled client-side.
 * All functions run on the server — safe for private env vars & cookies.
 * Used by Server Components and Server Actions throughout the app.
 */
import 'server-only';
import { cookies } from 'next/headers';
import {
  MOCK_PLANS, MOCK_COUNTRIES, MOCK_ESIMS,
  MOCK_ORDERS, MOCK_NOTIFICATIONS, MOCK_USER,
  MOCK_BLOG_POSTS, MOCK_ARTICLES,
} from '@/lib/mock/data';
import type { Plan, Country, ESIM, Order, User, BlogPost } from '@/types';

const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ||
  !process.env.NEXT_PUBLIC_API_URL;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1';

// ── Helpers ──────────────────────────────────────────────────

async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get('esim_access_token')?.value;
}

async function serverFetch<T>(
  path: string,
  opts: { cache?: RequestCache; revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  const token = await getToken();
  const res   = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(opts.revalidate !== undefined
      ? { next: { revalidate: opts.revalidate, tags: opts.tags ?? [] } }
      : { cache: opts.cache ?? 'no-store' }),
  });
  if (!res.ok) throw new Error(`Server fetch: ${path} → ${res.status}`);
  const data = await res.json();
  return data.data ?? data;
}

// ── PUBLIC DATA (ISR-cached) ─────────────────────────────────

export async function getPlansServer(filters?: {
  search?: string;
  country?: string;
}): Promise<Plan[]> {
  if (USE_MOCK) {
    let plans = [...MOCK_PLANS];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      plans = plans.filter(
        (p) => p.name.toLowerCase().includes(q) || p.country.name.toLowerCase().includes(q),
      );
    }
    if (filters?.country) {
      plans = plans.filter(
        (p) => p.country.code.toLowerCase() === filters.country!.toLowerCase(),
      );
    }
    return plans;
  }
  const qs = new URLSearchParams(filters as Record<string, string>).toString();
  return serverFetch<Plan[]>(`/plans${qs ? `?${qs}` : ''}`, {
    revalidate: 300,
    tags:       ['plans'],
  });
}

export async function getPlanServer(id: string): Promise<Plan | null> {
  if (USE_MOCK) return MOCK_PLANS.find((p) => p.id === id) ?? null;
  return serverFetch<Plan>(`/plans/${id}`, { revalidate: 300, tags: ['plans', `plan-${id}`] });
}

export async function getCountriesServer(): Promise<Country[]> {
  if (USE_MOCK) return MOCK_COUNTRIES;
  return serverFetch<Country[]>('/countries', { revalidate: 600, tags: ['countries'] });
}

export async function getCountryServer(code: string): Promise<Country | null> {
  if (USE_MOCK)
    return (
      MOCK_COUNTRIES.find(
        (c) => c.code.toLowerCase() === code.toLowerCase() || c.id === code.toLowerCase(),
      ) ?? null
    );
  try {
    return await serverFetch<Country>(`/countries/${code}`, {
      revalidate: 600,
      tags:       ['countries', `country-${code}`],
    });
  } catch { return null; }
}

export async function getBlogPostsServer(): Promise<BlogPost[]> {
  if (USE_MOCK) return MOCK_BLOG_POSTS;
  return serverFetch<BlogPost[]>('/blog', { revalidate: 600, tags: ['blog'] });
}

export async function getBlogPostServer(slug: string): Promise<BlogPost | null> {
  if (USE_MOCK) return MOCK_BLOG_POSTS.find((p) => p.slug === slug) ?? null;
  try {
    return await serverFetch<BlogPost>(`/blog/${slug}`, {
      revalidate: 600,
      tags:       ['blog', `post-${slug}`],
    });
  } catch { return null; }
}

export async function getKBArticlesServer() {
  if (USE_MOCK) return MOCK_ARTICLES;
  return serverFetch('/knowledge-base/articles', { revalidate: 3600, tags: ['kb'] });
}

// ── AUTH-GATED DATA (SSR, no-store) ─────────────────────────

export async function getCurrentUserServer(): Promise<User | null> {
  const token = await getToken();
  if (!token) return null;
  if (USE_MOCK) return MOCK_USER;
  try { return await serverFetch<User>('/auth/me', { cache: 'no-store' }); }
  catch { return null; }
}

export async function getESIMsServer(): Promise<ESIM[]> {
  const token = await getToken();
  if (!token) return [];
  if (USE_MOCK) return MOCK_ESIMS;
  return serverFetch<ESIM[]>('/esims', { cache: 'no-store' });
}

export async function getESIMServer(id: string): Promise<ESIM | null> {
  const token = await getToken();
  if (!token) return null;
  if (USE_MOCK) return MOCK_ESIMS.find((e) => e.id === id) ?? null;
  try { return await serverFetch<ESIM>(`/esims/${id}`, { cache: 'no-store' }); }
  catch { return null; }
}

export async function getOrdersServer(): Promise<Order[]> {
  const token = await getToken();
  if (!token) return [];
  if (USE_MOCK) return MOCK_ORDERS;
  return serverFetch<Order[]>('/orders', { cache: 'no-store' });
}

export async function getNotificationsServer() {
  const token = await getToken();
  if (!token) return [];
  if (USE_MOCK) return MOCK_NOTIFICATIONS;
  return serverFetch('/user/notifications', { cache: 'no-store' });
}
