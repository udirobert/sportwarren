import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

const MatchStatus = z.enum(['pending', 'verified', 'disputed', 'finalized']);

// Custom error messages
const Errors = {
  MATCH_NOT_FOUND: { code: 'NOT_FOUND' as const, message: 'Match not found' },
  SQUAD_NOT_FOUND: { code: 'NOT_FOUND' as const, message: 'Squad not found' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED' as const, message: 'Not authorized' },
  ALREADY_VERIFIED: { code: 'CONFLICT' as const, message: 'Already verified this match' },
  INVALID_SCORE: { code: 'BAD_REQUEST' as const, message: 'Invalid score provided' },
};

export const matchRouter = createTRPCRouter({
  // Submit a new match result
  submit: protectedProcedure
    .input(z.object({
      homeSquadId: z.string().min(1, 'Home squad is required'),
      awaySquadId: z.string().min(1, 'Away squad is required'),
      homeScore: z.number().min(0, 'Score cannot be negative'),
      awayScore: z.number().min(0, 'Score cannot be negative'),
      matchDate: z.date().default(() => new Date()),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate squads exist
        const [homeSquad, awaySquad] = await Promise.all([
          ctx.prisma.squad.findUnique({ where: { id: input.homeSquadId } }),
          ctx.prisma.squad.findUnique({ where: { id: input.awaySquadId } }),
        ]);

        if (!homeSquad) {
          throw new TRPCError(Errors.SQUAD_NOT_FOUND);
        }
        if (!awaySquad) {
          throw new TRPCError({ ...Errors.SQUAD_NOT_FOUND, message: 'Away squad not found' });
        }
        if (input.homeSquadId === input.awaySquadId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Home and away squads must be different',
          });
        }

        const match = await ctx.prisma.match.create({
          data: {
            homeSquadId: input.homeSquadId,
            awaySquadId: input.awaySquadId,
            homeScore: input.homeScore,
            awayScore: input.awayScore,
            matchDate: input.matchDate,
            submittedBy: ctx.userId!,
            status: 'pending',
          },
          include: {
            homeSquad: true,
            awaySquad: true,
          },
        });
        
        return match;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit match',
          cause: error,
        });
      }
    }),

  // Verify a match result
  verify: protectedProcedure
    .input(z.object({
      matchId: z.string().min(1, 'Match ID is required'),
      verified: z.boolean(),
      homeScore: z.number().min(0).optional(),
      awayScore: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { matchId, verified, homeScore, awayScore } = input;

        // Check if match exists
        const match = await ctx.prisma.match.findUnique({
          where: { id: matchId },
          include: { verifications: true },
        });

        if (!match) {
          throw new TRPCError(Errors.MATCH_NOT_FOUND);
        }

        // Check if already verified by this user
        const existingVerification = match.verifications.find(
          v => v.verifierId === ctx.userId
        );
        if (existingVerification) {
          throw new TRPCError(Errors.ALREADY_VERIFIED);
        }

        // Check if match is already finalized
        if (match.status === 'finalized') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Match is already finalized',
          });
        }

        // Create verification record
        await ctx.prisma.matchVerification.create({
          data: {
            matchId,
            verifierId: ctx.userId!,
            verified,
            homeScore,
            awayScore,
            trustTier: 'gold', // TODO: Calculate from reputation
          },
        });

        // Check consensus
        const updatedMatch = await ctx.prisma.match.findUnique({
          where: { id: matchId },
          include: { verifications: true },
        });

        if (!updatedMatch) {
          throw new TRPCError(Errors.MATCH_NOT_FOUND);
        }

        const verifiedCount = updatedMatch.verifications.filter(v => v.verified).length;
        const disputedCount = updatedMatch.verifications.filter(v => !v.verified).length;

        let newStatus = updatedMatch.status;
        if (verifiedCount >= 3) {
          newStatus = 'verified';
        } else if (disputedCount >= 2) {
          newStatus = 'disputed';
        }

        if (newStatus !== updatedMatch.status) {
          await ctx.prisma.match.update({
            where: { id: matchId },
            data: { status: newStatus },
          });
        }

        return { success: true, newStatus };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify match',
          cause: error,
        });
      }
    }),

  // List matches with filtering
  list: publicProcedure
    .input(z.object({
      status: MatchStatus.optional(),
      squadId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { status, squadId, limit, offset } = input;
        
        const where: any = {};
        if (status) where.status = status;
        if (squadId) {
          where.OR = [
            { homeSquadId: squadId },
            { awaySquadId: squadId },
          ];
        }

        const [matches, total] = await Promise.all([
          ctx.prisma.match.findMany({
            where,
            include: {
              homeSquad: true,
              awaySquad: true,
              _count: { select: { verifications: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          ctx.prisma.match.count({ where }),
        ]);

        return { matches, total, hasMore: offset + matches.length < total };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch matches',
          cause: error,
        });
      }
    }),

  // Get single match with details
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, 'Match ID is required') }))
    .query(async ({ ctx, input }) => {
      try {
        const match = await ctx.prisma.match.findUnique({
          where: { id: input.id },
          include: {
            homeSquad: true,
            awaySquad: true,
            verifications: {
              include: { 
                verifier: { 
                  select: { 
                    name: true,
                    playerProfile: {
                      select: { reputationScore: true }
                    }
                  } 
                } 
              },
            },
            playerStats: {
              include: {
                profile: {
                  include: { user: { select: { name: true } } }
                }
              }
            },
          },
        });
        
        if (!match) {
          throw new TRPCError(Errors.MATCH_NOT_FOUND);
        }
        
        return match;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch match',
          cause: error,
        });
      }
    }),
});
