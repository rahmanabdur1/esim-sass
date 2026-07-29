import { type NextRequest, NextResponse } from 'next/server';
import { MOCK_ESIMS } from '@/lib/mock/data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const token = request.cookies.get('esim_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (USE_MOCK) {
    return NextResponse.json({ success: true, data: MOCK_ESIMS });
  }

  try {
    const res = await fetch(`${API_BASE}/esims`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch eSIMs' }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
