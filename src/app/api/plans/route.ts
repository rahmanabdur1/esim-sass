import { type NextRequest, NextResponse } from 'next/server';
// import { MOCK_PLANS, MOCK_COUNTRIES } from '@/lib/mock/data';
import { MOCK_PLANS } from '@/lib/mock/data';
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1';
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // ── MOCK MODE ───────────────────────────────────────────────
  if (USE_MOCK) {
    const search = searchParams.get('search')?.toLowerCase() ?? '';
    const country = searchParams.get('country')?.toLowerCase() ?? '';
    let plans = MOCK_PLANS;
    if (search)
      plans = plans.filter(
        (p) =>
          p.name.toLowerCase().includes(search) || p.country.name.toLowerCase().includes(search),
      );
    if (country)
      plans = plans.filter(
        (p) => p.country.code.toLowerCase() === country || p.country.id === country,
      );
    return NextResponse.json({
      data: { data: plans, total: plans.length, page: 1, limit: 50 },
      success: true,
      message: 'OK',
    });
  }

  // ── REAL API ────────────────────────────────────────────────
  try {
    const res = await fetch(`${API_BASE}/plans?${searchParams.toString()}`, {
      headers: { Authorization: `Bearer ${request.cookies.get('esim_access_token')?.value ?? ''}` },
      next: { revalidate: 300, tags: ['plans'] },
    });
    if (!res.ok)
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: res.status });
    return NextResponse.json(await res.json(), {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
export const revalidate = 300;
