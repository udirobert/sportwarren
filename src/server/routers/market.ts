import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  TreasuryBalanceError,
  ensureSquadTreasury,
} from '../../../server/services/economy/treasury-ledger';
import { calculatePlayerValue } from '../../lib/player/valuation-engine';
import { getSquadMembership } from '../services/permissions';
import {
  buildPlayerAttributesSnapshot,
  getLiveProspectById,
  getMarketPlayerRecord,
  listLiveMarketFeed,
} from '../services/market-feed';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const marketRouter = createTRPCRouter({
  getPlayerValuation: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await getMarketPlayerRecord(ctx.prisma, input.userId);

      if (!profile?.playerProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Player profile not found' });
      }

      const interestCount = await ctx.prisma.transferOffer.count({
        where: { playerId: input.userId, status: 'pending' },
      });

      return calculatePlayerValue(buildPlayerAttributesSnapshot(profile), interestCount);
    }),

  listProspects: publicProcedure.query(async ({ ctx }) => {
    const feed = await listLiveMarketFeed(ctx.prisma);
    return feed.prospects;
  }),

  listScoutingFeed: protectedProcedure
    .input(z.object({ squadId: z.string().min(1, 'Squad ID is required') }))
    .query(async ({ ctx, input }) => {
      const membership = await getSquadMembership(ctx.prisma, input.squadId, ctx.userId!);
      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only squad members can access the scouting feed',
        });
      }

      return listLiveMarketFeed(ctx.prisma, {
        viewerSquadId: input.squadId,
        viewerUserId: ctx.userId!,
      });
    }),

  signProspect: protectedProcedure
    .input(z.object({
      playerId: z.string(),
      squadId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const membership = input.squadId
        ? await getSquadMembership(ctx.prisma, input.squadId, ctx.userId!)
        : await ctx.prisma.squadMember.findFirst({
            where: { userId: ctx.userId! },
            orderBy: { joinedAt: 'desc' },
          });

      if (!membership) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You must be in a squad to sign prospects',
        });
      }

      const squadId = membership.squadId;
      const [prospect, player] = await Promise.all([
        getLiveProspectById(ctx.prisma, input.playerId),
        ctx.prisma.user.findUnique({ where: { id: input.playerId } }),
      ]);

      if (!prospect || !player) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Prospect not found in scouting feed',
        });
      }

      const existing = await ctx.prisma.squadMember.findUnique({
        where: {
          squadId_userId: {
            squadId,
            userId: player.id,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Player is already signed to your squad',
        });
      }

      const signingFee = prospect.askingPrice;
      const treasury = await ensureSquadTreasury(ctx.prisma, squadId);

      try {
        const member = await ctx.prisma.$transaction(async (tx) => {
          if (signingFee > 0) {
            const updateResult = await tx.squadTreasury.updateMany({
              where: {
                id: treasury.id,
                balance: { gte: signingFee },
              },
              data: {
                balance: { decrement: signingFee },
              },
            });

            if (updateResult.count === 0) {
              throw new TreasuryBalanceError();
            }

            await tx.squad.update({
              where: { id: squadId },
              data: {
                treasuryBalance: { decrement: signingFee },
              },
            });

            await tx.treasuryTransaction.create({
              data: {
                treasuryId: treasury.id,
                type: 'expense',
                category: 'transfer_out',
                amount: signingFee,
                description: `Signed ${player.name || 'Unnamed Player'} from the scouting feed`,
                verified: true,
              },
            });
          }

          return tx.squadMember.create({
            data: {
              squadId,
              userId: player.id,
              role: 'player',
            },
          });
        });

        return {
          success: true,
          message: `${player.name || 'This player'} has signed the contract!`,
          player,
          member,
        };
      } catch (error) {
        if (error instanceof TreasuryBalanceError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient treasury balance to sign this prospect',
          });
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sign prospect',
          cause: error,
        });
      }
    }),
});
