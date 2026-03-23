import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import algosdk from 'algosdk';
import { isAddress, type Address } from 'viem';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { chainlinkService } from '../../../server/services/blockchain/chainlink';
import { yellowService } from '../../../server/services/blockchain/yellow';
import { finalizeMatchFeeSettlement } from '../../../server/services/blockchain/yellow-recovery';
import { createPendingMatchSubmission } from '../../../server/services/match-submission';
import { postTreasuryLedgerEntryOnce, distributeMatchRewards } from '../../../server/services/economy/treasury-ledger';
import { getSquadMembership, isSquadLeader } from '../services/permissions';
import { simulateMatch, calculateWinProbabilities } from '../../lib/match/simulation-engine';
import { Tactics, PlayerAttributes } from '@/types';

const MatchStatus = z.enum(['pending', 'verified', 'disputed', 'finalized']);

// Custom error messages
const Errors = {
  MATCH_NOT_FOUND: { code: 'NOT_FOUND' as const, message: 'Match not found' },
  SQUAD_NOT_FOUND: { code: 'NOT_FOUND' as const, message: 'Squad not found' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED' as const, message: 'Not authorized' },
  ALREADY_VERIFIED: { code: 'CONFLICT' as const, message: 'Already verified this match' },
  INVALID_SCORE: { code: 'BAD_REQUEST' as const, message: 'Invalid score provided' },
};

const yellowMatchSettlementSchema = z.object({
  sessionId: z.string().min(1, 'Yellow session ID is required'),
  version: z.number().int().nonnegative('Yellow version must be non-negative'),
  settlementId: z.string().min(1).optional(),
});

async function getMatchParticipantCandidates(prisma: any, homeSquadId: string, awaySquadId: string) {
  const members = await prisma.squadMember.findMany({
    where: {
      squadId: { in: [homeSquadId, awaySquadId] },
      role: { in: ['captain', 'vice_captain'] },
    },
    include: {
      user: {
        select: { walletAddress: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  const participants = new Map<string, Address>();
  for (const member of members) {
    const walletAddress = member.user?.walletAddress;
    if (!walletAddress || !isAddress(walletAddress)) {
      continue;
    }

    participants.set(walletAddress.toLowerCase(), walletAddress as Address);
  }

  const platformWallet = process.env.NEXT_PUBLIC_YELLOW_PLATFORM_WALLET;
  if (platformWallet && isAddress(platformWallet)) {
    participants.set(platformWallet.toLowerCase(), platformWallet as Address);
  }

  return Array.from(participants.values());
}

async function settleMatchFee(
  prisma: any,
  match: any,
  status: 'verified' | 'disputed',
  settlement?: { sessionId: string; version: number; settlementId: string },
) {
  if (!match.yellowFeeSessionId || match.yellowFeeSettledAt) {
    return null;
  }

  if (!settlement) {
    return null;
  }

  await finalizeMatchFeeSettlement(prisma, match, status, settlement);
  return settlement;
}

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
      yellowSettlement: yellowMatchSettlementSchema.optional(),
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

        const match = await createPendingMatchSubmission({
          prisma: ctx.prisma,
          homeSquadId: input.homeSquadId,
          awaySquadId: input.awaySquadId,
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          matchDate: input.matchDate,
          submittedBy: ctx.userId!,
          latitude: input.latitude,
          longitude: input.longitude,
          weatherVerified,
          locationVerified,
          verificationDetails: (input as any).verificationDetails || null,
          agentInsights: (input as any).agentInsights || null,
        });

        const matchFeeAmount = yellowService.getMatchFeeAmount();
        if (yellowService.isEnabled() && matchFeeAmount > 0 && input.yellowSettlement) {
          try {
            const [homeTreasury, awayTreasury] = await Promise.all([
              ctx.prisma.squadTreasury.findUnique({ where: { squadId: input.homeSquadId } }),
              ctx.prisma.squadTreasury.findUnique({ where: { squadId: input.awaySquadId } }),
            ]);

            const homeHasFunds = (homeTreasury?.balance ?? 0) >= matchFeeAmount;
            const awayHasFunds = (awayTreasury?.balance ?? 0) >= matchFeeAmount;

            if (homeHasFunds && awayHasFunds) {
              const matchParticipants = await getMatchParticipantCandidates(
                ctx.prisma,
                input.homeSquadId,
                input.awaySquadId,
              );
              const feeSession = await yellowService.verifyClientSettlement({
                settlement: input.yellowSettlement,
                participantCandidates: matchParticipants,
                applicationPrefixes: ['sportwarren-match-fee-'],
                expectedParticipants: matchParticipants,
                expectedSessionData: {
                  homeSquadId: input.homeSquadId,
                  awaySquadId: input.awaySquadId,
                },
              });

              if (feeSession.sessionId) {
                await ctx.prisma.match.update({
                  where: { id: match.id },
                  data: { yellowFeeSessionId: feeSession.sessionId },
                });

                await postTreasuryLedgerEntryOnce({
                  prisma: ctx.prisma,
                  squadId: input.homeSquadId,
                  amountDelta: -matchFeeAmount,
                  type: 'expense',
                  category: 'match_fee',
                  description: `Match fee locked for match ${match.id}`,
                  txHash: feeSession.settlementId,
                });

                await postTreasuryLedgerEntryOnce({
                  prisma: ctx.prisma,
                  squadId: input.awaySquadId,
                  amountDelta: -matchFeeAmount,
                  type: 'expense',
                  category: 'match_fee',
                  description: `Match fee locked for match ${match.id}`,
                  txHash: feeSession.settlementId,
                });

                (match as any).yellowFeeSessionId = feeSession.sessionId;
              }
            }
          } catch (yellowError) {
            console.error('Yellow match fee session setup failed:', yellowError);
          }
        }

        // Return with CRE result if we have it
        return {
          ...match,
          creResult: (match as any).verificationDetails,
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
      yellowSettlement: yellowMatchSettlementSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { matchId, verified, homeScore, awayScore, yellowSettlement } = input;

        // Check if match exists
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

        if (match.submittedBy === ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Match submitters cannot verify their own result',
          });
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

        // Self-verified matches (has shareSlug) need only 2 verifications total
        // Non-self-verified matches need 3
        const requiredVerifications = match.shareSlug ? 2 : 3;

        let newStatus = updatedMatch.status;
        if (verifiedCount >= requiredVerifications) {
          newStatus = 'verified';
        } else if (disputedCount >= 2) {
          newStatus = 'disputed';
        }

        if (newStatus !== updatedMatch.status) {
          let txId = null;
          const matchParticipants = await getMatchParticipantCandidates(
            ctx.prisma,
            updatedMatch.homeSquadId,
            updatedMatch.awaySquadId,
          );
          const verifiedSettlement = yellowSettlement && updatedMatch.yellowFeeSessionId
            ? await yellowService.verifyClientSettlement({
                settlement: yellowSettlement,
                participantCandidates: matchParticipants,
                expectedSessionId: updatedMatch.yellowFeeSessionId,
                applicationPrefixes: ['sportwarren-match-fee-'],
                expectedParticipants: matchParticipants,
                expectedSessionData: {
                  matchId,
                  status: newStatus,
                },
              })
            : null;

          // If match is now verified, post to Algorand
          if (newStatus === 'verified') {
            try {
              const { algodClient, deployerAccount } = await import('../../../server/services/blockchain/algorand');
              const appId = parseInt(process.env.ALGORAND_MATCH_VERIFICATION_APP_ID || '0');

              if (appId > 0 && deployerAccount) {
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

        if (newStatus === 'verified' || newStatus === 'disputed') {
          try {
            if (verifiedSettlement) {
              await settleMatchFee(ctx.prisma, updatedMatch, newStatus, verifiedSettlement);
            } else if (updatedMatch.yellowFeeSessionId && !updatedMatch.yellowFeeSettledAt) {
              console.warn('Yellow fee session remains unsettled until the client submits a signed settlement.');
            }

              // AUTOMATED DAO REWARDS: Trigger prize and bonus payouts for both squads
              if (newStatus === 'verified') {
                const homeFinalScore = homeScore ?? updatedMatch.homeScore ?? 0;
                const awayFinalScore = awayScore ?? updatedMatch.awayScore ?? 0;
                const isDraw = homeFinalScore === awayFinalScore;

                // Process Home Squad
                await distributeMatchRewards({
                  prisma: ctx.prisma,
                  squadId: updatedMatch.homeSquadId,
                  matchId: updatedMatch.id,
                  isWinner: homeFinalScore > awayFinalScore,
                  isDraw,
                  playerStats: [], // Would fetch from playerStats table in full impl
                });

                // Process Away Squad
                await distributeMatchRewards({
                  prisma: ctx.prisma,
                  squadId: updatedMatch.awaySquadId,
                  matchId: updatedMatch.id,
                  isWinner: awayFinalScore > homeFinalScore,
                  isDraw,
                  playerStats: [],
                });
              }
            } catch (yellowError) {
              console.error('Failed to settle Yellow match fee or distribute rewards:', yellowError);
            }
          }
        }

        return {
          success: true,
          newStatus,
          requiresYellowSettlement:
            (newStatus === 'verified' || newStatus === 'disputed') &&
            Boolean(updatedMatch.yellowFeeSessionId) &&
            !updatedMatch.yellowFeeSettledAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to verify match',
          cause: error,
        });
      }
    }),

  settleFeeSession: protectedProcedure
    .input(z.object({
      matchId: z.string().min(1, 'Match ID is required'),
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
    .input(z.object({
      matchId: z.string().min(1, 'Match ID is required')
    }))
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
          const { algorandService } = await import('../../../server/services/blockchain/algorand');

          // Determine who won to issue different reputation gains
          const homeScore = match.homeScore || 0;
          const awayScore = match.awayScore || 0;

          const homeWon = homeScore > awayScore;
          const awayWon = awayScore > homeScore;

          const processTeam = async (members: any[], isWinner: boolean, isDraw: boolean) => {
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
          agentInsights: (match as any).agentInsights,
          paymentRail: {
            enabled: !!match.yellowFeeSessionId,
            assetSymbol: yellowService.getRailStatus().assetSymbol,
            sessionId: match.yellowFeeSessionId,
            feeAmount: yellowService.getMatchFeeAmount(),
          },
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
    .input(z.object({ squadId: z.string().min(1, 'Squad ID is required') }))
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
          const { getVeniceClient, VENICE_MODEL_ID } = await import('../../lib/ai/venice');
          const client = getVeniceClient();

          const response = await client.chat.completions.create({
            model: VENICE_MODEL_ID,
            messages: [
              {
                role: 'system',
                content: `You are Coach Kite analyzing the team's form. Provide a concise tactical summary of the last 5 matches. Keep it under 3 sentences. Be analytical, firm, but encouraging.`
              },
              {
                role: 'user',
                content: `Here are our last ${matches.length} results: ${matchSummaries.join(', ')}. What's your tactical "Captain's Log" analysis?`
              }
            ],
            temperature: 0.7,
            max_tokens: 150,
          });

          return {
            summary: response.choices[0]?.message?.content || "Keep focusing on the fundamentals. The results will come.",
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
      homeSquadId: z.string().min(1, 'Home squad is required'),
      awaySquadId: z.string().min(1, 'Away squad is required'),
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
            formation: (squad.tactics?.formation as any) || '4-4-2',
            style: (squad.tactics?.playStyle as any) || 'balanced',
            instructions: (squad.tactics?.instructions as any) || {
              width: 'normal',
              tempo: 'normal',
              passing: 'mixed',
              pressing: 'medium',
              defensiveLine: 'normal'
            },
            setPieces: (squad.tactics?.setPieces as any) || {
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
                position: (m.user.position as any) || 'MF',
                skills: profile.attributes.map(a => ({
                  skill: a.attribute as any,
                  rating: a.rating,
                  history: a.history,
                  // other fields omitted for simplicity in simulation
                } as any)),
                // other fields omitted
              } as any;
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
});
