import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download.pdf';

  if (!rawUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  // Helper to extract package slug from filename fallback
  const extractSlug = (): string => {
    return filename.replace('-brochure.pdf', '').replace('.pdf', '').trim();
  };

  const slugParam = searchParams.get('slug');
  const slugMatch = (slugParam && slugParam !== 'undefined' && slugParam !== '') ? slugParam : extractSlug();

  try {
    // 1. If URL is a relative print route, redirect immediately
    if (rawUrl.startsWith('/print/')) {
      const target = new URL(rawUrl, request.url);
      target.searchParams.set('autoDownload', 'true');
      return NextResponse.redirect(target);
    }

    // 2. If URL is a legacy private R2 storage key (not a valid HTTP URL)
    const isHttp = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');
    const isSlash = rawUrl.startsWith('/');

    if (!isHttp && !isSlash) {
      // Legacy storage key e.g. "private/brochures/uploaded/..."
      if (slugMatch && slugMatch !== 'download') {
        const target = new URL(`/print/package/${slugMatch}`, request.url);
        target.searchParams.set('autoDownload', 'true');
        return NextResponse.redirect(target);
      }
      return new NextResponse('Invalid document key', { status: 400 });
    }

    // 3. Resolve relative URL if needed
    let targetUrl = rawUrl;
    if (isSlash) {
      const origin = new URL(request.url).origin;
      targetUrl = `${origin}${rawUrl}`;
    }

    // 4. Fetch source document from Cloudinary / external storage
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/pdf, application/octet-stream, */*',
      },
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(
        `[api/download] Source returned ${response.status} for ${targetUrl}. Redirecting to live print page.`
      );
      if (slugMatch && slugMatch !== 'download') {
        const target = new URL(`/print/package/${slugMatch}`, request.url);
        target.searchParams.set('autoDownload', 'true');
        return NextResponse.redirect(target);
      }
      return new NextResponse(`Failed to fetch source file: ${response.status}`, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'application/pdf';

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('[api/download] Proxy error:', error);
    // On any fetch error, fallback to live print page rather than showing an error screen
    if (slugMatch && slugMatch !== 'download') {
      const target = new URL(`/print/package/${slugMatch}`, request.url);
      target.searchParams.set('autoDownload', 'true');
      return NextResponse.redirect(target);
    }
    return new NextResponse(`Error downloading file: ${error?.message || String(error)}`, { status: 500 });
  }
}
