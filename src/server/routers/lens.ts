import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const LENS_UNAVAILABLE_MESSAGE = 'Lens social publishing is not enabled on this deployment.';

export const lensRouter = createTRPCRouter({
  postUpdate: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(500),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async () => {
      return {
        success: false,
        status: 'unavailable' as const,
        message: LENS_UNAVAILABLE_MESSAGE,
      };
    }),
});
