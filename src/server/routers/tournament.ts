/**
 * Tournament tRPC Router
 * Manages tournament creation, entry, bracket simulation, and results.
 */

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import {
  simulateTournamentMatch,
  generateSyntheticPlayers,
  type TournamentEntry,
  type TournamentMatchResult,
} from '@/lib/tournament/tournament-simulation';
import type { Formation, PlayStyle } from '@/types';

const formationSchema = z.enum([
  '4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2',
  '4-5-1', '4-1-4-1', '3-4-3', '4-3-1-2', '5-4-1',
]);

const playStyleSchema = z.enum([
  'balanced', 'possession', 'direct', 'counter', 'high_press', 'low_block',
]);

export const tournamentRouter = createTRPCRouter({
  /**
   * Create a new tournament.
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(80),
      type: z.enum(['squad', 'individual']),
      maxEntries: z.number().min(4).max(16).default(8),
    }))
    .mutation(async ({ ctx, input }) => {
      const tournament = await ctx.prisma.tournament.create({
        data: {
          name: input.name,
          type: input.type,
          maxEntries: input.maxEntries,
          createdBy: ctx.userId!,
        },
      });

      return tournament;
    }),

  /**
   * Enter a tournament with a formation.
   */
  enter: protectedProcedure
    .input(z.object({
      tournamentId: z.string(),
      formation: formationSchema,
      playStyle: playStyleSchema.default('balanced'),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#3b82f6'),
      playerNames: z.array(z.string()).optional(),
      squadId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const tournament = await ctx.prisma.tournament.findUnique({
        where: { id: input.tournamentId },
        include: { entries: true },
      });

      if (!tournament) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tournament not found' });
      }

      if (tournament.status !== 'open') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tournament is not accepting entries' });
      }

      if (tournament.entries.length >= tournament.maxEntries) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tournament is full' });
      }

      // Check if user already entered
      const existingEntry = tournament.entries.find((e) => e.userId === ctx.userId);
      if (existingEntry) {
        throw new TRPCError({ code: 'CONFLICT', message: 'You have already entered this tournament' });
      }

      // Determine seed number (next available)
      const seedNumber = tournament.entries.length + 1;

      // For squad tournaments, validate squad membership
      if (input.squadId) {
        const membership = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: {
              squadId: input.squadId,
              userId: ctx.userId!,
            },
          },
        });
        if (!membership) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not a member of this squad' });
        }
      }

      const entry = await ctx.prisma.tournamentEntry.create({
        data: {
          tournamentId: input.tournamentId,
          userId: ctx.userId!,
          squadId: input.squadId,
          seedNumber,
          formation: input.formation,
          playStyle: input.playStyle,
          color: input.color,
          playerNames: input.playerNames || [],
        },
      });

      return entry;
    }),

  /**
   * Get tournament details with bracket.
   */
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const tournament = await ctx.prisma.tournament.findUnique({
        where: { id: input.id },
        include: {
          entries: { orderBy: { seedNumber: 'asc' } },
          matches: {
            orderBy: [{ round: 'asc' }, { position: 'asc' }],
            include: {
              homeEntry: true,
              awayEntry: true,
            },
          },
        },
      });

      if (!tournament) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tournament not found' });
      }

      return tournament;
    }),

  /**
   * List open tournaments.
   */
  list: publicProcedure
    .input(z.object({
      status: z.enum(['open', 'active', 'completed']).optional(),
      type: z.enum(['squad', 'individual']).optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const tournaments = await ctx.prisma.tournament.findMany({
        where: {
          status: input.status,
          type: input.type,
        },
        include: {
          _count: { select: { entries: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      });

      return tournaments;
    }),

  /**
   * Start a tournament (runs all bracket simulations).
   * Only the creator can start. Requires exactly maxEntries entries.
   */
  start: protectedProcedure
    .input(z.object({ tournamentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const tournament = await ctx.prisma.tournament.findUnique({
        where: { id: input.tournamentId },
        include: {
          entries: { orderBy: { seedNumber: 'asc' } },
        },
      });

      if (!tournament) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tournament not found' });
      }

      if (tournament.createdBy !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the creator can start the tournament' });
      }

      if (tournament.status !== 'open') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tournament is not in open state' });
      }

      if (tournament.entries.length < 4) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Need at least 4 entries to start' });
      }

      // Build tournament entries with player data
      const buildEntry = async (entry: typeof tournament.entries[0]): Promise<TournamentEntry> => {
        let players;

        if (entry.squadId) {
          // Squad tournament: use real squad members
          const members = await ctx.prisma.squadMember.findMany({
            where: { squadId: entry.squadId },
            include: {
              user: {
                include: {
                  playerProfile: {
                    include: { attributes: true },
                  },
                },
              },
            },
            take: 11,
          });

          players = members.map((m, i) => {
            const attrs = m.user.playerProfile?.attributes || [];
            const avgRating = attrs.length > 0
              ? Math.round(attrs.reduce((sum: number, a: { rating: number }) => sum + a.rating, 0) / attrs.length)
              : 50 + Math.floor(Math.random() * 20);

            return {
              name: m.user.name || `Player ${i + 1}`,
              position: (m.user.position || 'CM') as string,
              overall: Math.min(99, Math.max(30, avgRating)),
            };
          });
        }

        if (!players || players.length === 0) {
          // Individual tournament or no squad data: generate synthetic players
          const names = (entry.playerNames as string[]) || [];
          players = generateSyntheticPlayers(entry.formation as Formation, names);
        }

        return {
          id: entry.id,
          formation: entry.formation as Formation,
          playStyle: (entry.playStyle || 'balanced') as PlayStyle,
          color: entry.color,
          players,
        };
      };

      // Build all entries
      const entries = await Promise.all(tournament.entries.map(buildEntry));

      // Standard bracket seeding: 1v8, 4v5, 3v6, 2v7
      const n = entries.length;
      const bracket = [
        [entries[0], entries[n - 1]],
        [entries[3], entries[n - 4]],
        [entries[2], entries[n - 3]],
        [entries[1], entries[n - 2]],
      ].filter(([a, b]) => a && b);

      // Run quarter-finals
      const qfResults: { match: TournamentMatchResult; homeIdx: number; awayIdx: number }[] = bracket.map(
        ([home, away], i) => ({
          match: simulateTournamentMatch(home, away, i * 1000 + 42),
          homeIdx: entries.indexOf(home),
          awayIdx: entries.indexOf(away),
        }),
      );

      // Determine semi-finalists
      const qfWinners = qfResults.map((qf) => {
        const homeWon = qf.match.homeScore >= qf.match.awayScore;
        return entries[homeWon ? qf.homeIdx : qf.awayIdx];
      });

      // Run semi-finals
      const sfResults: { match: TournamentMatchResult; homeIdx: number; awayIdx: number }[] = [];
      for (let i = 0; i < qfWinners.length; i += 2) {
        if (qfWinners[i] && qfWinners[i + 1]) {
          sfResults.push({
            match: simulateTournamentMatch(qfWinners[i], qfWinners[i + 1], 9000 + i),
            homeIdx: entries.indexOf(qfWinners[i]),
            awayIdx: entries.indexOf(qfWinners[i + 1]),
          });
        }
      }

      // Run final
      const sfWinners = sfResults.map((sf) => {
        const homeWon = sf.match.homeScore >= sf.match.awayScore;
        return entries[homeWon ? sf.homeIdx : sf.awayIdx];
      });

      const finalResults: { match: TournamentMatchResult; homeIdx: number; awayIdx: number }[] = [];
      if (sfWinners.length >= 2) {
        finalResults.push({
          match: simulateTournamentMatch(sfWinners[0], sfWinners[1], 99999),
          homeIdx: entries.indexOf(sfWinners[0]),
          awayIdx: entries.indexOf(sfWinners[1]),
        });
      }

      // Save all matches to DB
      await ctx.prisma.$transaction(async (tx) => {
        // Quarter-finals
        for (let i = 0; i < qfResults.length; i++) {
          const qf = qfResults[i];
          await tx.tournamentMatch.create({
            data: {
              tournamentId: input.tournamentId,
              round: 'quarter',
              position: i + 1,
              homeEntryId: tournament.entries[qf.homeIdx].id,
              awayEntryId: tournament.entries[qf.awayIdx].id,
              homeScore: qf.match.homeScore,
              awayScore: qf.match.awayScore,
              events: qf.match.events as any,
              status: 'completed',
              playedAt: new Date(),
            },
          });
        }

        // Semi-finals
        for (let i = 0; i < sfResults.length; i++) {
          const sf = sfResults[i];
          await tx.tournamentMatch.create({
            data: {
              tournamentId: input.tournamentId,
              round: 'semi',
              position: i + 1,
              homeEntryId: tournament.entries[sf.homeIdx].id,
              awayEntryId: tournament.entries[sf.awayIdx].id,
              homeScore: sf.match.homeScore,
              awayScore: sf.match.awayScore,
              events: sf.match.events as any,
              status: 'completed',
              playedAt: new Date(),
            },
          });
        }

        // Final
        if (finalResults.length > 0) {
          const f = finalResults[0];
          await tx.tournamentMatch.create({
            data: {
              tournamentId: input.tournamentId,
              round: 'final',
              position: 1,
              homeEntryId: tournament.entries[f.homeIdx].id,
              awayEntryId: tournament.entries[f.awayIdx].id,
              homeScore: f.match.homeScore,
              awayScore: f.match.awayScore,
              events: f.match.events as any,
              status: 'completed',
              playedAt: new Date(),
            },
          });
        }

        // Update tournament status
        await tx.tournament.update({
          where: { id: input.tournamentId },
          data: { status: 'completed', completedAt: new Date() },
        });
      });

      // Return the complete bracket
      return {
        tournamentId: input.tournamentId,
        rounds: [
          { round: 'quarter', matches: qfResults.map((q) => q.match) },
          { round: 'semi', matches: sfResults.map((s) => s.match) },
          { round: 'final', matches: finalResults.map((f) => f.match) },
        ],
      };
    }),
});
