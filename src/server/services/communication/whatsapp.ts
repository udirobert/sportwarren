import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { prisma } from "@/lib/db";
import type { MatchAvailabilityRequest, MessagingProvider } from './provider-types.js';

export interface WhatsAppConfig {
  apiKey?: string;
  phoneNumberId?: string;
  baseUrl?: string;
}

export class WhatsAppService implements MessagingProvider {
  readonly platform = 'whatsapp' as const;
  private client: WhatsAppClient;
  private phoneNumberId: string;

  constructor(config?: WhatsAppConfig) {
    const apiKey = config?.apiKey || process.env.KAPSO_API_KEY;
    this.phoneNumberId = config?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    const baseUrl = config?.baseUrl || 'https://app.kapso.ai/api/meta/';

    if (!apiKey) {
      console.warn("⚠️ KAPSO_API_KEY is not set. WhatsApp service will be limited.");
    }

    this.client = new WhatsAppClient({
      baseUrl,
      kapsoApiKey: apiKey || 'dummy-key',
    });
  }

  isConfigured(): boolean {
    return Boolean(this.phoneNumberId);
  }

  async sendText(to: string, text: string): Promise<void> {
    if (!this.phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is required");
    
    await this.client.messages.sendText({
      phoneNumberId: this.phoneNumberId,
      to,
      body: text,
    });
  }

  /**
   * Sends a match availability template to a player.
   * Requires a pre-approved template 'match_availability' on Meta/Kapso.
   */
  async sendAvailabilityRequest(to: string, request: MatchAvailabilityRequest): Promise<void> {
    await this.sendAvailabilityTemplate(to, request.matchDetails, request.matchId);
  }

  async sendAvailabilityTemplate(to: string, matchDetails: string, matchId: string): Promise<void> {
    if (!this.phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is required");

    await this.client.messages.sendTemplate({
      phoneNumberId: this.phoneNumberId,
      to,
      template: {
        name: 'match_availability',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: matchDetails }
            ]
          },
          {
            type: 'button',
            subType: 'quick_reply',
            index: 0,
            parameters: [{ type: 'payload', payload: `avail_yes_${matchId}` }]
          },
          {
            type: 'button',
            subType: 'quick_reply',
            index: 1,
            parameters: [{ type: 'payload', payload: `avail_no_${matchId}` }]
          }
        ]
      }
    });
  }

  /**
   * Updates match RSVP based on WhatsApp response.
   */
  async handleRsvp(whatsappNumber: string, matchId: string, status: 'available' | 'unavailable' | 'maybe'): Promise<void> {
    const identity = await prisma.platformIdentity.findUnique({
      where: {
        platform_platformUserId: {
          platform: 'whatsapp',
          platformUserId: whatsappNumber,
        },
      },
      include: { user: true },
    });

    if (!identity) {
      console.warn(`[WHATSAPP] No identity found for number ${whatsappNumber}`);
      return;
    }

    await prisma.matchRsvp.upsert({
      where: {
        userId_matchId: {
          matchId,
          userId: identity.userId,
        },
      },
      create: {
        matchId,
        userId: identity.userId,
        status,
      },
      update: {
        status,
      },
    });

    console.log(`[WHATSAPP] Updated RSVP for user ${identity.userId} on match ${matchId} to ${status}`);
  }

  getClient(): WhatsAppClient {
    return this.client;
  }
}
