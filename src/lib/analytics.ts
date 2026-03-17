/**
 * Lightweight analytics utility for tracking user behavior
 * Can be easily integrated with PostHog, Mixpanel, Amplitude, etc.
 */

type EventProperties = Record<string, string | number | boolean | null | undefined>;

interface AnalyticsEvent {
  name: string;
  properties?: EventProperties;
  timestamp: number;
  sessionId: string;
}

// Simple session ID (could be replaced with more sophisticated tracking)
const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('sw_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('sw_session_id', sessionId);
  }
  return sessionId;
};

// Store events locally for debugging/export
const EVENT_STORAGE_KEY = 'sw_analytics_events';
const MAX_STORED_EVENTS = 100;

const storeEvent = (event: AnalyticsEvent): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];
    events.push(event);
    
    // Keep only last N events
    const trimmed = events.slice(-MAX_STORED_EVENTS);
    localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[Analytics] Failed to store event:', e);
  }
};

// Check if analytics is enabled
const isAnalyticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('sw_analytics_enabled') !== 'false';
};

/**
 * Track an analytics event
 */
export function trackEvent(eventName: string, properties?: EventProperties): void {
  if (!isAnalyticsEnabled()) return;
  
  const event: AnalyticsEvent = {
    name: eventName,
    properties: {
      ...properties,
      url: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    },
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties || '');
  }
  
  // Store locally
  storeEvent(event);
  
  // Send to Sentry as breadcrumb for context
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      category: 'analytics',
      message: eventName,
      data: properties,
      level: 'info',
    });
  }
  
  // TODO: Send to analytics provider (PostHog, Mixpanel, etc.)
  // Example:
  // if (window.posthog) {
  //   window.posthog.capture(eventName, properties);
  // }
}

/**
 * Track page view
 */
export function trackPageView(pageName?: string): void {
  const page = pageName || (typeof window !== 'undefined' ? window.location.pathname : 'unknown');
  trackEvent('page_view', { page });
}

/**
 * Track wallet connection attempt
 */
export function trackWalletConnection(walletType: string, success: boolean, error?: string): void {
  trackEvent('wallet_connection', {
    wallet_type: walletType,
    success,
    error: error || null,
  });
}

/**
 * Track guest mode usage
 */
export function trackGuestMode(action: 'started' | 'migrated' | 'prompted'): void {
  trackEvent('guest_mode', { action });
}

/**
 * Track onboarding progress
 */
export function trackOnboarding(step: string, completed: boolean): void {
  trackEvent('onboarding_step', { step, completed });
}

/**
 * Track match submission
 */
export function trackMatchSubmission(matchId: string, verificationMethod: string): void {
  trackEvent('match_submitted', {
    match_id: matchId,
    verification_method: verificationMethod,
  });
}

/**
 * Track XP gain
 */
export function trackXPGain(amount: number, source: string, attribute?: string): void {
  trackEvent('xp_gained', {
    amount,
    source,
    attribute: attribute || null,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsed(featureName: string, details?: EventProperties): void {
  trackEvent('feature_used', {
    feature: featureName,
    ...details,
  });
}

/**
 * Get stored analytics events (for debugging/export)
 */
export function getStoredEvents(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(EVENT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored events
 */
export function clearStoredEvents(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(EVENT_STORAGE_KEY);
  }
}

/**
 * Enable/disable analytics
 */
export function setAnalyticsEnabled(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sw_analytics_enabled', String(enabled));
  }
}

// Export types
export type { EventProperties, AnalyticsEvent };
