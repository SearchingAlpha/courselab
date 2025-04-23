/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['localhost'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'courseforge.com',
          port: '',
          pathname: '/images/**',
        },
      ],
    },
    experimental: {
      serverActions: {
        allowedOrigins: ['localhost:3000', 'localhost:3001'],
      },
    },
  }
  
  module.exports = nextConfig