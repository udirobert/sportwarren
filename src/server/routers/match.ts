import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import algosdk from 'algosdk';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { chainlinkService } from '../../../server/services/blockchain/chainlink';

const MatchStatus = z.enum(['pending', 'verified', 'disputed', 'finalized']);

// Custom error messages
const Errors = {
  MATCH_NOT_FOUND: { code: 'NOT_FOUND' as const, message: 'Match not found' },
  SQUAD_NOT_FOUND: { code: 'NOT_FOUND' as const, message: 'Squad not found' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED' as const, message: 'Not authorized' },
  ALREADY_VERIFIED: { code: 'CONFLICT' as const, message: 'Already verified this match' },
  INVALID_SCORE: { code: 'BAD_REQUEST' as const, message: 'Invalid score provided' },
};

export const matchRouter = createTRPCRouter({
  // Submit a new match result
  submit: protectedProcedure
    .input(z.object({
      homeSquadId: z.string().min(1, 'Home squad is required'),
      awaySquadId: z.string().min(1, 'Away squad is required'),
      homeScore: z.number().min(0, 'Score cannot be negative'),
      awayScore: z.number().min(0, 'Score cannot be negative'),
      matchDate: z.date().default(() => new Date()),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate squads exist
        const [homeSquad, awaySquad] = await Promise.all([
          ctx.prisma.squad.findUnique({ where: { id: input.homeSquadId } }),
          ctx.prisma.squad.findUnique({ where: { id: input.awaySquadId } }),
        ]);

        if (!homeSquad) {
          throw new TRPCError(Errors.SQUAD_NOT_FOUND);
        }
        if (!awaySquad) {
          throw new TRPCError({ ...Errors.SQUAD_NOT_FOUND, message: 'Away squad not found' });
        }
        if (input.homeSquadId === input.awaySquadId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Home and away squads must be different',
          });
        }

        let weatherVerified = false;
        let locationVerified = false;

        // Perform Chainlink Verification if coordinates are provided
        if (input.latitude !== undefined && input.longitude !== undefined) {
          try {
            const verificationResult = await chainlinkService.verifyMatch({
              latitude: input.latitude,
              longitude: input.longitude,
              timestamp: Math.floor(input.matchDate.getTime() / 1000),
              homeTeam: homeSquad.name,
              awayTeam: awaySquad.name,
            });

            weatherVerified = verificationResult.weatherVerified;
            locationVerified = verificationResult.locationVerified;
            (input as any).verificationDetails = verificationResult.details;

            // Trigger Agentic Narrative Insight
            try {
              const { agenticService } = await import('../../../server/services/ai/agentic');
              (input as any).agentInsights = await agenticService.generateMatchReport(
                { homeSquad, awaySquad, homeScore: input.homeScore, awayScore: input.awayScore },
                verificationResult.details
              );
            } catch (aiError) {
              console.warn('Agentic insight generation failed:', aiError);
            }
          } catch (e) {
            console.error('Chainlink verification failed during match submission:', e);
            // We don't fail the match submission if oracle fails, just log it.
          }
        }

        const match = await ctx.prisma.match.create({
          data: {
            homeSquadId: input.homeSquadId,
            awaySquadId: input.awaySquadId,
            homeScore: input.homeScore,
            awayScore: input.awayScore,
            matchDate: input.matchDate,
            submittedBy: ctx.userId!,
            status: 'pending',
            latitude: input.latitude,
            longitude: input.longitude,
            weatherVerified,
            locationVerified,
            verificationDetails: (input as any).verificationDetails || null,
            agentInsights: (input as any).agentInsights || null,
          } as any,
          include: {
            homeSquad: true,
            awaySquad: true,
          },
        });

        // Return with CRE result if we have it
        return {
          ...match,
          creResult: (match as any).verificationDetails
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit match',
          cause: error,
        });
      }
    }),

  // Verify a match result
  verify: protectedProcedure
    .input(z.object({
      matchId: z.string().min(1, 'Match ID is required'),
      verified: z.boolean(),
      homeScore: z.number().min(0).optional(),
      awayScore: z.number().min(0).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { matchId, verified, homeScore, awayScore } = input;

        // Check if match exists
        const match = await ctx.prisma.match.findUnique({
          where: { id: matchId },
          include: { verifications: true },
        });

        if (!match) {
          throw new TRPCError(Errors.MATCH_NOT_FOUND);
        }

        // Check if already verified by this user
        const existingVerification = match.verifications.find(
          v => v.verifierId === ctx.userId
        );
        if (existingVerification) {
          throw new TRPCError(Errors.ALREADY_VERIFIED);
        }

        // Check if match is already finalized
        if (match.status === 'finalized') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Match is already finalized',
          });
        }

        // Create verification record
        await ctx.prisma.matchVerification.create({
          data: {
            matchId,
            verifierId: ctx.userId!,
            verified,
            homeScore,
            awayScore,
            trustTier: 'gold', // TODO: Calculate from reputation
          },
        });

        // Check consensus
        const updatedMatch = await ctx.prisma.match.findUnique({
          where: { id: matchId },
          include: { verifications: true },
        });

        if (!updatedMatch) {
          throw new TRPCError(Errors.MATCH_NOT_FOUND);
        }

        const verifiedCount = updatedMatch.verifications.filter(v => v.verified).length;
        const disputedCount = updatedMatch.verifications.filter(v => !v.verified).length;

        let newStatus = updatedMatch.status;
        if (verifiedCount >= 3) {
          newStatus = 'verified';
        } else if (disputedCount >= 2) {
          newStatus = 'disputed';
        }

        if (newStatus !== updatedMatch.status) {
          let txId = null;

          // If match is now verified, post to Algorand
          if (newStatus === 'verified') {
            try {
              const { algodClient, deployerAccount } = await import('../../../server/services/blockchain/algorand');
              const appId = parseInt(process.env.ALGORAND_MATCH_VERIFICATION_APP_ID || '0');

              if (appId > 0) {
                const params = await algodClient.getTransactionParams().do();
                const encoder = new TextEncoder();

                // Op: verify_match, Args: [match_id, type (1=confirm), weight]
                const appArgs = [
                  encoder.encode('verify_match'),
                  algosdk.encodeUint64(parseInt(matchId.replace(/\D/g, '').slice(0, 10)) || 1),
                  algosdk.encodeUint64(1),
                  algosdk.encodeUint64(100),
                ];

                const txn = algosdk.makeApplicationNoOpTxnFromObject({
                  sender: deployerAccount.addr.toString(),
                  suggestedParams: params,
                  appIndex: appId,
                  appArgs,
                });

                const signedTxn = txn.signTxn(deployerAccount.sk);
                const { txid: submittedTxId } = await algodClient.sendRawTransaction(signedTxn).do();
                txId = submittedTxId;
                console.log(`Match ${matchId} verified on-chain! Tx: ${txId}`);
              }
            } catch (algoError) {
              console.error('Failed to post verification to Algorand:', algoError);
            }
          }

          await ctx.prisma.match.update({
            where: { id: matchId },
            data: {
              status: newStatus,
              txId: txId || undefined
            },
          });
        }

        return { success: true, newStatus };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify match',
          cause: error,
        });
      }
    }),

  // List matches with filtering
  list: publicProcedure
    .input(z.object({
      status: MatchStatus.optional(),
      squadId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { status, squadId, limit, offset } = input;

        const where: any = {};
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
    .input(z.object({ id: z.string().min(1, 'Match ID is required') }))
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

        return {
          ...match,
          creResult,
          agentInsights: (match as any).agentInsights
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch match',
          cause: error,
        });
      }
    }),
});
