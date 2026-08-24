import { prisma } from '@/lib/db';
import {
  extractWalletFromHeaders,
  isSupportedWalletChain,
  verifyWalletSignature,
} from '@/lib/auth/wallet';

/** Resolve an existing user only after verifying the request's wallet proof. */
export async function getAuthenticatedRequestUser(request: Request) {
  const wallet = extractWalletFromHeaders(request.headers);
  const chain = wallet.chain?.toLowerCase();
  if (!wallet.address || !chain || !isSupportedWalletChain(chain) || !wallet.signature || !wallet.message || !wallet.timestamp) {
    return null;
  }

  const verification = await verifyWalletSignature({
    address: wallet.address,
    chain,
    signature: wallet.signature,
    message: wallet.message,
    timestamp: Number(wallet.timestamp),
  });
  if (!verification.verified) return null;

  return prisma.user.findUnique({ where: { walletAddress: wallet.address } });
}
