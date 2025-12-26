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
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

// export default withPWA(nextConfig);
export default nextConfig;
