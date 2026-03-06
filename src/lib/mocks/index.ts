/**
 * SportWarren Mock Data - Single Source of Truth
 * 
 * All mock data is centralized here to ensure consistency across the app.
 * When transitioning to real APIs, replace these exports with API calls.
 */

// Domain-specific mock exports
export * from './matches';
export * from './players';
export * from './squads';
export * from './achievements';

// Re-export types for convenience
export type { MockMatch, MockPlayer, MockSquad, MockAchievement } from './types';
