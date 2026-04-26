import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { squadIdSchema, sessionCreateSchema, sessionJoinSchema } from '../lib/validation-schemas';

export const sessionRouter = createTRPCRouter({
  // Create a new weekly session for a squad
  create: protectedProcedure
    .input(sessionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.session.create({
        data: {
          squadId: input.squadId,
          name: input.name,
          date: input.date ?? new Date(),
          status: 'open',
        },
      });
    }),

  // Register attendance for a session
  join: protectedProcedure
    .input(sessionJoinSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not authenticated' });
      }
      const profile = await ctx.prisma.playerProfile.findUnique({
        where: { userId: ctx.userId },
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Player profile not found',
        });
      }

      return await ctx.prisma.sessionAttendee.upsert({
        where: {
          sessionId_profileId: {
            sessionId: input.sessionId,
            profileId: profile.id,
          },
        },
        update: {
          teamPreference: input.teamPreference,
        },
        create: {
          sessionId: input.sessionId,
          profileId: profile.id,
          teamPreference: input.teamPreference,
        },
      });
    }),

  // Get session details with attendees
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, 'Session ID is required') }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.prisma.session.findUnique({
        where: { id: input.id },
        include: {
          attendees: {
            include: {
              profile: {
                include: {
                  user: {
                    select: { name: true, avatar: true },
                  },
                  attributes: true,
                },
              },
            },
          },
          matches: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      return session;
    }),

  // List sessions for a squad
  listBySquad: publicProcedure
    .input(z.object({ squadId: squadIdSchema }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.session.findMany({
        where: { squadId: input.squadId },
        orderBy: { date: 'desc' },
      });
    }),

  // Balanced team generation logic (Bibs vs No Bibs)
  generateTeams: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.session.findUnique({
        where: { id: input.sessionId },
        include: {
          attendees: {
            include: {
              profile: {
                include: { attributes: true },
              },
            },
          },
        },
      });

      if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      if (session.attendees.length < 2) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Need at least 2 players to generate teams',
        });
      }

      // Simple balancing algorithm based on average attribute rating
      const playersWithStrength = session.attendees.map(a => {
        const avgRating = a.profile.attributes.reduce((acc, attr) => acc + attr.rating, 0) / (a.profile.attributes.length || 1);
        return { attendeeId: a.id, profileId: a.profileId, rating: avgRating || 50 };
      });

      // Sort by rating descending
      playersWithStrength.sort((a, b) => b.rating - a.rating);

      const bibs: string[] = [];
      const noBibs: string[] = [];
      let bibsRating = 0;
      let noBibsRating = 0;

      // Distribute players to balance ratings
      for (const p of playersWithStrength) {
        if (bibsRating <= noBibsRating) {
          bibs.push(p.attendeeId);
          bibsRating += p.rating;
        } else {
          noBibs.push(p.attendeeId);
          noBibsRating += p.rating;
        }
      }

      // Update attendees with generated teams
      await Promise.all([
        ...bibs.map(id => ctx.prisma.sessionAttendee.update({
          where: { id },
          data: { teamPreference: 'bibs' },
        })),
        ...noBibs.map(id => ctx.prisma.sessionAttendee.update({
          where: { id },
          data: { teamPreference: 'no_bibs' },
        })),
        ctx.prisma.session.update({
          where: { id: input.sessionId },
          data: { status: 'balanced' },
        }),
      ]);

      return { bibs, noBibs };
    }),
});
