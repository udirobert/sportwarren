import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { redisService } from '@/server/services/redis';
import { yellowService } from '@/server/services/blockchain/yellow';

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
  checks?: Record<string, 'ok' | 'missing' | 'error'>;
}

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
] as const;

const OPTIONAL_ENV_VARS = [
  'NEXT_PUBLIC_ALGORAND_NODE_URL',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'VENICE_API_KEY',
  'OPENAI_API_KEY',
  'YELLOW_APP_ID',
  'NEXT_PUBLIC_YELLOW_PLATFORM_WALLET',
  'TELEGRAM_BOT_USERNAME',
  'TON_TREASURY_WALLET_ADDRESS',
  'TONCENTER_API_KEY',
  'KITE_API_KEY',
] as const;

function isConfigured(value: string | undefined): boolean {
  if (!value) return false;
  return !value.includes('your-') && value !== 'your-walletconnect-project-id';
}

function shouldExposeDetailedChecks(request: NextRequest): boolean {
  if (process.env.HEALTH_DETAILS_ENABLED === 'true') return true;

  const headerName = process.env.HEALTH_DETAILS_HEADER_NAME?.trim() || 'x-health-details-token';
  const expectedToken = process.env.HEALTH_DETAILS_TOKEN?.trim();
  const providedToken = request.headers.get(headerName)?.trim();

  return Boolean(expectedToken && providedToken && providedToken === expectedToken);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const checks: Record<string, 'ok' | 'missing' | 'error'> = {};
  const exposeDetailedChecks = shouldExposeDetailedChecks(request);
  let overallStatus: 'ok' | 'degraded' | 'unhealthy' = 'ok';
  let httpStatus = 200;

  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
    overallStatus = 'unhealthy';
    httpStatus = 503;
  }
  const dbLatency = Date.now() - dbStart;

  let redisStatus: 'ok' | 'unavailable' | 'error' = 'unavailable';
  let redisLatency: number | undefined;
  try {
    const pingStart = Date.now();
    await redisService.get('_health_check_');
    redisLatency = Date.now() - pingStart;
    redisStatus = 'ok';
  } catch {
    redisStatus = 'unavailable';
    if (overallStatus === 'ok') overallStatus = 'degraded';
  }

  const missingRequiredConfig = REQUIRED_ENV_VARS.some((key) => !isConfigured(process.env[key]));

  if (missingRequiredConfig && overallStatus !== 'unhealthy') {
    overallStatus = 'degraded';
  }

  // Missing optional config does not degrade overall status — these are non-critical integrations

  if (exposeDetailedChecks) {
    REQUIRED_ENV_VARS.forEach((key) => {
      checks[key] = isConfigured(process.env[key]) ? 'ok' : 'missing';
    });
    OPTIONAL_ENV_VARS.forEach((key) => {
      checks[key] = process.env[key] ? 'ok' : 'missing';
    });
  }

  const aiProvider = process.env.VENICE_API_KEY
    ? 'venice'
    : process.env.OPENAI_API_KEY
      ? 'openai-fallback'
      : 'none';

  const yellowRail = yellowService.getRailStatus();

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
    ...(exposeDetailedChecks ? { checks } : {}),
  };

  // Only return non-200 if database (critical dependency) is down
  return NextResponse.json(result, { status: httpStatus });
}
