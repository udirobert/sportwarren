import { describe, expect, it, vi } from 'vitest';
import type { MessagingProvider } from '../server/services/communication/provider-types';

vi.mock('../server/services/communication/telegram', () => ({
  TelegramService: class TelegramService {},
}));

  vi.mock('../server/services/communication/telegram-provider', () => ({
    TelegramProvider: class TelegramProvider {
      platform = 'telegram' as const;
      async sendText(): Promise<void> {}
      async sendAvailabilityRequest(): Promise<void> {}
    },
  }));

  vi.mock('../server/services/communication/whatsapp', () => ({
    WhatsAppService: class WhatsAppService {
      platform = 'whatsapp' as const;
      isConfigured(): boolean { return true; }
      async sendText(): Promise<void> {}
      async sendAvailabilityRequest(): Promise<void> {}
    },
  }));

  vi.mock('../server/services/communication/spectrum-pilot', () => ({
    SpectrumPilotProvider: class SpectrumPilotProvider {
      platform = 'spectrum' as const;
      isConfigured(): boolean { return true; }
      async sendText(): Promise<void> {}
      async sendAvailabilityRequest(): Promise<void> {}
    },
  }));

import { CommunicationBridge } from '../server/services/communication/bridge';

function createProvider(): MessagingProvider {
  return {
    platform: 'whatsapp',
    sendText: vi.fn().mockResolvedValue(undefined),
    sendAvailabilityRequest: vi.fn().mockResolvedValue(undefined),
  };
}

describe('CommunicationBridge', () => {
  it('routes reminders through configured providers with channel formatting', async () => {
    const telegramProvider = {
      platform: 'telegram' as const,
      telegram: null,
      sendText: vi.fn().mockResolvedValue(undefined),
      sendAvailabilityRequest: vi.fn().mockResolvedValue(undefined),
    } as any;
    const whatsappProvider = createProvider();
    const spectrumProvider = {
      ...createProvider(),
      platform: 'spectrum' as const,
    };

    const bridge = new CommunicationBridge(null, {
      telegramProvider,
      whatsappProvider,
      spectrumProvider,
    });

    await bridge.sendMatchReminder(
      'squad-1',
      { opponent: 'Red Lions', date: 'Saturday 3pm' },
      {
        telegram: { chatId: '123' },
        whatsapp: { phoneNumber: '+254700000001' },
        spectrum: { address: 'pilot-room' },
      },
    );

    expect(telegramProvider.sendText).toHaveBeenCalledWith(
      '123',
      '📅 Match Reminder: Red Lions on Saturday 3pm',
    );
    expect(whatsappProvider.sendText).toHaveBeenCalledWith(
      '+254700000001',
      '📅 Match Reminder: Red Lions on Saturday 3pm',
    );
    expect(spectrumProvider.sendText).toHaveBeenCalledWith(
      'pilot-room',
      '📅 Match Reminder: Red Lions on Saturday 3pm',
    );
  });

  it('dispatches availability requests only to providers that support them', async () => {
    const whatsappProvider = createProvider();
    const telegramProvider = {
      platform: 'telegram' as const,
      telegram: null,
      sendText: vi.fn().mockResolvedValue(undefined),
      sendAvailabilityRequest: vi.fn().mockResolvedValue(undefined),
    } as any;
    const bridge = new CommunicationBridge(null, {
      telegramProvider,
      whatsappProvider,
    });

    await bridge.sendAvailabilityRequest(
      {
        telegram: { chatId: '123' },
        whatsapp: { phoneNumber: '+254700000001' },
      },
      {
        matchId: 'match-9',
        matchDetails: 'Saturday 3pm vs Red Lions at Warren Park',
      },
    );

    expect(whatsappProvider.sendAvailabilityRequest).toHaveBeenCalledWith(
      '+254700000001',
      {
        matchId: 'match-9',
        matchDetails: 'Saturday 3pm vs Red Lions at Warren Park',
      },
    );
  });
});
