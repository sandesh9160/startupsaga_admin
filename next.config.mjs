// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //     images: {
// //         remotePatterns: [
// //             {
// //                 protocol: 'https',
// //                 hostname: 'images.unsplash.com',
// //                 port: '',
// //                 pathname: '/**',
// //             },
// //         ],
// //     },
// //     async rewrites() {
// //         return [
// //             {
// //                 source: '/admin/:path*',
// //                 destination: 'http://127.0.0.1:8000/admin/:path*',
// //             },
// //             {
// //                 source: '/api/:path*',
// //                 destination: 'http://127.0.0.1:8000/api/:path*',
// //             },
// //             {
// //                 source: '/static/:path*',
// //                 destination: 'http://127.0.0.1:8000/static/:path*',
// //             },
// //             {
// //                 source: '/media/:path*',
// //                 destination: 'http://127.0.0.1:8000/media/:path*',
// //             },
// //         ];
// //     },
// // };

// // export default nextConfig;

/** Backend origin for rewrites (no trailing slash). Override via BACKEND_ORIGIN or derive from the public API URL env vars. */
function getBackendOrigin() {
  const explicit = process.env.BACKEND_ORIGIN || process.env.NEXT_PUBLIC_BACKEND_ORIGIN;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (apiUrl) {
    const trimmed = apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
    if (trimmed) return trimmed;
  }
  return "https://api.startupsaga.in";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.startupsaga.in',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'startupsaga.in',
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    const origin = getBackendOrigin();
    return [
      {
        source: '/admin/:path*',
        destination: `${origin}/admin/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${origin}/api/:path*`,
      },
      {
        source: '/static/:path*',
        destination: `${origin}/static/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${origin}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
