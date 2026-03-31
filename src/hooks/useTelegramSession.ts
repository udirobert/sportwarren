'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTelegram } from './useTelegram';

interface UseTelegramSessionReturn {
  sessionToken: string;
  sessionBootstrapped: boolean;
  requiresSquadOnboarding: boolean;
  setRequiresSquadOnboarding: (v: boolean) => void;
  error: string | null;
  setError: (e: string | null) => void;
  openSquadSetup: () => Promise<void>;
}

export function useTelegramSession(): UseTelegramSessionReturn {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const { webApp, isReady, cloudStorage } = useTelegram();

  const [sessionToken, setSessionToken] = useState(tokenFromUrl);
  const [sessionBootstrapped, setSessionBootstrapped] = useState(Boolean(tokenFromUrl));
  const [requiresSquadOnboarding, setRequiresSquadOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenFromUrl || tokenFromUrl === sessionToken) {
      return;
    }

    setSessionToken(tokenFromUrl);
    setSessionBootstrapped(true);
  }, [tokenFromUrl, sessionToken]);

  useEffect(() => {
    if (tokenFromUrl || !isReady) {
      if (tokenFromUrl) {
        setSessionBootstrapped(true);
      }
      return;
    }

    let cancelled = false;
    const bootstrapSession = async () => {
      let initData = webApp?.initData;

      if (!initData) {
        for (let attempt = 0; attempt < 3; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, 600));
          if (cancelled) return;
          initData = webApp?.initData;
          if (initData) break;
        }
      }

      if (!initData) {
        if (!cancelled) {
          setSessionBootstrapped(true);
        }
        return;
      }

      try {
        const response = await fetch('/api/telegram/mini-app/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data?.token) {
          throw new Error(data?.error || 'Failed to initialize Telegram Mini App session.');
        }

        if (cancelled) {
          return;
        }

        setSessionToken(data.token as string);
        setRequiresSquadOnboarding(Boolean(data?.hasSquad === false));
        setSessionBootstrapped(true);

        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('token', data.token as string);
          window.history.replaceState(window.history.state, '', url.toString());
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to initialize Telegram Mini App.');
        setSessionBootstrapped(true);
      }
    };

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [tokenFromUrl, isReady, webApp]);

  const openSquadSetup = useCallback(async () => {
    const initData = webApp?.initData;

    if (initData) {
      setError(null);
      try {
        const response = await fetch('/api/telegram/mini-app/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ initData }),
        });
        const data = await response.json().catch(() => ({}));

        if (response.ok && data?.token) {
          setSessionToken(data.token as string);
          setRequiresSquadOnboarding(Boolean(data?.hasSquad === false));
          setSessionBootstrapped(true);
          setError(null);

          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('token', data.token as string);
            window.history.replaceState(window.history.state, '', url.toString());
          }
          return;
        }

        setError(data?.error || 'Failed to connect. Please try again.');
      } catch {
        setError('Network error. Please check your connection and try again.');
      }
    } else {
      setError('This app must be opened from Telegram. Tap the bot menu or use /app in your squad chat.');
    }
  }, [webApp]);

  return {
    sessionToken,
    sessionBootstrapped,
    requiresSquadOnboarding,
    setRequiresSquadOnboarding,
    error,
    setError,
    openSquadSetup,
  };
}
