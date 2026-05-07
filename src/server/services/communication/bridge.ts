import { TelegramService } from './telegram.js';
import { TelegramProvider } from './telegram-provider.js';
import { WhatsAppService } from './whatsapp.js';
import { SpectrumPilotProvider } from './spectrum-pilot.js';
import type { MatchAvailabilityRequest, MessagingProvider } from './provider-types.js';
import type { RedisService } from '../redis.js';

export interface CommunicationTargets {
  telegram?: { chatId: string };
  whatsapp?: { phoneNumber: string };
  spectrum?: { address: string };
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
  private telegramService: TelegramService | null;
  private telegramProvider: TelegramProvider | null;
  private whatsappProvider: MessagingProvider | null;
  private spectrumProvider: MessagingProvider | null;

  constructor(
    redisService: RedisService | null = null,
    providers?: {
      telegramProvider?: TelegramProvider;
      whatsappProvider?: MessagingProvider;
      spectrumProvider?: MessagingProvider;
    }
  ) {
    this.telegramService = process.env.TELEGRAM_BOT_TOKEN ? new TelegramService(redisService) : null;
    this.telegramProvider = providers?.telegramProvider || (this.telegramService ? new TelegramProvider(this.telegramService) : null);
    this.whatsappProvider = providers?.whatsappProvider || null;
    this.spectrumProvider = providers?.spectrumProvider || null;
  }

  async initialize(): Promise<void> {
    if (this.telegramService) {
      console.log('✅ Telegram service initialized');
    } else {
      console.log('ℹ️ Telegram bot disabled (set TELEGRAM_BOT_TOKEN to enable)');
    }

    const whatsappConfigured = this.whatsappProvider && 'isConfigured' in this.whatsappProvider && typeof (this.whatsappProvider as any).isConfigured === 'function' ? (this.whatsappProvider as any).isConfigured() : false;
    const spectrumConfigured = this.spectrumProvider && 'isConfigured' in this.spectrumProvider && typeof (this.spectrumProvider as any).isConfigured === 'function' ? (this.spectrumProvider as any).isConfigured() : false;

    console.log('✅ Communication bridge initialized');
    console.log(`   - Telegram: ${this.telegramProvider ? 'enabled' : 'disabled'}`);
    console.log(`   - WhatsApp: ${this.whatsappProvider ? 'enabled' + (whatsappConfigured ? ' (configured)' : ' (unconfigured)') : 'disabled'}`);
    console.log(`   - Spectrum: ${this.spectrumProvider ? 'enabled' + (spectrumConfigured ? ' (configured)' : ' (unconfigured)') : 'disabled'}`);
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

  async sendAvailabilityRequest(targets: CommunicationTargets, matchDetails: MatchAvailabilityRequest): Promise<void> {
    const promises: Promise<void>[] = [];

    if (targets.telegram && this.telegramProvider) {
      promises.push(
        this.telegramProvider.sendAvailabilityRequest(targets.telegram.chatId, matchDetails).catch((e) => {
          console.error('[Bridge] Telegram availability request failed:', e);
        })
      );
    }

    if (targets.whatsapp && this.whatsappProvider?.sendAvailabilityRequest) {
      promises.push(
        this.whatsappProvider.sendAvailabilityRequest(targets.whatsapp.phoneNumber, matchDetails).catch((e) => {
          console.error('[Bridge] WhatsApp availability request failed:', e);
        })
      );
    }

    if (targets.spectrum && this.spectrumProvider?.sendAvailabilityRequest) {
      promises.push(
        this.spectrumProvider.sendAvailabilityRequest(targets.spectrum.address, matchDetails).catch((e) => {
          console.error('[Bridge] Spectrum availability request failed:', e);
        })
      );
    }

    await Promise.allSettled(promises);
  }

  private async deliverToTargets(targets: CommunicationTargets, plainText: string): Promise<void> {
    const promises: Promise<void>[] = [];

    if (targets.telegram && this.telegramProvider) {
      promises.push(
        this.telegramProvider.sendText(targets.telegram.chatId, plainText).catch((e) => {
          console.error('[Bridge] Telegram delivery failed:', e);
        })
      );
    }

    if (targets.whatsapp && this.whatsappProvider?.sendText) {
      promises.push(
        this.whatsappProvider.sendText(targets.whatsapp.phoneNumber, plainText).catch((e) => {
          console.error('[Bridge] WhatsApp delivery failed:', e);
        })
      );
    }

    if (targets.spectrum && this.spectrumProvider?.sendText) {
      promises.push(
        this.spectrumProvider.sendText(targets.spectrum.address, plainText).catch((e) => {
          console.error('[Bridge] Spectrum delivery failed:', e);
        })
      );
    }

    await Promise.allSettled(promises);
  }

  getTelegramService(): TelegramService | null {
    return this.telegramService;
  }
}
