import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ['sharp', '@resvg/resvg-js'],
  // `sharp` is externalized above (native require, not webpack-bundled), so the
  // `.next/standalone` output-file trace must physically copy its package dir.
  // Next's tracer (@vercel/nft) misses this for sharp specifically — a
  // documented gap (see the Next.js `output` config docs' own "Common include
  // patterns for native/runtime assets" example) — which is what broke the CI
  // "Smoke Test (artifact build + server boot)" job with `sharp — MODULE NOT
  // FOUND` even though its platform binaries were present. `/*` is scoped by
  // the narrow value, not the route key: it forces every route's trace to
  // include just the sharp package directory, not the whole repo.
  //
  // VERCEL-ONLY GUARD: this is needed for the Hetzner standalone artifact
  // (built via scripts/build-runtime-artifact.sh in CI) but NOT for Vercel,
  // which already bundles sharp into its serverless functions correctly on
  // its own (sharp has worked in Vercel production via the avatar-upload path
  // — image.ts -> identity.ts -> the player/squad routers — since before this
  // config existed). Vercel's own packaging step chokes on the extra trace:
  // it flattened node_modules/sharp's pnpm symlink into the include glob and
  // failed with "produces files in symlinked directories" on every build from
  // the point this was added. `process.env.VERCEL` is Vercel's documented,
  // stable system env var, always set (to '1') during its builds.
  ...(process.env.VERCEL
    ? {}
    : {
        outputFileTracingIncludes: {
          '/*': ['node_modules/sharp/**/*'],
        },
      }),
  typescript: {
    // Type-checking runs in GitHub Actions CI (ci.yml) with 8GB heap — not during
    // the Vercel build, which is limited to 8GB total RAM and OOMs on tsc.
    // This is standard practice for large Next.js projects. Webpack compilation
    // still catches syntax/import errors; full type safety is enforced by CI.
    ignoreBuildErrors: true,
  },
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
  hideSourceMaps: true,
};

const finalConfig = process.env.DISABLE_SENTRY_BUILD === 'true' 
  ? nextConfig 
  : withSentryConfig(nextConfig, sentryWebpackPluginOptions);

export default finalConfig;
