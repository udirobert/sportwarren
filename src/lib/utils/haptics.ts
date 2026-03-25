/**
 * SportWarren Haptic Feedback Utilities
 * Standardized vibration patterns for web and native environments
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Trigger haptic feedback if supported by the browser/device
 */
export function triggerHaptic(type: HapticType = 'light') {
  // 1. Try Telegram WebApp HapticFeedback if available
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
    switch (type) {
      case 'light':
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        window.Telegram.WebApp.HapticFeedback.impactOccurred('heavy');
        break;
      case 'success':
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        break;
      case 'warning':
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
        break;
      case 'error':
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
        break;
    }
    return;
  }

  // 2. Fallback to standard Navigator Vibrate API
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(30);
        break;
      case 'heavy':
        navigator.vibrate(60);
        break;
      case 'success':
        navigator.vibrate([20, 30, 20]);
        break;
      case 'warning':
        navigator.vibrate([50, 50, 50]);
        break;
      case 'error':
        navigator.vibrate([50, 100, 50, 100, 50]);
        break;
    }
  }
}

/**
 * Hook for easy haptic usage in components
 */
export function useHaptics() {
  return {
    trigger: triggerHaptic,
    selection: () => triggerHaptic('light'),
    impact: (type: 'light' | 'medium' | 'heavy') => triggerHaptic(type),
    notification: (type: 'success' | 'warning' | 'error') => triggerHaptic(type),
  };
}
