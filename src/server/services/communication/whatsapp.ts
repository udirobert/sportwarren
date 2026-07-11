import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import { prisma } from "@/lib/db";
import { dispatchWhatsAppCommand } from './whatsapp-agent';
import { redisService } from '../redis';
import { generateRateToken } from '@/lib/auth/rate-token';
import { makeGroupVerificationStore } from './verification-store';
import {
  normalizePhone,
  phoneLinkRedisKey,
  confirmedMessage,
  type PendingPhoneLink,
} from '@/server/services/personalization/phone-link';

export interface WhatsAppConfig {
  apiKey?: string;
  phoneNumberId?: string;
  baseUrl?: string;
}

// ── Message shapes ──
// These were previously in the (now-deleted) provider-types.ts adapter layer.
// WhatsAppService is the sole consumer, so they live here as the single source.
export interface MatchAvailabilityRequest {
  matchId: string;
  matchDetails: string;
}

export interface MessagingButton {
  id: string;
  title: string;
}

export interface MessagingListSection {
  title?: string;
  rows: {
    id: string;
    title: string;
    description?: string;
  }[];
}

interface PendingWhatsAppVerification {
  matchId: string;
  homeSquadId: string;
  awaySquadId: string;
  homeSquadName: string;
  awaySquadName: string;
  homeScore: number;
  awayScore: number;
  homeGroupJid?: string;
  awayGroupJid?: string;
  confirms: string[];
  disputes: string[];
  createdAt: number;
  totalMembers: number;
}

export class WhatsAppService {
  readonly platform = 'whatsapp' as const;
  private client: WhatsAppClient;
  private phoneNumberId: string;
  private readonly DEFAULT_FOOTER = "Marcus, Academy Director";

  // ── Group verification state (Redis-backed; shared across serverless instances) ──
  private verifStore = makeGroupVerificationStore<PendingWhatsAppVerification>('whatsapp');

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
   * Also stores the matchId in Redis so text-based RSVP (in/out/maybe) works.
   */
  async sendAvailabilityRequest(to: string, request: MatchAvailabilityRequest): Promise<void> {
    // Track pending availability so text replies work
    try {
      await redisService.set(`wa:avail:${to}`, request.matchId, 7 * 24 * 60 * 60); // 7 days
    } catch {/* redis optional */}

    // Send plain text prompting for inline reply
    const msg = [
      `⚽ *Match availability check*`,
      '',
      request.matchDetails,
      '',
      `Reply with your status:`,
      `• *in* — I'm playing`,
      `• *out* — Can't make it`,
      `• *maybe* — Not sure yet`,
      '',
      `_Just type your reply below — no link needed._`,
    ].join('\n');

    await this.sendText(to, msg);
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
          void this.handleRsvp(from, matchId, status).catch((err) => {
            console.error('[WHATSAPP] RSVP handler failed', err);
          });
        } else if (typeof id === 'string' && id.startsWith('verify_confirm_')) {
          const matchId = id.replace('verify_confirm_', '');
          void this.handleVerificationCallback(from, 'confirm', matchId).catch((err) => {
            console.error('[WHATSAPP] Verification confirm handler failed', err);
          });
        } else if (typeof id === 'string' && id.startsWith('verify_dispute_')) {
          const matchId = id.replace('verify_dispute_', '');
          void this.handleVerificationCallback(from, 'dispute', matchId).catch((err) => {
            console.error('[WHATSAPP] Verification dispute handler failed', err);
          });
        } else if (typeof id === 'string' && id.startsWith('squad_confirm_')) {
          const squadId = id.replace('squad_confirm_', '');
          void this.sendText(from, `✅ Squad link confirmed for ${squadId.slice(0, 8)}. Commands:\n• \`we won 3-1\` — log a result\n• \`scout <opponent>\` — scouting report`).catch(() => {});
        } else if (typeof id === 'string' && id.startsWith('squad_unlink_')) {
          const squadId = id.replace('squad_unlink_', '');
          void prisma.squadGroup.deleteMany({ where: { squadId, platform: 'whatsapp' } })
            .then(() => this.sendText(from, '❌ Group unlinked. Use `link` to connect a different squad.'))
            .catch(() => {});
        }
      }
      // list_reply intentionally unhandled for now
      return;
    }

    if (type === 'text') {
      const text: string = message.text?.body ?? '';
      const senderNumber = message.from_user ?? from;

      // ── Voluntary phone-link confirmation ─────────────────────
      // A preview-tier player requested this from a preview page (see
      // requestPhoneLink in preview/[token]/_actions.ts) and was texted a
      // confirm word. Matching here — replying from the SAME number — is
      // the only proof-of-ownership step; nothing was written to
      // PlatformIdentity until this moment.
      if (!from.endsWith('@g.us')) {
        try {
          const normalizedSender = normalizePhone(senderNumber);
          const pendingRaw = await redisService.get(phoneLinkRedisKey(normalizedSender));
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw) as PendingPhoneLink;
            if (text.trim().toUpperCase() === pending.code) {
              await prisma.platformIdentity.upsert({
                where: {
                  platform_platformUserId: { platform: 'whatsapp', platformUserId: normalizedSender },
                },
                update: { userId: pending.userId },
                create: { userId: pending.userId, platform: 'whatsapp', platformUserId: normalizedSender },
              });
              await redisService.del(phoneLinkRedisKey(normalizedSender));
              await this.sendText(senderNumber, confirmedMessage(pending.firstName, pending.context));
              return;
            }
          }
        } catch (err) {
          console.error('[WHATSAPP] Phone-link confirm check failed:', err);
        }
      }

      // ── Text-based RSVP (in/out/maybe) ────────────────────────
      const rsvpMatch = text.trim().toLowerCase().match(/^(in|out|maybe|yes|no|nah|yep|yeah|nah|cant|can'?t)$/i);
      if (rsvpMatch && !from.endsWith('@g.us')) {
        const rsvpWord = rsvpMatch[1].toLowerCase();
        const rsvpStatus = ['in', 'yes', 'yep', 'yeah'].includes(rsvpWord)
          ? 'available'
          : ['out', 'no', 'nah', "can't", 'cant'].includes(rsvpWord)
            ? 'unavailable'
            : 'maybe';

        let matchId: string | null = null;
        try {
          matchId = await redisService.get(`wa:avail:${senderNumber}`);
        } catch {/* redis optional */}

        if (matchId) {
          void this.handleRsvp(senderNumber, matchId, rsvpStatus).then(async () => {
            try {
              await redisService.del(`wa:avail:${senderNumber}`);
            } catch {/* swallow */}
          }).catch((err) => {
            console.error('[WHATSAPP] Text RSVP handler failed', err);
          });
          return; // Don't dispatch to agent
        }
      }

      // Fire-and-forget so we return 200 immediately and Kapso doesn't retry.
      void (async () => {
        try {
          // ── Auto-link group to squad on first message ──────────────
          if (from.endsWith('@g.us')) {
            await this.autoLinkGroupIfNeeded(from, senderNumber);
          }

          const reply = await dispatchWhatsAppCommand(text, senderNumber);
          if (reply) {
            // In groups, send reply to the group; in DMs, send to the user
            const replyTo = from.endsWith('@g.us') ? from : senderNumber;

            if (typeof reply === 'string') {
              await this.sendText(replyTo, reply);
            } else {
              // Structured response — send text first, then interactive list if present
              if (reply.text) {
                await this.sendText(replyTo, reply.text);
              }
              if (reply.list) {
                try {
                  await this.sendList(
                    replyTo,
                    reply.text,
                    reply.list.buttonText,
                    reply.list.sections,
                    reply.list.title,
                  );
                } catch (listErr) {
                  // Fallback: send as plain text if list fails (e.g., in groups)
                  console.warn('[WHATSAPP] List message failed, falling back to text:', listErr);
                }
              }
            }
          }
        } catch (err) {
          console.error('[WHATSAPP] agent dispatch failed', err);
          try {
            await this.sendText(from, '⚠️ Agent error — try `help`.');
          } catch {/* swallow secondary send error */}
        }
      })();
    }

    // ── Group system events (join / leave / create) ──────────────────
    if (type === 'system') {
      const system = message.system;
      const systemType = system?.type;
      // When the bot is added to a group, send a welcome message
      if (systemType === 'user_added' || systemType === 'group_created') {
        // The group JID is the `from` field for group messages
        const groupJid = from;
        void this.handleGroupJoin(groupJid).catch((err) => {
          console.error('[WHATSAPP] group join handler failed', err);
        });
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

  // ── Group verification flow ──────────────────────────────────────────────

  /**
   * Send a group verification message to both squad WhatsApp groups.
   * WhatsApp doesn't support editing interactive messages, so button counts
   * are static. Updates are sent as follow-up text messages.
   */
  async sendGroupVerification(
    matchId: string,
    homeSquadId: string,
    awaySquadId: string,
    homeScore: number,
    awayScore: number,
    submittedByName: string,
  ): Promise<void> {
    const [homeSquad, awaySquad] = await Promise.all([
      prisma.squad.findUnique({
        where: { id: homeSquadId },
        include: { groups: { where: { platform: 'whatsapp' } }, members: true },
      }),
      prisma.squad.findUnique({
        where: { id: awaySquadId },
        include: { groups: { where: { platform: 'whatsapp' } }, members: true },
      }),
    ]);

    if (!homeSquad || !awaySquad) return;

    const homeGroupJid = homeSquad.groups.find((g) => g.chatId)?.chatId;
    const awayGroupJid = awaySquad.groups.find((g) => g.chatId)?.chatId;

    if (!homeGroupJid && !awayGroupJid) return;

    const totalMembers = new Set([
      ...homeSquad.members.map((m) => m.userId),
      ...awaySquad.members.map((m) => m.userId),
    ]).size;

    const threshold = totalMembers <= 4
      ? Math.max(2, Math.ceil(totalMembers * 0.5))
      : 3;

    await this.verifStore.save({
      matchId,
      homeSquadId,
      awaySquadId,
      homeSquadName: homeSquad.name,
      awaySquadName: awaySquad.name,
      homeScore,
      awayScore,
      homeGroupJid: homeGroupJid || undefined,
      awayGroupJid: awayGroupJid || undefined,
      confirms: [],
      disputes: [],
      createdAt: Date.now(),
      totalMembers,
    });

    const messageText = [
      `⚽ *Match Result Submitted*`,
      ``,
      `*${homeSquad.name}* ${homeScore} - ${awayScore} *${awaySquad.name}*`,
      `Submitted by ${submittedByName}`,
      ``,
      `${threshold} confirms needed to verify. Tap below:`,
    ].join('\n');

    const buttons = [
      { id: `verify_confirm_${matchId}`, title: `✅ Confirm` },
      { id: `verify_dispute_${matchId}`, title: `❌ Dispute` },
    ];

    if (homeGroupJid) {
      try {
        await this.sendButtons(homeGroupJid, messageText, buttons, 'SportWarren Verification');
      } catch (err) {
        console.error(`Failed to send WA verification to home group ${homeGroupJid}:`, err);
      }
    }

    if (awayGroupJid) {
      try {
        await this.sendButtons(awayGroupJid, messageText, buttons, 'SportWarren Verification');
      } catch (err) {
        console.error(`Failed to send WA verification to away group ${awayGroupJid}:`, err);
      }
    }
  }

  /**
   * Handle a confirm/dispute button press from the webhook.
   */
  async handleVerificationCallback(
    from: string,
    action: 'confirm' | 'dispute',
    matchId: string,
  ): Promise<void> {
    const pending = await this.verifStore.get(matchId);
    if (!pending) {
      await this.sendText(from, 'This verification has expired or been resolved.');
      return;
    }

    // Resolve user identity
    const identity = await prisma.platformIdentity.findUnique({
      where: {
        platform_platformUserId: {
          platform: 'whatsapp',
          platformUserId: from,
        },
      },
      include: { user: { include: { squads: true } } },
    });

    if (!identity) {
      await this.sendText(from, 'Link your account first: use the link command in SportWarren Settings.');
      return;
    }

    const isMember = identity.user.squads.some(
      (m: { squadId: string }) => m.squadId === pending.homeSquadId || m.squadId === pending.awaySquadId,
    );

    if (!isMember) {
      await this.sendText(from, 'Only squad members can verify match results.');
      return;
    }

    const userId = from;

    // Toggle behavior: adding to one set removes from the other. A repeat press
    // of the same button toggles that vote off.
    const hasConfirm = pending.confirms.includes(userId);
    const hasDispute = pending.disputes.includes(userId);
    pending.confirms = pending.confirms.filter((u) => u !== userId);
    pending.disputes = pending.disputes.filter((u) => u !== userId);
    if (action === 'confirm') {
      if (!hasConfirm) pending.confirms.push(userId);
    } else {
      if (!hasDispute) pending.disputes.push(userId);
    }

    await this.verifStore.save(pending);

    // Send updated count as a text message (WhatsApp can't edit interactive messages)
    const threshold = pending.totalMembers <= 4
      ? Math.max(2, Math.ceil(pending.totalMembers * 0.5))
      : 3;

    const statusMsg = [
      `📊 Verification update: ${pending.confirms.length}/${threshold} confirms, ${pending.disputes.length} disputes`,
    ].join('\n');

    // Send to the group where the vote happened
    const groupJid = pending.homeGroupJid || pending.awayGroupJid;
    if (groupJid) {
      try {
        await this.sendText(groupJid, statusMsg);
      } catch {
        // Group may not accept texts from bot
      }
    }

    // Check thresholds
    if (pending.confirms.length >= threshold && pending.disputes.length === 0) {
      await this.resolveGroupVerification(matchId, 'verified');
    } else if (pending.disputes.length >= 2) {
      await this.resolveGroupVerification(matchId, 'disputed');
    }
  }

  /**
   * Resolve a group verification: update match status and send match card.
   */
  private async resolveGroupVerification(
    matchId: string,
    resolution: 'verified' | 'disputed',
  ): Promise<void> {
    const pending = await this.verifStore.get(matchId);
    if (!pending) return;

    await this.verifStore.remove(matchId);

    if (resolution === 'disputed') {
      await prisma.match.update({
        where: { id: matchId },
        data: { status: 'disputed' },
      });

      const msg = `⚠️ Match ${pending.homeSquadName} vs ${pending.awaySquadName} has been disputed. Captains: review and resubmit.`;
      if (pending.homeGroupJid) await this.sendText(pending.homeGroupJid, msg).catch(() => {});
      if (pending.awayGroupJid) await this.sendText(pending.awayGroupJid, msg).catch(() => {});
      return;
    }

    // Verified: run full verification workflow
    try {
      const { verifyMatchResult } = await import('@/server/services/match-workflow');
      const verifierIds = pending.confirms;

      for (const verifierId of verifierIds) {
        try {
          const identity = await prisma.platformIdentity.findUnique({
            where: {
              platform_platformUserId: {
                platform: 'whatsapp',
                platformUserId: verifierId,
              },
            },
          });
          if (identity) {
            await verifyMatchResult({
              prisma,
              matchId,
              verifierId: identity.userId,
              verified: true,
              homeScore: pending.homeScore,
              awayScore: pending.awayScore,
            });
          }
        } catch {
          // Skip failed verifiers
        }
      }

      // Send match card to both groups
      await this.sendMatchCardIfPossible(pending);

      // Send personalized rate DMs to each squad member
      await this.sendRateDMs(pending);
    } catch (err) {
      console.error(`Failed to resolve WA verification for match ${matchId}:`, err);
    }
  }

  /**
   * Send match card image to both squad WhatsApp groups.
   */
  private async sendMatchCardIfPossible(pending: PendingWhatsAppVerification): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || process.env.CLIENT_URL;
    if (!baseUrl) return;

    const caption = [
      `✅ *Match Verified*`,
      ``,
      `*${pending.homeSquadName}* ${pending.homeScore} - ${pending.awayScore} *${pending.awaySquadName}*`,
      `Full stats: ${baseUrl}/match/${pending.matchId}`,
      ``,
      `⭐ Rate your teammates — check your DMs for your personal link!`,
    ].join('\n');

    const imageUrl = `${baseUrl}/api/og/match-card?matchId=${pending.matchId}&squadId=${pending.homeSquadId}`;

    for (const groupJid of [pending.homeGroupJid, pending.awayGroupJid]) {
      if (!groupJid) continue;
      try {
        await this.sendImage(groupJid, imageUrl, caption);
      } catch {
        try {
          await this.sendText(groupJid, caption);
        } catch {}
      }
    }

    // Send MOTM player card
    try {
      const match = await prisma.match.findUnique({
        where: { id: pending.matchId },
        include: { motmVotes: { select: { targetId: true } } },
      });

      if (match?.motmVotes.length) {
        const voteCounts = new Map<string, number>();
        for (const v of match.motmVotes) {
          voteCounts.set(v.targetId, (voteCounts.get(v.targetId) ?? 0) + 1);
        }
        const motmProfileId = [...voteCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];
        const motmProfile = await prisma.playerProfile.findUnique({
          where: { id: motmProfileId },
          include: { user: { select: { name: true } } },
        });

        if (motmProfile) {
          const cardUrl = `${baseUrl}/api/og/player-card?profileId=${motmProfileId}&matchId=${pending.matchId}`;
          const motmCaption = `🏆 *Man of the Match: ${motmProfile.user?.name ?? 'Player'}*`;

          for (const groupJid of [pending.homeGroupJid, pending.awayGroupJid]) {
            if (!groupJid) continue;
            try {
              await this.sendImage(groupJid, cardUrl, motmCaption);
            } catch {
              try {
                await this.sendText(groupJid, motmCaption);
              } catch {}
            }
          }
        }
      }
    } catch (err) {
      console.error('[WHATSAPP] Failed to send MOTM player card:', err);
    }
  }

  /**
   * External trigger to resolve a verification (called by the expiry cron to
   * update the group cards + send the match card once the DB match is settled).
   */
  async resolveGroupVerificationExternal(matchId: string): Promise<void> {
    const pending = await this.verifStore.get(matchId);
    if (!pending) return;

    const threshold = pending.totalMembers <= 4
      ? Math.max(2, Math.ceil(pending.totalMembers * 0.5))
      : 3;

    if (pending.confirms.length >= threshold) {
      await this.resolveGroupVerification(matchId, 'verified');
    } else if (pending.disputes.length >= 2) {
      await this.resolveGroupVerification(matchId, 'disputed');
    } else {
      // Silence = consent after 6 hours
      await this.resolveGroupVerification(matchId, 'verified');
    }
  }

  getClient(): WhatsAppClient {
    return this.client;
  }

  // ── Auto-link group to squad ───────────────────────────────────────

  /**
   * When a linked user sends a message in an unlinked WhatsApp group,
   * auto-link the group to the sender's squad. This enables the
   * "Champion adds Marcus to group → group auto-links" flow.
   */
  private async autoLinkGroupIfNeeded(groupJid: string, senderNumber: string): Promise<void> {
    // 1. Already linked?
    const existing = await prisma.squadGroup.findFirst({
      where: { platform: 'whatsapp', chatId: groupJid },
    });
    if (existing) return;

    // 2. Is the sender linked to a user with a squad?
    const identity = await prisma.platformIdentity.findUnique({
      where: {
        platform_platformUserId: {
          platform: 'whatsapp',
          platformUserId: senderNumber,
        },
      },
      include: {
        user: {
          include: {
            squads: {
              where: { status: 'active' },
              take: 1,
              include: {
                squad: {
                  include: {
                    groups: { where: { platform: 'whatsapp' } },
                    members: {
                      include: { user: { select: { name: true } } },
                      take: 12,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!identity?.user?.squads[0]) return;

    const squadMember = identity.user.squads[0];
    const squad = squadMember.squad;

    // 3. Only auto-link if this squad has NO WhatsApp group yet
    if (squad.groups.length > 0) return;

    // 4. Link this group to the squad
    await prisma.squadGroup.create({
      data: {
        squadId: squad.id,
        platform: 'whatsapp',
        chatId: groupJid,
        linkedAt: new Date(),
      },
    });

    console.log(`[WHATSAPP] Auto-linked group ${groupJid} to squad ${squad.name} (${squad.id}) via ${senderNumber}`);

    // 5. Confirm with roster and ask Champion to verify
    const rosterLines = squad.members
      .map((m) => `• ${m.user.name ?? 'Player'}`)
      .join('\n');

    const confirmMsg = [
      `🔗 *Group linked to ${squad.name}!*`,
      '',
      '*Current roster:*',
      rosterLines || '_No players yet_',
      '',
      'Is this the right squad? Tap below to confirm, or `unlink` to undo.',
    ].join('\n');

    try {
      await this.sendButtons(
        groupJid,
        confirmMsg,
        [
          { id: `squad_confirm_${squad.id}`, title: '✅ Correct' },
          { id: `squad_unlink_${squad.id}`, title: '❌ Wrong squad' },
        ],
      );
    } catch (err) {
      console.error('[WHATSAPP] Failed to send auto-link confirmation:', err);
    }
  }

  // ── Personalized rate DMs ────────────────────────────────────────────

  /**
   * Send a personalized rate-link DM to every squad member who has a
   * WhatsApp identity. Each link carries a signed JWT so the rate page
   * works without a wallet / Privy session.
   */
  private async sendRateDMs(pending: PendingWhatsAppVerification): Promise<void> {
    const baseUrl = process.env.NEXT_PUBLIC_CLIENT_URL || process.env.CLIENT_URL;
    if (!baseUrl) return;

    // Collect unique member userIds from both squads
    const [homeMembers, awayMembers] = await Promise.all([
      prisma.squadMember.findMany({
        where: { squadId: pending.homeSquadId },
        select: { userId: true },
      }),
      prisma.squadMember.findMany({
        where: { squadId: pending.awaySquadId },
        select: { userId: true },
      }),
    ]);

    const allUserIds = new Set([
      ...homeMembers.map((m) => m.userId),
      ...awayMembers.map((m) => m.userId),
    ]);

    // Look up WhatsApp identities for these users
    const identities = await prisma.platformIdentity.findMany({
      where: {
        platform: 'whatsapp',
        userId: { in: Array.from(allUserIds) },
      },
      select: { userId: true, platformUserId: true },
    });

    const rateHours = 24;
    for (const identity of identities) {
      try {
        const token = generateRateToken(pending.matchId, identity.userId);
        const rateUrl = `${baseUrl}/match/${pending.matchId}/rate?rt=${token}`;
        const dm = [
          `⭐ *Time to rate your teammates!*`,
          ``,
          `*${pending.homeSquadName}* ${pending.homeScore} - ${pending.awayScore} *${pending.awaySquadName}*`,
          ``,
          `Your objective feedback earns you Scout XP and helps your teammates level up.`,
          `Rating window closes in ${rateHours}h.`,
          ``,
          rateUrl,
        ].join('\n');
        await this.sendText(identity.platformUserId, dm);
      } catch (err) {
        console.error(`[WHATSAPP] Failed to send rate DM to ${identity.platformUserId}:`, err);
      }
    }
  }

  // ── Group welcome handler ────────────────────────────────────────────

  /**
   * When the bot is added to a WhatsApp group, introduce itself and
   * attempt to match the group to an existing squad.
   */
  private async handleGroupJoin(groupJid: string): Promise<void> {
    const welcome = [
      "👋 *Hey! I'm Marcus, Academy Director at SportWarren.*",
      "",
      "I'm here to help your squad track matches, rate performances, and scout opponents — all from this group chat.",
      "",
      "Quick commands:",
      "• `help` — see everything I can do",
      "• `squad` — view your squad info",
      "• `link WA-XXXXXX` — link your account (get code from Telegram)",
      "",
      "Once you've linked your account, just tell me a result like \"we won 3-1\" and I'll handle the rest!",
    ].join('\n');

    try {
      await this.sendText(groupJid, welcome);
    } catch (err) {
      console.error(`[WHATSAPP] Failed to send group welcome to ${groupJid}:`, err);
    }
  }
}

// ── Singleton accessor ──
let _whatsappService: WhatsAppService | null = null;

export function getWhatsAppService(): WhatsAppService | null {
  if (!_whatsappService) {
    try {
      _whatsappService = new WhatsAppService();
      if (!_whatsappService.isConfigured()) {
        _whatsappService = null;
        return null;
      }
    } catch {
      return null;
    }
  }
  return _whatsappService;
}
