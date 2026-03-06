/**
 * SportWarren Color Utilities
 * Centralized Tailwind color class helpers
 */

import type { TrustTier, MatchStatus } from '@/types';

// ============================================================================
// RATING COLORS
// ============================================================================

/**
 * Get color class for overall rating (FIFA-style)
 */
export function getOverallColor(rating: number): string {
  if (rating >= 90) return 'text-purple-600';
  if (rating >= 80) return 'text-green-600';
  if (rating >= 70) return 'text-yellow-600';
  if (rating >= 60) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Get background color class for overall rating
 */
export function getOverallBgColor(rating: number): string {
  if (rating >= 90) return 'bg-purple-100 text-purple-800';
  if (rating >= 80) return 'bg-green-100 text-green-800';
  if (rating >= 70) return 'bg-yellow-100 text-yellow-800';
  if (rating >= 60) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
}

/**
 * Get color class for individual attribute rating
 */
export function getAttributeColor(rating: number): string {
  if (rating >= 90) return 'bg-purple-500';
  if (rating >= 80) return 'bg-green-500';
  if (rating >= 70) return 'bg-yellow-500';
  if (rating >= 60) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Get text color class for attribute rating
 */
export function getAttributeTextColor(rating: number): string {
  if (rating >= 90) return 'text-purple-600';
  if (rating >= 80) return 'text-green-600';
  if (rating >= 70) return 'text-yellow-600';
  if (rating >= 60) return 'text-orange-600';
  return 'text-red-600';
}

// ============================================================================
// TRUST TIER COLORS
// ============================================================================

/**
 * Get Tailwind classes for trust tier
 */
export function getTrustTierColor(tier: TrustTier): string {
  switch (tier) {
    case 'platinum':
      return 'text-purple-600 bg-purple-100';
    case 'gold':
      return 'text-yellow-600 bg-yellow-100';
    case 'silver':
      return 'text-gray-600 bg-gray-100';
    case 'bronze':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get border color for trust tier
 */
export function getTrustTierBorderColor(tier: TrustTier): string {
  switch (tier) {
    case 'platinum':
      return 'border-purple-300';
    case 'gold':
      return 'border-yellow-300';
    case 'silver':
      return 'border-gray-300';
    case 'bronze':
      return 'border-orange-300';
    default:
      return 'border-gray-300';
  }
}

// ============================================================================
// FORM COLORS
// ============================================================================

/**
 * Get color class for form value
 */
export function getFormColor(form: number): string {
  if (form >= 4) return 'text-green-600';
  if (form >= 2) return 'text-blue-600';
  if (form >= 0) return 'text-gray-600';
  if (form >= -2) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get background color class for form
 */
export function getFormBgColor(form: number): string {
  if (form >= 4) return 'bg-green-100 text-green-800';
  if (form >= 2) return 'bg-blue-100 text-blue-800';
  if (form >= 0) return 'bg-gray-100 text-gray-800';
  if (form >= -2) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

/**
 * Get border color class for form
 */
export function getFormBorderColor(form: number): string {
  if (form >= 4) return 'border-green-300';
  if (form >= 2) return 'border-blue-300';
  if (form >= 0) return 'border-gray-300';
  if (form >= -2) return 'border-yellow-300';
  return 'border-red-300';
}

// ============================================================================
// MATCH STATUS COLORS
// ============================================================================

/**
 * Get display info for match status
 */
export function getMatchStatusDisplay(status: MatchStatus): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '✓',
      };
    case 'disputed':
      return {
        label: 'Disputed',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '⚠',
      };
    case 'finalized':
      return {
        label: 'Finalized',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        icon: '🔒',
      };
    case 'pending':
    default:
      return {
        label: 'Pending',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: '⏳',
      };
  }
}

/**
 * Get simple color class for match status
 */
export function getMatchStatusColor(status: MatchStatus): string {
  switch (status) {
    case 'verified':
      return 'text-green-600 bg-green-100';
    case 'disputed':
      return 'text-red-600 bg-red-100';
    case 'finalized':
      return 'text-blue-600 bg-blue-100';
    case 'pending':
    default:
      return 'text-yellow-600 bg-yellow-100';
  }
}

// ============================================================================
// RARITY COLORS
// ============================================================================

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'text-yellow-600 bg-yellow-100 border-yellow-300';
    case 'epic':
      return 'text-purple-600 bg-purple-100 border-purple-300';
    case 'rare':
      return 'text-blue-600 bg-blue-100 border-blue-300';
    case 'common':
    default:
      return 'text-gray-600 bg-gray-100 border-gray-300';
  }
}

export function getRarityBgColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'bg-yellow-100 text-yellow-800';
    case 'epic':
      return 'bg-purple-100 text-purple-800';
    case 'rare':
      return 'bg-blue-100 text-blue-800';
    case 'common':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// ============================================================================
// XP GAIN COLORS
// ============================================================================

export function getXPGainColor(xp: number): string {
  if (xp >= 500) return 'text-purple-600';
  if (xp >= 200) return 'text-blue-600';
  if (xp >= 100) return 'text-green-600';
  return 'text-gray-600';
}

// ============================================================================
// CHALLENGE TYPE COLORS
// ============================================================================

export function getChallengeTypeColor(type: string): string {
  switch (type) {
    case 'goal_scoring':
      return 'text-green-600 bg-green-100';
    case 'playmaking':
      return 'text-blue-600 bg-blue-100';
    case 'defensive':
      return 'text-red-600 bg-red-100';
    case 'consistency':
      return 'text-purple-600 bg-purple-100';
    case 'special':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// ============================================================================
// TRANSACTION TYPE COLORS
// ============================================================================

export function getTransactionTypeColor(type: 'income' | 'expense'): string {
  return type === 'income' 
    ? 'text-green-600 bg-green-100' 
    : 'text-red-600 bg-red-100';
}
