import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import { prisma } from '@/lib/db';

// Context type
export interface TRPCContext {
  prisma: typeof prisma;
  userId?: string;
  walletAddress?: string;
  chain?: string;
}

// Context for tRPC - in production, this would verify wallet signatures
export const createTRPCContext = cache(async (opts?: { 
  headers?: Headers;
}): Promise<TRPCContext> => {
  // TODO: Implement proper wallet signature verification
  // For now, we'll use a simple header-based approach for development
  const walletAddress = opts?.headers?.get('x-wallet-address') || undefined;
  const chain = opts?.headers?.get('x-chain') || undefined;
  
  return { 
    prisma,
    walletAddress,
    chain,
  };
});

// Initialize tRPC with typed context
const t = initTRPC.context<TRPCContext>().create();

// Export router and procedure helpers
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure - requires wallet authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.walletAddress) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Wallet authentication required',
    });
  }

  // Find or create user
  let user = await ctx.prisma.user.findUnique({
    where: { walletAddress: ctx.walletAddress },
  });

  if (!user) {
    // Create new user
    user = await ctx.prisma.user.create({
      data: {
        walletAddress: ctx.walletAddress,
        chain: ctx.chain || 'algorand',
        name: `Player_${ctx.walletAddress.slice(0, 8)}`,
      },
    });

    // Create default player profile
    await ctx.prisma.playerProfile.create({
      data: {
        userId: user.id,
        attributes: {
          create: [
            { attribute: 'pace', rating: 50, xp: 0, xpToNext: 100 },
            { attribute: 'shooting', rating: 50, xp: 0, xpToNext: 100 },
            { attribute: 'passing', rating: 50, xp: 0, xpToNext: 100 },
            { attribute: 'dribbling', rating: 50, xp: 0, xpToNext: 100 },
            { attribute: 'defending', rating: 50, xp: 0, xpToNext: 100 },
            { attribute: 'physical', rating: 50, xp: 0, xpToNext: 100 },
          ],
        },
      },
    });
  }

  return next({ 
    ctx: {
      ...ctx,
      userId: user.id,
    }
  });
});

// Admin procedure - for system operations
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  // TODO: Implement admin check
  // For now, same as protected
  if (!ctx.walletAddress) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  return next({ ctx });
});
