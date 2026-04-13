import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';
import 'dotenv/config';

async function checkProductionReady() {
  console.log('🚀 Starting SportWarren Production Readiness Check...');
  
  const requiredEnv = [
    'DATABASE_URL',
    'REDIS_URL',
    'NEXT_PUBLIC_SERVER_URL',
    'TELEGRAM_BOT_TOKEN',
    'VENICE_API_KEY',
    'OPENAI_API_KEY',
    'NEXT_PUBLIC_SENTRY_DSN',
    'AUTH0_SECRET',
    'KITE_API_KEY'
  ];

  const missing = requiredEnv.filter(env => !process.env[env]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
  } else {
    console.log('✅ All core environment variables are present.');
  }

  // Check Database
  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      console.log('✅ Database (Prisma) connection successful.');
      const matchCount = await prisma.match.count();
      console.log(`📊 Found ${matchCount} matches in database.`);
    } catch (e) {
      console.error('❌ Database connection failed:', (e as Error).message);
    } finally {
      await prisma.$disconnect();
    }
  } else {
    console.warn('⚠️ DATABASE_URL missing — skipping database connection check.');
  }

  // Check Redis
  if (process.env.REDIS_URL) {
    const redis = new Redis(process.env.REDIS_URL);
    try {
      await redis.ping();
      console.log('✅ Redis connection successful.');
    } catch (e) {
      console.error('❌ Redis connection failed:', (e as Error).message);
    } finally {
      redis.disconnect();
    }
  }

  // Check AI Services (Basic check)
  if (process.env.VENICE_API_KEY) {
    console.log('✅ Venice AI API key detected.');
  } else {
    console.warn('⚠️ Venice AI key missing — fallback to OpenAI or Kilocode might fail.');
  }

  console.log('\n🏁 Readiness check complete.');
  if (missing.length > 0) {
    process.exit(1);
  }
}

checkProductionReady().catch(console.error);
