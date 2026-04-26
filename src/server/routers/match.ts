import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { chainlinkService } from '../services/blockchain/chainlink';
import { yellowService } from '../services/blockchain/yellow';
import { getSquadMembership, isSquadLeader } from '../services/permissions';
import {
  getMatchParticipantCandidates,
  MatchWorkflowError,
  settleMatchFee,
  submitMatchResult,
  verifyMatchResult,
} from '../services/match-workflow';
import { simulateMatch, calculateWinProbabilities } from '@/lib/match/simulation-engine';
import { INTEL_LEVELS, maskMatchIntel } from '@/lib/match/intel-disclosure';
import { Tactics, PlayerAttributes, Formation, PlayStyle, TeamInstructions, SetPieceInstructions } from '@/types';
import {
  squadIdSchema,
  matchIdSchema,
  matchScoreSchema,
  paginationSchema,
  matchStatusSchema,
  yellowMatchSettlementSchema,
  latitudeSchema,
  longitudeSchema,
} from '../lib/validation-schemas';

// Use shared validation schemas

// Custom error messages
const Errors = {
  MATCH_NOT_FOUND: { code: 'NOT_FOUND' as const, message: 'Match not found' },
  SQUAD_NOT_FOUND: { code: 'NOT_FOUND' as const, message: 'Squad not found' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED' as const, message: 'Not authorized' },
  ALREADY_VERIFIED: { code: 'CONFLICT' as const, message: 'Already verified this match' },
  INVALID_SCORE: { code: 'BAD_REQUEST' as const, message: 'Invalid score provided' },
};

function toTRPCError(error: unknown) {
  if (error instanceof TRPCError) {
    return error;
  }

  if (error instanceof MatchWorkflowError) {
    return new TRPCError({
      code: error.code,
      message: error.message,
      cause: error,
    });
  }

  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Match operation failed',
    cause: error,
  });
}

export const matchRouter = createTRPCRouter({
  // Submit a new match result
  submit: protectedProcedure
    .input(z.object({
      homeSquadId: squadIdSchema,
      awaySquadId: squadIdSchema,
      homeScore: matchScoreSchema,
      awayScore: matchScoreSchema,
      matchDate: z.date().default(() => new Date()),
      latitude: latitudeSchema.optional(),
      longitude: longitudeSchema.optional(),
      yellowSettlement: yellowMatchSettlementSchema.optional(),
      isSociallyTrusted: z.boolean().optional(),
      hasKeeper: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const submitterMembership = await getSquadMembership(ctx.prisma, input.homeSquadId, ctx.userId!);
        if (!submitterMembership) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only squad members can submit matches',
          });
        }
        if (!isSquadLeader(submitterMembership.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captains can submit matches',
          });
        }

        return await submitMatchResult({
          prisma: ctx.prisma,
          homeSquadId: input.homeSquadId,
          awaySquadId: input.awaySquadId,
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          matchDate: input.matchDate,
          submittedBy: ctx.userId!,
          submittedByMembershipId: submitterMembership.id, // Multi-squad attribution
          latitude: input.latitude,
          longitude: input.longitude,
          yellowSettlement: input.yellowSettlement,
          isSociallyTrusted: input.isSociallyTrusted,
          hasKeeper: input.hasKeeper,
        });
      } catch (error) {
        throw toTRPCError(error);
      }
    }),

  // Handle RSVP for a match
  rsvp: protectedProcedure
    .input(z.object({
      matchId: matchIdSchema,
      status: z.enum(['available', 'unavailable', 'maybe']),
      position: z.string().max(10).optional(),
      notes: z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.matchRsvp.upsert({
        where: {
          userId_matchId: {
            userId: ctx.userId!,
            matchId: input.matchId,
          },
        },
        create: {
          userId: ctx.userId!,
          matchId: input.matchId,
          status: input.status,
          position: input.position,
          notes: input.notes,
          respondedAt: new Date(),
        },
        update: {
          status: input.status,
          position: input.position,
          notes: input.notes,
          respondedAt: new Date(),
        },
      });
    }),

  // Set payment status for a player (subs/pitch fees)
  setPaymentStatus: protectedProcedure
    .input(z.object({
      matchId: matchIdSchema,
      userId: z.string().min(1).optional(), // If omitted, set for self
      isPaid: z.boolean(),
      amountPaid: z.number().positive().optional(),
      paymentType: z.enum(['cash', 'transfer', 'crypto']).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const targetUserId = input.userId || ctx.userId!;
      
      // If setting for someone else, check if caller is captain of the squad for this match
      if (targetUserId !== ctx.userId) {
        const match = await ctx.prisma.match.findUnique({
          where: { id: input.matchId },
          select: { homeSquadId: true, awaySquadId: true }
        });
        
        if (!match) throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });
        
        const homeMembership = await getSquadMembership(ctx.prisma, match.homeSquadId, ctx.userId!);
        const awayMembership = await getSquadMembership(ctx.prisma, match.awaySquadId, ctx.userId!);
        
        const isCaptain = isSquadLeader(homeMembership?.role) || isSquadLeader(awayMembership?.role);
                         
        if (!isCaptain) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only captains can mark others as paid' });
        }
      }

      // Ensure RSVP exists first
      const rsvp = await ctx.prisma.matchRsvp.upsert({
        where: {
          userId_matchId: {
            userId: targetUserId,
            matchId: input.matchId,
          },
        },
        create: {
          userId: targetUserId,
          matchId: input.matchId,
          status: 'available', // Default to available if they paid
          isPaid: input.isPaid,
          paidAt: input.isPaid ? new Date() : null,
          amountPaid: input.amountPaid,
          paymentType: input.paymentType,
          respondedAt: new Date(),
        },
        update: {
          isPaid: input.isPaid,
          paidAt: input.isPaid ? new Date() : null,
          amountPaid: input.amountPaid,
          paymentType: input.paymentType,
        },
      });

      // Digital Twin Impact: Payments contribute to Squad resources/prestige
      if (input.isPaid && input.amountPaid) {
        try {
          const match = await ctx.prisma.match.findUnique({
            where: { id: input.matchId },
            select: { homeSquadId: true, awaySquadId: true },
          });

          if (match) {
            const membership = await ctx.prisma.squadMember.findFirst({
              where: {
                userId: targetUserId,
                squadId: { in: [match.homeSquadId, match.awaySquadId] },
              },
              select: { squadId: true },
            });

            if (membership) {
              const { getDigitalTwinService } = await import('@/server/services/ai/digital-twin');
              const dtService = getDigitalTwinService(ctx.prisma);
              await dtService.processPaymentImpact(membership.squadId, input.amountPaid);
            }
          }
        } catch (error) {
          console.error('Failed to process digital twin payment impact:', error);
        }
      }

      return rsvp;
    }),

  // Get RSVPs for a match
  getRsvps: protectedProcedure
    .input(z.object({ matchId: matchIdSchema }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.matchRsvp.findMany({
        where: { matchId: input.matchId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              walletAddress: true,
            }
          }
        },
        orderBy: { respondedAt: 'desc' },
      });
    }),

  // Get the next upcoming match for a squad
  getUpcoming: protectedProcedure
    .input(z.object({ squadId: squadIdSchema }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.match.findFirst({
        where: {
          OR: [
            { homeSquadId: input.squadId },
            { awaySquadId: input.squadId },
          ],
          status: 'pending',
          matchDate: { gte: new Date() },
        },
        include: {
          homeSquad: { select: { name: true } },
          awaySquad: { select: { name: true } },
          rsvps: {
            where: { userId: ctx.userId },
            take: 1,
          }
        },
        orderBy: { matchDate: 'asc' },
      });
    }),

  // Verify a match result
  verify: protectedProcedure
    .input(z.object({
      matchId: matchIdSchema,
      verified: z.boolean(),
      homeScore: matchScoreSchema.optional(),
      awayScore: matchScoreSchema.optional(),
      yellowSettlement: yellowMatchSettlementSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { matchId, verified, homeScore, awayScore, yellowSettlement } = input;

        const match = await ctx.prisma.match.findUnique({
          where: { id: matchId },
          include: { verifications: true },
        });

        if (!match) {
          throw new TRPCError(Errors.MATCH_NOT_FOUND);
        }

        const homeMembership = await getSquadMembership(ctx.prisma, match.homeSquadId, ctx.userId!);
        const awayMembership = await getSquadMembership(ctx.prisma, match.awaySquadId, ctx.userId!);
        const verifyingMembership = homeMembership || awayMembership;

        if (!verifyingMembership) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only match squad members can verify results',
          });
        }

        if (!isSquadLeader(verifyingMembership.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captains can verify match results',
          });
        }

        return await verifyMatchResult({
          prisma: ctx.prisma,
          matchId,
          verifierId: ctx.userId!,
          verified,
          homeScore,
          awayScore,
          yellowSettlement,
        }).then(async (result) => {
          if (result.newStatus === 'verified') {
            const match = await ctx.prisma.match.findUnique({
              where: { id: matchId },
              include: {
                homeSquad: { select: { name: true } },
                awaySquad: { select: { name: true } },
              },
            });
            if (match) {
              const { notifyMatchVerified } = await import('../services/communication/match-notifications');
              notifyMatchVerified(matchId, match.homeSquad.name, match.awaySquad.name).catch(console.error);
            }
          }
          return result;
        });
      } catch (error) {
        throw toTRPCError(error);
      }
    }),

  settleFeeSession: protectedProcedure
    .input(z.object({
      matchId: matchIdSchema,
      yellowSettlement: yellowMatchSettlementSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      const match = await ctx.prisma.match.findUnique({
        where: { id: input.matchId },
      });

      if (!match) {
        throw new TRPCError(Errors.MATCH_NOT_FOUND);
      }

      const homeMembership = await getSquadMembership(ctx.prisma, match.homeSquadId, ctx.userId!);
      const awayMembership = await getSquadMembership(ctx.prisma, match.awaySquadId, ctx.userId!);
      const settlingMembership = homeMembership || awayMembership;
      if (!settlingMembership || !isSquadLeader(settlingMembership.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only captains can settle match fee sessions',
        });
      }

      if (!match.yellowFeeSessionId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Match does not have a Yellow fee session',
        });
      }

      if (match.yellowFeeSettledAt) {
        return { success: true, alreadySettled: true };
      }

      if (match.status !== 'verified' && match.status !== 'disputed') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Match fee settlement is only available after verification consensus',
        });
      }

      const participants = await getMatchParticipantCandidates(
        ctx.prisma,
        match.homeSquadId,
        match.awaySquadId,
      );
      const settlement = await yellowService.verifyClientSettlement({
        settlement: input.yellowSettlement,
        participantCandidates: participants,
        expectedSessionId: match.yellowFeeSessionId,
        applicationPrefixes: ['sportwarren-match-fee-'],
        expectedParticipants: participants,
        expectedSessionData: {
          matchId: match.id,
          status: match.status,
        },
      });

      await settleMatchFee(ctx.prisma, match, match.status as 'verified' | 'disputed', settlement);

      return { success: true, alreadySettled: false };
    }),

  // Finalize a verified match and issue Reputation tracking SBT logic
  finalize: protectedProcedure
    .input(z.object({ matchId: matchIdSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { matchId } = input;
        const match = await ctx.prisma.match.findUnique({
          where: { id: matchId },
          include: {
            homeSquad: { include: { members: { include: { user: true } } } },
            awaySquad: { include: { members: { include: { user: true } } } }
          }
        });

        if (!match) throw new TRPCError(Errors.MATCH_NOT_FOUND);

        const homeMembership = await getSquadMembership(ctx.prisma, match.homeSquadId, ctx.userId!);
        const awayMembership = await getSquadMembership(ctx.prisma, match.awaySquadId, ctx.userId!);
        const finalizeMembership = homeMembership || awayMembership;
        if (!finalizeMembership || !isSquadLeader(finalizeMembership.role)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captains can finalize matches',
          });
        }

        if (match.status !== 'verified') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Only verified matches can be finalized',
          });
        }

        // Update match status to finalized
        await ctx.prisma.match.update({
          where: { id: matchId },
          data: { status: 'finalized' }
        });

        // Mint On-Chain Reputation (Soulbound logic simulation) via Algorand Service
        try {
          const { algorandService } = await import('@/server/services/blockchain/algorand');

          // Determine who won to issue different reputation gains
          const homeScore = match.homeScore || 0;
          const awayScore = match.awayScore || 0;

          const homeWon = homeScore > awayScore;
          const awayWon = awayScore > homeScore;

          const processTeam = async (members: Array<{ user: { id: string; walletAddress?: string | null; chain?: string | null } }>, isWinner: boolean, isDraw: boolean) => {
            const repGain = isDraw ? 2 : (isWinner ? 5 : 1); // 5 for win, 2 for draw, 1 for loss

            for (const member of members) {
              const user = member.user;
              if (user && user.walletAddress && user.chain === 'algorand') {
                // Issue reputation token/state update on-chain
                await algorandService.updatePlayerReputation(
                  user.walletAddress,
                  repGain,
                  `match_finalized:${matchId.substring(0, 8)}`
                );
              }

              // Local DB update
              await ctx.prisma.playerProfile.updateMany({
                where: { userId: user.id },
                data: { reputationScore: { increment: repGain } }
              });
            }
          };

          const isDraw = homeScore === awayScore;
          await processTeam(match.homeSquad.members, homeWon, isDraw);
          await processTeam(match.awaySquad.members, awayWon, isDraw);

        } catch (algoError) {
          console.error('Failed to issue on-chain reputation:', algoError);
          // Non-blocking on DB finalize
        }

        return { success: true, message: 'Match finalized and reputation SBTs issued!' };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to finalize match',
          cause: error,
        });
      }
    }),

  // List matches with filtering
  list: publicProcedure
    .input(z.object({
      status: matchStatusSchema.optional(),
      squadId: squadIdSchema.optional(),
      ...paginationSchema.shape,
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { status, squadId, limit, offset } = input;

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (squadId) {
          where.OR = [
            { homeSquadId: squadId },
            { awaySquadId: squadId },
          ];
        }

        const [matches, total] = await Promise.all([
          ctx.prisma.match.findMany({
            where,
            include: {
              homeSquad: true,
              awaySquad: true,
              verifications: {
                include: {
                  verifier: {
                    select: {
                      name: true,
                      squadContexts: true,
                    }
                  }
                }
              },
              _count: { select: { verifications: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          ctx.prisma.match.count({ where }),
        ]);

        return { matches, total, hasMore: offset + matches.length < total };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch matches',
          cause: error,
        });
      }
    }),

  // Get single match with details
  getById: publicProcedure
    .input(z.object({ id: matchIdSchema }))
    .query(async ({ ctx, input }) => {
      try {
        const match = await ctx.prisma.match.findUnique({
          where: { id: input.id },
          include: {
            homeSquad: true,
            awaySquad: true,
            verifications: {
              include: {
                verifier: {
                  select: {
                    name: true,
                    squadContexts: true,
                    playerProfile: {
                      select: { reputationScore: true }
                    }
                  }
                }
              },
            },
            playerStats: {
              include: {
                profile: {
                  include: { user: { select: { name: true } } }
                }
              }
            },
          },
        });

        if (!match) {
          throw new TRPCError(Errors.MATCH_NOT_FOUND);
        }

        // ENHANCEMENT: On-the-fly CRE enrichment for demo/hackathon
        // If we have coordinates but no persisted CRE result, run it now
        let creResult = (match as any).verificationDetails;
        if (!creResult && match.latitude !== null && match.longitude !== null) {
          try {
            const verification = await chainlinkService.verifyMatch({
              latitude: match.latitude,
              longitude: match.longitude,
              timestamp: Math.floor(match.matchDate.getTime() / 1000),
              homeTeam: match.homeSquad.name,
              awayTeam: match.awaySquad.name,
            });
            creResult = verification.details;
          } catch (e) {
            console.error('CRE Enrichment failed:', e);
          }
        }

        const response = {
          ...match,
          creResult,
          agentInsights: (match as { agentInsights?: unknown }).agentInsights,
          paymentRail: {
            enabled: !!match.yellowFeeSessionId,
            assetSymbol: yellowService.getRailStatus().assetSymbol,
            sessionId: match.yellowFeeSessionId,
            feeAmount: yellowService.getMatchFeeAmount(),
          },
        };

        // Apply progressive intel masking for pending matches
        if (match.status === 'pending') {
          return maskMatchIntel(response);
        }

        return { ...response, intelLevel: INTEL_LEVELS.FULL };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch match',
          cause: error,
        });
      }
    }),

  // Get match by share slug — public, no auth required
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1, 'Slug is required') }))
    .query(async ({ ctx, input }) => {
      try {
        const match = await ctx.prisma.match.findUnique({
          where: { shareSlug: input.slug },
          include: {
            homeSquad: true,
            awaySquad: true,
            verifications: {
              include: {
                verifier: {
                  select: {
                    name: true,
                    squadContexts: true,
                    playerProfile: {
                      select: { reputationScore: true }
                    }
                  }
                }
              },
            },
          },
        });

        if (!match) {
          throw new TRPCError(Errors.MATCH_NOT_FOUND);
        }

        return match;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch match',
          cause: error,
        });
      }
    }),

  // Get Captain's Log (Summarize last 5 matches)
  getCaptainsLog: protectedProcedure
    .input(z.object({ squadId: squadIdSchema }))
    .query(async ({ ctx, input }) => {
      try {
        const member = await getSquadMembership(ctx.prisma, input.squadId, ctx.userId!);
        if (!member) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only squad members can access Captain\'s Log',
          });
        }

        const matches = await ctx.prisma.match.findMany({
          where: {
            OR: [
              { homeSquadId: input.squadId },
              { awaySquadId: input.squadId },
            ],
            status: 'finalized'
          },
          include: {
            homeSquad: { select: { name: true } },
            awaySquad: { select: { name: true } },
          },
          orderBy: { matchDate: 'desc' },
          take: 5
        });

        if (matches.length === 0) {
          return { summary: "No recent matches found. Get out there and play!", matchesFound: 0 };
        }

        const matchSummaries = matches.map(m => {
          const isHome = m.homeSquadId === input.squadId;
          const ourScore = isHome ? m.homeScore : m.awayScore;
          const theirScore = isHome ? m.awayScore : m.homeScore;
          const opponent = isHome ? m.awaySquad.name : m.homeSquad.name;
          return `vs ${opponent}: ${ourScore} - ${theirScore} (${ourScore! > theirScore! ? 'Win' : ourScore! < theirScore! ? 'Loss' : 'Draw'})`;
        });

        try {
          const { generateInference } = await import('../../lib/ai/inference');

          const result = await generateInference([
            {
              role: 'user',
              content: `Here are our last ${matches.length} results: ${matchSummaries.join(', ')}. What's your tactical "Captain's Log" analysis?`
            }
          ], {
            systemPrompt: `You are Coach Kite analyzing the team's form. Provide a concise tactical summary of the last 5 matches. Keep it under 3 sentences. Be analytical, firm, but encouraging.`,
            temperature: 0.7,
            max_tokens: 150,
          });

          return {
            summary: result?.content || "Keep focusing on the fundamentals. The results will come.",
            matchesFound: matches.length
          };
        } catch (aiError) {
          console.error("AI summarization failed:", aiError);
          return {
            summary: "Tac-link offline. Based on the raw data, maintaining defensive shape is our priority right now.",
            matchesFound: matches.length
          };
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to generate Captain\'s Log',
          cause: error,
        });
      }
    }),

  // Preview a match between two squads (Simulation)
  preview: publicProcedure
    .input(z.object({
      homeSquadId: squadIdSchema,
      awaySquadId: squadIdSchema,
    }))
    .query(async ({ ctx, input }) => {
      try {
        const getSquadData = async (squadId: string) => {
          const squad = await ctx.prisma.squad.findUnique({
            where: { id: squadId },
            include: {
              tactics: true,
              members: {
                include: {
                  user: {
                    include: {
                      playerProfile: {
                        include: { attributes: true }
                      }
                    }
                  }
                }
              }
            }
          });

          if (!squad) throw new TRPCError(Errors.SQUAD_NOT_FOUND);

          // Map to simulation engine types
          const tactics: Tactics = {
            formation: (squad.tactics?.formation as Formation) || '4-4-2',
            style: (squad.tactics?.playStyle as PlayStyle) || 'balanced',
            instructions: (squad.tactics?.instructions as unknown as TeamInstructions) || {
              width: 'normal',
              tempo: 'normal',
              passing: 'mixed',
              pressing: 'medium',
              defensiveLine: 'normal'
            },
            setPieces: (squad.tactics?.setPieces as unknown as SetPieceInstructions) || {
              corners: 'near_post',
              freeKicks: 'shoot',
              penalties: ''
            }
          };

          const players: PlayerAttributes[] = squad.members
            .filter(m => m.user.playerProfile)
            .map(m => {
              const profile = m.user.playerProfile!;
              return {
                address: m.user.walletAddress,
                playerName: m.user.name || 'Unknown',
                position: m.user.position || 'MF',
                skills: profile.attributes.map(a => ({
                  skill: a.attribute,
                  rating: a.rating,
                  history: a.history,
                  // other fields omitted for simplicity in simulation
                })),
                // other fields omitted
              } as PlayerAttributes;
            });

          return { players, tactics };
        };

        const [homeData, awayData] = await Promise.all([
          getSquadData(input.homeSquadId),
          getSquadData(input.awaySquadId)
        ]);

        const simulation = simulateMatch(homeData, awayData);
        const probabilities = calculateWinProbabilities(homeData, awayData);

        return {
          ...simulation,
          probability: probabilities,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Match simulation failed',
          cause: error,
        });
      }
    }),

  /**
   * Admin procedure to trigger consensus calculation for expired rating windows
   */
  triggerConsensus: adminProcedure
    .input(z.object({ matchId: matchIdSchema.optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { calculateConsensus } = await import('@/lib/match/peer-consensus');

        if (input.matchId) {
          return await calculateConsensus(ctx.prisma, input.matchId);
        }

        // Auto-discover expired windows
        const expiredMatches = await ctx.prisma.match.findMany({
          where: {
            peerRatingsClosed: false,
            peerRatingsCloseAt: { lte: new Date() },
            status: 'verified',
          },
          select: { id: true }
        });

        const results = [];
        for (const match of expiredMatches) {
          const res = await calculateConsensus(ctx.prisma, match.id);
          results.push({ matchId: match.id, ...res });
        }

        return { success: true, processed: results.length, results };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to trigger consensus',
          cause: error,
        });
      }
    }),
});
