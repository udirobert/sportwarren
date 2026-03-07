import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
  const optional = ['OPENAI_API_KEY', 'KITE_API_KEY'];

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

  return NextResponse.json({
    status: httpStatus === 200 ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    checks,
  }, { status: httpStatus });
}

