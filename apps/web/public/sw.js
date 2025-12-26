// ============================================
// VERSIX NORMA - SERVICE WORKER v1.0.2
// Cache-first para assets, Network-first para API
// ============================================

const CACHE_VERSION = 'v1.0.2';
const STATIC_CACHE = `norma-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `norma-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `norma-images-${CACHE_VERSION}`;
const API_CACHE = `norma-api-${CACHE_VERSION}`;

// Assets que devem ser cacheados na instalação
const STATIC_ASSETS = [
    '/',
    '/home',
    '/login',
    '/offline',
    '/manifest.json',
];

// Padrões de URL para diferentes estratégias de cache
const CACHE_STRATEGIES = {
    // Cache First - Assets estáticos
    'cache-first': [
        /\/_next\/static\/.*/,
        /\/icons\/.*/,
        /\/fonts\/.*/,
        /\.(?:js|css|woff2?)$/,
    ],
    // Network First - API calls
    'network-first': [
        /\/api\/.*/,
        /supabase\.co/,
    ],
    // Stale While Revalidate - Imagens
    'stale-while-revalidate': [
        /\.(?:png|jpg|jpeg|gif|svg|webp|avif)$/,
        /images\.unsplash\.com/,
    ],
    // Network Only - Autenticação
    'network-only': [
        /\/auth\/.*/,
        /supabase\.co\/auth/,
    ],
};

// ============================================
// INSTALAÇÃO
// ============================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker ' + CACHE_VERSION);
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[SW] Some static assets failed to cache:', err);
            });
        })
    );
    self.skipWaiting();
});

// ============================================
// ATIVAÇÃO
// ============================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker ' + CACHE_VERSION);
    event.waitUntil(
        Promise.all([
            caches.keys().then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => {
                            return key.startsWith('norma-') &&
                                key !== STATIC_CACHE &&
                                key !== DYNAMIC_CACHE &&
                                key !== IMAGE_CACHE &&
                                key !== API_CACHE;
                        })
                        .map((key) => {
                            console.log('[SW] Removing old cache:', key);
                            return caches.delete(key);
                        })
                );
            }),
            self.clients.claim(),
        ])
    );
});

// ============================================
// FETCH - Intercepta requisições
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Ignora requisições não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Tenta parsear a URL
    let url;
    try {
        url = new URL(request.url);
    } catch (e) {
        return;
    }

    // Ignora extensões do browser
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return;
    }

    // Ignora URLs inválidas
    if (!url.href || url.href === 'about:blank') {
        return;
    }

    // Determina a estratégia de cache
    const strategy = getCacheStrategy(url.href);

    if (strategy === 'network-only') {
        return;
    }

    event.respondWith(handleRequest(request, strategy));
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getCacheStrategy(urlString) {
    // Validação de entrada
    if (!urlString || typeof urlString !== 'string') {
        return 'network-first';
    }

    // Itera sobre as estratégias
    for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
        // Verifica se patterns é um array válido
        if (!Array.isArray(patterns)) {
            continue;
        }

        for (const pattern of patterns) {
            // Verifica se pattern é uma RegExp válida
            if (pattern && typeof pattern.test === 'function') {
                try {
                    if (pattern.test(urlString)) {
                        return strategy;
                    }
                } catch (e) {
                    console.warn('[SW] Pattern test failed:', e);
                }
            }
        }
    }

    // Default: network-first para navegação, cache-first para assets
    try {
        const url = new URL(urlString);
        const isNavigation = url.pathname === '/' || (url.pathname && !url.pathname.includes('.'));
        return isNavigation ? 'network-first' : 'cache-first';
    } catch (e) {
        return 'network-first';
    }
}

async function handleRequest(request, strategy) {
    switch (strategy) {
        case 'cache-first':
            return handleCacheFirst(request);
        case 'network-first':
            return handleNetworkFirst(request);
        case 'stale-while-revalidate':
            return handleStaleWhileRevalidate(request);
        default:
            return fetch(request);
    }
}

async function handleCacheFirst(request) {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.warn('[SW] Cache-first failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

async function handleNetworkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache');
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        if (request.destination === 'document') {
            const offlineCache = await caches.open(STATIC_CACHE);
            const offlinePage = await offlineCache.match('/offline');
            if (offlinePage) return offlinePage;
        }

        return new Response('Offline', { status: 503 });
    }
}

async function handleStaleWhileRevalidate(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((networkResponse) => {
            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        })
        .catch((error) => {
            console.warn('[SW] SWR fetch failed:', error);
            return null;
        });

    if (cachedResponse) {
        fetchPromise; // Update in background
        return cachedResponse;
    }

    const networkResponse = await fetchPromise;
    return networkResponse || new Response('Offline', { status: 503 });
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch (e) {
        data = { title: 'Norma', body: event.data.text() };
    }

    const options = {
        body: data.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            notificationId: data.id
        },
        tag: data.tag || 'default',
        renotify: true,
        requireInteraction: data.priority === 'high'
    };

    if (data.type === 'emergency') {
        options.vibrate = [200, 100, 200, 100, 200];
        options.requireInteraction = true;
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'Norma', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        client.navigate(urlToOpen);
                        return;
                    }
                }
                return clients.openWindow(urlToOpen);
            })
    );
});

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-critical-data') {
        event.waitUntil(syncCriticalData());
    }
    if (event.tag === 'sync-offline-actions') {
        event.waitUntil(syncOfflineActions());
    }
});

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-critical-data') {
        event.waitUntil(syncCriticalData());
    }
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCaches());
    }
});

async function syncCriticalData() {
    console.log('[SW] Syncing critical data...');
}

async function syncOfflineActions() {
    console.log('[SW] Syncing offline actions...');
}

async function cleanupOldCaches() {
    console.log('[SW] Cleaning up old caches...');
    const keys = await caches.keys();
    await Promise.all(
        keys
            .filter(key => key.startsWith('norma-') && !key.includes(CACHE_VERSION))
            .map(key => caches.delete(key))
    );
}
