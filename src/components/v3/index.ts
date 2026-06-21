/**
 * V3 Risograph design system — barrel export.
 *
 * Convention: import from '@/components/v3' for everything.
 *   import { V3PageShell, V3Ribbon, PALETTE } from '@/components/v3';
 *
 * The canonical chess.com card component lives in
 * `@/components/identity/V3PlayerCard` and is also re-exported here.
 */

export * from './tokens';
export * from './primitives';
export { V3PlayerCard, buildPlayerCardData, type V3PlayerCardData, type Attrs } from '../identity/V3PlayerCard';
