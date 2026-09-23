// Service Worker for BHUPA' BHABHU' GHURU RATO' PWA
const CACHE_NAME = 'satengka-pasung-pwa-v16';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './login.html',
  './register.html',
  './manifest.json',
  './assets/logo_opt.png',
  './assets/background_opt.webp',
  './assets/brand_text_official.png',
  './assets/splash_official.jpeg',
  './assets/splash_desktop.jpg',
  './assets/icons/role_bhupa.png',
  './assets/icons/role_bhu-ghuru.png',
  './assets/icons/role_rato.png',
  './assets/icons/role_nakes.png',
  './assets/icons/role_bhupa_white.png',
  './assets/icons/role_bhu-ghuru_white.png',
  './assets/icons/role_rato_white.png',
  './assets/icons/role_nakes_white.png',
  './assets/pdf_extracted/page_3_img_2.jpeg',
  './assets/pdf_extracted/page_1_img_2.png',
  './js/malekkas-engine.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Cache pre-fetch partial error:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
