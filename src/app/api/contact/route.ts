import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name:    z.string().min(2).max(100),
  email:   z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !process.env.NEXT_PUBLIC_API_URL;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1';

export async function POST(request: NextRequest) {
  try {
    const body   = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    if (USE_MOCK) {
      // Simulate 300ms processing delay in mock mode
      await new Promise((r) => setTimeout(r, 300));
      return NextResponse.json({ message: 'Message received! We will reply within 24 hours.' });
    }

    const res = await fetch(`${API_BASE}/contact`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(parsed.data),
      cache:   'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: res.status });
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Only POST allowed — no GET
export const runtime = 'edge';
