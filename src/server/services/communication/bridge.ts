import { TelegramService } from './telegram.js';
import type { RedisService } from '../redis.js';

export interface CommunicationTargets {
  telegram?: { chatId: string };
}

export interface CrossPlatformMessage {
  id: string;
  squadId: string;
  content: string;
  type: 'match_update' | 'achievement' | 'reminder' | 'general';
  sender: {
    platform: 'telegram' | 'app';
    address: string;
    name?: string;
  };
  timestamp: number;
}

export interface MatchUpdateData {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  event?: string;
  minute?: number;
}

export interface AchievementData {
  playerName: string;
  title: string;
}

export interface MatchReminderData {
  opponent: string;
  date: string;
  time?: string;
  venue?: string;
}

export class CommunicationBridge {
  private telegram: TelegramService | null;

  constructor(redisService: RedisService | null = null) {
    this.telegram = process.env.TELEGRAM_BOT_TOKEN ? new TelegramService(redisService) : null;
  }

  async initialize(): Promise<void> {
    if (this.telegram) {
      // Telegram initialization is handled within the service
      console.log('✅ Telegram service initialized');
    } else {
      console.log('ℹ️ Telegram bot disabled (set TELEGRAM_BOT_TOKEN to enable)');
    }

    console.log('✅ Communication bridge initialized (Telegram only)');
  }

  async broadcastMatchUpdate(squadId: string, matchData: MatchUpdateData, targets: CommunicationTargets): Promise<void> {
    const content = `Match Update: ${matchData.homeTeam} ${matchData.homeScore} - ${matchData.awayScore} ${matchData.awayTeam}`;
    await this.deliverToTargets(targets, content);
  }

  async broadcastAchievement(squadId: string, achievement: AchievementData, targets: CommunicationTargets): Promise<void> {
    const content = `🏆 ${achievement.playerName} unlocked: ${achievement.title}!`;
    await this.deliverToTargets(targets, content);
  }

  async sendMatchReminder(squadId: string, matchDetails: MatchReminderData, targets: CommunicationTargets): Promise<void> {
    const content = `📅 Match Reminder: ${matchDetails.opponent} on ${matchDetails.date}`;
    await this.deliverToTargets(targets, content);
  }

  private async deliverToTargets(targets: CommunicationTargets, telegramText: string): Promise<void> {
    const promises: Promise<void>[] = [];

    if (targets.telegram && this.telegram) {
      promises.push(this.telegram.sendMatchNotification(targets.telegram.chatId, this.formatMessageForTelegram(telegramText)));
    }

    await Promise.allSettled(promises);
  }

  private formatMessageForTelegram(content: string): string {
    return `🔄 SportWarren\n\n${content}`;
  }

  getTelegramService(): TelegramService | null {
    return this.telegram;
  }
}
