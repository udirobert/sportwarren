import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const authRouter = createTRPCRouter({
    setActiveSquad: protectedProcedure
        .input(z.object({ squadId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const { userId, prisma } = ctx;

            // Verify the user actually belongs to this squad
            const membership = await prisma.squadMember.findUnique({
                where: { squadId_userId: { squadId: input.squadId, userId: userId! } },
            });

            if (!membership) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: 'You are not a member of this squad',
                });
            }

            // Persist activeSquadId on PlatformIdentity if one exists (Telegram path).
            // On web, the client handles this via React context — this is a no-op-safe write.
            await prisma.platformIdentity.updateMany({
                where: { userId: userId! },
                data: { activeSquadId: input.squadId },
            });

            return { success: true };
        }),

    migrateGuestProgress: protectedProcedure
        .input(z.object({
            guestData: z.object({
                draftedPlayerIds: z.array(z.string()).optional(),
                completedMissions: z.array(z.string()).optional(),
                accumulatedXP: z.number().optional().default(0),
            })
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, prisma } = ctx;
            const { guestData } = input;

            try {
                // 1. Get user's squad
                const membership = await prisma.squadMember.findFirst({
                    where: { userId: userId! },
                    include: { squad: true }
                });

                if (!membership) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'You must create or join a squad before migrating progress'
                    });
                }

                const squadId = membership.squadId;

                // 2. Migrate Drafted Players
                if (guestData.draftedPlayerIds && guestData.draftedPlayerIds.length > 0) {
                    for (const playerId of guestData.draftedPlayerIds) {
                        // Check if already in squad
                        const existing = await prisma.squadMember.findUnique({
                            where: {
                                squadId_userId: {
                                    squadId,
                                    userId: playerId
                                }
                            }
                        });

                        if (!existing) {
                            // We assume guest had "drafted" them, so we add them to the real squad in DB
                            // In a real app, we'd verify these IDs against a mock catalog
                            await prisma.squadMember.create({
                                data: {
                                    squadId,
                                    userId: playerId,
                                    role: 'player'
                                }
                            }).catch(e => console.warn(`Failed to migrate player ${playerId}:`, e));
                        }
                    }
                }

                // 3. Migrate XP to Player Profile
                if (guestData.accumulatedXP > 0) {
                    await prisma.playerProfile.upsert({
                        where: { userId: userId! },
                        update: {
                            totalXP: { increment: guestData.accumulatedXP },
                            reputationScore: { increment: Math.floor(guestData.accumulatedXP / 100) }
                        },
                        create: {
                            userId: userId!,
                            totalXP: guestData.accumulatedXP,
                            reputationScore: Math.floor(guestData.accumulatedXP / 100)
                        }
                    });
                }

                return {
                    success: true,
                    message: 'Guest progress migrated successfully!',
                    migratedPlayers: guestData.draftedPlayerIds?.length || 0,
                    xpMigrated: guestData.accumulatedXP
                };
            } catch (error) {
                if (error instanceof TRPCError) throw error;
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to migrate guest progress',
                    cause: error
                });
            }
    }),
});
