import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import { prisma } from '@/lib/db';
import { 
  verifyWalletSignature, 
  extractWalletFromHeaders,
  generateAuthMessage 
} from '@/lib/auth/wallet';

// Re-export for API routes
export { generateAuthMessage };

// Context type
export interface TRPCContext {
  prisma: typeof prisma;
  userId?: string;
  walletAddress?: string;
  chain?: string;
}

// Context for tRPC with wallet signature verification
export const createTRPCContext = cache(async (opts?: { 
  headers?: Headers;
}): Promise<TRPCContext> => {
  const walletInfo = extractWalletFromHeaders(opts?.headers || new Headers());
  
  // If no wallet address, return unauthenticated context
  if (!walletInfo.address || !walletInfo.chain) {
    return { prisma };
  }

  // In development mode without signature, just trust the headers
  // In production, require signature verification
  const isDevelopment = process.env.NODE_ENV === 'development';
  const skipVerification = isDevelopment && !walletInfo.signature;

  let verified = false;

  if (skipVerification) {
    console.warn('Development mode: Skipping signature verification');
    verified = true;
  } else if (walletInfo.signature && walletInfo.message && walletInfo.timestamp) {
    // Verify the signature
    const verification = await verifyWalletSignature({
      address: walletInfo.address,
      chain: walletInfo.chain as 'algorand' | 'avalanche',
      signature: walletInfo.signature,
      message: walletInfo.message,
      timestamp: parseInt(walletInfo.timestamp, 10),
    });
    verified = verification.verified;
  }

  if (!verified) {
    return { prisma };
  }

  return { 
    prisma,
    walletAddress: walletInfo.address,
    chain: walletInfo.chain,
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
      message: 'Wallet authentication required. Please sign the authentication message.',
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

    // Create default player profile with attributes
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
  if (!ctx.walletAddress) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  // For now, allow any authenticated user
  return next({ ctx });
});
