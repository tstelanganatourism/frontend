import type { NextConfig } from "next";
import path from "node:path";

const backendOrigin = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns', 'lodash'],
    middlewareClientMaxBodySize: '100mb',
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 60, 65, 75, 85, 90, 100],
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
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://res.cloudinary.com https://*.r2.cloudflarestorage.com https://www.google-analytics.com; connect-src 'self' https://api.tsboattourism.org wss://api.tsboattourism.org https://api.razorpay.com https://checkout.razorpay.com wss: https://www.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://*.sentry.io; frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.google.com; font-src 'self' data: https://fonts.gstatic.com;" },
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
        // ISR page routes: browser must always revalidate (max-age=0) so a
        // reload after deployment never serves stale HTML. The CDN layer
        // (Vercel / Cloudflare) caches for 60s via s-maxage, and
        // stale-while-revalidate lets the CDN serve the old page instantly
        // while regenerating in the background.
        {
          source: '/packages/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=59' },
          ],
        },
        {
          source: '/stays/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=59' },
          ],
        },
        {
          source: '/boat-rides/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=59' },
          ],
        },
        {
          source: '/sightseeing/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=59' },
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
