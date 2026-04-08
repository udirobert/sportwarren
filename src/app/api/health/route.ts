import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { yellowService } from '@/server/services/blockchain/yellow';
import { getKiteServiceStatus } from '@/server/services/ai/kite';

export async function GET() {
  const checks: Record<string, 'ok' | 'missing' | 'error'> = {};
  let httpStatus = 200;

  // ── DB connectivity ───────────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
    httpStatus = 503;
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

  return NextResponse.json({
    status: httpStatus === 200 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    ai: {
      provider: aiProvider,
      note: aiProvider === 'none'
        ? 'Set VENICE_API_KEY (preferred) or OPENAI_API_KEY to enable AI staff chat'
        : undefined,
    },
    paymentRail,
    rails: {
      yellow: yellowRail,
      kite: kiteStatus,
    },
    checks,
  }, { status: httpStatus });
}
