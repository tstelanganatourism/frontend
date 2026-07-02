import type { NextConfig } from "next";
import path from "node:path";

const backendOrigin = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns', 'lodash'],
    proxyClientMaxBodySize: '100mb',
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
    qualities: [25, 50, 65, 75, 80, 90, 100],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', pathname: '/**' },
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com', pathname: '/**' }
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';
    
    const headersList = [
      // Security headers for all routes
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://sdk.cashfree.com https://www.googletagmanager.com https://static.cloudflareinsights.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com; img-src 'self' data: blob: https://res.cloudinary.com https://*.r2.cloudflarestorage.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://maps.googleapis.com https://maps.gstatic.com https://*.ggpht.com https://*.googleapis.com https://*.gstatic.com; connect-src 'self' https://api.tsboattourism.org wss://api.tsboattourism.org https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com wss: https://*.google-analytics.com https://*.analytics.google.com https://*.g.doubleclick.net https://*.sentry.io https://cloudflareinsights.com https://maps.googleapis.com; frame-src 'self' https://sdk.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com https://payments.cashfree.com https://www.google.com https://maps.googleapis.com; font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com;" },
        ],
      },
    ];

    if (isProd) {
      headersList.push(
        // Static assets: aggressive caching (1 year) — Next.js content-hashes these
        {
          source: '/_next/static/(.*)',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        }
        // Note: ISR page routes are NOT overridden here.
        // Next.js native `export const revalidate = 43200` (12h) on each page
        // controls the Vercel Data Cache. On-demand revalidation via /api/revalidate
        // is triggered by the admin dashboard for instant updates.
        // Custom 60s s-maxage overrides were removed because they caused excessive
        // ISR Writes (forced regeneration every 60s) burning through free tier limits.
      );
    }

    return headersList;
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      {
        source: "/health",
        destination: `${backendOrigin}/health`,
      },
    ];
  },
};

export default nextConfig;
