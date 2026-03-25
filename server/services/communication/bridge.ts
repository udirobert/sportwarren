import { XMTPBotService, type IncomingXmtpMessage, type XmtpPayload } from './xmtp.js';
import { WhatsAppService } from './whatsapp.js';
import { TelegramService } from './telegram.js';
import type { RedisService } from '../redis.js';

export interface CommunicationTargets {
  xmtp?: { kind: 'group'; groupId: string } | { kind: 'dm'; inboxId: string };
  whatsapp?: { chatId: string };
  telegram?: { chatId: string };
}

export interface CrossPlatformMessage {
  id: string;
  squadId: string;
  content: string;
  type: 'match_update' | 'achievement' | 'reminder' | 'general';
  sender: {
    platform: 'xmtp' | 'whatsapp' | 'telegram' | 'app';
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
  private xmtp: XMTPBotService;
  private whatsapp: WhatsAppService;
  private telegram: TelegramService | null;

  constructor(redisService: RedisService | null = null) {
    this.xmtp = new XMTPBotService();
    this.whatsapp = new WhatsAppService();
    this.telegram = process.env.TELEGRAM_BOT_TOKEN ? new TelegramService(redisService) : null;
  }

  async initialize(): Promise<void> {
    const results = await Promise.allSettled([
      this.xmtp.initialize(),
      this.whatsapp.initialize(),
    ]);

    const serviceNames = ['XMTP', 'WhatsApp'];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn(`⚠️ ${serviceNames[index]} failed to initialize (non-fatal):`, (result.reason as Error).message);
      }
    });

    this.xmtp.start(async (message: IncomingXmtpMessage) => {
      console.log('📩 Incoming XMTP message:', message.from, message.content);
    }).catch((err: Error) => {
      console.warn('⚠️ XMTP message stream not available:', err.message);
    });

    if (!this.telegram) {
      console.log('ℹ️ Telegram bot disabled (set TELEGRAM_BOT_TOKEN to enable)');
    }

    console.log('✅ Communication bridge initialized (some services may be degraded)');
  }

  async broadcastMatchUpdate(squadId: string, matchData: MatchUpdateData, targets: CommunicationTargets): Promise<void> {
    const content = `Match Update: ${matchData.homeTeam} ${matchData.homeScore} - ${matchData.awayScore} ${matchData.awayTeam}`;
    const payload: XmtpPayload = { type: 'match_update', squadId, data: matchData as unknown as Record<string, unknown>, timestamp: Date.now() };
    await this.deliverToTargets(targets, payload, this.formatMessageForWhatsApp(matchData), content);
  }

  async broadcastAchievement(squadId: string, achievement: AchievementData, targets: CommunicationTargets): Promise<void> {
    const content = `🏆 ${achievement.playerName} unlocked: ${achievement.title}!`;
    const payload: XmtpPayload = { type: 'achievement', squadId, data: achievement as unknown as Record<string, unknown>, timestamp: Date.now() };
    await this.deliverToTargets(targets, payload, { homeTeam: '', awayTeam: '', homeScore: 0, awayScore: 0, event: content, minute: 0 }, content);
  }

  async sendMatchReminder(squadId: string, matchDetails: MatchReminderData, targets: CommunicationTargets): Promise<void> {
    const content = `📅 Match Reminder: ${matchDetails.opponent} on ${matchDetails.date}`;
    const payload: XmtpPayload = { type: 'reminder', squadId, data: matchDetails as unknown as Record<string, unknown>, timestamp: Date.now() };
    await this.deliverToTargets(targets, payload, { homeTeam: '', awayTeam: '', homeScore: 0, awayScore: 0, event: content, minute: 0 }, content);
  }

  private async deliverToTargets(targets: CommunicationTargets, xmtpPayload: XmtpPayload, whatsappData: any, telegramText: string): Promise<void> {
    const promises: Promise<void>[] = [];

    if (targets.xmtp) {
      if (targets.xmtp.kind === 'group') {
        promises.push(this.xmtp.sendGroupMessage(targets.xmtp.groupId, xmtpPayload));
      } else {
        promises.push(this.xmtp.sendDirectMessage(targets.xmtp.inboxId, xmtpPayload));
      }
    }

    if (targets.whatsapp) {
      promises.push(this.whatsapp.sendMatchUpdate(targets.whatsapp.chatId, whatsappData));
    }

    if (targets.telegram && this.telegram) {
      promises.push(this.telegram.sendMatchNotification(targets.telegram.chatId, this.formatMessageForTelegram(telegramText)));
    }

    await Promise.allSettled(promises);
  }

  private formatMessageForWhatsApp(matchData: MatchUpdateData): any {
    return {
      homeTeam: matchData.homeTeam,
      awayTeam: matchData.awayTeam,
      homeScore: matchData.homeScore,
      awayScore: matchData.awayScore,
      event: matchData.event ?? '',
      minute: matchData.minute ?? 0,
    };
  }

  private formatMessageForTelegram(content: string): string {
    return `🔄 SportWarren\n\n${content}`;
  }

  getTelegramService(): TelegramService | null {
    return this.telegram;
  }
}
