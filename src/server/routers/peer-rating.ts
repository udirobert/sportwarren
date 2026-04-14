import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { PEER_RATING } from '@/lib/match/constants';
import { getSquadMembership } from '../services/permissions';

export const peerRatingRouter = createTRPCRouter({
  /**
   * Submit ratings for a teammate and optionally vote for MOTM
   */
  submit: protectedProcedure
    .input(z.object({
      matchId: z.string().min(1),
      ratings: z.array(z.object({
        targetId: z.string().min(1),
        attribute: z.string().min(1),
        score: z.number().min(1).max(10),
        hypeTags: z.array(z.string()).optional(),
      })).max(PEER_RATING.TEAMMATES_TO_RATE * PEER_RATING.ATTRIBUTES_PER_TEAMMATE),
      motmVote: z.string().min(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { matchId, ratings, motmVote } = input;
      const userId = ctx.userId!;

      // 1. Validate match exists and window is open
      const match = await ctx.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeSquad: { select: { id: true } },
          awaySquad: { select: { id: true } },
        },
      });

      if (!match) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });
      }

      if (match.peerRatingsClosed || (match.peerRatingsCloseAt && match.peerRatingsCloseAt < new Date())) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Rating window is closed' });
      }

      // 2. Validate rater is in the match
      const homeMember = await getSquadMembership(ctx.prisma, match.homeSquadId, userId);
      const awayMember = await getSquadMembership(ctx.prisma, match.awaySquadId, userId);
      const raterMembership = homeMember || awayMember;

      if (!raterMembership) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'You must have played in the match to rate teammates' });
      }

      const raterProfile = await ctx.prisma.playerProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!raterProfile) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Player profile not found' });
      }

      // 3. Process Ratings
      const ratingPromises = ratings.map(r => 
        ctx.prisma.peerRating.upsert({
          where: {
            matchId_raterId_targetId_attribute: {
              matchId,
              raterId: raterProfile.id,
              targetId: r.targetId,
              attribute: r.attribute,
            }
          },
          update: { 
            score: r.score,
            hypeTags: r.hypeTags || [],
            weighted: false // Reset weighted if they update their rating
          },
          create: {
            matchId,
            raterId: raterProfile.id,
            targetId: r.targetId,
            attribute: r.attribute,
            score: r.score,
            hypeTags: r.hypeTags || [],
          }
        })
      );

      // 4. Process MOTM Vote
      if (motmVote) {
        ratingPromises.push(
          ctx.prisma.motmVote.upsert({
            where: {
              matchId_voterId: {
                matchId,
                voterId: raterProfile.id,
              }
            },
            update: { targetId: motmVote },
            create: {
              matchId,
              voterId: raterProfile.id,
              targetId: motmVote,
            }
          }) as any
        );
      }

      await Promise.all(ratingPromises);

      // 5. Trigger Digital Twin Sync
      try {
        const { getDigitalTwinService } = await import('@/server/services/ai/digital-twin');
        const dtService = getDigitalTwinService(ctx.prisma);
        await dtService.syncPeerRatings(matchId);
      } catch (e) {
        console.error('Failed to sync peer ratings to digital twin:', e);
      }

      return { success: true };
    }),

  /**
   * Get assignments: which teammates should I rate?
   */
  getMyAssignments: protectedProcedure
    .input(z.object({ matchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { matchId } = input;
      const userId = ctx.userId!;

      const match = await ctx.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          homeSquad: { include: { members: { include: { user: { include: { playerProfile: true } } } } } },
          awaySquad: { include: { members: { include: { user: { include: { playerProfile: true } } } } } },
        }
      });

      if (!match) throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });

      const isHome = match.homeSquad.members.some(m => m.userId === userId);
      const squad = isHome ? match.homeSquad : match.awaySquad;
      
      const raterMember = squad.members.find(m => m.userId === userId);
      if (!raterMember) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not in this match' });

      // Teammates excluding self
      const teammates = squad.members
        .filter(m => m.userId !== userId && m.user.playerProfile)
        .map(m => ({
          id: m.user.playerProfile!.id,
          name: m.user.name || 'Anonymous',
          avatar: m.user.avatar,
          position: m.user.position,
        }));

      // Deterministic "random" selection based on userId + matchId
      // In a real app, we might want to ensure coverage across the squad
      const seed = userId + matchId;
      const seededRandom = (i: number) => {
        const str = seed + i;
        let hash = 0;
        for (let j = 0; j < str.length; j++) {
          hash = ((hash << 5) - hash) + str.charCodeAt(j);
          hash |= 0;
        }
        return Math.abs(hash) / 2147483647;
      };

      const selectedTeammates = teammates
        .sort((a, b) => seededRandom(teammates.indexOf(a)) - seededRandom(teammates.indexOf(b)))
        .slice(0, PEER_RATING.TEAMMATES_TO_RATE);

      // Attributes to rate (can be position-based or random)
      const attributes = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];

      return {
        teammates: selectedTeammates,
        attributes,
        maxAttributesPerTeammate: PEER_RATING.ATTRIBUTES_PER_TEAMMATE,
      };
    }),

  /**
   * Get aggregated results for a match
   */
  getResults: publicProcedure
    .input(z.object({ matchId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { matchId } = input;

      const match = await ctx.prisma.match.findUnique({
        where: { id: matchId },
        include: {
          peerRatings: true,
          motmVotes: true,
          homeSquad: { include: { members: { include: { user: { include: { playerProfile: true } } } } } },
          awaySquad: { include: { members: { include: { user: { include: { playerProfile: true } } } } } },
        }
      });

      if (!match) throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });

      // If window is still open, we don't show consensus results to prevent bias
      const isClosed = match.peerRatingsClosed || (match.peerRatingsCloseAt && match.peerRatingsCloseAt < new Date());

      if (!isClosed) {
        return { isClosed: false, results: [] };
      }

      // Aggregate medians
      const allPlayerProfiles = [
        ...match.homeSquad.members.map(m => m.user.playerProfile),
        ...match.awaySquad.members.map(m => m.user.playerProfile),
      ].filter(Boolean);

      const results = allPlayerProfiles.map(profile => {
        const playerRatings = match.peerRatings.filter(r => r.targetId === profile!.id);
        const attrs = [...new Set(playerRatings.map(r => r.attribute))];
        
        const medians = attrs.map(attr => {
          const scores = playerRatings.filter(r => r.attribute === attr).map(r => r.score).sort((a, b) => a - b);
          const mid = Math.floor(scores.length / 2);
          const median = scores.length % 2 !== 0 ? scores[mid] : (scores[mid - 1] + scores[mid]) / 2;
          return { attribute: attr, median, count: scores.length };
        }).filter(m => m.count >= PEER_RATING.MIN_QUORUM);

        const motmVotesCount = match.motmVotes.filter(v => v.targetId === profile!.id).length;

        // Find the user for this profile from either squad
        const allMembers = [...match.homeSquad.members, ...match.awaySquad.members];
        const member = allMembers.find(m => m.user.playerProfile?.id === profile!.id);

        return {
          profileId: profile!.id,
          name: member?.user.name || 'Anonymous',
          medians,
          motmVotes: motmVotesCount,
        };
      });

      // Find MOTM winner
      const motmWinnerId = results.reduce((prev, current) => (prev.motmVotes > current.motmVotes) ? prev : current, results[0]).motmVotes > 0 
        ? results.reduce((prev, current) => (prev.motmVotes > current.motmVotes) ? prev : current).profileId
        : null;

      return {
        isClosed: true,
        results,
        motmWinnerId,
      };
    }),

  /**
   * Get Scout profile for a user
   */
  getScoutProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const profile = await ctx.prisma.playerProfile.findUnique({
        where: { userId: ctx.userId! },
        select: {
          scoutXP: true,
          scoutTier: true,
          _count: {
            select: { ratingsGiven: true }
          }
        }
      });

      if (!profile) throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });

      const nextTier = profile.scoutTier === 'rookie' ? 'trusted' : profile.scoutTier === 'trusted' ? 'elite' : 'max';
      const nextXP = nextTier === 'trusted' ? PEER_RATING.SCOUT_TIERS.TRUSTED.minXP : nextTier === 'elite' ? PEER_RATING.SCOUT_TIERS.ELITE.minXP : null;

      return {
        ...profile,
        nextTier,
        nextXP,
        progress: nextXP ? (profile.scoutXP / nextXP) * 100 : 100,
      };
    }),
});
