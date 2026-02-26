import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

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
});
