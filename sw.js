const CACHE_NAME = 'bankcard-v2';

// فقط فایل‌هایی که واقعاً وجود دارن
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/sw.js'
];

// ===== INSTALL =====
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching files...');
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('[SW] Some files failed to cache:', err);
        });
      })
      .then(() => {
        console.log('[SW] Install complete');
        return self.skipWaiting();
      })
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Removing old cache:', key);
              return caches.delete(key);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// ===== FETCH =====
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // فقط درخواست‌های GET رو هندل کن
  if (event.request.method !== 'GET') {
    return;
  }

  // درخواست‌های API رو نادیده بگیر
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') ||
      url.hostname.includes('gstatic') ||
      url.hostname.includes('firebasedatabase')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // اگه توی کش بود، برگردون
        if (cachedResponse) {
          return cachedResponse;
        }

        // اگه نبود، از نتورک بگیر
        return fetch(event.request)
          .then(networkResponse => {
            // فقط پاسخ‌های موفق رو کش کن
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // پاسخ رو کلون کن
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                try {
                  cache.put(event.request, responseToCache);
                } catch (err) {
                  // بعضی چیزها قابل کش نیستن
                }
              });

            return networkResponse;
          })
          .catch(() => {
            // اگه نتورک در دسترس نبود، صفحه آفلاین رو نشون بده
            return caches.match('/index.html');
          });
      })
  );
});
