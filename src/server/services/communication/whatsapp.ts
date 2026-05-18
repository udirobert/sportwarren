import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { prisma } from "@/lib/db";
import type { 
  MatchAvailabilityRequest, 
  MessagingProvider, 
  MessagingButton, 
  MessagingListSection 
} from './provider-types.js';
import { dispatchWhatsAppCommand } from './whatsapp-agent';
import { redisService } from '../redis.js';

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

     await this.client.messages.sendInteractiveButtons({
       phoneNumberId: this.phoneNumberId,
       to,
       bodyText: text,
       footerText: footer || this.DEFAULT_FOOTER,
       buttons: buttons.map(b => ({
         id: b.id,
         title: b.title,
       })),
     });
   }

   async sendList(
     to: string, 
     text: string, 
     buttonText: string, 
     sections: MessagingListSection[], 
     title?: string, 
     footer?: string
   ): Promise<void> {
     if (!this.phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is required");

     await this.client.messages.sendInteractiveList({
       phoneNumberId: this.phoneNumberId,
       to,
       bodyText: text,
       buttonText,
       sections: sections.map(s => ({
         title: s.title,
         rows: s.rows.map(r => ({
           id: r.id,
           title: r.title,
           description: r.description,
         }))
       })),
       header: title ? { type: 'text', text: title } : undefined,
       footerText: footer || this.DEFAULT_FOOTER,
     });
   }

   async sendImage(to: string, url: string, caption?: string): Promise<void> {
     if (!this.phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is required");

     await this.client.messages.sendImage({
       phoneNumberId: this.phoneNumberId,
       to,
       image: { link: url, caption },
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
    const messageId: string | undefined = message.id;

    // Idempotency: Kapso/Meta retries on slow webhooks. Skip if we've already
    // accepted this message in the last 5 minutes.
    if (messageId) {
      try {
        const seenKey = `wa:msg:${messageId}`;
        const seen = await redisService.get(seenKey);
        if (seen) {
          console.log(`[WHATSAPP WEBHOOK] dedup skip ${messageId}`);
          return;
        }
        await redisService.set(seenKey, '1', 300);
      } catch {/* redis optional; fall through */}
    }

    console.log(`[WHATSAPP WEBHOOK] Received ${type} from ${from} (${messageId ?? 'noid'})`);

    if (type === 'interactive') {
      const interactive = message.interactive;
      // Button click
      if (interactive?.type === 'button_reply') {
        const id = interactive.button_reply.id;
        if (typeof id === 'string' && id.startsWith('avail_')) {
          const parts = id.split('_');
          const status = parts[1] === 'yes' ? 'available' : 'unavailable';
          const matchId = parts[2];
          // Fire-and-forget so the webhook responds fast.
          void this.handleRsvp(from, matchId, status).catch((err) => {
            console.error('[WHATSAPP] RSVP handler failed', err);
          });
        }
      }
      // list_reply intentionally unhandled for now
      return;
    }

    if (type === 'text') {
      const text: string = message.text?.body ?? '';
      // Fire-and-forget so we return 200 immediately and Kapso doesn't retry.
      void (async () => {
        try {
          const reply = await dispatchWhatsAppCommand(text, from);
          if (reply) await this.sendText(from, reply);
        } catch (err) {
          console.error('[WHATSAPP] agent dispatch failed', err);
          try {
            await this.sendText(from, '⚠️ Agent error — try `help`.');
          } catch {/* swallow secondary send error */}
        }
      })();
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
