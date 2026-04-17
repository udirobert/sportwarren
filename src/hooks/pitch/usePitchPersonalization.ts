import { useState, useEffect, useCallback } from 'react';
import type { Formation } from '@/types';
import { DEFAULT_PLAYER_NAMES, STORAGE_KEYS, formationKey } from '@/lib/pitch.constants';

export interface PitchPersonalizationState {
  names: string[];
  avatars: (string | null)[];
  showNames: boolean;
  blurFaces: boolean;
  blurLevel: 'low' | 'med' | 'high';
  selectedSlotIndex: number | undefined;
  unlocked: boolean;
}

export function usePitchPersonalization(formation: Formation) {
  const [names, setNames] = useState<string[]>([]);
  const [avatars, setAvatars] = useState<(string | null)[]>([]);
  const [showNames, setShowNames] = useState(false);
  const [blurFaces, setBlurFaces] = useState(false);
  const [blurLevel, setBlurLevel] = useState<'low' | 'med' | 'high'>('med');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | undefined>(undefined);
  const [unlocked, setUnlocked] = useState(false);

  // Initialize names/avatars from defaults
  const initDefaults = useCallback((squadSize: number) => {
    setNames([...DEFAULT_PLAYER_NAMES].slice(0, squadSize));
    setAvatars(new Array(squadSize).fill(null));
  }, []);

  // Load unlock state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUnlocked(window.localStorage.getItem(STORAGE_KEYS.PERSONALIZE_UNLOCKED) === '1');
  }, []);

  // Load from localStorage on formation change
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const key = formationKey(formation);
      const n = window.localStorage.getItem(key(STORAGE_KEYS.NAMES)) || window.localStorage.getItem(STORAGE_KEYS.NAMES);
      const a = window.localStorage.getItem(key(STORAGE_KEYS.AVATARS)) || window.localStorage.getItem(STORAGE_KEYS.AVATARS);
      const s = window.localStorage.getItem(key(STORAGE_KEYS.SHOW_NAMES)) || window.localStorage.getItem(STORAGE_KEYS.SHOW_NAMES);
      const b = window.localStorage.getItem(key(STORAGE_KEYS.BLUR_FACES)) || window.localStorage.getItem(STORAGE_KEYS.BLUR_FACES);
      const bl = window.localStorage.getItem(key(STORAGE_KEYS.BLUR_LEVEL)) || window.localStorage.getItem(STORAGE_KEYS.BLUR_LEVEL);
       if (n) { const v = JSON.parse(n); if (Array.isArray(v) && v.length) setNames(v); }
       if (a) { const v = JSON.parse(a); if (Array.isArray(v) && v.length) setAvatars(v); }
      if (s) setShowNames(s === '1');
      if (b) setBlurFaces(b === '1');
      if (bl === 'low' || bl === 'med' || bl === 'high') setBlurLevel(bl);
    } catch (e) {
      console.warn('Failed to load pitch settings from localStorage', e);
    }
  }, [formation]);

  // Persist to localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const key = formationKey(formation);
      window.localStorage.setItem(key(STORAGE_KEYS.NAMES), JSON.stringify(names));
      window.localStorage.setItem(key(STORAGE_KEYS.AVATARS), JSON.stringify(avatars));
      window.localStorage.setItem(key(STORAGE_KEYS.SHOW_NAMES), showNames ? '1' : '0');
      window.localStorage.setItem(key(STORAGE_KEYS.BLUR_FACES), blurFaces ? '1' : '0');
      window.localStorage.setItem(key(STORAGE_KEYS.BLUR_LEVEL), blurLevel);
    } catch (e) {
      console.warn('Failed to save pitch settings to localStorage', e);
    }
  }, [names, avatars, showNames, blurFaces, blurLevel, formation]);

  const setUnlockedAndPersist = useCallback((value: boolean) => {
    setUnlocked(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEYS.PERSONALIZE_UNLOCKED, value ? '1' : '0');
    }
  }, []);

  const resetCurrentFormation = useCallback(() => {
    setNames(['Tunde', 'Kofi', 'Diallo', 'Eze', 'Yusuf', 'GK']);
    setAvatars([null, null, null, null, null, null]);
    setShowNames(false);
    setBlurFaces(false);
    try {
      if (typeof window !== 'undefined') {
        const key = formationKey(formation);
        [STORAGE_KEYS.NAMES, STORAGE_KEYS.AVATARS, STORAGE_KEYS.SHOW_NAMES, STORAGE_KEYS.BLUR_FACES, STORAGE_KEYS.BLUR_LEVEL]
          .forEach((k) => window.localStorage.removeItem(key(k)));
      }
    } catch {}
  }, [formation]);

  const resetAllFormations = useCallback(() => {
    setNames(['Tunde', 'Kofi', 'Diallo', 'Eze', 'Yusuf', 'GK']);
    setAvatars([null, null, null, null, null, null]);
    setShowNames(false);
    setBlurFaces(false);
    setBlurLevel('med');
    try {
      if (typeof window !== 'undefined') {
        const { FORMATIONS } = require('@/lib/formations');
        const fmList = Object.keys(FORMATIONS);
        const keys = [STORAGE_KEYS.NAMES, STORAGE_KEYS.AVATARS, STORAGE_KEYS.SHOW_NAMES, STORAGE_KEYS.BLUR_FACES, STORAGE_KEYS.BLUR_LEVEL];
        fmList.forEach((fm: string) => keys.forEach((k) => window.localStorage.removeItem(`${k}_${fm}`)));
        keys.forEach((k) => window.localStorage.removeItem(k));
      }
    } catch {}
  }, []);

  return {
    names, setNames,
    avatars, setAvatars,
    showNames, setShowNames,
    blurFaces, setBlurFaces,
    blurLevel, setBlurLevel,
    selectedSlotIndex, setSelectedSlotIndex,
    unlocked, setUnlocked: setUnlockedAndPersist,
    initDefaults,
    resetCurrentFormation,
    resetAllFormations,
  };
}
