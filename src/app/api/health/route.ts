import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redisService } from '@/server/services/redis';
import { yellowService } from '@/server/services/blockchain/yellow';
import { getKiteServiceStatus } from '@/server/services/ai/kite';

interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: { status: 'ok' | 'error'; latencyMs?: number };
    redis: { status: 'ok' | 'unavailable' | 'error'; latencyMs?: number };
    ai: { provider: string; available: boolean };
    paymentRail: { enabled: boolean; provider: string };
  };
  environment: {
    nodeEnv: string;
    region?: string;
  };
  checks: Record<string, 'ok' | 'missing' | 'error'>;
}

export async function GET(): Promise<NextResponse> {
  const startTime = Date.now();
  const checks: Record<string, 'ok' | 'missing' | 'error'> = {};
  let overallStatus: 'ok' | 'degraded' | 'unhealthy' = 'ok';
  let httpStatus = 200;

  // ── Database connectivity ────────────────────────────────
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
    httpStatus = 503;
    overallStatus = 'unhealthy';
  }
  const dbLatency = Date.now() - dbStart;

  // ── Redis connectivity ────────────────────────────────────
  let redisStatus: 'ok' | 'unavailable' | 'error' = 'unavailable';
  let redisLatency: number | undefined;
  try {
    const pingStart = Date.now();
    await redisService.get('_health_check_');
    redisLatency = Date.now() - pingStart;
    redisStatus = 'ok';
  } catch {
    // Redis is optional but should be monitored
    redisStatus = 'unavailable';
    if (overallStatus === 'ok') overallStatus = 'degraded';
  }

  // ── Required env vars ─────────────────────────────────────
  const required = [
    'DATABASE_URL',
    'NEXT_PUBLIC_ALGORAND_NODE_URL',
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  ];
  const optional = [
    'VENICE_API_KEY',      // AI staff chat (Marcus / StaffRoom) — app works without it but AI responses will be fallback strings
    'OPENAI_API_KEY',      // AI fallback if Venice is unavailable
    'YELLOW_APP_ID',       // Match fee payment rail
    'NEXT_PUBLIC_YELLOW_PLATFORM_WALLET', // Match fee payment rail
    'TELEGRAM_BOT_USERNAME', // Telegram deep links + Mini App launch
    'TON_TREASURY_WALLET_ADDRESS', // TON treasury top-ups
    'TONCENTER_API_KEY', // TON on-chain verification for Mini App top-ups
    'KITE_API_KEY',
  ];

  required.forEach(key => {
    const val = process.env[key];
    if (!val || val.includes('your-') || val === 'your-walletconnect-project-id') {
      checks[key] = 'missing';
      httpStatus = 503;
    } else {
      checks[key] = 'ok';
    }
  });
  optional.forEach(key => {
    checks[key] = process.env[key] ? 'ok' : 'missing';
  });

  // ── AI provider summary ───────────────────────────────────
  const aiProvider = process.env.VENICE_API_KEY
    ? 'venice'
    : process.env.OPENAI_API_KEY
    ? 'openai-fallback'
    : 'none';

  // ── Payment rail summary ──────────────────────────────────
  const yellowRail = yellowService.getRailStatus();
  const kiteStatus = getKiteServiceStatus();
  const paymentRail = yellowRail.enabled ? 'yellow-configured' : 'yellow-missing';

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    uptime: Math.floor(process.uptime()),
    services: {
      database: { status: checks.database as 'ok' | 'error', latencyMs: dbLatency },
      redis: { status: redisStatus, latencyMs: redisLatency },
      ai: { provider: aiProvider, available: aiProvider !== 'none' },
      paymentRail: { enabled: yellowRail.enabled, provider: 'yellow' },
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      region: process.env.VERCEL_REGION || undefined,
    },
    checks,
  };

  return NextResponse.json(result, { status: httpStatus });
}
