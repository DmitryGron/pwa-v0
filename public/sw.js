// This is a basic service worker with support for both development and production modes.
// It can be registered manually in development or via next-pwa in production.

const STATIC_CACHE_NAME = 'newsstand-static-v1';
const DYNAMIC_CACHE_NAME = 'newsstand-dynamic-v1';
const IMAGE_CACHE_NAME = 'newsstand-image-v1';

// Pre-cache the essential parts of the app shell
const APP_SHELL = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png'
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

  // Strategy: Cache First for icons and images
  if (url.pathname.includes('/icons/') || /\.(?:png|gif|jpg|jpeg|svg|webp)$/i.test(url.pathname)) {
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
          // If we get a good response, cache it (only for GET/HEAD requests)
          if (request.method === 'GET' || request.method === 'HEAD') {
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          // On network failure, try to serve from cache
          const cachedResponse = await caches.match(request);
          // For navigation, if it's not in cache, show the offline fallback page
          if (request.mode === 'navigate' && !cachedResponse) {
            return caches.match('/offline');
          }
          return cachedResponse;
        })
    );
    return;
  }

  // Check if this is a request we should handle
  // Only cache HTTP(S) requests, not chrome-extension:// or other schemes
  const requestUrl = new URL(request.url);
  const isHttps = requestUrl.protocol === 'https:' || requestUrl.protocol === 'http:';
  const isCacheable = request.method === 'GET' || request.method === 'HEAD';
  
  if (!isHttps || !isCacheable) {
    // Pass through non-HTTP(S) requests or non-GET/HEAD requests without caching
    return fetch(request);
  }

  // Strategy: Stale-While-Revalidate for other assets (CSS, JS)
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      // If we already have a cached version, use it
      if (cachedResponse) {
        // Try to update the cache in the background, but don't block on it
        fetch(request)
          .then(networkResponse => {
            if (networkResponse.ok && (request.method === 'GET' || request.method === 'HEAD')) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
              });
            }
          })
          .catch(error => {
            console.log('[SW] Background fetch failed:', error);
          });
        
        // Return the cached response immediately
        return cachedResponse;
      }
      
      // If no cached version, try the network but gracefully handle failure
      return fetch(request)
        .then(networkResponse => {
          if (networkResponse.ok && (request.method === 'GET' || request.method === 'HEAD')) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then(cache => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(error => {
          console.log('[SW] Fetch failed:', error);
          // Return a graceful offline response for different content types
          if (request.headers.get('accept').includes('image')) {
            return new Response('<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><rect width="100%" height="100%" fill="#f5f5f5"/><path d="M200 150C177 150 160 167 160 190s17 40 40 40c22 0 40-17 40-40s-17-40-40-40zm20 55h-10v-10h10v10zm0-15h-10c0-25 25-10 25-30 0-10-10-15-20-15s-20 5-20 15h-10c0-20 15-25 30-25s30 10 30 25c0 30-25 15-25 30z" fill="#bdbdbd"/></svg>', {
              headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' }
            });
          }
          // For other resource types, return an appropriate offline response
          return new Response('Resource not available offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
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
