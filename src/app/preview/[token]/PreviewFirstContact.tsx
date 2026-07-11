'use client';

/**
 * First-contact hero — the Tier-0 (pre-reciprocity) preview.
 *
 * The old Tier-0 experience dropped a brand-new player straight into the
 * rate-5-teammates quiz with their own card LOCKED. That inverted the
 * value exchange (chore before payoff) and read tame — first contact
 * should lead with THEM.
 *
 * This shows the app's opening bet first: their predicted card + a cheeky
 * "bold call" they'll want to argue with. The peer-verdict card stays
 * gated behind rating 5 (the reciprocity doctrine is intact) — what's
 * surfaced here is the *prediction*, not what the group said. The quiz
 * becomes the second action ("settle the debate"), launched from the CTA.
 *
 * See product-calibration.md → "First-contact pass".
 */

import React, { useState } from 'react';
import {
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3SectionLabel,
  V3CTAButton,
  V3PlayerCard,
  buildPlayerCardData,
  PALETTE,
  TYPE,
  TRACKING,
  type Attrs,
} from '@/components/v3';
import type { PlayerPrediction } from '@/server/services/personalization/predictions';
import { PreviewQuizFlow } from './PreviewQuizFlow';
import { PhoneLinkPrompt } from './PhoneLinkPrompt';

// Derive the quiz prop shape from the component itself so the two never
// drift and there's no nominal-type clash when we spread it through.
type QuizProps = React.ComponentProps<typeof PreviewQuizFlow>;

export function PreviewFirstContact({
  token,
  cardUser,
  attrs,
  overall,
  level,
  prediction,
  matesToRate,
  // pass-through quiz props
  quiz,
}: {
  token: string;
  cardUser: {
    name: string | null;
    position: string | null;
    avatarKitColor?: string | null;
    avatarAccentColor?: string | null;
    avatarSkinTone?: string | null;
    avatarHairColor?: string | null;
    avatarHairStyle?: string | null;
    avatarNumber?: string | null;
  };
  attrs: Attrs;
  overall: number;
  level: number;
  prediction: PlayerPrediction;
  matesToRate: number;
  quiz: QuizProps;
}) {
  const [started, setStarted] = useState(false);

  if (started) {
    return <PreviewQuizFlow {...quiz} />;
  }

  const cardData = buildPlayerCardData({ user: cardUser, attrs, level, overall });
  const firstName = (cardUser.name ?? 'You').split(' ')[0];

  return (
    <V3PageShell>
      <V3Ribbon />
      <V3IdentityLine context="your card" />

      {/* The card — value first, before any ask */}
      <div style={{ marginBottom: 28 }}>
        <V3PlayerCard data={cardData} variant="full" />
      </div>

      {/* The opening bet */}
      <V3SectionLabel>The opening bet</V3SectionLabel>
      <p
        style={{
          fontFamily: TYPE.display,
          fontSize: 26,
          lineHeight: 1.15,
          color: PALETTE.ink,
          margin: '4px 0 14px',
        }}
      >
        “{prediction.boldCall}”
      </p>

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 13,
          lineHeight: 1.5,
          color: PALETTE.inkLight,
          margin: '0 0 6px',
        }}
      >
        Backing your <strong style={{ color: PALETTE.ink }}>{prediction.strength.label}</strong>{' '}
        ({prediction.strength.value}) — but that{' '}
        <strong style={{ color: PALETTE.ink }}>{prediction.weakness.label}</strong>{' '}
        ({prediction.weakness.value}) is doing you no favours. Prove us wrong.
      </p>
      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 13,
          lineHeight: 1.5,
          color: PALETTE.inkLight,
          margin: '0 0 24px',
        }}
      >
        {firstName} — {prediction.predictedLine}.
      </p>

      {/* The ask, reframed as settling the debate */}
      <V3CTAButton variant="primary" onClick={() => setStarted(true)}>
        Rate the lads →
      </V3CTAButton>
      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 11,
          letterSpacing: TRACKING.cap,
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          margin: '12px 0 0',
        }}
      >
        These are our predictions — the lads decide what’s real. Rate {matesToRate} of
        them to unlock what they actually think of you.
      </p>

      {/* Secondary, low-key — never competes with the primary CTA above.
          Tied to a concrete payoff happening tonight, not an abstract
          "connect your account" ask. */}
      <div style={{ marginTop: 28, paddingTop: 20, borderTop: `1px solid ${PALETTE.ink}15` }}>
        <PhoneLinkPrompt
          token={token}
          context="pregame"
          promptLine={`Want us to tell you tomorrow if you proved us wrong? Link WhatsApp.`}
        />
      </div>
    </V3PageShell>
  );
}
