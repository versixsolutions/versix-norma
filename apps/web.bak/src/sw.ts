/// <reference lib="webworker" />

import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

// ============================================
// CONSTANTES
// ============================================
const CACHE_VERSION = 'v1.0.0';
const OFFLINE_CACHE = `offline-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const ASSETS_CACHE = `assets-${CACHE_VERSION}`;
const IMAGES_CACHE = `images-${CACHE_VERSION}`;

const OFFLINE_PAGE = '/offline.html';

// ============================================
// LIMPEZA E PRECACHE
// ============================================
cleanupOutdatedCaches();

// Precache de assets do build (injetado pelo bundler)
precacheAndRoute((self as any).__WB_MANIFEST || []);

// ============================================
// INSTALL: Cache de recursos críticos
// ============================================
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(OFFLINE_CACHE);
      await cache.addAll([OFFLINE_PAGE, '/icons/icon-192x192.png', '/icons/sos-96x96.png']);
    })()
  );
  self.skipWaiting();
});

// ============================================
// ACTIVATE: Limpar caches antigos
// ============================================
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((k) => (k !== OFFLINE_CACHE ? caches.delete(k) : Promise.resolve(true)))
      );
    })()
  );
  self.clients.claim();
});

// ============================================
// ESTRATÉGIAS DE CACHE (simplificadas)
// ============================================
registerRoute(
  ({ request }) => ['style', 'script', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: ASSETS_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: IMAGES_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') || url.hostname.includes('supabase'),
  new NetworkFirst({
    cacheName: API_CACHE,
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 5 * 60 }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.includes('/comunicados') || url.pathname.includes('/notificacoes'),
  new StaleWhileRevalidate({
    cacheName: 'dynamic-content',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 }),
    ],
  })
);

// Navigation fallback
registerRoute(
  new NavigationRoute(
    async ({ event }) => {
      try {
        const response = await fetch(event.request);
        return response;
      } catch {
        const cache = await caches.open(OFFLINE_CACHE);
        const offlinePage = await cache.match(OFFLINE_PAGE);
        return (
          offlinePage ||
          new Response('Você está offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/html' },
          })
        );
      }
    },
    { denylist: [/^\/api\//, /\.[a-z]+$/i] }
  )
);

// Background sync plugin (simplificado)
const bgSyncPlugin = new BackgroundSyncPlugin('offlineActionsQueue', {
  maxRetentionTime: 24 * 60,
});

registerRoute(
  ({ url, request }) =>
    (url.pathname.includes('/ocorrencias') ||
      url.pathname.includes('/chamados') ||
      url.pathname.includes('/reservas')) &&
    ['POST', 'PUT', 'DELETE'].includes(request.method),
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  'POST'
);

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;
  let data: any;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Nova notificação', body: event.data.text() };
  }

  const options: NotificationOptions = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: data.url || '/', notificationId: data.id, type: data.type },
    tag: data.tag || 'default',
    renotify: true,
  };

  if (data.type === 'emergency') {
    options.actions = [{ action: 'sos', title: '🆘 Ver Emergência' }];
    options.requireInteraction = true;
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Versix Norma', options));
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  const action = event.action;
  let targetUrl = urlToOpen;
  if (action === 'sos') targetUrl = '/emergencia';
  if (action === 'dismiss') return;

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const client = clientList.find(
        (c) => c.url.includes(self.location.origin) && 'focus' in c
      ) as WindowClient | undefined;
      if (client) return client.focus().then(() => client.navigate(targetUrl));
      return self.clients.openWindow(targetUrl);
    })()
  );
});

self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-critical-data') event.waitUntil(syncCriticalData());
  if (event.tag === 'sync-offline-actions') event.waitUntil(syncOfflineActions());
});

async function syncCriticalData() {
  try {
    const response = await fetch('/api/critical-data');
    if (!response.ok) throw new Error('Falha ao buscar dados críticos');
    const data = await response.json();
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.put(
      new Request('/api/critical-data'),
      new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    );
    console.log('Dados críticos sincronizados');
  } catch (error) {
    console.error('Erro ao sincronizar dados críticos:', error);
  }
}

async function syncOfflineActions() {
  console.log('Sincronizando ações offline...');
}

self.addEventListener('periodicsync', (event: Event) => {
  // PeriodicSyncEvent typing may vary; treat generically
  const e = event as any;
  if (e.tag === 'update-critical-data') event.waitUntil(syncCriticalData());
});

self.addEventListener('message', (event: MessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') event.ports?.[0]?.postMessage({ version: CACHE_VERSION });
  if (event.data?.type === 'CLEAR_CACHE')
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
    );
});

export {};
