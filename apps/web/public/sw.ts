/// <reference lib="webworker" />

// ============================================
// VERSIX NORMA - SERVICE WORKER v1.0.1
// Cache-first para assets, Network-first para API
// ============================================

declare const self: ServiceWorkerGlobalScope;

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
self.addEventListener('install', (event: ExtendableEvent) => {
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
self.addEventListener('activate', (event: ExtendableEvent) => {
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
self.addEventListener('fetch', (event: FetchEvent) => {
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

  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    case 'networkOnly':
      event.respondWith(networkOnly(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// ============================================
// ESTRATÉGIAS DE CACHE
// ============================================

// Cache First - Busca no cache, fallback para network
async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return getOfflinePage();
  }
}

// Network First - Busca na network, fallback para cache
async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return getOfflinePage();
  }
}

// Stale While Revalidate - Retorna cache imediato, atualiza em background
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || (await fetchPromise) || getOfflinePage();
}

// Network Only - Sempre busca na network
async function networkOnly(request: Request): Promise<Response> {
  try {
    return await fetch(request);
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Network unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ============================================
// HELPERS
// ============================================

function getCacheStrategy(url: string): string {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) {
        return strategy;
      }
    }
  }
  return 'networkFirst';
}

async function getOfflinePage(): Promise<Response> {
  const cached = await caches.match('/offline');
  if (cached) {
    return cached;
  }

  return new Response(
    `<!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Norma</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
          color: white;
          text-align: center;
          padding: 20px;
        }
        .container { max-width: 400px; }
        .icon { font-size: 64px; margin-bottom: 24px; }
        h1 { font-size: 24px; margin-bottom: 12px; }
        p { opacity: 0.8; margin-bottom: 24px; line-height: 1.5; }
        button {
          background: #e94560;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }
        button:active { transform: scale(0.95); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📡</div>
        <h1>Você está offline</h1>
        <p>Verifique sua conexão com a internet e tente novamente. Algumas funcionalidades podem estar indisponíveis.</p>
        <button onclick="location.reload()">Tentar novamente</button>
      </div>
    </body>
    </html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push notification received');

  let data = {
    title: 'Norma',
    body: 'Você tem uma nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'norma-notification',
    data: { url: '/home' },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title,
      {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        tag: data.tag,
        data: data.data,
        vibrate: [200, 100, 200],
        actions: [
          { action: 'open', title: 'Abrir' },
          { action: 'close', title: 'Fechar' },
        ],
      } as NotificationOptions
    )
  );
});

// ============================================
// NOTIFICATION CLICK
// ============================================
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/home';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Se já tem uma janela aberta, foca nela
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Se não, abre uma nova janela
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// ============================================
// BACKGROUND SYNC
// ============================================
self.addEventListener('sync', (event: SyncEvent) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-chamados') {
    event.waitUntil(syncChamados());
  }

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncChamados(): Promise<void> {
  // Busca chamados pendentes do IndexedDB e envia para o servidor
  console.log('[SW] Syncing chamados...');
  // Implementação depende do IndexedDB setup
}

async function syncMessages(): Promise<void> {
  // Busca mensagens pendentes do IndexedDB e envia para o servidor
  console.log('[SW] Syncing messages...');
  // Implementação depende do IndexedDB setup
}

// ============================================
// PERIODIC BACKGROUND SYNC (se disponível)
// ============================================
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent(): Promise<void> {
  console.log('[SW] Periodic sync: updating content');
  // Atualiza cache de conteúdo importante
  const cache = await caches.open(DYNAMIC_CACHE);
  try {
    const response = await fetch('/api/updates');
    if (response.ok) {
      await cache.put('/api/updates', response);
    }
  } catch (e) {
    console.warn('[SW] Failed to update content');
  }
}

// ============================================
// MESSAGE HANDLER
// ============================================
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[SW] Message received:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(keys.map((key) => caches.delete(key)));
      })
    );
  }

  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});

export { };

