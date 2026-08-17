import { NextResponse } from 'next/server';

// This route is called by Vercel Cron every 10 minutes to prevent
// the Render.com backend from sleeping (free tier sleeps after 15 min inactivity).
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const backendUrl = process.env.INTERNAL_API_URL || 
                     process.env.NEXT_PUBLIC_API_URL || 
                     'https://backend-st7o.onrender.com';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
    
    const res = await fetch(`${backendUrl}/health`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'TS-Tourism-KeepAlive/1.0' },
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    
    const data = res.ok ? await res.json().catch(() => ({})) : {};
    
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      backend: data,
      pingedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || 'unknown', pingedAt: new Date().toISOString() },
      { status: 503 }
    );
  }
}
