self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests; let browser handle cross-origin images & API calls directly
  if (event.request.method !== 'GET') return;
  try {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
  } catch (e) {
    return;
  }
  event.respondWith(fetch(event.request));
});
