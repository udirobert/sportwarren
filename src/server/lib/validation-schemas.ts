import { z } from 'zod';

/**
 * Shared Validation Schemas - Single Source of Truth
 * Centralized Zod schemas for common patterns across tRPC routers
 * Follows DRY and CONSOLIDATION principles
 */

// ─────────────────────────────────────────────────────────────────────────────
// CORE VALIDATORS - Used throughout the application
// ─────────────────────────────────────────────────────────────────────────────

/** UUID/ID validation with required error message */
export const idSchema = z.string().min(1, 'ID is required');

/** Optional UUID with consistent formatting */
export const optionalIdSchema = z.string().optional();

/** Pagination helpers */
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

/** Squad ID with validation */
export const squadIdSchema = z.string().min(1, 'Squad ID is required');

/** User ID with validation */
export const userIdSchema = z.string().min(1, 'User ID is required');

/** Match ID with validation */
export const matchIdSchema = z.string().min(1, 'Match ID is required');

// ─────────────────────────────────────────────────────────────────────────────
// SQUAD VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const squadNameSchema = z
  .string()
  .trim()
  .min(2, 'Squad name must be at least 2 characters')
  .max(60, 'Squad name must be 60 characters or fewer');

export const shortNameSchema = z
  .string()
  .trim()
  .min(2, 'Short name must be at least 2 characters')
  .max(5, 'Short name must be 5 characters or fewer');

export const squadCreateSchema = z.object({
  name: squadNameSchema,
  shortName: shortNameSchema,
  homeGround: z.string().max(120).optional(),
});

export const squadJoinSchema = z.object({
  squadId: squadIdSchema,
});

export const squadLeaveSchema = z.object({
  squadId: squadIdSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// MATCH VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const matchScoreSchema = z
  .number()
  .int()
  .min(0, 'Score cannot be negative')
  .max(255, 'Score must be 255 or less');

export const matchCreateSchema = z.object({
  homeSquadId: squadIdSchema,
  awaySquadId: squadIdSchema,
  homeScore: matchScoreSchema,
  awayScore: matchScoreSchema,
  matchDate: z.date().default(() => new Date()),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const matchVerifySchema = z.object({
  matchId: matchIdSchema,
  verified: z.boolean(),
  homeScore: matchScoreSchema.optional(),
  awayScore: matchScoreSchema.optional(),
});

export const matchListSchema = z.object({
  status: z.enum(['pending', 'verified', 'disputed', 'finalized']).optional(),
  squadId: squadIdSchema.optional(),
  ...paginationSchema.shape,
});

// ─────────────────────────────────────────────────────────────────────────────
// PLAYER VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const playerNameSchema = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(40, 'Name must be 40 characters or fewer');

export const positionSchema = z.enum(['GK', 'DF', 'MF', 'ST', 'WG'], {
  errorMap: () => ({ message: 'Position must be GK, DF, MF, ST, or WG' }),
});

export const playerProfileUpdateSchema = z.object({
  name: playerNameSchema,
  position: positionSchema,
  avatar: z.string().max(1_000_000, 'Avatar data too large').optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// TACTICS VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

// All valid formations including small-sided variants
const FORMATIONS = [
  // 11-a-side
  '4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2',
  '4-5-1', '4-1-4-1', '3-4-3', '4-3-1-2', '5-4-1',
  // Small-sided variants
  '1-2-1', '1-1-2', '1-3-1', '1-2-2', '1-2-1-1',
  '1-4-1', '1-3-2', '1-3-1-1', '2-3-1',
] as const;

export const formationSchema = z.enum(FORMATIONS, {
  errorMap: () => ({ message: 'Invalid formation' }),
});

export const playStyleSchema = z.enum([
  'balanced', 'possession', 'direct', 'counter', 'high_press', 'low_block'
], {
  errorMap: () => ({ message: 'Invalid play style' }),
});

export const tacticalInstructionsSchema = z.object({
  width: z.enum(['narrow', 'normal', 'wide']).optional(),
  tempo: z.enum(['slow', 'normal', 'fast']).optional(),
  passing: z.enum(['short', 'mixed', 'long']).optional(),
  pressing: z.enum(['low', 'medium', 'high']).optional(),
  defensiveLine: z.enum(['deep', 'normal', 'high']).optional(),
});

export const tacticsSaveSchema = z.object({
  squadId: squadIdSchema,
  formation: formationSchema,
  playStyle: playStyleSchema,
  instructions: tacticalInstructionsSchema.optional(),
  setPieces: z.object({
    corners: z.string().max(30).optional(),
    freeKicks: z.string().max(30).optional(),
    penalties: z.string().max(30).optional(),
  }).optional(),
  lineup: z.array(z.string()).max(11).optional(),
});

// Yellow settlement schema for treasury operations
export const yellowTreasurySettlementSchema = z.object({
  sessionId: z.string().min(1, 'Yellow session ID is required'),
  version: z.number().int().nonnegative('Yellow version must be non-negative'),
  settlementId: z.string().min(1).optional(),
});

// Yellow settlement schema for match operations
export const yellowMatchSettlementSchema = yellowTreasurySettlementSchema;

// Match status enum for list filters
export const matchStatusSchema = z.enum(['pending', 'verified', 'disputed', 'finalized']);

// Coordinate validation schemas
export const latitudeSchema = z.number().min(-90, 'Latitude must be >= -90').max(90, 'Latitude must be <= 90');
export const longitudeSchema = z.number().min(-180, 'Longitude must be >= -180').max(180, 'Longitude must be <= 180');

// ─────────────────────────────────────────────────────────────────────────────
// TYPE EXPORTS - Explicit types for use in other modules
// ─────────────────────────────────────────────────────────────────────────────

export type PaginationInput = z.infer<typeof paginationSchema>;
export type SquadCreateInput = z.infer<typeof squadCreateSchema>;
export type MatchCreateInput = z.infer<typeof matchCreateSchema>;
export type TacticsSaveInput = z.infer<typeof tacticsSaveSchema>;
export type TreasuryDepositInput = z.infer<typeof treasuryDepositSchema>;
export type TreasuryWithdrawInput = z.infer<typeof treasuryWithdrawSchema>;
export type TransferOfferInput = z.infer<typeof transferOfferSchema>;
export type PeerRatingSubmitInput = z.infer<typeof peerRatingSubmitSchema>;
export type AgentChatInput = z.infer<typeof agentChatSchema>;
export type StaffDecisionInput = z.infer<typeof staffDecisionSchema>;
export type AvailabilitySetInput = z.infer<typeof availabilitySetSchema>;
export type ActivitySyncInput = z.infer<typeof activitySyncSchema>;

// Formation and PlayStyle types
export type Formation = z.infer<typeof formationSchema>;
export type PlayStyle = z.infer<typeof playStyleSchema>;
export type Position = z.infer<typeof positionSchema>;
export type MatchStatus = z.infer<typeof matchStatusSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// TREASURY VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const treasuryAmountSchema = z
  .number()
  .positive('Amount must be positive')
  .max(1_000_000_000, 'Amount exceeds maximum allowed');

export const treasuryDepositSchema = z.object({
  squadId: squadIdSchema,
  amount: treasuryAmountSchema,
  description: z.string().max(500).optional(),
});

export const treasuryWithdrawSchema = z.object({
  squadId: squadIdSchema,
  amount: treasuryAmountSchema,
  reason: z.string().min(1, 'Reason is required').max(200),
  category: z.enum(['wages', 'transfers', 'facilities', 'other']),
});

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFER VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const transferOfferSchema = z.object({
  toSquadId: squadIdSchema,
  playerId: userIdSchema,
  offerType: z.enum(['permanent', 'loan']),
  amount: treasuryAmountSchema,
  loanDuration: z.number().int().min(1).max(24).optional(),
  expiresAt: z.date().optional(),
});

export const transferResponseSchema = z.object({
  offerId: z.string().min(1, 'Offer ID is required'),
  accept: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CHAT/AI VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const chatMessageSchema = z
  .string()
  .min(1, 'Message is required')
  .max(500, 'Message must be 500 characters or fewer');

export const agentChatSchema = z.object({
  staffId: z.string().min(1),
  message: chatMessageSchema,
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(2000),
  })).max(50).optional(),
  squadContext: z.object({
    squadName: z.string().max(60).optional(),
    balance: z.number().optional(),
    memberCount: z.number().int().min(1).max(50).optional(),
    avgLevel: z.number().optional(),
    formation: z.string().optional(),
    members: z.array(z.object({
      name: z.string().max(40),
      level: z.number().optional(),
      matches: z.number().optional(),
      role: z.string().optional(),
    })).max(30).optional(),
  }).optional(),
  recentDecisions: z.array(z.object({
    action: z.string().max(200),
    decision: z.enum(['confirmed', 'declined']),
    context: z.string().max(200).optional(),
    timestamp: z.string().datetime(),
  })).max(20).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// PEER RATING VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const peerRatingItemSchema = z.object({
  targetId: userIdSchema,
  attribute: z.string().min(1).max(30),
  score: z.number().int().min(1).max(10),
  hypeTags: z.array(z.string().max(50)).max(5).optional(),
});

export const peerRatingSubmitSchema = z.object({
  matchId: matchIdSchema,
  ratings: z.array(peerRatingItemSchema).min(1).max(30),
  motmVote: z.string().min(1).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// SESSION VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const sessionCreateSchema = z.object({
  squadId: squadIdSchema,
  name: z.string().min(3, 'Session name must be at least 3 characters').max(60),
  date: z.date().optional(),
});

export const sessionJoinSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  teamPreference: z.enum(['bibs', 'no_bibs']).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// MEMORY/LOG VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const staffDecisionSchema = z.object({
  staffId: z.string().min(1),
  action: z.string().min(1).max(200),
  decision: z.enum(['confirmed', 'declined']),
  context: z.string().max(200).optional(),
  timestamp: z.string().datetime({ message: 'Invalid ISO 8601 timestamp' }),
});

// ─────────────────────────────────────────────────────────────────────────────
// AVAILABILITY VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const availabilitySetSchema = z.object({
  squadId: squadIdSchema,
  dayOfWeek: z.number().int().min(1, 'Day of week must be 1-7').max(7),
  timeSlot: z.string().max(20).optional(),
  isAvailable: z.boolean().default(true),
  notes: z.string().max(200).optional(),
});

export const availabilityRemoveSchema = z.object({
  squadId: squadIdSchema,
  dayOfWeek: z.number().int().min(1).max(7),
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY/FITNESS VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

export const activitySyncSchema = z.object({
  userId: userIdSchema,
  type: z.enum(['run', 'gym', 'hiit', 'field_training']),
  duration: z.number().int().min(1, 'Duration must be at least 1 minute'),
  intensity: z.enum(['low', 'medium', 'high']),
  distance: z.number().positive().optional(),
  source: z.string().max(30).default('manual'),
});