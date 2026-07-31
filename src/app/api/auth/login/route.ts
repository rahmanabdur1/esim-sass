import { type NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1';
const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email: string; password: string };

    // ── MOCK MODE ─────────────────────────────────────────────
    if (USE_MOCK) {
      const validDemo = email === 'demo@esimplatform.com' && password === 'Demo1234!';
      const validAny = email.includes('@') && password.length >= 8;
      if (!validDemo && !validAny) {
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }
      const response = NextResponse.json(
        {
          user: { id: 'user-001', name: 'Alex Johnson', email, role: 'user', isVerified: true },
          message: 'Login successful',
        },
        { status: 200 },
      );
      response.cookies.set({
        name: 'esim_access_token',
        value: `mock_token_${Date.now()}`,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    // ── REAL API ──────────────────────────────────────────────
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json();
    if (!res.ok)
      return NextResponse.json(
        { error: data.message ?? 'Invalid credentials' },
        { status: res.status },
      );

    const response = NextResponse.json(
      { user: data.user, message: 'Login successful' },
      { status: 200 },
    );
    response.cookies.set({
      name: 'esim_access_token',
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
