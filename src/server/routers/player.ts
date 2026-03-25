import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { calculateSharpnessDecay, calculateActivityGain } from '../../lib/player/fitness-engine';
import { getSquadMembership } from '../services/permissions';
import { applyMatchXP } from '../services/match-xp';

const AttributeType = z.enum([
  'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical',
  'gk_diving', 'gk_handling', 'gk_kicking', 'gk_reflexes', 'gk_speed', 'gk_positioning'
]);

const playerProfileInclude = {
  attributes: true,
  formHistory: {
    orderBy: { createdAt: 'desc' },
    take: 5,
  },
  user: { select: { name: true, avatar: true, position: true, walletAddress: true } },
} as const;

async function ensurePlayerProfile(prisma: any, userId: string) {
  const profile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: playerProfileInclude,
  });

  if (profile) {
    return profile;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User not found',
    });
  }

  return prisma.playerProfile.create({
    data: {
      userId,
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
    include: playerProfileInclude,
  });
}

export const playerRouter = createTRPCRouter({
  // Get player profile with stats
  getProfile: publicProcedure
    .input(z.object({
      userId: z.string().min(1, 'User ID is required')
    }))
    .query(async ({ ctx, input }) => {
      try {
        const profile = await ensurePlayerProfile(ctx.prisma, input.userId);
        const newSharpness = calculateSharpnessDecay(profile.sharpness, profile.updatedAt);
        if (newSharpness !== profile.sharpness) {
          await ctx.prisma.playerProfile.update({
            where: { id: profile.id },
            data: { sharpness: newSharpness }
          });
          profile.sharpness = newSharpness;
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

  getCurrentProfile: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const profile = await ensurePlayerProfile(ctx.prisma, ctx.userId!);
        const newSharpness = calculateSharpnessDecay(profile.sharpness, profile.updatedAt);
        if (newSharpness !== profile.sharpness) {
          await ctx.prisma.playerProfile.update({
            where: { id: profile.id },
            data: { sharpness: newSharpness }
          });
          profile.sharpness = newSharpness;
        }
        return profile;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch current player profile',
          cause: error,
        });
      }
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(40, 'Name must be 40 characters or fewer'),
      position: z.enum(['GK', 'DF', 'MF', 'ST', 'WG']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ensurePlayerProfile(ctx.prisma, ctx.userId!);

        const user = await ctx.prisma.user.update({
          where: { id: ctx.userId! },
          data: {
            name: input.name,
            position: input.position,
          },
          select: {
            id: true,
            name: true,
            position: true,
          },
        });

        return {
          success: true,
          user,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update player profile',
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

            // Sync to Algorand
            try {
              const { algorandService } = await import('../../../server/services/blockchain/algorand');
              const user = await ctx.prisma.user.findUnique({ where: { id: gain.userId } });
              if (user?.walletAddress && user.chain === 'algorand') {
                await algorandService.updatePlayerSkillOnChain(
                  user.walletAddress,
                  attrName,
                  newRating,
                  `match:${matchId.slice(0, 8)}`
                );
              }
            } catch (e) {
              console.warn('On-chain sync failed:', e);
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

  // Auto-compute and apply XP from PlayerMatchStats (goals, assists, cleanSheet, participation)
  // XP formula: participation +10, goal +25 each, assist +15 each, cleanSheet +30
  // Attribute routing: goals → finishing, assists → passing, cleanSheet → defending, all → stamina
  finalizeMatchXP: protectedProcedure
    .input(z.object({ matchId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { matchId } = input;

      const match = await ctx.prisma.match.findUnique({
        where: { id: matchId },
        include: { playerStats: { include: { profile: { include: { attributes: true } } } } },
      });

      if (!match) throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });
      const homeMembership = await getSquadMembership(ctx.prisma, match.homeSquadId, ctx.userId!);
      const awayMembership = await getSquadMembership(ctx.prisma, match.awaySquadId, ctx.userId!);
      if (!homeMembership && !awayMembership) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only match participants can finalize XP' });
      }
      if (match.status !== 'verified' && match.status !== 'finalized') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Match must be verified first' });
      }

      const result = await applyMatchXP(ctx.prisma, matchId);
      return {
        ...result,
        count: result.results.length,
      };
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

  // Get AI-driven insights (Coach Kite)
  getAiInsights: publicProcedure
    .input(z.object({
      userId: z.string().min(1, 'User ID is required'),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { userId } = input;

        // Fetch player profile and recent form
        const profile = await ctx.prisma.playerProfile.findUnique({
          where: { userId },
          include: {
            attributes: true,
            formHistory: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          },
        });

        if (!profile) {
          return {
            insight: "Welcome to SportWarren! Play your first match to unlock personalized AI insights from Coach Kite.",
            type: 'onboarding',
            confidence: 1.0
          };
        }

        // Logic-based insights (Fallback if Python analytics service is down)
        let insight = "Keep up the hard work on the pitch! Your consistency is the key to leveling up.";
        let type = 'general';

        const shooting = profile.attributes.find(a => a.attribute === 'shooting')?.rating || 0;
        const passing = profile.attributes.find(a => a.attribute === 'passing')?.rating || 0;
        const defending = profile.attributes.find(a => a.attribute === 'defending')?.rating || 0;

        if (profile.formHistory.length >= 3) {
          const recentRatings = profile.formHistory.map(f => f.rating);
          const avgRating = recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length;

          if (avgRating > 8.0) {
            insight = "You're in elite form! Your recent performances have been outstanding. Consider testing yourself against higher-rated rivals.";
            type = 'performance';
          } else if (shooting > 80 && profile.totalGoals < 5) {
            insight = "Your shooting stats are high but goals are low. Try to get into more advanced positions during the next match.";
            type = 'tactical';
          } else if (defending < passing) {
            insight = "You're strong in build-up play, but your defensive contributions could improve. Focus on interceptions in your next session.";
            type = 'tactical';
          }
        }

        // record interaction with Kite AI service for analytics
        try {
          // Import dynamic to avoid circular or early loading issues
          const { kiteAIService } = await import('../../../server/services/ai/kite');
          await kiteAIService.recordInteraction('coach_kite', 'generate_insight', { userId, type });
        } catch (e) {
          console.warn('Kite AI service not available for analytics');
        }

        return {
          insight,
          type,
          agentName: "Coach Kite",
          confidence: 0.85,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate AI insights',
          cause: error,
        });
      }
    }),

  // Chat with Coach Kite
  chatWithCoach: publicProcedure
    .input(z.object({
      userId: z.string().min(1, 'User ID is required'),
      message: z.string().min(1, 'Message is required'),
      context: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, message, context } = input;

        // record interaction
        try {
          const { kiteAIService } = await import('../../../server/services/ai/kite');
          await kiteAIService.recordInteraction('coach_kite', 'chat_request', { userId });
        } catch (e) {
          console.warn('Kite AI service not available for analytics');
        }

        // Fetch player profile for context
        const profile = await ctx.prisma.playerProfile.findUnique({
          where: { userId },
          include: { attributes: true }
        });

        const statsContext = profile ?
          `Player Stats: ${profile.attributes.map(a => `${a.attribute}: ${a.rating}`).join(', ')}` :
          'No profile data available.';

        // Call OpenAI service
        try {
          const { openaiService } = await import('../../../server/services/openai');
          const response = await openaiService.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
              {
                role: "system",
                content: `You are Coach Kite, a supportive but firm Sunday league football coach. 
                Your goal is to help players improve their real-world game.
                Use football terminology. Be concise and encouraging.
                Current Player Context: ${statsContext}
                Previous Advice Context: ${context || 'None'}`
              },
              { role: "user", content: message }
            ],
            max_tokens: 150,
          });

          return {
            reply: response.choices[0]?.message.content || "I'm focusing on the next match, let's talk later!",
            agentName: "Coach Kite"
          };
        } catch (openaiError) {
          console.error('OpenAI call failed:', openaiError);
          return {
            reply: "The locker room is a bit noisy right now. To give you the best advice: focus on your positioning and keep your head up!",
            agentName: "Coach Kite (Offline)"
          };
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to chat with coach',
          cause: error,
        });
      }
    }),

  // Get training and physical activity data
  getTrainingData: publicProcedure
    .input(z.object({
      userId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { userId } = input;
        const profile = await ctx.prisma.playerProfile.findUnique({
          where: { userId },
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        });

        if (!profile) return null;

        // Calculate start of "Match Week" relative to their preference
        const now = new Date();
        const currentDay = now.getDay();
        const prefDay = profile.matchDayPreference;

        // Find the most recent "PrefDay" (e.g. if today is Wed(3) and pref is Tue(2), diff is 1)
        let daysSinceStart = currentDay - prefDay;
        if (daysSinceStart < 0) daysSinceStart += 7;

        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - daysSinceStart);
        weekStart.setHours(0, 0, 0, 0);

        return {
          sharpness: profile.sharpness,
          matchDay: profile.matchDayPreference,
          activities: profile.activities,
          weeklyTarget: 150, // 150 minutes per week
          weeklyProgress: profile.activities
            .filter(a => a.createdAt >= weekStart)
            .reduce((sum, a) => sum + a.duration, 0)
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch training data',
          cause: error,
        });
      }
    }),

  // Sync a physical activity (Manual or mock for Strava/Garmin)
  syncActivity: publicProcedure
    .input(z.object({
      userId: z.string().min(1),
      type: z.enum(['run', 'gym', 'hiit', 'field_training']),
      duration: z.number().min(1),
      intensity: z.enum(['low', 'medium', 'high']),
      distance: z.number().optional(),
      source: z.string().default('manual'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { userId, type, duration, intensity, distance, source } = input;

        const profile = await ctx.prisma.playerProfile.findUnique({
          where: { userId },
        });

        if (!profile) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Player profile not found' });
        }

        // Calculate gains using FitnessEngine
        const sharpnessGain = calculateActivityGain(type, duration, intensity);
        const intensityMult = intensity === 'high' ? 1.5 : intensity === 'medium' ? 1.0 : 0.5;
        const xpGained = Math.floor(duration * 2 * intensityMult);

        const activity = await ctx.prisma.physicalActivity.create({
          data: {
            profileId: profile.id,
            type,
            duration,
            intensity,
            distance,
            source,
            xpGained,
            sharpnessGain
          }
        });

        // Update profile sharpness (capped at 100)
        await ctx.prisma.playerProfile.update({
          where: { id: profile.id },
          data: {
            sharpness: Math.min(100, profile.sharpness + sharpnessGain),
            totalXP: { increment: xpGained }
          }
        });

        // Record for Coach Kite to mention
        try {
          const { kiteAIService } = await import('../../../server/services/ai/kite');
          await kiteAIService.recordInteraction('fitness_agent', 'activity_synced', { userId, type, duration });
        } catch (e) { }

        return activity;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to sync activity',
          cause: error,
        });
      }
    }),
});
