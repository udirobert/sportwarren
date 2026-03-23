import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { getSquadMembership, isSquadLeader } from '../services/permissions';
import {
  createTelegramLinkSession,
  disconnectPlatformConnection,
  getPlatformConnectionsForSquad,
} from '../../../server/services/communication/platform-connections';

const platformSchema = z.enum(['telegram', 'whatsapp', 'xmtp']);

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
      await requireSquadMember(ctx.prisma, input.squadId, ctx.userId!);
      return getPlatformConnectionsForSquad(ctx.prisma, input.squadId);
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
      await disconnectPlatformConnection(ctx.prisma, input.platform, input.squadId);
      return { success: true };
    }),
});
