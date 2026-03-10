import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { MOCK_AVAILABLE_PLAYERS } from '../../lib/mocks/players';
import { calculatePlayerValue } from '../../lib/player/valuation-engine';
import { PlayerAttributes } from '@/types';

export const marketRouter = createTRPCRouter({
    // Get a data-driven valuation for any player
    getPlayerValuation: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const profile = await ctx.prisma.playerProfile.findUnique({
                where: { userId: input.userId },
                include: { 
                    attributes: true,
                    user: { select: { name: true, position: true, walletAddress: true } }
                }
            });

            if (!profile) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Player profile not found' });
            }

            // Map DB profile to PlayerAttributes type
            const playerAttrs: PlayerAttributes = {
                address: profile.user.walletAddress,
                playerName: profile.user.name || 'Unknown',
                position: (profile.user.position as any) || 'MF',
                skills: profile.attributes.map(a => ({
                    skill: a.attribute as any,
                    rating: a.rating,
                    history: a.history,
                } as any)),
                form: {
                    current: 0,
                    history: [], // Would fetch from formHistory in a full impl
                    trend: 'stable'
                },
                xp: {
                    level: profile.level,
                    totalXP: profile.totalXP,
                    seasonXP: profile.seasonXP,
                    nextLevelXP: 0
                }
            } as any;

            // Check for "Interest" (how many active transfer offers for this player)
            const interestCount = await ctx.prisma.transferOffer.count({
                where: { playerId: input.userId, status: 'pending' }
            });

            return calculatePlayerValue(playerAttrs, interestCount);
        }),

    listProspects: publicProcedure
        .query(() => {
            // Return prospects that are eligible for drafting
            return MOCK_AVAILABLE_PLAYERS.filter(p => p.isDraftEligible);
        }),

    signProspect: protectedProcedure
        .input(z.object({
            playerId: z.string(),
            squadId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const { playerId } = input;
            let { squadId } = input;

            // Find user's squad if not provided
            if (!squadId) {
                const membership = await ctx.prisma.squadMember.findFirst({
                    where: { userId: ctx.userId! },
                    orderBy: { joinedAt: 'desc' },
                });

                if (!membership) {
                    throw new TRPCError({
                        code: 'FORBIDDEN',
                        message: 'You must be in a squad to sign prospects'
                    });
                }
                squadId = membership.squadId;
            }

            // Check if squad exists
            const squad = await ctx.prisma.squad.findUnique({
                where: { id: squadId },
            });

            if (!squad) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Squad not found' });
            }

            // For the demo: verify if player is in our catalog
            const mockData = MOCK_AVAILABLE_PLAYERS.find(p => p.id === playerId);
            if (!mockData) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'Prospect not found in scouting network' });
            }

            // Check if player user record exists in DB
            let player = await ctx.prisma.user.findUnique({
                where: { id: playerId },
            });

            if (!player) {
                // Create a persistent user/profile for this prospect in the DB
                player = await ctx.prisma.user.create({
                    data: {
                        id: playerId,
                        walletAddress: `0x${playerId.toUpperCase()}_SCOUTED`,
                        chain: 'lens',
                        name: mockData.name,
                        position: mockData.position,
                        playerProfile: {
                            create: {
                                level: Math.floor(mockData.overall / 10),
                                totalXP: mockData.overall * 100,
                                reputationScore: mockData.reputationScore,
                            }
                        }
                    }
                });
            }

            // Check if already in this squad
            const existing = await ctx.prisma.squadMember.findUnique({
                where: {
                    squadId_userId: {
                        squadId,
                        userId: player.id,
                    }
                }
            });

            if (existing) {
                throw new TRPCError({ code: 'CONFLICT', message: 'Player is already signed to your squad' });
            }

            // 1. Add to squad members
            const member = await ctx.prisma.squadMember.create({
                data: {
                    squadId,
                    userId: player.id,
                    role: 'player',
                },
            });

            // 2. Handle Treasury impact
            if (mockData.askingPrice > 0) {
                // Update squad balance
                await ctx.prisma.squad.update({
                    where: { id: squadId },
                    data: {
                        treasuryBalance: { decrement: mockData.askingPrice }
                    }
                });

                // Record as transaction if treasury model exists
                const treasury = await ctx.prisma.squadTreasury.findUnique({ where: { squadId } });
                if (treasury) {
                    await ctx.prisma.treasuryTransaction.create({
                        data: {
                            treasuryId: treasury.id,
                            type: 'expense',
                            category: 'transfer_out',
                            amount: mockData.askingPrice,
                            description: `Signed prospect ${player.name} via Draft Engine`,
                            verified: true,
                        }
                    });
                }
            }

            return {
                success: true,
                message: `${player.name} has signed the contract!`,
                player,
                member
            };
        }),
});
