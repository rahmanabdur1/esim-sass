import { type NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

const SECRET = process.env.REVALIDATE_SECRET ?? 'dev-secret';

/**
 * On-demand ISR revalidation endpoint
 * POST /api/revalidate?tag=plans&secret=xxx
 * POST /api/revalidate?path=/plans&secret=xxx
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const tag = searchParams.get('tag');
  const path = searchParams.get('path');

  // Validate secret (skip in dev/mock mode)
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
  if (!isMock && secret !== SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  if (!tag && !path) {
    return NextResponse.json({ error: 'Provide tag or path param' }, { status: 400 });
  }

  try {
    if (tag) revalidateTag(tag);
    if (path) revalidatePath(path);

    return NextResponse.json({
      revalidated: true,
      type: tag ? 'tag' : 'path',
      value: tag ?? path,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
