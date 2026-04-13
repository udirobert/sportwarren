import { Redis } from 'ioredis';

export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) {
          // Stop retrying after 3 attempts
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    // Suppress unhandled error events to prevent log spam
    this.client.on('error', () => {
      // Errors are handled in individual method try/catch blocks
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.ping();
      console.log('✅ Connected to Redis');
    } catch (error) {
      console.warn('⚠️ Redis connection failed, continuing without cache:', (error as Error).message);
    }
  }

  // Cache methods
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.warn('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.warn('Redis SET error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.warn('Redis DEL error:', error);
    }
  }

  // Real-time leaderboards
  async updateLeaderboard(type: string, userId: string, score: number): Promise<void> {
    try {
      await this.client.zadd(`leaderboard:${type}`, score, userId);
    } catch (error) {
      console.warn('Redis leaderboard update error:', error);
    }
  }

  async getLeaderboard(type: string, limit: number = 10): Promise<Array<{ userId: string; score: number }>> {
    try {
      const results = await this.client.zrevrange(`leaderboard:${type}`, 0, limit - 1, 'WITHSCORES');
      const leaderboard = [];

      for (let i = 0; i < results.length; i += 2) {
        leaderboard.push({
          userId: results[i],
          score: parseFloat(results[i + 1]),
        });
      }

      return leaderboard;
    } catch (error) {
      console.warn('Redis leaderboard get error:', error);
      return [];
    }
  }

  // Session management
  async setSession(sessionId: string, userData: any, ttl: number = 86400): Promise<void> {
    try {
      await this.client.setex(`session:${sessionId}`, ttl, JSON.stringify(userData));
    } catch (error) {
      console.warn('Redis session set error:', error);
    }
  }

  // Rate limiting & counters
  async incr(key: string, ttl?: number): Promise<number | null> {
    try {
      const result = await this.client.incr(key);
      if (ttl && result === 1) {
        await this.client.expire(key, ttl);
      }
      return result;
    } catch (error) {
      console.warn('Redis INCR error:', error);
      return null;
    }
  }

  async getSession(sessionId: string): Promise<any | null> {
    try {
      const data = await this.client.get(`session:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis session get error:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.client.del(`session:${sessionId}`);
    } catch (error) {
      console.warn('Redis session delete error:', error);
    }
  }

  // Match live updates
  async setMatchLiveData(matchId: string, data: any): Promise<void> {
    try {
      await this.client.setex(`match:live:${matchId}`, 7200, JSON.stringify(data)); // 2 hours TTL
    } catch (error) {
      console.warn('Redis match live data error:', error);
    }
  }

  async getMatchLiveData(matchId: string): Promise<any | null> {
    try {
      const data = await this.client.get(`match:live:${matchId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Redis match live data get error:', error);
      return null;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    console.log('✅ Disconnected from Redis');
  }
}

export const redisService = new RedisService();