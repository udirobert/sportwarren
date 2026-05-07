import { TelegramService } from './telegram.js';
import type { MatchAvailabilityRequest, MessagingProvider } from './provider-types.js';

export class TelegramProvider implements MessagingProvider {
  readonly platform = 'telegram' as const;

  constructor(private readonly telegram: TelegramService) {}

  async sendText(target: string, text: string): Promise<void> {
    await this.telegram.sendMatchNotification(target, text);
  }

  async sendAvailabilityRequest(target: string, request: MatchAvailabilityRequest): Promise<void> {
    const message = [
      'SportWarren availability check',
      '',
      request.matchDetails,
      '',
      `Reply in chat or use /available for match ${request.matchId}.`,
    ].join('\n');

    await this.sendText(target, message);
  }
}
