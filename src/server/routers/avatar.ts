import { createTRPCRouter, protectedProcedure } from '../trpc';

export const avatarRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { id: ctx.userId! },
      select: {
        avatarKitColor: true,
        avatarAccentColor: true,
        avatarSkinTone: true,
        avatarHairColor: true,
        avatarHairStyle: true,
        avatarNumber: true,
      },
    });
  }),
});
