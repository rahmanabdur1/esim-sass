import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      mock: process.env.NEXT_PUBLIC_USE_MOCK_API === 'true',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}

export const runtime = 'edge';
