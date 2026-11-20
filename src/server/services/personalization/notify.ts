/**
 * Notify service — channel-tiered delivery of twin events.
 *
 * Three tiers, three channels:
 *   - in-app  → always fires (in-memory event bus → react-query invalidation)
 *   - Telegram → per-event opt-in via TwinSignalPreference
 *   - WhatsApp → milestone-tier only, hard cap of 3 per twin per 24h
 *
 * Why a service instead of inline calls:
 *   - The orchestrator (`TwinService`) doesn't know what channels exist.
 *   - All caps, de-dup, and cap accounting live in one place.
 *   - Adding a new channel is one new `Channel` impl, not a search through
 *     the codebase.
 *
 * Side effects are *best-effort*: a failed WhatsApp message must not roll
 * back a verified twin mutation. Each channel catches its own errors.
 */

import { prisma } from '@/lib/db';
import { WhatsAppService } from '@/server/services/communication/whatsapp';
import {
  milestoneTelegramCopy,
  milestoneWhatsAppCopy,
  momentTelegramCopy,
  resolveLocale,
  type NotifyLocale,
} from './notify-i18n';
import { isKindQuiet } from './taste-service';
import type { MilestoneHint, MomentHint, TwinScope } from './twin-types';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface NotifyContext {
  scope: TwinScope;
  ownerId: string;        // profileId or squadId
  twinId: string;         // PlayerTwin.id or SquadTwin.id
  eventId?: string;       // source attestation id, for de-dup
}

export interface NotifyMilestoneArgs extends NotifyContext {
  milestone: MilestoneHint;
}

export interface NotifyMomentArgs extends NotifyContext {
  moment: MomentHint;
  momentId: string;
}

export interface NotifyChannel {
  readonly name: 'in-app' | 'telegram' | 'whatsapp';
  /** Returns true if the message was sent (or persisted for in-app). */
  sendMilestone(ctx: NotifyContext, milestone: MilestoneHint): Promise<boolean>;
  sendMoment(ctx: NotifyContext, moment: MomentHint, momentId: string): Promise<boolean>;
}

// ────────────────────────────────────────────────────────────────────────────
// In-app bus — fire-and-forget listeners invalidate react-query caches
// ────────────────────────────────────────────────────────────────────────────

type AppEvent =
  | { kind: 'twin.milestone'; ctx: NotifyContext; milestone: MilestoneHint }
  | { kind: 'twin.moment'; ctx: NotifyContext; moment: MomentHint; momentId: string };

const appListeners = new Set<(e: AppEvent) => void>();

export function onTwinAppEvent(listener: (e: AppEvent) => void): () => void {
  appListeners.add(listener);
  return () => appListeners.delete(listener);
}

function emitInApp(e: AppEvent) {
  for (const listener of appListeners) {
    try { listener(e); } catch (err) { console.warn('[in-app listener] failed:', err); }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// In-app channel
// ────────────────────────────────────────────────────────────────────────────

class InAppChannel implements NotifyChannel {
  readonly name = 'in-app' as const;
  async sendMilestone(ctx: NotifyContext, milestone: MilestoneHint) {
    emitInApp({ kind: 'twin.milestone', ctx, milestone });
    return true;
  }
  async sendMoment(ctx: NotifyContext, moment: MomentHint, momentId: string) {
    emitInApp({ kind: 'twin.moment', ctx, moment, momentId });
    return true;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Telegram channel — opt-in per event kind (player preference)
// ────────────────────────────────────────────────────────────────────────────

class TelegramChannel implements NotifyChannel {
  readonly name = 'telegram' as const;

  async sendMilestone(ctx: NotifyContext, milestone: MilestoneHint) {
    const target = await this.resolveTarget(ctx);
    if (!target) return false;

    const optedIn = await this.isOptedIn(ctx, milestone.kind);
    if (!optedIn) return false;

    try {
      const { getTelegramService } = await import('@/server/services/communication/telegram');
      const telegramService = getTelegramService();
      const bot = telegramService?.getBot();
      if (!bot) return false;

      const text = milestoneTelegramCopy(target.locale, ctx.scope, milestone);
      await bot.sendMessage(target.chatId, text, { parse_mode: 'Markdown' });
      return true;
    } catch (err) {
      console.warn('[telegram] sendMilestone failed:', err);
      return false;
    }
  }

  async sendMoment(ctx: NotifyContext, moment: MomentHint, _momentId: string) {
    const target = await this.resolveTarget(ctx);
    if (!target) return false;

    const optedIn = await this.isOptedIn(ctx, moment.kind);
    if (!optedIn) return false;

    try {
      const { getTelegramService } = await import('@/server/services/communication/telegram');
      const telegramService = getTelegramService();
      const bot = telegramService?.getBot();
      if (!bot) return false;

      const text = momentTelegramCopy(target.locale, ctx.scope, moment.label);
      await bot.sendMessage(target.chatId, text, { parse_mode: 'Markdown' });
      return true;
    } catch (err) {
      console.warn('[telegram] sendMoment failed:', err);
      return false;
    }
  }

  private async resolveTarget(
    ctx: NotifyContext,
  ): Promise<{ chatId: number; locale: NotifyLocale } | null> {
    if (ctx.scope === 'player') {
      const identity = await prisma.platformIdentity.findFirst({
        where: { platform: 'telegram', user: { playerProfile: { id: ctx.ownerId } } },
      });
      return identity?.chatId
        ? { chatId: parseInt(identity.chatId, 10), locale: resolveLocale(identity.locale) }
        : null;
    }
    // Squad groups have no single language preference — default copy.
    const group = await prisma.squadGroup.findFirst({
      where: { squadId: ctx.ownerId, platform: 'telegram' },
    });
    return group?.chatId ? { chatId: parseInt(group.chatId, 10), locale: 'en' } : null;
  }

  private async isOptedIn(ctx: NotifyContext, kind: string): Promise<boolean> {
    let userId: string | null = null;
    if (ctx.scope === 'player') {
      const profile = await prisma.playerProfile.findUnique({
        where: { id: ctx.ownerId },
        select: { userId: true },
      });
      userId = profile?.userId ?? null;
    } else {
      const squad = await prisma.squad.findUnique({
        where: { id: ctx.ownerId },
        include: { members: { where: { role: 'captain' }, take: 1 } },
      });
      userId = squad?.members[0]?.userId ?? null;
    }
    if (!userId) return false;

    const pref = await prisma.twinSignalPreference.findUnique({
      where: { userId_channel_kind: { userId, channel: 'telegram', kind } },
    });
    return pref?.enabled ?? false;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// WhatsApp channel — milestone-tier only, 3/twin/day hard cap
// ────────────────────────────────────────────────────────────────────────────

const WHATSAPP_DAILY_CAP = 3;
const WHATSAPP_TIER_WHITELIST: ReadonlySet<MilestoneHint['kind']> = new Set<MilestoneHint['kind']>([
  'level_up',
  'sim_win',
  'attestation_milestone',
  'record_broken',
  'season_end',
  'twin_created',
]);

class WhatsAppChannel implements NotifyChannel {
  readonly name = 'whatsapp' as const;
  private whatsapp: WhatsAppService;
  constructor() {
    this.whatsapp = new WhatsAppService();
  }

  async sendMilestone(ctx: NotifyContext, milestone: MilestoneHint) {
    if (!WHATSAPP_TIER_WHITELIST.has(milestone.kind)) return false;
    if (!this.whatsapp.isConfigured()) return false;

    const recipient = await this.resolveRecipient(ctx);
    if (!recipient) return false;

    // Taste gate — a kind the player keeps skipping shouldn't burn one of the
    // 3/day slots. Squad-scope has no single taste profile, so it always sends.
    if (recipient.userId && (await isKindQuiet(recipient.userId, milestone.kind))) return false;

    const withinCap = await this.checkAndRecordCap(ctx.twinId);
    if (!withinCap) return false;

    try {
      const text = milestoneWhatsAppCopy(recipient.locale, ctx.scope, milestone);
      await this.whatsapp.sendText(recipient.platformUserId, text);
      return true;
    } catch (err) {
      console.warn('[whatsapp] sendMilestone failed:', err);
      return false;
    }
  }

  async sendMoment(_ctx: NotifyContext, _moment: MomentHint, _momentId: string) {
    // Moments are rendered to image and shown in-app / via Telegram. WhatsApp
    // doesn't get a copy in PR 2 (avoid noise; revisit if engagement demands).
    return false;
  }

  private async resolveRecipient(
    ctx: NotifyContext,
  ): Promise<{ platformUserId: string; userId: string | null; locale: NotifyLocale } | null> {
    if (ctx.scope === 'player') {
      // Player's WhatsApp identity — also carries userId for the taste gate
      // and locale for localized copy.
      const identity = await prisma.platformIdentity.findFirst({
        where: { platform: 'whatsapp', user: { playerProfile: { id: ctx.ownerId } } },
      });
      return identity
        ? {
            platformUserId: identity.platformUserId,
            userId: identity.userId,
            locale: resolveLocale(identity.locale),
          }
        : null;
    }
    // Squad WhatsApp identity — no single language preference.
    const group = await prisma.squadGroup.findFirst({
      where: { squadId: ctx.ownerId, platform: 'whatsapp' },
    });
    return group?.chatId ? { platformUserId: group.chatId, userId: null, locale: 'en' } : null;
  }

  private async checkAndRecordCap(twinId: string): Promise<boolean> {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.whatsAppNotification.count({
      where: { twinId, createdAt: { gte: since } },
    });
    if (recent >= WHATSAPP_DAILY_CAP) return false;
    // Record the cap *after* the send attempt; sendMilestone catches send
    // errors so a failed send is silently dropped (no record).
    await prisma.whatsAppNotification.create({ data: { twinId } });
    return true;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Notify service — composition root
// ────────────────────────────────────────────────────────────────────────────

export class NotifyService {
  private channels: NotifyChannel[];
  constructor() {
    this.channels = [
      new InAppChannel(),
      new TelegramChannel(),
      new WhatsAppChannel(),
    ];
  }

  /** Milestones fan out to all channels that opt in. */
  async dispatchMilestone(args: NotifyMilestoneArgs): Promise<void> {
    const { milestone, ...ctx } = args;
    await Promise.allSettled(
      this.channels.map((c) => c.sendMilestone(ctx, milestone))
    );
  }

  /** Moments fan out the same way. */
  async dispatchMoment(args: NotifyMomentArgs): Promise<void> {
    const { moment, momentId, ...ctx } = args;
    await Promise.allSettled(
      this.channels.map((c) => c.sendMoment(ctx, moment, momentId))
    );
  }
}

let notifyInstance: NotifyService | null = null;
export function getNotifyService(): NotifyService {
  if (!notifyInstance) notifyInstance = new NotifyService();
  return notifyInstance;
}
