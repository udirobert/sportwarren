import { withSentryConfig } from "@sentry/nextjs";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/server': path.resolve(__dirname, 'src/server'),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/algorand/squad-dao-info',
        destination: 'http://localhost:4000/api/algorand/squad-dao-info',
      },
      {
        source: '/api/algorand/proposals',
        destination: 'http://localhost:4000/api/algorand/proposals',
      },
      {
        source: '/api/algorand/create-proposal',
        destination: 'http://localhost:4000/api/algorand/create-proposal',
      },
      {
        source: '/api/algorand/vote-proposal',
        destination: 'http://localhost:4000/api/algorand/vote-proposal',
      },
      {
        source: '/api/algorand/execute-proposal',
        destination: 'http://localhost:4000/api/algorand/execute-proposal',
      },
      {
        source: '/api/algorand/network-status',
        destination: 'http://localhost:4000/api/algorand/network-status',
      },
      {
        source: '/api/algorand/user-token-balance',
        destination: 'http://localhost:4000/api/algorand/user-token-balance',
      },
    ];
  },
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
