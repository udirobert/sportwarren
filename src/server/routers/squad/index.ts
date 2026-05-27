/**
 * Squad sub-router decomposition guide.
 *
 * The main squad.ts router (2284 lines, 40+ procedures) should be split
 * into domain-specific sub-routers following this pattern:
 *
 *   squad/
 *     treasury.ts   — getTreasury, deposit, withdraw, TON vault, Yellow settlement, wage processing
 *     tactics.ts    — getTactics, saveTactics
 *     transfers.ts  — getTransferOffers, create/respond/cancel
 *     governance.ts — getProposals, getGovernancePower, castVote
 *     availability.ts — get/set/remove availability, squad summary
 *     autonomy.ts   — get/set autonomy config, confirmation, action min level
 *     digital-twin.ts — getDigitalTwin, simulateGhostMatch, set3dEntitlement
 *     core.ts       — create, list, getById, join, leave, getMySquads, getPlayerContext, getTopTeammates
 *     challenges.ts — createChallenge, respondToChallenge
 *     territory.ts  — getTerritory
 *     alerts.ts     — getManagerAlerts, getNearbySquads
 *
 * Each sub-router exports a tRPC router. The main squad/index.ts merges them:
 *
 *   import { createTRPCRouter } from '../../trpc';
 *   import { treasuryRouter } from './treasury';
 *   import { tacticsRouter } from './tactics';
 *   // ...
 *   export const squadRouter = createTRPCRouter({
 *     ...treasuryRouter._def.record,
 *     ...tacticsRouter._def.record,
 *   });
 *
 * Shared helpers (getSquadLeaderWallets, normalizeTonWalletAddress, etc.)
 * should live in squad/utils.ts.
 */

export {};
