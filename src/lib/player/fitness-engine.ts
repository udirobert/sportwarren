/**
 * Player Fitness Engine
 * Manages sharpness, decay, and recovery based on IRL activity
 */

import { FITNESS_CONSTANTS } from '../match/constants';
import { AttributeType } from '@/types';

interface FitnessStatus {
  sharpness: number;
  modifier: number;
  label: string;
  color: string;
}

/**
 * Calculate updated sharpness after a period of inactivity
 */
export function calculateSharpnessDecay(
  currentSharpness: number,
  lastActivityDate: Date,
  now: Date = new Date()
): number {
  const daysDiff = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 0) return currentSharpness;
  
  const totalDecay = daysDiff * FITNESS_CONSTANTS.DAILY_SHARPNESS_DECAY;
  return Math.max(FITNESS_CONSTANTS.MIN_SHARPNESS, currentSharpness - totalDecay);
}

/**
 * Calculate sharpness gain from an activity
 */
export function calculateActivityGain(
  type: keyof typeof FITNESS_CONSTANTS.ACTIVITY_GAINS,
  duration: number, // in minutes
  intensity: 'low' | 'medium' | 'high' = 'medium'
): number {
  const baseGain = FITNESS_CONSTANTS.ACTIVITY_GAINS[type] || 2;
  
  // Modifiers based on duration (normalized to 30 mins) and intensity
  const durationMod = duration / 30;
  const intensityMod = intensity === 'high' ? 1.2 : intensity === 'low' ? 0.8 : 1.0;
  
  return Math.round(baseGain * durationMod * intensityMod);
}

/**
 * Get fitness status and attribute modifiers for simulation
 */
export function getFitnessStatus(sharpness: number): FitnessStatus {
  const { THRESHOLDS } = FITNESS_CONSTANTS;
  
  if (sharpness >= THRESHOLDS.ELITE) {
    return {
      sharpness,
      modifier: 1.10, // +10% boost
      label: 'Elite (Match Fit)',
      color: 'text-green-600',
    };
  }
  
  if (sharpness >= THRESHOLDS.FIT) {
    return {
      sharpness,
      modifier: 1.0,
      label: 'Fit',
      color: 'text-green-500',
    };
  }
  
  if (sharpness >= THRESHOLDS.TIRED) {
    return {
      sharpness,
      modifier: 0.90, // -10% penalty
      label: 'Tired',
      color: 'text-yellow-500',
    };
  }
  
  return {
    sharpness,
    modifier: 0.75, // -25% penalty
    label: 'Exhausted',
    color: 'text-red-600',
  };
}

/**
 * Apply fitness modifier to a set of attributes
 */
export function applyFitnessToAttributes(
  attributes: Record<AttributeType, number>,
  sharpness: number
): Record<AttributeType, number> {
  const { modifier } = getFitnessStatus(sharpness);
  
  const updatedAttrs: Partial<Record<AttributeType, number>> = {};
  
  for (const [key, value] of Object.entries(attributes)) {
    updatedAttrs[key as AttributeType] = Math.round(value * modifier);
  }
  
  return updatedAttrs as Record<AttributeType, number>;
}
