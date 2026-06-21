/**
 * V4 verdant register — barrel export.
 *
 * V4 is the design register for the GAME (pitch, dusk, mud, programme
 * covers, the lived experience). V3 is the register for the RECORD
 * (editorial cream + ink). Both share typography via v3/tokens.
 *
 *   import { V4PitchPanel, V4Heading, PALETTE } from '@/components/v4';
 *
 * Tokens (PALETTE, TYPE, TRACKING) are re-exported from v3 for
 * one-stop imports.
 */

export * from './primitives';
export { PALETTE, TYPE, TRACKING, type V3AccentKey, type V4AccentKey } from '@/components/v3/tokens';
