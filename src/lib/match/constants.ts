/**
 * Match Domain Constants
 * Single source of truth for weights, multipliers, and simulation modifiers
 */

import { AttributeType, PlayerPosition, Formation, PlayStyle } from '@/types';

// ============================================================================
// XP & REWARDS
// ============================================================================

export const BASE_XP = {
  win: 100,
  draw: 50,
  loss: 25,
  goal: 50,
  assist: 40,
  cleanSheet: 75,
  appearance: 20,
};

export const MATCH_MULTIPLIERS = {
  league: 1.0,
  cup: 1.5,
  playoff: 2.0,
  derby: 1.75,
  friendly: 0.5,
};

// ============================================================================
// ATTRIBUTE WEIGHTS
// ============================================================================

export const POSITION_ATTRIBUTE_WEIGHTS: Record<PlayerPosition, AttributeType[]> = {
  GK: ['gk_diving', 'gk_handling', 'gk_reflexes', 'gk_positioning', 'physical'],
  DF: ['defending', 'physical', 'passing', 'pace'],
  MF: ['passing', 'dribbling', 'physical', 'defending', 'pace'],
  ST: ['shooting', 'pace', 'physical', 'dribbling'],
  WG: ['dribbling', 'pace', 'shooting', 'passing'],
};

// ============================================================================
// FITNESS & SHARPNESS
// ============================================================================

export const FITNESS_CONSTANTS = {
  DEFAULT_SHARPNESS: 50,
  MAX_SHARPNESS: 100,
  MIN_SHARPNESS: 0,
  
  // Daily decay if no activity
  DAILY_SHARPNESS_DECAY: 2,
  
  // Activity gains (approximate)
  ACTIVITY_GAINS: {
    run: 5,
    gym: 3,
    hiit: 8,
    field_training: 10,
    match: 15,
  },
  
  // Performance Thresholds
  THRESHOLDS: {
    ELITE: 90,    // +10% to all attributes
    FIT: 70,      // No modifier
    TIRED: 40,    // -10% to physical/pace
    EXHAUSTED: 20, // -25% to all attributes
  }
};

// ============================================================================
// MARKET & VALUATION
// ============================================================================

export const MARKET_CONSTANTS = {
  BASE_VALUE: 100, // Base value in USDC/Stablecoins
  
  // Multipliers based on Average Rating
  RATING_MULTIPLIERS: {
    ELITE: 5.0,     // 85+ rating
    STAR: 2.5,      // 75-84 rating
    REGULAR: 1.0,   // 60-74 rating
    PROSPECT: 0.5,  // <60 rating
  },
  
  // Form multipliers (-5 to +5)
  FORM_MODIFIERS: {
    '↑↑': 1.5,
    '↑': 1.25,
    '↗': 1.1,
    '→': 1.0,
    '↘': 0.9,
    '↓': 0.75,
    '↓↓': 0.5,
  },
  
  // Potential multiplier (Level-based)
  POTENTIAL_MODIFIER: (level: number) => {
    if (level < 10) return 1.5; // High potential (young/new)
    if (level < 30) return 1.2;
    return 1.0; // Established
  },
  
  // Scarcity/Demand (Number of squads interested)
  DEMAND_MODIFIER: (interestCount: number) => 1 + (interestCount * 0.1),
};

// ============================================================================
// SIMULATION MODIFIERS
// ============================================================================

/**
 * Formation modifiers for different areas of the pitch
 * [Defense, Midfield, Attack]
 */
export const FORMATION_MODIFIERS: Record<Formation, [number, number, number]> = {
  '4-4-2': [1.0, 1.0, 1.0],      // Balanced
  '4-3-3': [0.9, 1.0, 1.2],      // Attacking
  '4-2-3-1': [1.0, 1.1, 1.0],    // Controlled
  '4-5-1': [1.1, 1.2, 0.8],      // Midfield heavy
  '4-1-4-1': [1.1, 1.1, 0.9],    // Defensive midfield
  '3-5-2': [0.8, 1.3, 1.1],      // Wing-back heavy
  '3-4-3': [0.7, 1.1, 1.3],      // Aggressive
  '5-3-2': [1.3, 0.9, 0.9],      // Defensive
  '5-4-1': [1.4, 0.9, 0.7],      // Bus parked
  '4-3-1-2': [1.0, 1.2, 1.0],    // Narrow diamond
};

/**
 * Play style modifiers for attributes
 */
export const STYLE_MODIFIERS: Record<PlayStyle, Partial<Record<AttributeType, number>>> = {
  balanced: {},
  possession: {
    passing: 1.2,
    dribbling: 1.1,
    pace: 0.9,
  },
  direct: {
    passing: 0.9,
    physical: 1.2,
    pace: 1.1,
  },
  counter: {
    pace: 1.3,
    passing: 1.1,
    defending: 1.1,
  },
  high_press: {
    physical: 1.3,
    defending: 1.2,
    pace: 1.1,
  },
  low_block: {
    defending: 1.3,
    physical: 1.2,
    pace: 0.8,
  },
};
