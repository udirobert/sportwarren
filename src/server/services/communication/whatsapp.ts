import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { prisma } from "@/lib/db";
import type { 
  MatchAvailabilityRequest, 
  MessagingProvider, 
  MessagingButton, 
  MessagingListSection 
} from './provider-types.js';

export interface WhatsAppConfig {
  apiKey?: string;
  phoneNumberId?: string;
  baseUrl?: string;
}

export class WhatsAppService implements MessagingProvider {
  readonly platform = 'whatsapp' as const;
  private client: WhatsAppClient;
  private phoneNumberId: string;
  private readonly DEFAULT_FOOTER = "Marcus, Academy Director";

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
   * Sends an interactive button message.
   * Top-tier feature for quick actions (Verify/Dispute).
   */
  async sendButtons(to: string, text: string, buttons: MessagingButton[], footer?: string): Promise<void> {
    if (!this.phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is required");

    await this.client.messages.sendButtons({
      phoneNumberId: this.phoneNumberId,
      to,
      body: text,
      footer: footer || this.DEFAULT_FOOTER,
      buttons: buttons.map(b => ({
        id: b.id,
        title: b.title,
      })),
    });
  }

  /**
   * Sends an interactive list message.
   * Top-tier feature for squad/match selection.
   */
  async sendList(
    to: string, 
    text: string, 
    buttonText: string, 
    sections: MessagingListSection[], 
    title?: string, 
    footer?: string
  ): Promise<void> {
    if (!this.phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is required");

    await this.client.messages.sendList({
      phoneNumberId: this.phoneNumberId,
      to,
      button: buttonText,
      body: text,
      title: title || "SportWarren Tactical",
      footer: footer || this.DEFAULT_FOOTER,
      sections: sections.map(s => ({
        title: s.title,
        rows: s.rows.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description,
        })),
      })),
    });
  }

  /**
   * Sends an image with an optional caption.
   */
  async sendImage(to: string, url: string, caption?: string): Promise<void> {
    if (!this.phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is required");

    await this.client.messages.sendImage({
      phoneNumberId: this.phoneNumberId,
      to,
      url,
      caption,
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
   * Drastically improved webhook handler for Kapso.
   * Parses incoming messages, button clicks, and list selections.
   */
  async handleWebhook(body: any): Promise<void> {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const message = change?.messages?.[0];

    if (!message) return;

    const from = message.from;
    const type = message.type;

    console.log(`[WHATSAPP WEBHOOK] Received ${type} from ${from}`);

    if (type === 'interactive') {
      const interactive = message.interactive;
      
      // Button click
      if (interactive.type === 'button_reply') {
        const id = interactive.button_reply.id;
        if (id.startsWith('avail_')) {
          const parts = id.split('_');
          const status = parts[1] === 'yes' ? 'available' : 'unavailable';
          const matchId = parts[2];
          await this.handleRsvp(from, matchId, status);
        }
      }
      
      // List selection
      if (interactive.type === 'list_reply') {
        const id = interactive.list_reply.id;
        // Handle list logic...
      }
    }

    if (type === 'text') {
      const text = message.text.body.toLowerCase();
      // Basic command parsing
      if (text === 'stats') {
        // Send stats summary...
      }
    }
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
    
    // Auto-respond with confirmation
    await this.sendText(whatsappNumber, `Tactical confirm: Your availability for match ${matchId.slice(0, 4)} is logged as ${status.toUpperCase()}. - Marcus`);
  }

  getClient(): WhatsAppClient {
    return this.client;
  }
}
