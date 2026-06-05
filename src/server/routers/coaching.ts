import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import {
  hireCoach,
  cancelEffect,
  getActiveEffects,
  listAvailableCoaches,
} from '@/server/services/personalization/coaching';

const attributeSchema = z.enum([
  'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical',
]);

const targetTypeSchema = z.enum(['player', 'squad']);

export const coachingRouter = createTRPCRouter({
  listCoaches: publicProcedure.query(async ({ ctx }) => {
    return listAvailableCoaches(ctx.prisma);
  }),

  getActiveEffects: publicProcedure
    .input(z.object({
      targetType: targetTypeSchema,
      targetId: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      return getActiveEffects(input.targetType, input.targetId, ctx.prisma);
    }),

  hireCoach: protectedProcedure
    .input(z.object({
      targetType: targetTypeSchema,
      targetId: z.string().min(1),
      coachAgentId: z.string().min(1),
      attribute: attributeSchema,
      modifier: z.number().min(-20).max(20),
      durationDays: z.number().int().min(1).max(90),
      costUsdc: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.targetType === 'player') {
        const profile = await ctx.prisma.playerProfile.findUnique({
          where: { userId: ctx.userId! },
        });
        if (!profile || profile.id !== input.targetId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your twin' });
        }
      } else {
        const membership = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: { squadId: input.targetId, userId: ctx.userId! },
          },
        });
        if (!membership) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a squad member' });
        }
      }

      const coach = await ctx.prisma.aiAgent.findUnique({
        where: { id: input.coachAgentId },
      });
      if (!coach || coach.type !== 'coach_external' || !coach.serviceActive) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Coach not available' });
      }

      return hireCoach({
        targetType: input.targetType,
        targetId: input.targetId,
        coachAgentId: input.coachAgentId,
        attribute: input.attribute,
        modifier: input.modifier,
        durationDays: input.durationDays,
        costUsdc: input.costUsdc,
      }, ctx.prisma);
    }),

  cancelEffect: protectedProcedure
    .input(z.object({ effectId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const effect = await ctx.prisma.coachingEffect.findUnique({
        where: { id: input.effectId },
      });
      if (!effect || !effect.active) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Active effect not found' });
      }

      let twinId: string | null = null;
      if (effect.targetType === 'player') {
        const profile = await ctx.prisma.playerProfile.findUnique({
          where: { userId: ctx.userId! },
        });
        if (!profile || profile.id !== effect.targetId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your twin' });
        }
        const twin = await ctx.prisma.playerTwin.findUnique({
          where: { profileId: effect.targetId },
        });
        twinId = twin?.id ?? null;
      } else {
        const membership = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: { squadId: effect.targetId, userId: ctx.userId! },
          },
        });
        if (!membership) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a squad member' });
        }
        const twin = await ctx.prisma.squadTwin.findUnique({
          where: { squadId: effect.targetId },
        });
        twinId = twin?.id ?? null;
      }

      if (!twinId) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Twin not found' });
      }

      await cancelEffect(input.effectId, twinId, ctx.prisma);
      return { success: true };
    }),
});
