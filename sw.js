// Service Worker for SATENGKA PASUNG PWA
const CACHE_NAME = 'satengka-pasung-pwa-v24';
const ASSETS_TO_CACHE = [
  './',
  './login.html',
  './register.html',
  './manifest.json',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
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
  './js/satengka-engine.js',
  './src/services/satengka-service.js',
  './src/services/mock-engine.js',
  './src/constants/roles.js',
  './src/utils/formatters.js',
  './src/services/storage.js',
  './src/services/ews-service.js',
  './src/features/ews/geo-kokop.js',
  './src/features/ews/triage-engine.js',
  './src/components/ui/toast.js',
  './src/components/ui/tanjung-bumi-toast.js',
  './src/components/ui/modal-controller.js',
  './src/features/roles/mitra-view.js',
  './src/features/roles/kader-view.js',
  './src/features/nakes/nakes-view.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(() => {}))
      );
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
            return caches.match('./login.html');
          }
        });
      })
  );
});
