// This is a basic service worker with support for both development and production modes.
// It can be registered manually in development or via next-pwa in production.

const STATIC_CACHE_NAME = 'newsstand-static-v1';
const DYNAMIC_CACHE_NAME = 'newsstand-dynamic-v1';
const IMAGE_CACHE_NAME = 'newsstand-image-v1';

// Pre-cache the essential parts of the app shell
const APP_SHELL = [
  '/',
  '/offline',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching App Shell');
      return cache.addAll(APP_SHELL);
    }).catch(error => {
      console.error('[SW] Failed to pre-cache app shell:', error);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  const cacheWhitelist = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, IMAGE_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (!cacheWhitelist.includes(key)) {
            console.log('[SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Generic fetch handler with multiple caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy: Cache First for images
  if (/\.(?:png|gif|jpg|jpeg|svg|webp)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(IMAGE_CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      })
    );
    return;
  }
  
  // Strategy: Network First for navigation and API calls
  if (request.mode === 'navigate' || url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If we get a good response, cache it
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // On network failure, try to serve from cache
          return caches.match(request).then(cachedResponse => {
            // For navigation, if it's not in cache, show the offline fallback page
            if (request.mode === 'navigate' && !cachedResponse) {
              return caches.match('/offline');
            }
            return cachedResponse;
          });
        })
    );
    return;
  }

  // Strategy: Stale-While-Revalidate for other assets (CSS, JS)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      const fetchPromise = fetch(request).then(networkResponse => {
        const responseToCache = networkResponse.clone();
        caches.open(STATIC_CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});

// --- Push Notification Event Listeners ---

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('[SW] Push Received.');
  let data = { title: 'New Article', body: 'Check out the latest news!', url: '/' };
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error('[SW] Push event data parse error:', e);
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Listen for notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click Received.');
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
