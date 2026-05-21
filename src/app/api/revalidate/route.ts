import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand cache revalidation endpoint.
 * Called by adminStore after any package/room mutation to instantly
 * bust the ISR cache so storefront changes appear in <1s (not 60s).
 *
 * POST /api/revalidate
 * Body: { paths: string[], tags: string[], secret: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paths, tags, secret } = body as { paths?: string[]; tags?: string[]; secret?: string };

    // In development mode, Next.js does not statically cache pages (it renders on-demand),
    // and calling revalidatePath/revalidateTag forces full page recompilations that freeze the single-threaded dev server.
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        message: 'Skipped revalidation in development mode to prevent dev server freeze.',
        paths,
        tags
      });
    }

    // Simple shared secret guard — prevents public abuse
    const expectedSecret = process.env.REVALIDATE_SECRET || 'ts-tourism-revalidate-2024';
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const revalidatedPaths: string[] = [];
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        if (typeof path === 'string' && path.startsWith('/')) {
          revalidatePath(path);
          revalidatedPaths.push(path);
        }
      }
    }

    const revalidatedTags: string[] = [];
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (typeof tag === 'string') {
          revalidateTag(tag, 'default');
          revalidatedTags.push(tag);
        }
      }
    }

    return NextResponse.json({ 
      revalidatedPaths, 
      revalidatedTags,
      pathsCount: revalidatedPaths.length, 
      tagsCount: revalidatedTags.length 
    });
  } catch (err) {
    console.error('[revalidate] Error:', err);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
