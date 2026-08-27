// ─── Service Worker — TS Boat Tourism ──────────────────────────────────────────
// Strategy:
//   /_next/static/*  →  Cache-First (content-hashed, never stale)
//   HTML pages       →  Stale-While-Revalidate (with offline fallback)
//   /api/*           →  Network-Only (never cache — auth/dynamic data)
//   Cross-origin     →  Network-Only (CDN images/videos bypass)
// ──────────────────────────────────────────────────────────────────────────────

const STATIC_CACHE = 'ts-static-v1';
const SHELL_CACHE = 'ts-shell-v1';

// HTML pages to pre-cache on install
const SHELL_URLS = ['/', '/packages', '/stays', '/about', '/contact', '/gallery', '/faq', '/brochures'];

// ─── Install: pre-cache shell pages ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)))
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
  ) return;

  // 2. Cross-origin (Cloudinary CDN, Google Fonts) — bypass
  if (url.origin !== self.location.origin) return;

  // 3. Next.js static assets — Cache-First (safe: filenames are content-hashed)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  // 4. HTML shell pages — Stale-While-Revalidate
  const acceptsHtml = event.request.headers.get('accept')?.includes('text/html');
  if (acceptsHtml) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        return cached ?? networkFetch;
      })
    );
    return;
  }

  // 5. Everything else — network only (no respondWith = native fetch)
});
