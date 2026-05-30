import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download.pdf';

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    });
    
    if (!response.ok) {
      console.error(`Download proxy fetch failed: ${response.status} ${response.statusText} for URL: ${url}`);
      return new NextResponse(`Failed to fetch from url: ${response.status}`, { status: 502 });
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return new NextResponse(`Error downloading file: ${error.message}`, { status: 500 });
  }
}
