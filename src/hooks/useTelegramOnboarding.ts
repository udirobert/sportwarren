'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

interface OnboardingSquadOption {
  id: string;
  name: string;
  shortName: string | null;
  memberCount: number;
  alreadyMember: boolean;
}

interface UseTelegramOnboardingReturn {
  onboardingMode: 'menu' | 'create' | 'join';
  setOnboardingMode: (mode: 'menu' | 'create' | 'join') => void;
  onboardingNotice: string | null;
  setOnboardingNotice: (notice: string | null) => void;
  onboardingBusy: boolean;
  createSquadName: string;
  setCreateSquadName: (v: string) => void;
  createShortName: string;
  setCreateShortName: (v: string) => void;
  createHomeGround: string;
  setCreateHomeGround: (v: string) => void;
  createValidationError: string | null;
  showCreateValidationError: boolean;
  joinQuery: string;
  setJoinQuery: (v: string) => void;
  joinOptions: OnboardingSquadOption[];
  joinLoading: boolean;
  handleCreateSquad: () => Promise<void>;
  handleJoinSquad: (option: OnboardingSquadOption) => Promise<void>;
}

export function useTelegramOnboarding(
  sessionToken: string,
  loadContext: () => Promise<void>,
  setRequiresSquadOnboarding: (v: boolean) => void,
): UseTelegramOnboardingReturn {
  const [onboardingMode, setOnboardingMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [onboardingNotice, setOnboardingNotice] = useState<string | null>(null);
  const [onboardingBusy, setOnboardingBusy] = useState(false);
  const [createSquadName, setCreateSquadName] = useState('');
  const [createShortName, setCreateShortName] = useState('');
  const [createHomeGround, setCreateHomeGround] = useState('');
  const [joinQuery, setJoinQuery] = useState('');
  const [joinOptions, setJoinOptions] = useState<OnboardingSquadOption[]>([]);
  const [joinLoading, setJoinLoading] = useState(false);

  const createValidationError = useMemo(() => {
    const trimmedName = createSquadName.trim();
    const trimmedShortName = createShortName.trim();

    if (trimmedName.length < 2) {
      return 'Squad name must be at least 2 characters.';
    }

    if (trimmedShortName.length < 2 || trimmedShortName.length > 5) {
      return 'Short name must be between 2 and 5 characters.';
    }

    return null;
  }, [createShortName, createSquadName]);

  const showCreateValidationError = Boolean(createValidationError)
    && (createSquadName.trim().length > 0 || createShortName.trim().length > 0);

  const fetchJoinOptions = useCallback(async () => {
    if (!sessionToken) {
      return;
    }

    setJoinLoading(true);
    try {
      const response = await fetch(
        `/api/telegram/mini-app/onboarding/squads?token=${encodeURIComponent(sessionToken)}&q=${encodeURIComponent(joinQuery.trim())}`,
        { cache: 'no-store' },
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Could not load squads.');
      }

      setJoinOptions(Array.isArray(data?.squads) ? data.squads as OnboardingSquadOption[] : []);
    } catch (err) {
      setOnboardingNotice(err instanceof Error ? err.message : 'Could not load squads.');
      setJoinOptions([]);
    } finally {
      setJoinLoading(false);
    }
  }, [joinQuery, sessionToken]);

  useEffect(() => {
    if (!sessionToken || onboardingMode !== 'join') {
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetchJoinOptions();
    }, 180);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [sessionToken, onboardingMode, fetchJoinOptions]);

  const handleCreateSquad = async () => {
    if (!sessionToken || onboardingBusy) {
      return;
    }

    if (createValidationError) {
      setOnboardingNotice(createValidationError);
      return;
    }

    setOnboardingBusy(true);
    setOnboardingNotice(null);
    try {
      const response = await fetch('/api/telegram/mini-app/onboarding/squad/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          name: createSquadName.trim(),
          shortName: createShortName.trim().toUpperCase(),
          homeGround: createHomeGround.trim() || undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create squad.');
      }

      setOnboardingNotice(`${data?.squad?.name || 'Squad'} created. Loading your dashboard...`);
      setRequiresSquadOnboarding(false);
      setCreateSquadName('');
      setCreateShortName('');
      setCreateHomeGround('');
      setOnboardingMode('menu');
      await loadContext();
    } catch (err) {
      setOnboardingNotice(err instanceof Error ? err.message : 'Failed to create squad.');
    } finally {
      setOnboardingBusy(false);
    }
  };

  const handleJoinSquad = async (option: OnboardingSquadOption) => {
    if (!sessionToken || onboardingBusy) {
      return;
    }

    setOnboardingBusy(true);
    setOnboardingNotice(null);
    try {
      const response = await fetch('/api/telegram/mini-app/onboarding/squad/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: sessionToken,
          squadId: option.id,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to join squad.');
      }

      const joinedSquad = data?.squad;
      const squadName = joinedSquad?.name || option.name;
      const alreadyMember = Boolean(joinedSquad?.alreadyMember ?? option.alreadyMember);
      setOnboardingNotice(
        alreadyMember
          ? `Switched to ${squadName}. Loading your dashboard...`
          : `Joined ${squadName}. Loading your dashboard...`,
      );
      setRequiresSquadOnboarding(false);
      setOnboardingMode('menu');
      await loadContext();
    } catch (err) {
      setOnboardingNotice(err instanceof Error ? err.message : 'Failed to join squad.');
    } finally {
      setOnboardingBusy(false);
    }
  };

  return {
    onboardingMode,
    setOnboardingMode,
    onboardingNotice,
    setOnboardingNotice,
    onboardingBusy,
    createSquadName,
    setCreateSquadName,
    createShortName,
    setCreateShortName,
    createHomeGround,
    setCreateHomeGround,
    createValidationError,
    showCreateValidationError,
    joinQuery,
    setJoinQuery,
    joinOptions,
    joinLoading,
    handleCreateSquad,
    handleJoinSquad,
  };
}
