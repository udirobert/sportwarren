import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { getSquadMembership, isSquadLeader } from '../services/permissions';

const avatarFields = {
  avatarKitColor: z.string().max(7).optional(),
  avatarAccentColor: z.string().max(7).optional(),
  avatarSkinTone: z.string().max(7).optional(),
  avatarHairColor: z.string().max(7).optional(),
  avatarHairStyle: z.enum(['short', 'tall', 'shaved', 'cap']).optional(),
  avatarNumber: z.string().max(2).optional(),
};

const avatarSelect = {
  avatarKitColor: true,
  avatarAccentColor: true,
  avatarSkinTone: true,
  avatarHairColor: true,
  avatarHairStyle: true,
  avatarNumber: true,
  avatarLocked: true,
};

async function assertCaptain(prisma: typeof import('@/lib/db').prisma, userId: string, squadId: string) {
  const membership = await getSquadMembership(prisma, squadId, userId);
  if (!membership || !isSquadLeader(membership.role)) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Only captains can manage squad avatars' });
  }
}

export const avatarRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.userId! },
      select: avatarSelect,
    });
  }),

  patch: protectedProcedure
    .input(z.object(avatarFields))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId! },
        select: { avatarLocked: true },
      });
      if (user?.avatarLocked) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Avatar is locked by your captain' });
      }
      const data: Record<string, string> = {};
      for (const [k, v] of Object.entries(input)) {
        if (v !== undefined) data[k] = v;
      }
      return ctx.prisma.user.update({
        where: { id: ctx.userId! },
        data,
        select: avatarSelect,
      });
    }),

  setSquadDefaults: protectedProcedure
    .input(z.object({
      squadId: z.string(),
      kitColor: z.string().max(7),
      accentColor: z.string().max(7).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertCaptain(ctx.prisma, ctx.userId!, input.squadId);
      return ctx.prisma.squad.update({
        where: { id: input.squadId },
        data: {
          kitColor: input.kitColor,
          accentColor: input.accentColor ?? null,
        },
        select: { kitColor: true, accentColor: true },
      });
    }),

  setPlayer: protectedProcedure
    .input(z.object({
      playerId: z.string(),
      squadId: z.string(),
      ...avatarFields,
    }))
    .mutation(async ({ ctx, input }) => {
      await assertCaptain(ctx.prisma, ctx.userId!, input.squadId);
      const { squadId: _, playerId, ...fields } = input;
      const data: Record<string, string> = {};
      for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined) data[k] = v;
      }
      return ctx.prisma.user.update({
        where: { id: playerId },
        data,
        select: avatarSelect,
      });
    }),

  lock: protectedProcedure
    .input(z.object({
      playerId: z.string(),
      squadId: z.string(),
      locked: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await assertCaptain(ctx.prisma, ctx.userId!, input.squadId);
      return ctx.prisma.user.update({
        where: { id: input.playerId },
        data: { avatarLocked: input.locked },
        select: { id: true, avatarLocked: true },
      });
    }),
});
