import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

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
};

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
});
