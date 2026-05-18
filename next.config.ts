import type { NextConfig } from "next";
import path from "node:path";

const backendOrigin = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  compress: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
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
        },
        // ISR page routes: allow CDN/browser to cache the rendered HTML for 60s.
        // stale-while-revalidate lets the browser serve stale content instantly
        // while fetching the fresh version in the background — eliminates the
        // "cold" repeated requests visible in the dev server log.
        {
          source: '/packages/:slug*',
          headers: [
            { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' },
          ],
        },
        {
          source: '/stays/:slug*',
          headers: [
            { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' },
          ],
        },
        {
          source: '/boat-rides/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' },
          ],
        },
        {
          source: '/sightseeing/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=120' },
          ],
        }
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
