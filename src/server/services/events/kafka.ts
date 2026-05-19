import { Kafka, Producer, Consumer, EachMessagePayload } from 'kafkajs';
import { prisma } from '@/lib/db';

export interface SportEvent {
  id: string;
  type: 'match_event' | 'achievement' | 'stat_update' | 'communication';
  squadId: string;
  matchId?: string;
  playerId?: string;
  data: any;
  timestamp: number;
  source: 'app' | 'telegram' | 'voice' | 'vision';
}

// In-memory socket broadcast (injected from server/index.ts)
let broadcastFn: ((event: SportEvent) => void) | null = null;

export function setSocketBroadcast(fn: (event: SportEvent) => void): void {
  broadcastFn = fn;
}

export class EventStreamService {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();

  constructor() {
    this.kafka = new Kafka({
      clientId: 'sportwarren-app',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      logLevel: 1,
      retry: {
        initialRetryTime: 100,
        retries: 3,
      },
    });

    this.producer = this.kafka.producer({
      maxInFlightRequests: 1,
      idempotent: true,
      transactionTimeout: 30000,
    });
  }

  async initialize(): Promise<void> {
    await this.producer.connect();
    console.log('✅ Kafka producer connected');

    await this.createConsumer('match-events', this.handleMatchEvent.bind(this));
    await this.createConsumer('achievements', this.handleAchievementEvent.bind(this));
    await this.createConsumer('statistics', this.handleStatisticEvent.bind(this));
    await this.createConsumer('communications', this.handleCommunicationEvent.bind(this));
  }

  private async createConsumer(topic: string, handler: (payload: EachMessagePayload) => Promise<void>): Promise<void> {
    const consumer = this.kafka.consumer({ 
      groupId: `sportwarren-${topic}-group`,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({ eachMessage: handler });

    this.consumers.set(topic, consumer);
    console.log(`✅ Kafka consumer created for topic: ${topic}`);
  }

  async publishEvent(event: SportEvent): Promise<void> {
    try {
      const topic = this.getTopicForEvent(event);
      
      await this.producer.send({
        topic,
        messages: [{
          key: event.id,
          value: JSON.stringify(event),
          timestamp: event.timestamp.toString(),
          headers: {
            source: event.source,
            type: event.type,
            squadId: event.squadId,
          },
        }],
      });

      console.log(`📤 Event published to ${topic}:`, event.id);
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  private getTopicForEvent(event: SportEvent): string {
    switch (event.type) {
      case 'match_event': return 'match-events';
      case 'achievement': return 'achievements';
      case 'stat_update': return 'statistics';
      case 'communication': return 'communications';
      default: return 'general-events';
    }
  }

  // ─── Handlers ─────────────────────────────────────────────────

  private async handleMatchEvent(payload: EachMessagePayload): Promise<void> {
    try {
      const event: SportEvent = JSON.parse(payload.message.value?.toString() || '{}');
      
      await prisma.activityEvent.create({
        data: {
          type: event.type,
          squadId: event.squadId,
          matchId: event.matchId,
          playerId: event.playerId,
          source: event.source,
          data: event.data as any,
        },
      });

      broadcastFn?.(event);
      console.log(`📊 Match event processed: ${event.id}`);
    } catch (error) {
      console.error('Error handling match event:', error);
    }
  }

  private async handleAchievementEvent(payload: EachMessagePayload): Promise<void> {
    try {
      const event: SportEvent = JSON.parse(payload.message.value?.toString() || '{}');
      
      const [activity] = await Promise.all([
        prisma.activityEvent.create({
          data: {
            type: event.type,
            squadId: event.squadId,
            playerId: event.playerId,
            source: event.source,
            data: event.data as any,
          },
        }),
      ]);

      if (event.playerId) {
        await prisma.notification.create({
          data: {
            userId: event.playerId,
            type: 'achievement',
            title: event.data?.title || 'Achievement Unlocked',
            message: event.data?.description || '',
            data: event.data as any,
          },
        });
      }

      broadcastFn?.(event);
      console.log(`🏆 Achievement event processed: ${event.id}`);
    } catch (error) {
      console.error('Error handling achievement event:', error);
    }
  }

  private async handleStatisticEvent(payload: EachMessagePayload): Promise<void> {
    try {
      const event: SportEvent = JSON.parse(payload.message.value?.toString() || '{}');
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentMatchCount = await prisma.activityEvent.count({
        where: {
          squadId: event.squadId,
          type: 'stat_update',
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      if (recentMatchCount % 10 === 0 && event.playerId) {
        await prisma.notification.create({
          data: {
            userId: event.playerId,
            type: 'milestone',
            title: 'Season Milestone Reached',
            message: `Your squad has processed ${recentMatchCount + 1} stat updates this month.`,
            data: { count: recentMatchCount + 1 },
          },
        });
      }

      await prisma.activityEvent.create({
        data: {
          type: event.type,
          squadId: event.squadId,
          matchId: event.matchId,
          playerId: event.playerId,
          source: event.source,
          data: event.data as any,
        },
      });

      broadcastFn?.(event);
      console.log(`📈 Statistic event processed: ${event.id}`);
    } catch (error) {
      console.error('Error handling statistic event:', error);
    }
  }

  private async handleCommunicationEvent(payload: EachMessagePayload): Promise<void> {
    try {
      const event: SportEvent = JSON.parse(payload.message.value?.toString() || '{}');

      if (event.playerId && event.data?.message) {
        await prisma.notification.create({
          data: {
            userId: event.playerId,
            type: 'communication',
            title: event.data?.title || 'New Message',
            message: event.data.message,
            data: event.data as any,
          },
        });
      }

      await prisma.activityEvent.create({
        data: {
          type: event.type,
          squadId: event.squadId,
          playerId: event.playerId,
          source: event.source,
          data: event.data as any,
        },
      });

      broadcastFn?.(event);
      console.log(`💬 Communication event processed: ${event.id}`);
    } catch (error) {
      console.error('Error handling communication event:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      
      for (const [, consumer] of this.consumers) {
        await consumer.disconnect();
      }
      
      console.log('✅ Kafka disconnected');
    } catch (error) {
      console.error('Error disconnecting Kafka:', error);
    }
  }
}