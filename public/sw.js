self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Let the browser do its default thing
  // For a full offline experience, you would implement a cache-first or network-first strategy here.
  // This lightweight version just satisfies the PWA installability requirements.
});
