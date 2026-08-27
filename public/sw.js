// ─── Service Worker — TS Boat Tourism ──────────────────────────────────────────
// Strategy:
//   /_next/static/*  →  Cache-First (content-hashed, immutable assets)
//   Dynamic pages    →  Network-First (live data with offline fallback)
//   Shell pages      →  Network-First (always fresh, offline cache fallback)
//   /api/*, /admin/* →  Network-Only (never cache auth/dynamic/live routes)
//   Cross-origin     →  Network-Only (CDN images/videos bypass)
// ──────────────────────────────────────────────────────────────────────────────

const STATIC_CACHE = 'ts-static-v4';
const SHELL_CACHE = 'ts-shell-v4';

// HTML pages to pre-cache on install for offline capability
const SHELL_URLS = ['/', '/packages', '/stays', '/about', '/contact', '/gallery', '/faq', '/brochures'];

// ─── Install: pre-cache shell pages ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(
        SHELL_URLS.map(async (url) => {
          try {
            const res = await fetch(url);
            if (res.ok && res.status === 200) {
              await cache.put(url, res);
            }
          } catch {
            // Ignore prefetch failures during install
          }
        })
      )
    )
  );
});

// ─── Activate: take control + prune stale cache versions ─────────────────────
self.addEventListener('activate', (event) => {
  const KNOWN_CACHES = [STATIC_CACHE, SHELL_CACHE];
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => !KNOWN_CACHES.includes(k))
            .map((k) => caches.delete(k))
        )
      ),
    ])
  );
});

// ─── Fetch: route requests to the correct strategy ───────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  // 1. API, Admin, Agent, Dashboard, and Print routes — ALWAYS network only (never cache auth/dynamic/live data)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/print/') ||
    url.pathname.startsWith('/admin/') ||
    url.pathname.startsWith('/agent/') ||
    url.pathname.startsWith('/dashboard/')
  ) {
    return;
  }

  // 2. Cross-origin (Cloudinary CDN, Google Fonts) — bypass SW
  if (url.origin !== self.location.origin) return;

  // 3. Next.js static assets — Cache-First (safe: filenames are content-hashed)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok && response.status === 200) {
          cache.put(event.request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // 4. HTML pages — Network-First (always fresh live data, only fallback to cache if offline)
  const acceptsHtml = event.request.headers.get('accept')?.includes('text/html');
  if (acceptsHtml) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok && networkResponse.status === 200) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // Network failed (offline) — attempt to serve from cache
          const cached = await caches.match(event.request);
          if (cached && cached.ok && cached.status === 200) {
            return cached;
          }
          // If not in cache, fallback to root shell
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          return new Response('Network error. Please check your internet connection.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' },
          });
        }
      })()
    );
    return;
  }

  // 5. Everything else — network only (no respondWith = native fetch)
});
