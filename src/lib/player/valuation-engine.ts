/**
 * Player Valuation Engine
 * Calculates market value based on attributes, form, and potential
 */

import { PlayerAttributes, FormRating } from '@/types';
import { MARKET_CONSTANTS } from '../match/constants';
import { calculateForm, getFormArrow } from '../match/xp-calculator';

interface ValuationResult {
  value: number; // in USDC/Stablecoins
  breakdown: {
    base: number;
    ratingMultiplier: number;
    formMultiplier: number;
    potentialMultiplier: number;
    demandMultiplier: number;
  };
  tier: 'Prospect' | 'Regular' | 'Star' | 'Elite';
}

/**
 * Calculate a player's current market valuation
 */
export function calculatePlayerValue(
  player: PlayerAttributes,
  interestCount: number = 0
): ValuationResult {
  const { BASE_VALUE, RATING_MULTIPLIERS, FORM_MODIFIERS, POTENTIAL_MODIFIER, DEMAND_MODIFIER } = MARKET_CONSTANTS;

  // 1. Calculate Average Rating
  const avgRating = player.skills.length > 0
    ? player.skills.reduce((sum, s) => sum + s.rating, 0) / player.skills.length
    : 50;

  // 2. Determine Tier & Rating Multiplier
  let tier: ValuationResult['tier'] = 'Prospect';
  let ratingMultiplier = RATING_MULTIPLIERS.PROSPECT;

  if (avgRating >= 85) {
    tier = 'Elite';
    ratingMultiplier = RATING_MULTIPLIERS.ELITE;
  } else if (avgRating >= 75) {
    tier = 'Star';
    ratingMultiplier = RATING_MULTIPLIERS.STAR;
  } else if (avgRating >= 60) {
    tier = 'Regular';
    ratingMultiplier = RATING_MULTIPLIERS.REGULAR;
  }

  // 3. Form Multiplier
  // If player.form.history is missing, use stable
  const form = calculateForm(player.form?.history || []);
  const arrow = getFormArrow(form.current);
  const formMultiplier = (FORM_MODIFIERS as any)[arrow] || 1.0;

  // 4. Potential Multiplier
  const potentialMultiplier = POTENTIAL_MODIFIER(player.xp.level);

  // 5. Demand Multiplier
  const demandMultiplier = DEMAND_MODIFIER(interestCount);

  // Final Calculation
  const finalValue = Math.round(
    BASE_VALUE * 
    ratingMultiplier * 
    formMultiplier * 
    potentialMultiplier * 
    demandMultiplier
  );

  return {
    value: finalValue,
    breakdown: {
      base: BASE_VALUE,
      ratingMultiplier,
      formMultiplier,
      potentialMultiplier,
      demandMultiplier,
    },
    tier,
  };
}
