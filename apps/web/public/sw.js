// ============================================
// VERSIX NORMA - SERVICE WORKER v1.0.1
// Cache-first para assets, Network-first para API
// ============================================

const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE = `norma-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `norma-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `norma-images-${CACHE_VERSION}`;
const API_CACHE = `norma-api-${CACHE_VERSION}`;

// Assets que devem ser cacheados na instalação
const STATIC_ASSETS = [
    '/',
    '/home',
    '/login',
    '/signup',
    '/onboarding',
    '/welcome',
    '/offline',
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Padrões de URL para diferentes estratégias de cache
const CACHE_STRATEGIES = {
    // Cache First - Assets estáticos
    cacheFirst: [
        /\/_next\/static\/.*/,
        /\/icons\/.*/,
        /\/fonts\/.*/,
        /\.(?:js|css|woff2?)$/,
    ],
    // Network First - API calls
    networkFirst: [
        /\/api\/.*/,
        /supabase\.co/,
    ],
    // Stale While Revalidate - Imagens
    staleWhileRevalidate: [
        /\.(?:png|jpg|jpeg|gif|svg|webp|avif)$/,
        /images\.unsplash\.com/,
    ],
    // Network Only - Autenticação
    networkOnly: [
        /\/auth\/.*/,
        /supabase\.co\/auth/,
    ],
};

// ============================================
// INSTALAÇÃO
// ============================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[SW] Some static assets failed to cache:', err);
            });
        })
    );
    // Ativa imediatamente sem esperar
    self.skipWaiting();
});

// ============================================
// ATIVAÇÃO
// ============================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
    event.waitUntil(
        Promise.all([
            // Limpa caches antigos
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
            // Assume controle de todas as páginas
            self.clients.claim(),
        ])
    );
});

// ============================================
// FETCH - Intercepta requisições
// ============================================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora requisições não-GET
    if (request.method !== 'GET') {
        return;
    }

    // Ignora extensões do Chrome e outros
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return;
    }

    // Determina a estratégia de cache
    const strategy = getCacheStrategy(url.href);

    if (strategy === 'network-only') {
        // Network Only - passa direto
        return;
    }

    event.respondWith(
        handleRequest(request, strategy)
    );
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getCacheStrategy(urlString) {
    for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
        for (const pattern of patterns) {
            if (pattern.test(urlString)) {
                return strategy;
            }
        }
    }
    // Default: Cache First para navegação
    try {
        const url = new URL(urlString);
        return url.pathname === '/' || !url.pathname.includes('.') ? 'network-first' : 'cache-first';
    } catch (error) {
        // Fallback se URL for inválida
        return 'cache-first';
    }
}

async function handleRequest(request, strategy) {
    const url = new URL(request.url);

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
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
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
        console.log('[SW] Network failed, trying cache:', error);
        const cache = await caches.open(DYNAMIC_CACHE);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback para página offline
        if (request.destination === 'document') {
            const offlineCache = await caches.open(STATIC_CACHE);
            return offlineCache.match('/offline') || new Response('Offline', { status: 503 });
        }

        return new Response('Offline', { status: 503 });
    }
}

async function handleStaleWhileRevalidate(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch((error) => {
        console.warn('[SW] Stale-while-revalidate fetch failed:', error);
    });

    if (cachedResponse) {
        // Retorna cache e atualiza em background
        fetchPromise;
        return cachedResponse;
    }

    // Se não tem cache, espera pela rede
    return fetchPromise || new Response('Offline', { status: 503 });
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();

    const options = {
        body: data.body,
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

    // Notificação de emergência
    if (data.type === 'emergency') {
        options.vibrate = [200, 100, 200, 100, 200];
        options.requireInteraction = true;
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Se já tem uma janela aberta, foca nela
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        client.focus();
                        client.navigate(urlToOpen);
                        return;
                    }
                }
                // Se não, abre nova janela
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

// ============================================
// PERIODIC SYNC
// ============================================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-critical-data') {
        event.waitUntil(syncCriticalData());
    }
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCaches());
    }
});

// ============================================
// FUNÇÕES PLACEHOLDER
// ============================================
async function syncCriticalData() {
    console.log('[SW] Syncing critical data...');
    // Implementação será feita no lado do cliente
}

async function syncOfflineActions() {
    console.log('[SW] Syncing offline actions...');
    // Implementação será feita no lado do cliente
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
