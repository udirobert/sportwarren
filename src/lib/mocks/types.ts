/**
 * Mock Data Type Definitions
 * These types represent the shape of mock data used throughout the app.
 * They should mirror the real types from @/types but allow for mock-specific fields.
 */

import type { 
  MatchResult, 
  PlayerAttributes, 
  Squad, 
  Achievement,
  Treasury,
  TransferOffer,
  Rivalry,
  Player,
  MatchEvent
} from '@/types';

// Re-export real types as mock types for consistency
export type MockMatch = MatchResult;
export type MockPlayer = PlayerAttributes;
export type MockSquad = Squad;
export type MockAchievement = Achievement;
export type MockTreasury = Treasury;
export type MockTransferOffer = TransferOffer;
export type MockRivalry = Rivalry;
export type MockPlayerBasic = Player;
export type MockMatchEvent = MatchEvent;

// Mock-specific metadata type
export interface MockMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: string;
}
