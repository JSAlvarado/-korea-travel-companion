// Map-tile cache. Only touches map-tile image requests; the app itself is bundled locally.
// Tiles you have viewed (or pre-loaded) stay available with no internet.
const TILES_CACHE = 'korea-travel-tiles-v4';

const OFFLINE_TILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"></svg>`;

function isTileRequest(url) {
  return (
    (url.hostname.endsWith('google.com') && url.pathname.includes('/vt')) ||
    url.hostname.endsWith('openstreetmap.org') ||
    url.hostname.startsWith('tile.')
  );
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== TILES_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch { return; }
  if (!isTileRequest(url)) return;

  event.respondWith(
    caches.open(TILES_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        // opaque (status 0) responses are fine for <img> tiles
        if (res && (res.ok || res.type === 'opaque')) {
          cache.put(req, res.clone());
          return res;
        }
        throw new Error('tile unavailable');
      } catch {
        return new Response(OFFLINE_TILE_SVG, {
          headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' },
        });
      }
    })
  );
});

// Pre-cache tile URLs on request from the app ("Download map for offline")
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    event.waitUntil(
      caches.open(TILES_CACHE).then(async (cache) => {
        for (const u of event.data.urls) {
          try {
            const res = await fetch(u, { mode: 'no-cors' });
            if (res) await cache.put(u, res);
          } catch {}
        }
      })
    );
  }
});
