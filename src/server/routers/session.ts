import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { squadIdSchema, sessionCreateSchema, sessionJoinSchema } from '../lib/validation-schemas';
import { isSquadLeader, getSquadMembership } from '../services/permissions';

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

  // Create a match from a balanced session (bibs vs no-bibs)
  // Uses the session's squad as both home and away, with teamAssignments
  // derived from the balanced attendees' teamPreference
  createMatch: protectedProcedure
    .input(z.object({
      sessionId: z.string().min(1, 'Session ID is required'),
      homeScore: z.number().int().min(0),
      awayScore: z.number().int().min(0),
      matchDate: z.date().optional(),
      hasKeeper: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.session.findUnique({
        where: { id: input.sessionId },
        include: {
          attendees: {
            where: { teamPreference: { in: ['bibs', 'no_bibs'] } },
            include: {
              profile: { select: { id: true } },
            },
          },
        },
      });

      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }

      if (session.status !== 'balanced') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Session must have balanced teams before creating a match. Run generateTeams first.',
        });
      }

      // Verify the submitter is a captain of the session's squad
      const membership = await getSquadMembership(ctx.prisma, session.squadId, ctx.userId!);
      if (!membership || !isSquadLeader(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only squad captains can create matches from sessions',
        });
      }

      // Find profile IDs for each team
      const bibsProfiles = session.attendees
        .filter(a => a.teamPreference === 'bibs' && a.profile)
        .map(a => a.profile!.id);

      const noBibsProfiles = session.attendees
        .filter(a => a.teamPreference === 'no_bibs' && a.profile)
        .map(a => a.profile!.id);

      if (bibsProfiles.length === 0 || noBibsProfiles.length === 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Both teams must have at least one player assigned',
        });
      }

      // Use the session's squad as both home and away (bibs vs no-bibs)
      // teamAssignments overrides the squad-membership derivation for teamSide
      const { submitMatchResult } = await import('../services/match-workflow');

      const match = await submitMatchResult({
        prisma: ctx.prisma,
        homeSquadId: session.squadId,
        awaySquadId: session.squadId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        matchDate: input.matchDate,
        submittedBy: ctx.userId!,
        submittedByMembershipId: membership.id,
        sessionId: session.id,
        isSociallyTrusted: true, // Auto-verified within the session
        hasKeeper: input.hasKeeper,
        teamAssignments: {
          home: bibsProfiles,   // bibs = home
          away: noBibsProfiles, // no-bibs = away
        },
      });

      return match;
    }),

  // Submit a micro-match for an ongoing rotation session (winner-stays-on format)
  // Takes explicit team assignments per rotation — no need to re-generate teams
  // between micro-matches. All profile IDs must be attendees of the session.
  submitMicroMatch: protectedProcedure
    .input(z.object({
      sessionId: z.string().min(1, 'Session ID is required'),
      homeScore: z.number().int().min(0),
      awayScore: z.number().int().min(0),
      teamHome: z.array(z.string()).min(1, 'Home team needs at least 1 player'),
      teamAway: z.array(z.string()).min(1, 'Away team needs at least 1 player'),
      matchDate: z.date().optional(),
      hasKeeper: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.prisma.session.findUnique({
        where: { id: input.sessionId },
        select: {
          id: true,
          squadId: true,
          status: true,
          attendees: {
            select: { profileId: true },
          },
        },
      });

      if (!session) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Session not found' });
      }

      if (session.status === 'completed') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot submit micro-matches for a completed session',
        });
      }

      // Verify the submitter is a captain of the session's squad
      const membership = await getSquadMembership(ctx.prisma, session.squadId, ctx.userId!);
      if (!membership || !isSquadLeader(membership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only squad captains can submit micro-matches from sessions',
        });
      }

      // Validate all submitted players are actual session attendees
      const attendeeProfileIds = new Set(session.attendees.map(a => a.profileId));
      const allPlayers = [...input.teamHome, ...input.teamAway];
      const unknownPlayers = allPlayers.filter(id => !attendeeProfileIds.has(id));

      if (unknownPlayers.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Some players are not attendees of this session: ${unknownPlayers.length} unknown profile(s)`,
        });
      }

      // Check for overlap — a player can't be on both teams
      const homeSet = new Set(input.teamHome);
      const awaySet = new Set(input.teamAway);
      const overlap = input.teamHome.filter(id => awaySet.has(id));
      if (overlap.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'A player cannot be on both teams',
        });
      }

      const { submitMatchResult } = await import('../services/match-workflow');

      const match = await submitMatchResult({
        prisma: ctx.prisma,
        homeSquadId: session.squadId,
        awaySquadId: session.squadId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        matchDate: input.matchDate,
        submittedBy: ctx.userId!,
        submittedByMembershipId: membership.id,
        sessionId: session.id,
        isSociallyTrusted: true,
        hasKeeper: input.hasKeeper,
        teamAssignments: {
          home: [...new Set(input.teamHome)],
          away: [...new Set(input.teamAway)],
        },
      });

      return match;
    }),
});
