'use client';

/**
 * RiveCharacter — the living V3 risograph footballer.
 *
 * Client component that renders a Rive `.riv` file and drives its
 * state machine from `AvatarPresentation` data. Replaces the static
 * `MiniAvatar` SVG in the `V3PlayerCard` full + showcase variants.
 *
 * The character is part of the product (the card), responding to real
 * career data (match events, peer ratings, level-ups) and user input
 * (hover/tap). Not a sticker on top — see
 * `docs/makeathon/rive-character-design.md` for the full spec.
 *
 * TOOLCHAIN STATUS: @rive-app/react-canvas 4.28.6 verified working
 * with Next 16.2.6 + React 18.3 (no a.startsWith runtime error,
 * canvas renders, no webpack config changes needed).
 *
 * TODO: replace RIVE_SRC with the real .riv once built in the Rive
 * editor. The state machine name + input names must match the .riv.
 */

import { useEffect, useRef } from 'react';
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas';
import type { AvatarPresentation } from '@/lib/avatar/types';

// ── Map presentation enums → Rive number inputs ──────────────────────

const ARCHETYPE_INDEX: Record<string, number> = {
  finisher: 0,
  creator: 1,
  engine: 2,
  anchor: 3,
  guardian: 4,
  leader: 5,
};

const FORM_STATE_INDEX: Record<string, number> = {
  neutral: 0,
  hot: 1,
  trusted: 2,
  clutch: 3,
  locked_in: 4,
};

const FRAME_TIER_INDEX: Record<string, number> = {
  rookie: 0,
  starter: 1,
  regular: 2,
  standout: 3,
  captain_class: 4,
  legend: 5,
};

// ── Constants — must match the .riv file built in Rive editor ────────

const RIVE_SRC = '/rive/player-character.riv';
const STATE_MACHINE = 'PlayerCharacter';

const INPUTS = {
  archetype: 'archetype',
  formState: 'formState',
  frameTier: 'frameTier',
  overall: 'overall',
  glow: 'glow',
  unlock: 'unlock',
} as const;

// ── Component ────────────────────────────────────────────────────────

export interface RiveCharacterProps {
  presentation: AvatarPresentation;
  overall: number;
  size?: number;
}

export function RiveCharacter({ presentation, overall, size = 120 }: RiveCharacterProps) {
  const { rive, RiveComponent } = useRive({
    src: RIVE_SRC,
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    onLoadError: (err) => console.error('[RiveCharacter] load error:', err),
  });

  const archetypeInput = useStateMachineInput(rive, STATE_MACHINE, INPUTS.archetype);
  const formStateInput = useStateMachineInput(rive, STATE_MACHINE, INPUTS.formState);
  const frameTierInput = useStateMachineInput(rive, STATE_MACHINE, INPUTS.frameTier);
  const overallInput = useStateMachineInput(rive, STATE_MACHINE, INPUTS.overall);
  const glowInput = useStateMachineInput(rive, STATE_MACHINE, INPUTS.glow);
  const unlockInput = useStateMachineInput(rive, STATE_MACHINE, INPUTS.unlock);

  // Track previous unlock to fire the trigger only on new unlocks
  const prevUnlockKey = useRef<string | null>(null);

  useEffect(() => {
    if (!rive) return;

    if (archetypeInput && presentation.archetype) {
      archetypeInput.value = ARCHETYPE_INDEX[presentation.archetype] ?? 0;
    }
    if (formStateInput) {
      formStateInput.value = FORM_STATE_INDEX[presentation.formState] ?? 0;
    }
    if (frameTierInput) {
      frameTierInput.value = FRAME_TIER_INDEX[presentation.frameTier] ?? 0;
    }
    if (overallInput) {
      overallInput.value = overall;
    }
    if (glowInput) {
      glowInput.value = presentation.verifiedGlow;
    }

    // Fire unlock trigger when a new recentUnlock appears
    const unlockKey = presentation.recentUnlock
      ? `${presentation.recentUnlock.type}:${presentation.recentUnlock.unlockedAt}`
      : null;
    if (unlockInput && unlockKey && unlockKey !== prevUnlockKey.current) {
      unlockInput.fire();
    }
    prevUnlockKey.current = unlockKey;
  }, [
    rive,
    presentation.archetype,
    presentation.formState,
    presentation.frameTier,
    presentation.verifiedGlow,
    presentation.recentUnlock,
    overall,
    archetypeInput,
    formStateInput,
    frameTierInput,
    overallInput,
    glowInput,
    unlockInput,
  ]);

  return (
    <div style={{ width: size, height: size }}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
