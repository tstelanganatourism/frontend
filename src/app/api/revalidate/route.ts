import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand cache revalidation endpoint.
 * Called by adminStore after any package/room mutation to instantly
 * bust the ISR cache so storefront changes appear in <1s (not 60s).
 *
 * POST /api/revalidate
 * Body: { paths: string[], secret: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paths, secret } = body as { paths?: string[]; secret?: string };

    // In development mode, Next.js does not statically cache pages (it renders on-demand),
    // and calling revalidatePath forces full page recompilations that freeze the single-threaded dev server.
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        message: 'Skipped revalidation in development mode to prevent dev server freeze.',
        paths 
      });
    }

    // Simple shared secret guard — prevents public abuse
    const expectedSecret = process.env.REVALIDATE_SECRET || 'ts-tourism-revalidate-2024';
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: 'paths array required' }, { status: 400 });
    }

    const revalidated: string[] = [];
    for (const path of paths) {
      if (typeof path === 'string' && path.startsWith('/')) {
        revalidatePath(path);
        revalidated.push(path);
      }
    }

    return NextResponse.json({ revalidated, count: revalidated.length });
  } catch (err) {
    console.error('[revalidate] Error:', err);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
