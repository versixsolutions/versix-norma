// @ts-check
import { withSentryConfig } from '@sentry/nextjs';
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || process.env.DISABLE_PWA === 'true',
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: '/offline',
  },
  buildExcludes: [
    /app-build-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/,
    /_next\/static\/.*\.js\.map$/,
    /_next\/static\/chunks\/.*\.js\.map$/,
  ],
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\/_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
});

// @ts-check
// Temporariamente desabilitando next-pwa para evitar conflitos
// import withPWAInit from 'next-pwa';

// const withPWA = withPWAInit({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development' || process.env.DISABLE_PWA === 'true',
//   fallbacks: {
//     document: '/offline',
//   },
//   buildExcludes: [
//     /app-build-manifest\.json$/,
//     /_buildManifest\.js$/,
//     /_ssgManifest\.js$/,
//     /_next\/static\/.*\.js\.map$/,
//     /_next\/static\/chunks\/.*\.js\.map$/,
//   ],
//   runtimeCaching: [
//     {
//       urlPattern: /^https:\/\/.*\/_next\/static\/.*/,
//       handler: 'CacheFirst',
//       options: {
//         cacheName: 'next-static',
//         expiration: {
//           maxEntries: 200,
//           maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
//         },
//       },
//     },
//     {
//       urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
//       handler: 'CacheFirst',
//       options: {
//         cacheName: 'images',
//         expiration: {
//           maxEntries: 100,
//           maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
//         },
//       },
//     },
//   ],
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Otimizações de performance para Lighthouse
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Otimização de imagens
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Otimizações de bundle
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Headers de segurança e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
        ],
      },
      // Cache headers para assets estáticos
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      // Cache headers para imagens otimizadas
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800'
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Otimizar bundle size em produção
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix-ui',
          chunks: 'all',
          priority: 20,
        },
      };
    }

    return config;
  },
};

// export default withPWA(nextConfig);
export default withSentryConfig(withPWA(nextConfig), {
  silent: true,
  org: 'versix-solutions',
  project: 'versix-norma',
  // Upload sourcemaps automaticamente durante o build
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
  // Configurar webpack para sourcemaps
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.devtool = 'source-map';
    }
    return config;
  },
});
