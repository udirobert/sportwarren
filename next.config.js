import { withSentryConfig } from "@sentry/nextjs";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    // Enable optimization for production - images served via /_next/image
    // CDN domains can be added for external image sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.telegram.org',
      },
      {
        protocol: 'https',
        hostname: '**.twitter.com',
      },
      {
        protocol: 'https',
        hostname: '**.lens.xyz',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Optimize for performance
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60, // 1 hour cache
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/server': path.resolve(__dirname, 'src/server'),
    };
    
    if (!dev && !isServer) {
        config.optimization.minimize = true;
    }

    return config;
  },
  async rewrites() {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/algorand/squad-dao-info',
        destination: `${serverUrl}/api/algorand/squad-dao-info`,
      },
      {
        source: '/api/algorand/proposals',
        destination: `${serverUrl}/api/algorand/proposals`,
      },
      {
        source: '/api/algorand/create-proposal',
        destination: `${serverUrl}/api/algorand/create-proposal`,
      },
      {
        source: '/api/algorand/vote-proposal',
        destination: `${serverUrl}/api/algorand/vote-proposal`,
      },
      {
        source: '/api/algorand/execute-proposal',
        destination: `${serverUrl}/api/algorand/execute-proposal`,
      },
      {
        source: '/api/algorand/network-status',
        destination: `${serverUrl}/api/algorand/network-status`,
      },
      {
        source: '/api/algorand/user-token-balance',
        destination: `${serverUrl}/api/algorand/user-token-balance`,
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  disableLogger: true,
  hideSourceMaps: true,
};

const finalConfig = process.env.DISABLE_SENTRY_BUILD === 'true' 
  ? nextConfig 
  : withSentryConfig(nextConfig, sentryWebpackPluginOptions);

export default finalConfig;
