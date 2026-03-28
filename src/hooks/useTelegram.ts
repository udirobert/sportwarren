'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

/**
 * useTelegram Hook
 * Centralized hook for interacting with the Telegram Mini App API (8.0 compatible).
 */
export function useTelegram() {
  const [webApp, setWebApp] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;
      setWebApp(app);
      app.ready();
      setIsReady(true);

      // Initialize safe area
      if (app.contentSafeAreaInset) {
        setSafeArea(app.contentSafeAreaInset);
      }

      // Sync online status
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Safe area listener for dynamic changes (e.g., orientation)
  useEffect(() => {
    if (!webApp) return;

    const handleSafeAreaChanged = () => {
      if (webApp.contentSafeAreaInset) {
        setSafeArea(webApp.contentSafeAreaInset);
      }
    };

    webApp.onEvent('safeAreaChanged', handleSafeAreaChanged);
    webApp.onEvent('contentSafeAreaChanged', handleSafeAreaChanged);

    return () => {
      webApp.offEvent('safeAreaChanged', handleSafeAreaChanged);
      webApp.offEvent('contentSafeAreaChanged', handleSafeAreaChanged);
    };
  }, [webApp]);

  const user = useMemo(() => webApp?.initDataUnsafe?.user || null, [webApp]);
  const initData = useMemo(() => webApp?.initData || '', [webApp]);
  const colorScheme = useMemo(() => webApp?.colorScheme || 'dark', [webApp]);
  const themeParams = useMemo(() => webApp?.themeParams || {}, [webApp]);

  const hapticImpact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
    webApp?.HapticFeedback?.impactOccurred(style);
  }, [webApp]);

  const hapticNotification = useCallback((type: 'error' | 'success' | 'warning') => {
    webApp?.HapticFeedback?.notificationOccurred(type);
  }, [webApp]);

  const hapticSelection = useCallback(() => {
    webApp?.HapticFeedback?.selectionChanged();
  }, [webApp]);

  const showAlert = useCallback((message: string, callback?: () => void) => {
    webApp?.showAlert(message, callback);
  }, [webApp]);

  const showConfirm = useCallback((message: string, callback?: (confirmed: boolean) => void) => {
    webApp?.showConfirm(message, callback);
  }, [webApp]);

  const requestFullscreen = useCallback(() => {
    try {
      if (webApp?.version && parseFloat(webApp.version) >= 8.0) {
        webApp.requestFullscreen();
      } else {
        webApp?.expand();
      }
    } catch (e) {
      webApp?.expand();
    }
  }, [webApp]);

  const enableVerticalSwipes = useCallback(() => {
    try {
      if (webApp?.version && parseFloat(webApp.version) >= 7.0) {
        webApp.enableVerticalSwipes();
      }
    } catch (e) {
      console.warn('Vertical swipes not supported');
    }
  }, [webApp]);

  const shareToStory = useCallback((mediaUrl: string, text?: string, widgetUrl?: string) => {
    try {
      if (webApp?.version && parseFloat(webApp.version) >= 7.8) {
        webApp.shareToStory(mediaUrl, {
          text,
          widget_link: widgetUrl ? { url: widgetUrl, name: 'Open SportWarren' } : undefined
        });
      } else {
        showAlert('Story sharing is not supported on your version of Telegram.');
      }
    } catch (e) {
      console.error('Failed to share to story', e);
    }
  }, [webApp, showAlert]);

  const cloudStorage = useMemo(() => ({
    get: (key: string): Promise<string | null> => {
      return new Promise((resolve) => {
        if (!webApp?.CloudStorage) return resolve(null);
        webApp.CloudStorage.getItem(key, (_err: any, value: string) => resolve(value || null));
      });
    },
    set: (key: string, value: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!webApp?.CloudStorage) return resolve(false);
        webApp.CloudStorage.setItem(key, value, (_err: any, success: boolean) => resolve(success));
      });
    },
    remove: (key: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!webApp?.CloudStorage) return resolve(false);
        webApp.CloudStorage.removeItem(key, (_err: any, success: boolean) => resolve(success));
      });
    }
  }), [webApp]);

  const biometricManager = useMemo(() => ({
    isInited: webApp?.BiometricManager?.isInited || false,
    isBiometricAvailable: webApp?.BiometricManager?.isBiometricAvailable || false,
    biometricType: webApp?.BiometricManager?.biometricType || 'unknown',
    isAccessRequested: webApp?.BiometricManager?.isAccessRequested || false,
    isAccessGranted: webApp?.BiometricManager?.isAccessGranted || false,
    init: (): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!webApp?.BiometricManager) return resolve(false);
        webApp.BiometricManager.init(() => resolve(true));
      });
    },
    requestAccess: (reason: string): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!webApp?.BiometricManager) return resolve(false);
        webApp.BiometricManager.requestAccess({ reason }, (granted: boolean) => resolve(granted));
      });
    },
    authenticate: (reason: string): Promise<{ success: boolean; token?: string }> => {
      return new Promise((resolve) => {
        if (!webApp?.BiometricManager) return resolve({ success: false });
        webApp.BiometricManager.authenticate({ reason }, (success: boolean, token?: string) => 
          resolve({ success, token })
        );
      });
    },
    openSettings: () => webApp?.BiometricManager?.openSettings(),
  }), [webApp]);

  return {
    webApp,
    isReady,
    user,
    initData,
    colorScheme,
    themeParams,
    safeArea,
    isOnline,
    hapticImpact,
    hapticNotification,
    hapticSelection,
    showAlert,
    showConfirm,
    requestFullscreen,
    enableVerticalSwipes,
    shareToStory,
    cloudStorage,
    biometricManager,
  };
}
