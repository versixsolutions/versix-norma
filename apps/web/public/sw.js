// ============================================
// VERSIX NORMA - SERVICE WORKER v1.0.1
// Cache-first para assets, Network-first para API
// ============================================

const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE = `norma-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `norma-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `norma-images-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/home',
  '/login',
  '/offline',
  '/manifest.json',
];

const CACHE_STRATEGIES = {
  cacheFirst: [
    /\/_next\/static\/.*/,
    /\/icons\/.*/,
    /\/fonts\/.*/,
    /\.(?:js|css|woff2?)$/,
  ],
  networkFirst: [
    /\/api\/.*/,
    /supabase\.co/,
  ],
  staleWhileRevalidate: [
    /\.(?:png|jpg|jpeg|gif|svg|webp|avif)$/,
    /images\.unsplash\.com/,
  ],
  networkOnly: [
    /\/auth\/.*/,
    /supabase\.co\/auth/,
  ],
};

// INSTALL
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v' + CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(console.warn);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v' + CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key.startsWith('norma-') && 
            ![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(key))
            .map((key) => caches.delete(key))
        );
      }),
      self.clients.claim(),
    ])
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

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
      event.respondWith(fetch(request).catch(() => offlineResponse()));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

// STRATEGIES
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineResponse();
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineResponse();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || (await fetchPromise) || offlineResponse();
}

function getCacheStrategy(url) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    for (const pattern of patterns) {
      if (pattern.test(url)) return strategy;
    }
  }
  return 'networkFirst';
}

function offlineResponse() {
  return new Response(`
<!DOCTYPE html>
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
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>Você está offline</h1>
    <p>Verifique sua conexão com a internet e tente novamente.</p>
    <button onclick="location.reload()">Tentar novamente</button>
  </div>
</body>
</html>`, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
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
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
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
    })
  );
});

// NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/home';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
});

// MESSAGE HANDLER
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
  }
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0]?.postMessage({ version: CACHE_VERSION });
  }
});
