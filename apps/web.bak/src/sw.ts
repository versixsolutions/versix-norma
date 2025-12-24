// ============================================================
// VERSIX NORMA - SERVICE WORKER
// PWA Offline-First com Workbox
// ============================================================

import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

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

// Precache de assets do build (injetado pelo Vite)
precacheAndRoute(self.__WB_MANIFEST);

// ============================================
// INSTALL: Cache de recursos críticos
// ============================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE).then((cache) => {
      return cache.addAll([
        OFFLINE_PAGE,
        '/icons/icon-192x192.png',
        '/icons/sos-96x96.png',
        // Dados críticos serão adicionados via sync
      ]);
    })
  );
  // Ativar imediatamente
  self.skipWaiting();
});

// ============================================
// ACTIVATE: Limpar caches antigos
// ============================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.includes(CACHE_VERSION))
          .map((name) => caches.delete(name))
      );
    })
  );
  // Assumir controle de todas as páginas
  self.clients.claim();
});

// ============================================
// ESTRATÉGIA 1: Cache-First para Assets Estáticos
// ============================================
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: ASSETS_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
      }),
    ],
  })
);

// ============================================
// ESTRATÉGIA 2: Cache-First para Imagens
// ============================================
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: IMAGES_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
      }),
    ],
  })
);

// ============================================
// ESTRATÉGIA 3: Network-First para API
// ============================================
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') || url.hostname.includes('supabase'),
  new NetworkFirst({
    cacheName: API_CACHE,
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60, // 5 minutos
      }),
    ],
  })
);

// ============================================
// ESTRATÉGIA 4: Stale-While-Revalidate para Dados Dinâmicos
// ============================================
registerRoute(
  ({ url }) => url.pathname.includes('/comunicados') || url.pathname.includes('/notificacoes'),
  new StaleWhileRevalidate({
    cacheName: 'dynamic-content',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hora
      }),
    ],
  })
);

// ============================================
// ESTRATÉGIA 5: Cache-First para Dados Críticos (Modo Pânico)
// ============================================
registerRoute(
  ({ url }) => url.pathname.includes('/emergency') || url.pathname.includes('/critical-data'),
  new CacheFirst({
    cacheName: OFFLINE_CACHE,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxAgeSeconds: 24 * 60 * 60, // 24 horas
      }),
    ],
  })
);

// ============================================
// NAVIGATION FALLBACK
// ============================================
registerRoute(
  new NavigationRoute(
    async ({ event }) => {
      try {
        // Tentar buscar da rede
        const response = await fetch(event.request);
        return response;
      } catch {
        // Fallback para página offline
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
    {
      // Excluir rotas de API e assets
      denylist: [/^\/api\//, /\.[a-z]+$/i],
    }
  )
);

// ============================================
// BACKGROUND SYNC para Ações Offline
// ============================================
const bgSyncPlugin = new BackgroundSyncPlugin('offlineActionsQueue', {
  maxRetentionTime: 24 * 60, // 24 horas em minutos
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
        console.log('Ação sincronizada:', entry.request.url);
      } catch (error) {
        console.error('Erro ao sincronizar:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

// Registrar sync para ações offline (POST/PUT/DELETE)
registerRoute(
  ({ url, request }) =>
    (url.pathname.includes('/ocorrencias') ||
      url.pathname.includes('/chamados') ||
      url.pathname.includes('/reservas')) &&
    ['POST', 'PUT', 'DELETE'].includes(request.method),
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

registerRoute(
  ({ url, request }) =>
    (url.pathname.includes('/ocorrencias') ||
      url.pathname.includes('/chamados') ||
      url.pathname.includes('/reservas')) &&
    ['POST', 'PUT', 'DELETE'].includes(request.method),
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'PUT'
);

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Nova notificação', body: event.data.text() };
  }

  const options: NotificationOptions = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: data.type === 'emergency' ? [200, 100, 200, 100, 200] : [100, 50, 100],
    data: {
      url: data.url || '/',
      notificationId: data.id,
      type: data.type,
    },
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.type === 'emergency' || data.priority === 'high',
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'dismiss', title: 'Fechar' },
    ],
    timestamp: Date.now(),
  };

  // Customização para emergências
  if (data.type === 'emergency') {
    options.actions = [{ action: 'sos', title: '🆘 Ver Emergência' }];
    options.requireInteraction = true;
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Versix Norma', options));
});

// ============================================
// NOTIFICATION CLICK
// ============================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  const action = event.action;

  // Tratar ação específica
  let targetUrl = urlToOpen;
  if (action === 'sos') {
    targetUrl = '/emergencia';
  } else if (action === 'dismiss') {
    return; // Apenas fecha
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Procurar janela existente
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Abrir nova janela
      return self.clients.openWindow(targetUrl);
    })
  );
});

// ============================================
// SYNC: Sincronização de Dados Críticos
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-critical-data') {
    event.waitUntil(syncCriticalData());
  }

  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncCriticalData() {
  try {
    // Buscar dados críticos para modo pânico
    const response = await fetch('/api/critical-data');
    if (!response.ok) throw new Error('Falha ao buscar dados críticos');

    const data = await response.json();

    // Salvar no cache
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.put(
      new Request('/api/critical-data'),
      new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      })
    );

    console.log('Dados críticos sincronizados');
  } catch (error) {
    console.error('Erro ao sincronizar dados críticos:', error);
  }
}

async function syncOfflineActions() {
  // Background Sync Plugin cuida disso automaticamente
  console.log('Sincronizando ações offline...');
}

// ============================================
// PERIODIC SYNC: Atualização Periódica
// ============================================
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-critical-data') {
    event.waitUntil(syncCriticalData());
  }
});

// ============================================
// MESSAGE: Comunicação com a Página
// ============================================
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
    );
  }
});

// ============================================
// EXPORT PARA WORKBOX
// ============================================
export {};
