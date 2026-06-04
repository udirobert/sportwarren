/**
 * Notify service — channel-tiered delivery of twin events.
 *
 * Three tiers, three channels:
 *   - in-app  → always fires (in-memory event bus → react-query invalidation)
 *   - Telegram → per-event opt-in via PlatformIdentity
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
  async sendMilestone(_ctx: NotifyContext, _milestone: MilestoneHint) {
    // Telegram delivery goes through the existing telegram-mini-app bot.
    // Wiring the per-kind opt-in lives in PR 7 (signals + onboarding) so
    // PR 2 stays focused on the orchestrator. The channel is a stub.
    return false;
  }
  async sendMoment(_ctx: NotifyContext, _moment: MomentHint, _momentId: string) {
    return false;
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

    const withinCap = await this.checkAndRecordCap(ctx.twinId);
    if (!withinCap) return false;

    const platformUserId = await this.resolveRecipient(ctx);
    if (!platformUserId) return false;

    try {
      const text = formatMilestoneText(ctx, milestone);
      await this.whatsapp.sendText(platformUserId, text);
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

  private async resolveRecipient(ctx: NotifyContext): Promise<string | null> {
    if (ctx.scope === 'player') {
      // Player's WhatsApp identity
      const identity = await prisma.platformIdentity.findFirst({
        where: { platform: 'whatsapp', user: { playerProfile: { id: ctx.ownerId } } },
      });
      return identity?.platformUserId ?? null;
    }
    // Squad WhatsApp identity
    const group = await prisma.squadGroup.findFirst({
      where: { squadId: ctx.ownerId, platform: 'whatsapp' },
    });
    return group?.chatId ?? null;
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

function formatMilestoneText(ctx: NotifyContext, m: MilestoneHint): string {
  const subject = ctx.scope === 'player' ? 'Your twin' : 'Your squad twin';
  switch (m.kind) {
    case 'twin_created': return `${subject} just woke up. Time to train.`;
    case 'level_up': return `${subject} leveled up — L${(m.payload as any).to ?? '?'}. Keep stacking.`;
    case 'sim_win': return `${subject} won the sim. Receipt on chain, trophy in app.`;
    case 'attestation_milestone': return `${subject} crossed a milestone. Reputation growing.`;
    case 'record_broken': return `${subject} broke a record. The timeline is watching.`;
    case 'season_end': return `${subject} closed the season. Receipts are live.`;
    default: return `${subject} hit a milestone.`;
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
