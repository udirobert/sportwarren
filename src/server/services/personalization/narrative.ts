/**
 * Narrative service — generates a one-paragraph summary of a squad twin's
 * trajectory. PR 2 ships a stub; PR 3 (identity + tRPC) wires this into the
 * personalisation layer with proper prompt templating and caching.
 *
 * The function exists today so `getDigitalTwin` doesn't depend on the
 * deleted `ai/digital-twin.ts` module.
 */

import { prisma } from '@/lib/db';

export async function generateSquadNarrative(squadId: string): Promise<string> {
  const [squad, twin, matchCount] = await Promise.all([
    prisma.squad.findUnique({ where: { id: squadId }, select: { name: true } }),
    prisma.squadTwin.findUnique({ where: { squadId }, select: { level: true, prestige: true, baseAttributes: true } }),
    prisma.match.count({ where: { OR: [{ homeSquadId: squadId }, { awaySquadId: squadId }], status: 'verified' } }),
  ]);

  if (!squad) return 'Squad not found.';

  const level = twin?.level ?? 1;
  const prestige = twin?.prestige ?? 0;
  return `${squad.name} — Level ${level} squad twin, ${matchCount} verified match${matchCount === 1 ? '' : 'es'} on the books, prestige at ${prestige}. PR 3 wires this into the personalisation prompt layer.`;
}
