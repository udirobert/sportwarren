/**
 * Resolve a User row from a preview URL token.
 *
 * Preview surfaces use auth-by-URL: the `walletAddress` field doubles
 * as the auth token (shaped like `<name>-<6char>`). Anyone holding the
 * URL can read + mutate the preview row's state. We layer one rule on
 * top of `findUnique` — only return rows where `chain === 'preview'`,
 * so a token that's been claimed (chain flipped to 'claimed') silently
 * 404s on the preview surface.
 *
 * Type generic preserves the `include` inference from the caller, so
 * `getPreviewUser(t, { include: { squads: true } })` returns a User
 * with `.squads` typed correctly. Skip the generic and you get the
 * bare User shape.
 */

import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';

type FindArgsExcludingWhere = Omit<Prisma.UserFindUniqueArgs, 'where'>;

export async function getPreviewUser<T extends FindArgsExcludingWhere>(
  token: string,
  args?: T,
): Promise<Prisma.UserGetPayload<T> | null> {
  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    ...(args ?? {}),
  } as Prisma.UserFindUniqueArgs);

  if (!user || (user as { chain: string }).chain !== 'preview') return null;
  return user as Prisma.UserGetPayload<T>;
}
