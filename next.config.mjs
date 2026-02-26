/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
                port: '8000',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/admin/:path*',
                destination: 'http://127.0.0.1:8000/admin/:path*',
            },
            {
                source: '/api/:path*',
                destination: 'http://127.0.0.1:8000/api/:path*',
            },
            {
                source: '/static/:path*',
                destination: 'http://127.0.0.1:8000/static/:path*',
            },
            {
                source: '/media/:path*',
                destination: 'http://127.0.0.1:8000/media/:path*',
            },
        ];
    },
};

export default nextConfig;
