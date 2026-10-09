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

    // Dev-mode skip removed for real-time consistency verification

    // Simple shared secret guard — prevents public abuse
    const expectedSecret = process.env.REVALIDATE_SECRET || 'ts-tourism-revalidate-2024';
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const revalidatedPaths: string[] = [];
    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        if (typeof path === 'string' && path.startsWith('/')) {
          try {
            revalidatePath(path);
            revalidatedPaths.push(path);
          } catch (e) {
            console.warn(`[revalidate] Failed path ${path}:`, e);
          }
        }
      }
    }

    const revalidatedTags: string[] = [];
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        if (typeof tag === 'string') {
          try {
            (revalidateTag as any)(tag, 'max');
            revalidatedTags.push(tag);
          } catch (e) {
            try {
              (revalidateTag as any)(tag);
              revalidatedTags.push(tag);
            } catch (e2) {
              console.warn(`[revalidate] Failed tag ${tag}:`, e2);
            }
          }
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
