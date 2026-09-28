import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/pdf/[type]/[id]
 *
 * Server-side PDF proxy route.
 * - Generates the HMAC secret internally (access to env vars, no client exposure needed)
 * - Calls the backend Playwright PDF endpoint server-to-server (no CORS)
 * - Streams the PDF back to the browser with Content-Disposition: attachment
 *   so the browser saves it directly to Downloads — no print dialog shown.
 *
 * Usage from PrintAction (client):
 *   fetch('/api/pdf/ticket/TSBOAT_PHT_30092026_1000')
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  // Validate doc type
  const allowed = ['ticket', 'invoice', 'form'];
  if (!allowed.includes(type)) {
    return new NextResponse('Invalid document type', { status: 400 });
  }

  if (!id || id.trim() === '') {
    return new NextResponse('Missing booking ID', { status: 400 });
  }

  // ── Generate HMAC secret server-side ────────────────────────────────────────
  // Same logic as the backend: HMAC-SHA256(PDF_SECRET_KEY, booking_id)
  const secretKey =
    process.env.PDF_SECRET_KEY ||
    process.env.SECRET_KEY ||
    'tsaptourismpapikondalubadhrachalam';

  let secret: string;
  if (id.startsWith('DEMO-')) {
    // DEMO bookings: secret is the expected HMAC (backend also allows DEMO without validation)
    secret = crypto.createHmac('sha256', secretKey).update(id).digest('hex');
  } else {
    secret = crypto.createHmac('sha256', secretKey).update(id).digest('hex');
  }

  // ── Call backend PDF endpoint server-to-server ───────────────────────────────
  // Use internal API URL if available (e.g., Docker internal network), fall back to public URL
  const backendUrl =
    process.env.INTERNAL_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000';

  const pdfEndpoint = `${backendUrl}/api/v1/bookings/${encodeURIComponent(id)}/pdf?doc_type=${encodeURIComponent(type)}&secret=${encodeURIComponent(secret)}`;

  try {
    const response = await fetch(pdfEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        // Identify ourselves as the Next.js server (not a browser) so the backend can trust us
        'X-Internal-Request': '1',
      },
      // Don't cache — PDFs should always be fresh
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error(
        `[pdf-proxy] Backend returned ${response.status} for ${type}/${id}`
      );
      return new NextResponse(
        `PDF generation failed: backend returned ${response.status}`,
        { status: response.status }
      );
    }

    const pdfBytes = await response.arrayBuffer();

    const filename = `${type.charAt(0).toUpperCase() + type.slice(1)}_${id}.pdf`;

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // `attachment` tells the browser to save to Downloads, not open/print
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBytes.byteLength.toString(),
        // Never cache PDF downloads — booking data changes
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[pdf-proxy] Network error for ${type}/${id}:`, message);
    return new NextResponse(`PDF proxy network error: ${message}`, {
      status: 502,
    });
  }
}
