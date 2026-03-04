import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

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
        const treasury = await ctx.prisma.squadTreasury.findUnique({
          where: { squadId: input.squadId },
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 20,
            },
          },
        });

        // Return default treasury if none exists
        if (!treasury) {
          return {
            balance: 0,
            budgets: { wages: 0, transfers: 0, facilities: 0 },
            transactions: [],
          };
        }

        return {
          balance: treasury.balance,
          budgets: treasury.budgets,
          transactions: treasury.transactions,
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

        // Get or create treasury
        let treasury = await ctx.prisma.squadTreasury.findUnique({
          where: { squadId },
        });

        if (!treasury) {
          treasury = await ctx.prisma.squadTreasury.create({
            data: {
              squadId,
              balance: 0,
              budgets: { wages: 0, transfers: 0, facilities: 0 },
            },
          });
        }

        // Update balance and create transaction
        const [updatedTreasury, transaction] = await ctx.prisma.$transaction([
          ctx.prisma.squadTreasury.update({
            where: { id: treasury.id },
            data: { balance: { increment: amount } },
          }),
          ctx.prisma.treasuryTransaction.create({
            data: {
              treasuryId: treasury.id,
              type: 'income',
              category: 'deposit',
              amount,
              description: description || 'Treasury deposit',
              verified: true,
            },
          }),
        ]);

        return { treasury: updatedTreasury, transaction };
      } catch (error) {
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

        // Update balance and create transaction
        const [updatedTreasury, transaction] = await ctx.prisma.$transaction([
          ctx.prisma.squadTreasury.update({
            where: { id: treasury.id },
            data: { balance: { increment: -amount } },
          }),
          ctx.prisma.treasuryTransaction.create({
            data: {
              treasuryId: treasury.id,
              type: 'expense',
              category,
              amount,
              description: reason,
              verified: true,
            },
          }),
        ]);

        return { treasury: updatedTreasury, transaction };
      } catch (error) {
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
        const { toSquadId, ...offerData } = input;

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

        const offer = await ctx.prisma.transferOffer.create({
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

        return offer;
      } catch (error) {
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

        const updatedOffer = await ctx.prisma.transferOffer.update({
          where: { id: offerId },
          data: {
            status: accept ? 'accepted' : 'rejected',
          },
        });

        // If accepted, create treasury transaction for payment
        if (accept) {
          // Get or create treasury
          let treasury = await ctx.prisma.squadTreasury.findUnique({
            where: { squadId: offer.toSquadId },
          });

          if (!treasury) {
            treasury = await ctx.prisma.squadTreasury.create({
              data: {
                squadId: offer.toSquadId,
                balance: 0,
              },
            });
          }

          // Deduct from treasury
          await ctx.prisma.squadTreasury.update({
            where: { id: treasury.id },
            data: { balance: { increment: -offer.amount } },
          });

          // Create transaction record
          await ctx.prisma.treasuryTransaction.create({
            data: {
              treasuryId: treasury.id,
              type: 'expense',
              category: 'transfer_out',
              amount: offer.amount,
              description: `Transfer: ${offer.offerType} for player ${offer.playerId}`,
              verified: true,
            },
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

        await ctx.prisma.transferOffer.update({
          where: { id: offerId },
          data: { status: 'cancelled' },
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
});
