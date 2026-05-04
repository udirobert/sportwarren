import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// ──────────────────────────────────────────────
// Lazy database connection — doesn't throw at build time
// ──────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL;

function getPool(): Pool {
  if (!DATABASE_URL) {
    const msg = '[SportWarren] DATABASE_URL environment variable is not set.\n' +
      'Set it in your .env.local (development) or in your hosting provider (production).\n' +
      'Example: DATABASE_URL=postgresql://user:password@host:5432/sportwarren';

    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    } else {
      console.warn('\n⚠️  ' + msg + '\n');
    }
  }

  const globalForPrisma = global as unknown as { pool: Pool };
  
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString: DATABASE_URL,
      max: process.env.NODE_ENV === 'production' ? 10 : 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  
  return globalForPrisma.pool;
}

function getPrisma(): PrismaClient {
  const globalForPrisma = global as unknown as { prisma: PrismaClient };
  
  if (!globalForPrisma.prisma) {
    const pool = getPool();
    const adapter = new PrismaPg(pool);
    
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  
  return globalForPrisma.prisma;
}

// Lazy singleton — only connects when first accessed
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

