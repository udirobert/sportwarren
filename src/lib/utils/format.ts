/**
 * SportWarren Format Utilities
 * Date, number, and string formatting
 */

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(date);
}

/**
 * Get days remaining until a date
 */
export function getDaysRemaining(endDate: Date | string | number): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Format duration in seconds to "M:SS" string
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'ALGO'): string {
  return `${formatNumber(amount)} ${currency}`;
}

/**
 * Format prize with currency
 */
export function formatPrize(amount: number, currency: string = 'ALGO'): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k ${currency}`;
  }
  return `${amount} ${currency}`;
}

/**
 * Format XP with "k" suffix for large numbers
 */
export function formatXPGain(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a large number compactly (1.2k, 1.5M, etc.)
 */
export function formatCompact(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

// ============================================================================
// STRING FORMATTING
// ============================================================================

/**
 * Truncate a string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Truncate a wallet address (0x1234...5678)
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert snake_case or camelCase to Title Case
 */
export function toTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

// ============================================================================
// MATCH FORMATTING
// ============================================================================

import type { MatchResult } from '@/types';

/**
 * Format match result as "TeamA X - Y TeamB"
 */
export function formatMatchResult(match: MatchResult): string {
  return `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`;
}

/**
 * Format match score only
 */
export function formatMatchScore(match: MatchResult): string {
  return `${match.homeScore} - ${match.awayScore}`;
}
