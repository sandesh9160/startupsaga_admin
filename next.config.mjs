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
    return [
      {
        source: '/admin/:path*',
        destination: 'https://api.startupsaga.in/admin/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'https://api.startupsaga.in/api/:path*',
      },
      {
        source: '/static/:path*',
        destination: 'https://api.startupsaga.in/static/:path*',
      },
      {
        source: '/media/:path*',
        destination: 'https://api.startupsaga.in/media/:path*',
      },
    ];
  },
};

export default nextConfig;