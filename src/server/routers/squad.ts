import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { yellowService } from '../../../server/services/blockchain/yellow';
import {
  ensureSquadTreasury,
  postTreasuryLedgerEntry,
  TreasuryBalanceError,
} from '../../../server/services/economy/treasury-ledger';

const formationSchema = z.enum([
  '4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2',
  '4-5-1', '4-1-4-1', '3-4-3', '4-3-1-2', '5-4-1'
]);

const playStyleSchema = z.enum([
  'balanced', 'possession', 'direct', 'counter', 'high_press', 'low_block'
]);

const instructionsSchema = z.object({
  width: z.enum(['narrow', 'normal', 'wide']).optional(),
  tempo: z.enum(['slow', 'normal', 'fast']).optional(),
  passing: z.enum(['short', 'mixed', 'long']).optional(),
  pressing: z.enum(['low', 'medium', 'high']).optional(),
  defensiveLine: z.enum(['deep', 'normal', 'high']).optional(),
});

async function getSquadLeaderWallet(prisma: any, squadId: string) {
  const leader = await prisma.squadMember.findFirst({
    where: {
      squadId,
      role: { in: ['captain', 'vice_captain'] },
    },
    include: {
      user: {
        select: { walletAddress: true },
      },
    },
    orderBy: {
      joinedAt: 'asc',
    },
  });

  return leader?.user.walletAddress ?? null;
}

async function movePlayerToSquad(prisma: any, offer: { playerId: string; fromSquadId: string; toSquadId: string }) {
  const currentMembership = await prisma.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId: offer.toSquadId,
        userId: offer.playerId,
      },
    },
  });

  const destinationMembership = await prisma.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId: offer.fromSquadId,
        userId: offer.playerId,
      },
    },
  });

  await prisma.$transaction(async (tx: any) => {
    if (currentMembership) {
      await tx.squadMember.delete({
        where: {
          squadId_userId: {
            squadId: offer.toSquadId,
            userId: offer.playerId,
          },
        },
      });
    }

    if (!destinationMembership) {
      await tx.squadMember.create({
        data: {
          squadId: offer.fromSquadId,
          userId: offer.playerId,
          role: 'player',
        },
      });
    }
  });
}

async function expireTransferOffers(prisma: any, squadId?: string) {
  const now = new Date();
  const where: Record<string, unknown> = {
    status: 'pending',
    expiresAt: { lt: now },
  };

  if (squadId) {
    where.OR = [{ fromSquadId: squadId }, { toSquadId: squadId }];
  }

  const expiredOffers = await prisma.transferOffer.findMany({ where });

  for (const offer of expiredOffers) {
    const settlement = offer.yellowSessionId
      ? await yellowService.settleTransferEscrow({
          sessionId: offer.yellowSessionId,
          offerId: offer.id,
          amount: offer.amount,
          recipient: 'buyer',
        })
      : null;

    await prisma.transferOffer.update({
      where: { id: offer.id },
      data: { status: 'cancelled' },
    });

    await postTreasuryLedgerEntry({
      prisma,
      squadId: offer.fromSquadId,
      amountDelta: offer.amount,
      type: 'income',
      category: 'transfer_in',
      description: `Escrow refunded after offer expiry for player ${offer.playerId}`,
      txHash: settlement?.settlementId ?? null,
    });
  }
}

export const squadRouter = createTRPCRouter({
  // Create a new squad
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2, 'Squad name must be at least 2 characters'),
      shortName: z.string().min(2).max(5, 'Short name must be 2-5 characters'),
      homeGround: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if short name is taken
        const existing = await ctx.prisma.squad.findFirst({
          where: { shortName: input.shortName },
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Short name is already taken',
          });
        }

        const squad = await ctx.prisma.squad.create({
          data: {
            name: input.name,
            shortName: input.shortName,
            homeGround: input.homeGround,
            members: {
              create: {
                userId: ctx.userId!,
                role: 'captain',
              }
            }
          },
        });

        return squad;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create squad',
          cause: error,
        });
      }
    }),

  // List all squads
  list: publicProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { search, limit, offset } = input;

        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { shortName: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [squads, total] = await Promise.all([
          ctx.prisma.squad.findMany({
            where,
            include: {
              _count: { select: { members: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          ctx.prisma.squad.count({ where }),
        ]);

        return { squads, total, hasMore: offset + squads.length < total };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch squads',
          cause: error,
        });
      }
    }),

  // Get squad by ID with members
  getById: publicProcedure
    .input(z.object({ id: z.string().min(1, 'Squad ID is required') }))
    .query(async ({ ctx, input }) => {
      try {
        const squad = await ctx.prisma.squad.findUnique({
          where: { id: input.id },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    playerProfile: {
                      select: {
                        level: true,
                        totalMatches: true,
                        totalGoals: true,
                      }
                    }
                  }
                }
              },
              orderBy: [
                { role: 'asc' },
                { joinedAt: 'asc' }
              ]
            },
            matchesHome: {
              take: 5,
              orderBy: { matchDate: 'desc' },
              include: {
                awaySquad: { select: { shortName: true } },
              }
            },
            matchesAway: {
              take: 5,
              orderBy: { matchDate: 'desc' },
              include: {
                homeSquad: { select: { shortName: true } },
              }
            },
          },
        });

        if (!squad) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Squad not found',
          });
        }

        return squad;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch squad',
          cause: error,
        });
      }
    }),

  // Join a squad
  join: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if squad exists
        const squad = await ctx.prisma.squad.findUnique({
          where: { id: input.squadId },
        });

        if (!squad) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Squad not found',
          });
        }

        // Check if already a member
        const existing = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: {
              squadId: input.squadId,
              userId: ctx.userId!,
            }
          }
        });

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Already a member of this squad',
          });
        }

        const member = await ctx.prisma.squadMember.create({
          data: {
            squadId: input.squadId,
            userId: ctx.userId!,
            role: 'player',
          },
        });

        return member;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to join squad',
          cause: error,
        });
      }
    }),

  // Leave a squad
  leave: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if member exists
        const member = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: {
              squadId: input.squadId,
              userId: ctx.userId!,
            }
          }
        });

        if (!member) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Not a member of this squad',
          });
        }

        // Prevent captain from leaving without transferring ownership
        if (member.role === 'captain') {
          const otherMembers = await ctx.prisma.squadMember.count({
            where: { squadId: input.squadId, userId: { not: ctx.userId! } },
          });

          if (otherMembers > 0) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Transfer captaincy before leaving',
            });
          }
        }

        await ctx.prisma.squadMember.delete({
          where: {
            squadId_userId: {
              squadId: input.squadId,
              userId: ctx.userId!,
            }
          }
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to leave squad',
          cause: error,
        });
      }
    }),

  // Get user's squads
  getMySquads: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const memberships = await ctx.prisma.squadMember.findMany({
          where: { userId: ctx.userId! },
          include: {
            squad: {
              include: {
                _count: { select: { members: true } },
              }
            }
          },
          orderBy: { joinedAt: 'desc' },
        });

        return memberships;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch your squads',
          cause: error,
        });
      }
    }),

  // ============================================================================
  // TACTICS
  // ============================================================================

  // Get squad tactics
  getTactics: publicProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const tactics = await ctx.prisma.squadTactics.findUnique({
          where: { squadId: input.squadId },
        });

        // Return default tactics if none exist
        if (!tactics) {
          return {
            formation: '4-4-2',
            playStyle: 'balanced',
            instructions: {
              width: 'normal',
              tempo: 'normal',
              passing: 'mixed',
              pressing: 'medium',
              defensiveLine: 'normal',
            },
            setPieces: {
              corners: 'near_post',
              freeKicks: 'cross',
              penalties: '',
            },
          };
        }

        return {
          formation: tactics.formation,
          playStyle: tactics.playStyle,
          instructions: tactics.instructions,
          setPieces: tactics.setPieces,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch tactics',
          cause: error,
        });
      }
    }),

  // Save squad tactics (captain only)
  saveTactics: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
      formation: formationSchema,
      playStyle: playStyleSchema,
      instructions: instructionsSchema.optional(),
      setPieces: z.object({
        corners: z.string().optional(),
        freeKicks: z.string().optional(),
        penalties: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { squadId, ...tacticsData } = input;

        // Check if user is captain or vice_captain
        const member = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: {
              squadId,
              userId: ctx.userId!,
            },
          },
        });

        if (!member || (member.role !== 'captain' && member.role !== 'vice_captain')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captain or vice-captain can update tactics',
          });
        }

        // Upsert tactics
        const tactics = await ctx.prisma.squadTactics.upsert({
          where: { squadId },
          update: tacticsData,
          create: {
            squadId,
            ...tacticsData,
          },
        });

        return tactics;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save tactics',
          cause: error,
        });
      }
    }),

  // ============================================================================
  // TREASURY
  // ============================================================================

  // Get squad treasury
  getTreasury: publicProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const [treasury, yellowStatus] = await Promise.all([
          ctx.prisma.squadTreasury.findUnique({
            where: { squadId: input.squadId },
            include: {
              transactions: {
                orderBy: { createdAt: 'desc' },
                take: 20,
              },
            },
          }),
          Promise.resolve(yellowService.getRailStatus()),
        ]);

        return {
          balance: treasury?.balance ?? 0,
          budgets: treasury?.budgets ?? { wages: 0, transfers: 0, facilities: 0 },
          transactions: treasury?.transactions ?? [],
          paymentRail: {
            enabled: yellowStatus.enabled,
            mode: yellowStatus.mode,
            assetSymbol: yellowStatus.assetSymbol,
            sessionId: treasury?.yellowSessionId ?? null,
            settledBalance: treasury?.balance ?? 0,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch treasury',
          cause: error,
        });
      }
    }),

  // Deposit to treasury
  depositToTreasury: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
      amount: z.number().positive('Amount must be positive'),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { squadId, amount, description } = input;

        // Check membership
        const member = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: {
              squadId,
              userId: ctx.userId!,
            },
          },
        });

        if (!member) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Not a squad member',
          });
        }

        const treasury = await ensureSquadTreasury(ctx.prisma, squadId);
        const settlement = await yellowService.depositToTreasury({
          existingSessionId: treasury.yellowSessionId,
          squadId,
          walletAddress: ctx.walletAddress!,
          amount,
        });

        if (settlement.sessionId && settlement.sessionId !== treasury.yellowSessionId) {
          await ctx.prisma.squadTreasury.update({
            where: { id: treasury.id },
            data: { yellowSessionId: settlement.sessionId },
          });
        }

        return await postTreasuryLedgerEntry({
          prisma: ctx.prisma,
          squadId,
          amountDelta: amount,
          type: 'income',
          category: 'deposit',
          description: description || 'Treasury deposit via Yellow',
          txHash: settlement.settlementId,
        });
      } catch (error) {
        if (error instanceof TreasuryBalanceError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient treasury balance',
          });
        }
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to deposit to treasury',
          cause: error,
        });
      }
    }),

  // Withdraw from treasury
  withdrawFromTreasury: protectedProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
      amount: z.number().positive('Amount must be positive'),
      reason: z.string().min(1, 'Reason is required'),
      category: z.enum(['wages', 'transfers', 'facilities', 'other']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { squadId, amount, reason, category } = input;

        // Check if user is captain or vice_captain
        const member = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: {
              squadId,
              userId: ctx.userId!,
            },
          },
        });

        if (!member || (member.role !== 'captain' && member.role !== 'vice_captain')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captain or vice-captain can withdraw from treasury',
          });
        }

        // Get treasury
        const treasury = await ctx.prisma.squadTreasury.findUnique({
          where: { squadId },
        });

        if (!treasury) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Treasury not found',
          });
        }

        if (treasury.balance < amount) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient treasury balance',
          });
        }

        const settlement = await yellowService.withdrawFromTreasury({
          existingSessionId: treasury.yellowSessionId,
          squadId,
          walletAddress: ctx.walletAddress!,
          amount,
        });

        if (settlement.sessionId && settlement.sessionId !== treasury.yellowSessionId) {
          await ctx.prisma.squadTreasury.update({
            where: { id: treasury.id },
            data: { yellowSessionId: settlement.sessionId },
          });
        }

        return await postTreasuryLedgerEntry({
          prisma: ctx.prisma,
          squadId,
          amountDelta: -amount,
          type: 'expense',
          category,
          description: reason,
          txHash: settlement.settlementId,
        });
      } catch (error) {
        if (error instanceof TreasuryBalanceError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient treasury balance',
          });
        }
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to withdraw from treasury',
          cause: error,
        });
      }
    }),

  // ============================================================================
  // TRANSFER MARKET
  // ============================================================================

  // Get transfer offers for a squad
  getTransferOffers: publicProcedure
    .input(z.object({
      squadId: z.string().min(1, 'Squad ID is required'),
      type: z.enum(['incoming', 'outgoing']).default('incoming'),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { squadId, type } = input;
        await expireTransferOffers(ctx.prisma, squadId);

        const where = type === 'incoming'
          ? { toSquadId: squadId }
          : { fromSquadId: squadId };

        const offers = await ctx.prisma.transferOffer.findMany({
          where,
          include: {
            fromSquad: { select: { id: true, name: true, shortName: true } },
            toSquad: { select: { id: true, name: true, shortName: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        return offers;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch transfer offers',
          cause: error,
        });
      }
    }),

  // Create transfer offer
  createTransferOffer: protectedProcedure
    .input(z.object({
      toSquadId: z.string().min(1, 'Target squad ID is required'),
      playerId: z.string().min(1, 'Player ID is required'),
      offerType: z.enum(['permanent', 'loan']),
      amount: z.number().positive('Amount must be positive'),
      loanDuration: z.number().min(1).max(24).optional(),
      expiresAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { toSquadId } = input;

        // Get user's squad
        const fromMembership = await ctx.prisma.squadMember.findFirst({
          where: {
            userId: ctx.userId!,
          },
          orderBy: { joinedAt: 'desc' },
        });

        if (!fromMembership) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be in a squad to make transfer offers',
          });
        }

        if (fromMembership.role !== 'captain' && fromMembership.role !== 'vice_captain') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captain or vice-captain can make transfer offers',
          });
        }

        if (fromMembership.squadId === toSquadId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot create an offer for your own squad',
          });
        }

        // Check if player exists
        const player = await ctx.prisma.user.findUnique({
          where: { id: input.playerId },
        });

        if (!player) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player not found',
          });
        }

        const treasury = await ensureSquadTreasury(ctx.prisma, fromMembership.squadId);
        if (treasury.balance < input.amount) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient treasury balance to lock escrow',
          });
        }

        let offer = await ctx.prisma.transferOffer.create({
          data: {
            fromSquadId: fromMembership.squadId,
            toSquadId,
            playerId: input.playerId,
            offerType: input.offerType,
            amount: input.amount,
            loanDuration: input.loanDuration,
            expiresAt: input.expiresAt,
            status: 'pending',
          },
          include: {
            fromSquad: { select: { id: true, name: true, shortName: true } },
            toSquad: { select: { id: true, name: true, shortName: true } },
          },
        });

        const escrow = await yellowService.createTransferEscrow({
          offerId: offer.id,
          buyerAddress: ctx.walletAddress!,
          sellerAddress: await getSquadLeaderWallet(ctx.prisma, toSquadId),
          amount: input.amount,
        });

        if (escrow.sessionId) {
          offer = await ctx.prisma.transferOffer.update({
            where: { id: offer.id },
            data: { yellowSessionId: escrow.sessionId },
            include: {
              fromSquad: { select: { id: true, name: true, shortName: true } },
              toSquad: { select: { id: true, name: true, shortName: true } },
            },
          });
        }

        await postTreasuryLedgerEntry({
          prisma: ctx.prisma,
          squadId: fromMembership.squadId,
          amountDelta: -input.amount,
          type: 'expense',
          category: 'transfer_out',
          description: `Escrow locked for ${input.offerType} offer on player ${input.playerId}`,
          txHash: escrow.settlementId,
        });

        return offer;
      } catch (error) {
        if (error instanceof TreasuryBalanceError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient treasury balance to lock escrow',
          });
        }
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create transfer offer',
          cause: error,
        });
      }
    }),

  // Respond to transfer offer (accept/reject)
  respondToTransferOffer: protectedProcedure
    .input(z.object({
      offerId: z.string().min(1, 'Offer ID is required'),
      accept: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { offerId, accept } = input;
        await expireTransferOffers(ctx.prisma);

        // Get offer
        const offer = await ctx.prisma.transferOffer.findUnique({
          where: { id: offerId },
        });

        if (!offer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Offer not found',
          });
        }

        if (offer.status !== 'pending') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Only pending offers can be updated',
          });
        }

        // Check if user is in the target squad
        const member = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: {
              squadId: offer.toSquadId,
              userId: ctx.userId!,
            },
          },
        });

        if (!member || (member.role !== 'captain' && member.role !== 'vice_captain')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captain or vice-captain can respond to offers',
          });
        }

        const settlement = offer.yellowSessionId
          ? await yellowService.settleTransferEscrow({
              sessionId: offer.yellowSessionId,
              offerId,
              amount: offer.amount,
              recipient: accept ? 'seller' : 'buyer',
            })
          : null;

        const updatedOffer = await ctx.prisma.transferOffer.update({
          where: { id: offerId },
          data: {
            status: accept ? 'accepted' : 'rejected',
          },
          include: {
            fromSquad: { select: { id: true, name: true, shortName: true } },
            toSquad: { select: { id: true, name: true, shortName: true } },
          },
        });

        if (accept) {
          await postTreasuryLedgerEntry({
            prisma: ctx.prisma,
            squadId: offer.toSquadId,
            amountDelta: offer.amount,
            type: 'income',
            category: 'transfer_in',
            description: `Transfer settled for player ${offer.playerId}`,
            txHash: settlement?.settlementId ?? null,
          });
          await movePlayerToSquad(ctx.prisma, offer);
        } else {
          await postTreasuryLedgerEntry({
            prisma: ctx.prisma,
            squadId: offer.fromSquadId,
            amountDelta: offer.amount,
            type: 'income',
            category: 'transfer_in',
            description: `Escrow refunded for player ${offer.playerId}`,
            txHash: settlement?.settlementId ?? null,
          });
        }

        return updatedOffer;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to respond to transfer offer',
          cause: error,
        });
      }
    }),

  // Cancel transfer offer
  cancelTransferOffer: protectedProcedure
    .input(z.object({
      offerId: z.string().min(1, 'Offer ID is required'),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { offerId } = input;
        await expireTransferOffers(ctx.prisma);

        // Get offer
        const offer = await ctx.prisma.transferOffer.findUnique({
          where: { id: offerId },
        });

        if (!offer) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Offer not found',
          });
        }

        if (offer.status !== 'pending') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Only pending offers can be cancelled',
          });
        }

        // Check if user is in the from squad
        const member = await ctx.prisma.squadMember.findUnique({
          where: {
            squadId_userId: {
              squadId: offer.fromSquadId,
              userId: ctx.userId!,
            },
          },
        });

        if (!member || (member.role !== 'captain' && member.role !== 'vice_captain')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captain or vice-captain can cancel offers',
          });
        }

        const settlement = offer.yellowSessionId
          ? await yellowService.settleTransferEscrow({
              sessionId: offer.yellowSessionId,
              offerId,
              amount: offer.amount,
              recipient: 'buyer',
            })
          : null;

        await ctx.prisma.transferOffer.update({
          where: { id: offerId },
          data: { status: 'cancelled' },
        });

        await postTreasuryLedgerEntry({
          prisma: ctx.prisma,
          squadId: offer.fromSquadId,
          amountDelta: offer.amount,
          type: 'income',
          category: 'transfer_in',
          description: `Escrow refunded after cancellation for player ${offer.playerId}`,
          txHash: settlement?.settlementId ?? null,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel transfer offer',
          cause: error,
        });
      }
    }),

  // Get nearby squads for matchmaking/discovery
  getNearbySquads: publicProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
      radiusKm: z.number().default(10),
      limit: z.number().min(1).max(50).default(5),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const { latitude, longitude, radiusKm, limit } = input;

        // Fetch squads that have recent matches with coordinates
        // In a production app, squads would have a primary homeGround location
        // For now, we'll derive it from their recent matches or mock it
        const squads = await ctx.prisma.squad.findMany({
          include: {
            matchesHome: {
              where: { latitude: { not: null }, longitude: { not: null } },
              take: 1,
              orderBy: { createdAt: 'desc' }
            },
            _count: { select: { members: true } }
          },
          take: 50, // Get a pool to filter from
        });

        const nearbySquads = squads
          .map(squad => {
            // Use match location or fallback to a slightly offset location for demo variety
            const squadLat = squad.matchesHome[0]?.latitude || latitude + (Math.random() - 0.5) * 0.1;
            const squadLon = squad.matchesHome[0]?.longitude || longitude + (Math.random() - 0.5) * 0.1;

            // Haversine formula for distance
            const R = 6371; // Earth radius in km
            const dLat = (squadLat - latitude) * Math.PI / 180;
            const dLon = (squadLon - longitude) * Math.PI / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(latitude * Math.PI / 180) * Math.cos(squadLat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            return {
              id: squad.id,
              name: squad.name,
              shortName: squad.shortName,
              memberCount: squad._count.members,
              distance: Math.round(distance * 10) / 10,
              location: squad.homeGround || 'Local Field',
            };
          })
          .filter(squad => squad.distance <= radiusKm)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, limit);

        return nearbySquads;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch nearby squads',
          cause: error,
        });
      }
    }),

  // Create a match challenge
  createChallenge: protectedProcedure
    .input(z.object({
      toSquadId: z.string().min(1),
      proposedDate: z.date(),
      pitchId: z.string().optional(),
      message: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { toSquadId, proposedDate, pitchId, message } = input;

        // Get user's squad (must be captain)
        const member = await ctx.prisma.squadMember.findFirst({
          where: { userId: ctx.userId!, role: 'captain' },
        });

        if (!member) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only captains can issue challenges',
          });
        }

        const challenge = await ctx.prisma.matchChallenge.create({
          data: {
            fromSquadId: member.squadId,
            toSquadId,
            proposedDate,
            pitchId,
            message,
            status: 'pending',
          },
        });

        return challenge;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create challenge',
          cause: error,
        });
      }
    }),

  // Respond to a challenge (triggers a proposal for the squad to vote on)
  respondToChallenge: protectedProcedure
    .input(z.object({
      challengeId: z.string().min(1),
      action: z.enum(['accept', 'reject']),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { challengeId, action } = input;

        const challenge = await ctx.prisma.matchChallenge.findUnique({
          where: { id: challengeId },
          include: { fromSquad: true, toSquad: true },
        });

        if (!challenge) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Challenge not found' });
        }

        // Must be a member of the target squad
        const member = await ctx.prisma.squadMember.findFirst({
          where: { userId: ctx.userId!, squadId: challenge.toSquadId },
        });

        if (!member) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Only squad members can respond' });
        }

        if (action === 'reject') {
          return await ctx.prisma.matchChallenge.update({
            where: { id: challengeId },
            data: { status: 'rejected' },
          });
        }

        // If action is 'accept', we don't accept yet - we should initiate a DAO vote
        // TODO: Bridge to On-Chain Governor instead of legacy PrismaProposal
        /*
        const proposal = await ctx.prisma.squadProposal.create({
          data: {
            squadId: challenge.toSquadId,
            creatorId: ctx.userId!,
            title: `Accept match vs ${challenge.fromSquad.name}?`,
            description: `Proposed for ${challenge.proposedDate.toISOString().split('T')[0]}. Message: ${challenge.message || 'None'}`,
            type: 'match_challenge',
            referenceId: challengeId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h to vote
            status: 'active',
          },
        });
        */

        // Temporary: accept challenge directly until on-chain bridge is complete
        return await ctx.prisma.matchChallenge.update({
          where: { id: challengeId },
          data: { status: 'accepted' },
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to respond to challenge',
          cause: error,
        });
      }
    }),

  // Get active proposals for a squad (LEGACY - Migration to On-Chain)
  getProposals: publicProcedure
    .input(z.object({ squadId: z.string().min(1) }))
    .query(async () => {
      // Returning empty for now until on-chain indexer/governor bridge is active
      return [];
    }),

  // Vote on a proposal (LEGACY - DEPRECATED)
  voteOnProposal: protectedProcedure
    .input(z.object({
      proposalId: z.string().min(1),
      vote: z.enum(['yes', 'no', 'abstain']),
    }))
    .mutation(async () => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Legacy voting deprecated. Use On-Chain Governor.'
      });
    }),

  // Finalize/Execute a proposal (LEGACY - DEPRECATED)
  executeProposal: protectedProcedure
    .input(z.object({ proposalId: z.string().min(1) }))
    .mutation(async () => {
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Legacy execution deprecated. Use On-Chain Timelock.'
      });
    }),

  // Get territory control data
  getTerritory: publicProcedure
    .input(z.object({ squadId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      try {
        const { squadId } = input;

        // Get all pitches
        const pitches = await ctx.prisma.pitch.findMany();

        // For each pitch, count verified wins for this squad vs others
        // (Simplified for MVP: just show control status)
        const territory = await Promise.all(pitches.map(async (pitch) => {
          const wins = await ctx.prisma.match.count({
            where: {
              pitchId: pitch.id,
              status: 'verified',
              OR: [
                { homeSquadId: squadId, homeScore: { gt: ctx.prisma.match.fields.awayScore } },
                { awaySquadId: squadId, awayScore: { gt: ctx.prisma.match.fields.homeScore } },
              ]
            }
          });

          const totalMatches = await ctx.prisma.match.count({
            where: { pitchId: pitch.id, status: 'verified' }
          });

          return {
            ...pitch,
            squadWins: wins,
            totalMatches,
            isControlling: pitch.controllingSquadId === squadId,
            dominance: totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0
          };
        }));

        return territory;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch territory data',
          cause: error,
        });
      }
    }),
});
