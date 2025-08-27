
const CACHE_NAME = 'subscription-tracker-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.svg',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/hooks/useSubscriptions.ts',
  '/components/icons.tsx',
  '/components/Modal.tsx',
  '/components/SubscriptionForm.tsx',
  '/components/SubscriptionCard.tsx',
  '/components/SubscriptionList.tsx',
  '/components/HistoryCard.tsx',
  '/components/HelpModal.tsx'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});