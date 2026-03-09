import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

/**
 * Lens post router — logs post intent to AiMemory.
 * Swap the stub body for a real @lens-protocol/client call once the SDK is installed.
 */
export const lensRouter = createTRPCRouter({
    postUpdate: protectedProcedure
        .input(z.object({
            text: z.string().min(1).max(500),
            tags: z.array(z.string()).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            // Persist intent so we have an audit trail even before Lens SDK is wired
            await ctx.prisma.aiMemory.upsert({
                where: { userId: ctx.userId },
                create: {
                    userId: ctx.userId,
                    history: JSON.stringify([{
                        type: 'lens_post',
                        text: input.text,
                        tags: input.tags ?? [],
                        postedAt: new Date().toISOString(),
                        status: 'pending_sdk',
                    }]),
                    keyInsights: '',
                },
                update: {
                    history: JSON.stringify([{
                        type: 'lens_post',
                        text: input.text,
                        tags: input.tags ?? [],
                        postedAt: new Date().toISOString(),
                        status: 'pending_sdk',
                    }]),
                },
            });

            // TODO: replace with real Lens SDK call, e.g.:
            // const client = await LensClient.create({ environment: production });
            // await client.publication.postOnchain({ contentURI: ... });

            return { success: true, status: 'pending_sdk', message: 'Post intent logged. Lens SDK integration pending.' };
        }),
});
