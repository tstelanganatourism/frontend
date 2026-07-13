self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass all requests through to the network.
  // An empty fetch handler can intercept requests but cause them to hang/fail in certain browsers or throttled connections.
  event.respondWith(fetch(event.request));
});
