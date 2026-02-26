import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';

const AttributeType = z.enum([
  'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical',
  'gk_diving', 'gk_handling', 'gk_kicking', 'gk_reflexes', 'gk_speed', 'gk_positioning'
]);

export const playerRouter = createTRPCRouter({
  // Get player profile with stats
  getProfile: publicProcedure
    .input(z.object({ 
      userId: z.string().min(1, 'User ID is required') 
    }))
    .query(async ({ ctx, input }) => {
      try {
        let profile = await ctx.prisma.playerProfile.findUnique({
          where: { userId: input.userId },
          include: { 
            attributes: true,
            user: { select: { name: true, avatar: true } }
          },
        });
        
        if (!profile) {
          // Check if user exists
          const user = await ctx.prisma.user.findUnique({
            where: { id: input.userId },
          });
          
          if (!user) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'User not found',
            });
          }

          // Create default profile with all attributes
          profile = await ctx.prisma.playerProfile.create({
            data: {
              userId: input.userId,
              attributes: {
                create: [
                  { attribute: 'pace', rating: 50, xp: 0, xpToNext: 100 },
                  { attribute: 'shooting', rating: 50, xp: 0, xpToNext: 100 },
                  { attribute: 'passing', rating: 50, xp: 0, xpToNext: 100 },
                  { attribute: 'dribbling', rating: 50, xp: 0, xpToNext: 100 },
                  { attribute: 'defending', rating: 50, xp: 0, xpToNext: 100 },
                  { attribute: 'physical', rating: 50, xp: 0, xpToNext: 100 },
                ],
              },
            },
            include: { 
              attributes: true,
              user: { select: { name: true, avatar: true } }
            },
          });
        }
        
        return profile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch player profile',
          cause: error,
        });
      }
    }),

  // Get player form history
  getForm: publicProcedure
    .input(z.object({ 
      userId: z.string().min(1, 'User ID is required'), 
      limit: z.number().min(1).max(50).default(5) 
    }))
    .query(async ({ ctx, input }) => {
      try {
        const form = await ctx.prisma.formEntry.findMany({
          where: { profile: { userId: input.userId } },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        });
        
        return form;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch player form',
          cause: error,
        });
      }
    }),

  // Apply XP gains after match verification - admin/system only
  applyXPGains: adminProcedure
    .input(z.object({
      matchId: z.string().min(1, 'Match ID is required'),
      gains: z.array(z.object({
        userId: z.string().min(1, 'User ID is required'),
        attributeBreakdown: z.record(z.string(), z.number().min(0)),
        baseXP: z.number().min(0),
        bonusXP: z.number().min(0).default(0),
        source: z.string().min(1),
        description: z.string().optional(),
      })).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { matchId, gains } = input;
        
        // Verify match exists and is verified
        const match = await ctx.prisma.match.findUnique({
          where: { id: matchId },
        });
        
        if (!match) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Match not found',
          });
        }
        
        if (match.status !== 'verified' && match.status !== 'finalized') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Match must be verified before applying XP',
          });
        }
        
        const results = [];
        
        for (const gain of gains) {
          const profile = await ctx.prisma.playerProfile.findUnique({
            where: { userId: gain.userId },
            include: { attributes: true },
          });
          
          if (!profile) {
            results.push({ userId: gain.userId, error: 'Profile not found' });
            continue;
          }
          
          // Apply attribute XP
          for (const [attrName, xpAmount] of Object.entries(gain.attributeBreakdown)) {
            const attr = profile.attributes.find(a => a.attribute === attrName);
            if (!attr) continue;
            
            let newXp = attr.xp + xpAmount;
            let newRating = attr.rating;
            let newXpToNext = attr.xpToNext;
            
            // Level up logic
            while (newXp >= newXpToNext && newRating < attr.maxRating) {
              newXp -= newXpToNext;
              newRating += 1;
              newXpToNext = Math.floor(newXpToNext * 1.2);
            }
            
            await ctx.prisma.playerAttribute.update({
              where: { id: attr.id },
              data: {
                xp: newXp,
                rating: Math.min(newRating, attr.maxRating),
                xpToNext: newXpToNext,
                history: { push: newRating },
              },
            });
          }
          
          // Create XP gain record
          await ctx.prisma.xPGain.create({
            data: {
              matchId,
              profileId: profile.id,
              baseXP: gain.baseXP,
              bonusXP: gain.bonusXP,
              totalXP: gain.baseXP + gain.bonusXP,
              source: gain.source,
              description: gain.description,
              attributeBreakdown: gain.attributeBreakdown,
            },
          });
          
          // Update profile totals
          await ctx.prisma.playerProfile.update({
            where: { id: profile.id },
            data: {
              totalXP: { increment: gain.baseXP + gain.bonusXP },
              seasonXP: { increment: gain.baseXP + gain.bonusXP },
            },
          });
          
          results.push({ userId: gain.userId, success: true });
        }
        
        return { success: true, count: gains.length, results };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to apply XP gains',
          cause: error,
        });
      }
    }),

  // Get leaderboard
  getLeaderboard: publicProcedure
    .input(z.object({
      type: z.enum(['overall', 'attribute', 'goals', 'assists', 'matches']).default('overall'),
      attribute: AttributeType.optional(),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { type, attribute, limit } = input;
        
        if (type === 'attribute' && attribute) {
          // Leaderboard by specific attribute
          const attributes = await ctx.prisma.playerAttribute.findMany({
            where: { attribute },
            orderBy: { rating: 'desc' },
            take: limit,
            include: { 
              profile: { 
                include: { 
                  user: { select: { id: true, name: true, avatar: true } } 
                } 
              } 
            },
          });
          
          return attributes.map(a => ({
            userId: a.profile.userId,
            name: a.profile.user.name,
            avatar: a.profile.user.avatar,
            rating: a.rating,
            xp: a.xp,
            attribute: a.attribute,
          }));
        }
        
        // Overall leaderboard
        const profiles = await ctx.prisma.playerProfile.findMany({
          include: { 
            attributes: true,
            user: { select: { id: true, name: true, avatar: true } },
          },
          take: limit * 2,
        });
        
        let ranked;
        switch (type) {
          case 'goals':
            ranked = profiles.sort((a, b) => b.totalGoals - a.totalGoals);
            break;
          case 'assists':
            ranked = profiles.sort((a, b) => b.totalAssists - a.totalAssists);
            break;
          case 'matches':
            ranked = profiles.sort((a, b) => b.totalMatches - a.totalMatches);
            break;
          default:
            // Overall by average rating
            ranked = profiles
              .map(p => ({
                ...p,
                averageRating: p.attributes.length > 0
                  ? Math.round(p.attributes.reduce((sum, a) => sum + a.rating, 0) / p.attributes.length)
                  : 0
              }))
              .sort((a, b) => b.averageRating - a.averageRating);
        }
        
        return ranked.slice(0, limit).map(p => ({
          userId: p.userId,
          name: p.user.name,
          avatar: p.user.avatar,
          level: p.level,
          totalXP: p.totalXP,
          totalMatches: p.totalMatches,
          totalGoals: p.totalGoals,
          totalAssists: p.totalAssists,
          averageRating: 'averageRating' in p ? p.averageRating : undefined,
        }));
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch leaderboard',
          cause: error,
        });
      }
    }),
});
