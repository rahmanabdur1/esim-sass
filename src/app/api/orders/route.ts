import { type NextRequest, NextResponse } from 'next/server';
import { MOCK_ORDERS, MOCK_PLANS, MOCK_ESIMS, MOCK_PAYMENT_METHODS } from '@/lib/mock/data';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1';
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const token = request.cookies.get('esim_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (USE_MOCK) {
    return NextResponse.json({ success: true, data: MOCK_ORDERS });
  }

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok)
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('esim_access_token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();

  if (USE_MOCK) {
    const plan = MOCK_PLANS.find((p) => p.id === body.planId) ?? MOCK_PLANS[1]!;
    const order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ESM-2025-${String(Math.floor(Math.random() * 900) + 100)}`,
      status: 'completed',
      totalAmount: plan.price,
      currency: 'USD',
      plan,
      esim: MOCK_ESIMS[0]!,
      paymentMethod: MOCK_PAYMENT_METHODS[0]!,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: order });
  }

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ error: 'Order failed' }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
