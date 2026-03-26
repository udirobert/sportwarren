/**
 * Telegram Deep Link Utilities
 * Single source of truth for building Telegram Mini App URLs
 * Used by: Dashboard, Settings, Match components, Onboarding
 */

export type TelegramMiniAppTab = 'squad' | 'match' | 'profile' | 'treasury' | 'ai';

interface DeepLinkOptions {
  tab?: TelegramMiniAppTab;
  prefilled?: Record<string, string>;
}

/**
 * Build a Telegram Mini App deep link URL
 * @param options - Tab and prefilled data options
 * @returns Deep link URL for Telegram Mini App
 */
export function buildTelegramDeepLink(options: DeepLinkOptions = {}): string {
  const baseUrl = 'https://t.me/sportwarrenbot/app';
  const params = new URLSearchParams();

  if (options.tab) {
    params.set('startapp', options.tab);
  }

  if (options.prefilled) {
    Object.entries(options.prefilled).forEach(([key, value]) => {
      params.set(key, value);
    });
  }

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Build a Telegram share URL
 * @param text - Text to share
 * @param url - URL to share (optional)
 * @returns Telegram share URL
 */
export function buildTelegramShareUrl(text: string, url?: string): string {
  const params = new URLSearchParams();
  params.set('text', text);
  if (url) {
    params.set('url', url);
  }
  return `https://t.me/share/url?${params.toString()}`;
}

/**
 * Get the tab label for display
 */
export function getTabLabel(tab: TelegramMiniAppTab): string {
  const labels: Record<TelegramMiniAppTab, string> = {
    squad: 'Squad Dashboard',
    match: 'Match Center',
    profile: 'Player Profile',
    treasury: 'Treasury',
    ai: 'AI Staff',
  };
  return labels[tab];
}

/**
 * Get the tab description for display
 */
export function getTabDescription(tab: TelegramMiniAppTab): string {
  const descriptions: Record<TelegramMiniAppTab, string> = {
    squad: 'View your squad overview, form, and treasury summary',
    match: 'Log results, verify matches, and review XP movement',
    profile: 'Review your attributes, XP, and sharpness',
    treasury: 'Connect TON wallet and manage squad treasury',
    ai: 'Chat with AI staff for tactical, scouting, and commercial guidance',
  };
  return descriptions[tab];
}