import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc';
import { getSquadMembership, isSquadLeader } from '../services/permissions';
import { TacticalNotificationService } from '../services/communication/tactical-notification-service';
import { TelegramService } from '../services/communication/telegram';
import {
  createTelegramLinkSession,
  disconnectSquadGroup,
  getSquadGroupsForSquad,
  updateActiveSquadContext,
} from '../services/communication/platform-connections';

const platformSchema = z.enum(['telegram']);

async function requireSquadMember(prisma: any, squadId: string, userId: string) {
  const membership = await getSquadMembership(prisma, squadId, userId);
  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must belong to this squad to manage its channels',
    });
  }

  return membership;
}

async function requireSquadLeader(prisma: any, squadId: string, userId: string) {
  const membership = await requireSquadMember(prisma, squadId, userId);
  if (!isSquadLeader(membership.role)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Only squad captains can manage chat channels',
    });
  }

  return membership;
}

export const communicationRouter = createTRPCRouter({
  getConnections: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
    }))
    .query(async ({ ctx, input }) => {
      const membership = await requireSquadMember(ctx.prisma, input.squadId, ctx.userId!);
      return getSquadGroupsForSquad(ctx.prisma, input.squadId, {
        includePendingLinkUrl: isSquadLeader(membership.role),
      });
    }),

  createTelegramLink: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      await requireSquadLeader(ctx.prisma, input.squadId, ctx.userId!);

      try {
        return await createTelegramLinkSession(ctx.prisma, ctx.userId!, input.squadId);
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: (error as Error).message || 'Telegram linking is unavailable on this deployment',
          cause: error,
        });
      }
    }),

  disconnectPlatform: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
      platform: platformSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      await requireSquadLeader(ctx.prisma, input.squadId, ctx.userId!);
      await disconnectSquadGroup(ctx.prisma, input.platform, input.squadId);
      return { success: true };
    }),

  setActiveSquad: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is a member of this squad
      const membership = await getSquadMembership(ctx.prisma, input.squadId, ctx.userId!);
      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must be a member of this squad to select it as active',
        });
      }

      // Update PlatformIdentity's activeSquadId
      // Find the user's PlatformIdentity for Telegram
      const identity = await ctx.prisma.platformIdentity.findFirst({
        where: {
          platform: 'telegram',
          userId: ctx.userId!,
        },
      });

      if (identity) {
        await updateActiveSquadContext(ctx.prisma, identity.id, input.squadId);
      }

      return { success: true, squadId: input.squadId };
    }),

  triggerTacticalBriefings: adminProcedure
    .mutation(async ({ ctx: _ctx }) => {
      const telegramService = new TelegramService();
      const tacticalService = new TacticalNotificationService(telegramService);
      
      console.log('[COMM-ROUTER] Triggering tactical briefings processing...');
      await tacticalService.processUpcomingMatches();
      
      return { success: true };
    }),

  getSignalPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      const allKinds = [
        'twin_created', 'level_up', 'sim_podium', 'sim_win',
        'record_broken', 'attestation_100', 'attestation_500',
        'attestation_1000', 'attestation_milestone',
        'coaching_expired', 'season_end', 'achievement_unlocked',
      ];

      const prefs = await ctx.prisma.twinSignalPreference.findMany({
        where: { userId: ctx.userId!, channel: 'telegram' },
      });

      const prefMap = new Map(prefs.map((p) => [p.kind, p.enabled]));
      return allKinds.map((kind) => ({
        kind,
        channel: 'telegram' as const,
        enabled: prefMap.get(kind) ?? false,
      }));
    }),

  setSignalPreference: protectedProcedure
    .input(z.object({
      channel: z.literal('telegram'),
      kind: z.string().min(1),
      enabled: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.twinSignalPreference.upsert({
        where: {
          userId_channel_kind: {
            userId: ctx.userId!,
            channel: input.channel,
            kind: input.kind,
          },
        },
        create: {
          userId: ctx.userId!,
          channel: input.channel,
          kind: input.kind,
          enabled: input.enabled,
        },
        update: { enabled: input.enabled },
      });
    }),

  // ── Taste learner — implicit engagement → learned notification weights ────
  // Signals land here from any surface (moment gallery, recap, share flows);
  // the WhatsApp cap gate reads the resulting weights. Never throws — a taste
  // write must not break the surface that produced the signal.

  recordTasteSignal: protectedProcedure
    .input(z.object({
      signal: z.enum(['skip', 'dismiss', 'open', 'dwell', 'share', 'save', 'like']),
      kind: z.string().min(1),
      matchId: z.string().optional(),
      playerId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { recordTasteSignal } = await import(
        '../services/personalization/taste-service'
      );
      return recordTasteSignal(ctx.userId!, input.signal, input.kind, {
        matchId: input.matchId,
        playerId: input.playerId,
      });
    }),

  tasteExplanation: protectedProcedure.query(async ({ ctx }) => {
    const { explainForUser } = await import(
      '../services/personalization/taste-service'
    );
    return explainForUser(ctx.userId!);
  }),

  // ── Notification language — user-set locale on all their platform
  // identities; notify resolves it per-send ('en' when unset).

  notificationLocale: protectedProcedure.query(async ({ ctx }) => {
    const identity = await ctx.prisma.platformIdentity.findFirst({
      where: { userId: ctx.userId!, locale: { not: null } },
      select: { locale: true },
    });
    return identity?.locale ?? 'en';
  }),

  setNotificationLocale: protectedProcedure
    .input(z.object({ locale: z.enum(['en', 'es', 'fr', 'pt', 'de', 'sw', 'ha', 'yo', 'zu']) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.platformIdentity.updateMany({
        where: { userId: ctx.userId! },
        data: { locale: input.locale },
      });
      return { locale: input.locale };
    }),
});
