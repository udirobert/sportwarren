import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// ──────────────────────────────────────────────
// Production guard: fail fast if DB isn't set
// ──────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  const msg = '[SportWarren] DATABASE_URL environment variable is not set.\n' +
    'Set it in your .env.local (development) or in your hosting provider (production).\n' +
    'Example: DATABASE_URL=postgresql://user:password@host:5432/sportwarren';

  if (process.env.NODE_ENV === 'production') {
    // Hard crash in production — don't start with a broken DB
    throw new Error(msg);
  } else {
    // Warn loudly in dev but allow app to boot so UI can still be worked on
    console.warn('\n⚠️  ' + msg + '\n');
  }
}

// ──────────────────────────────────────────────
// Singleton pattern — prevents connection pool
// exhaustion during hot-reload in development
// ──────────────────────────────────────────────
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  pool: Pool;
};

const pool = globalForPrisma.pool ?? new Pool({
  connectionString: DATABASE_URL,
  // Production-safe defaults
  max: process.env.NODE_ENV === 'production' ? 10 : 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

const adapter = new PrismaPg(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Only cache globally in non-production to avoid stale singletons across serverless invocations
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

