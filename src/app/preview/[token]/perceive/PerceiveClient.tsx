'use client';

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../../_components/MiniAvatar';
import {
  TYPE,
  TRACKING,
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
  V3CTAButton,
} from '@/components/v3';
import { submitPerception } from './_actions';

interface Target {
  profileId: string;
  name: string;
  firstName: string;
  position: string | null;
  avatar: {
    kit?: string;
    accent?: string;
    skin?: string;
    hair?: string;
    hairStyle?: string;
    number?: string;
  };
}

interface ScenarioPayload {
  id: string;
  prompt: string;
  context?: string;
  hasPrescriptive: boolean;
  options: Array<{ id: 'a' | 'b' | 'c' | 'd'; label: string }>;
}

interface RatedRow {
  targetId: string;
  scenarioId: string;
  kind: string;
  choice: string;
}

interface Combo {
  target: Target;
  scenario: ScenarioPayload;
  kind: 'descriptive' | 'prescriptive';
}

function buildCombos(targets: Target[], scenarios: ScenarioPayload[]): Combo[] {
  const out: Combo[] = [];
  for (const target of targets) {
    for (const scenario of scenarios) {
      out.push({ target, scenario, kind: 'descriptive' });
      if (scenario.hasPrescriptive) {
        out.push({ target, scenario, kind: 'prescriptive' });
      }
    }
  }
  // Shuffle with a stable RNG seeded by target IDs to keep the order
  // consistent across reloads in the same session.
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function comboKey(c: Combo): string {
  return `${c.target.profileId}::${c.scenario.id}::${c.kind}`;
}

function ratedKey(r: RatedRow): string {
  return `${r.targetId}::${r.scenarioId}::${r.kind}`;
}

export function PerceiveClient({
  token,
  squadName,
  raterName,
  targets,
  scenarios,
  alreadyRated,
  totalCombos,
}: {
  token: string;
  squadName: string;
  raterName: string;
  targets: Target[];
  scenarios: ScenarioPayload[];
  alreadyRated: RatedRow[];
  totalCombos: number;
}) {
  // Build the full combo set once on mount.
  const allCombos = useMemo(() => buildCombos(targets, scenarios), [targets, scenarios]);
  const ratedSet = useMemo(() => new Set(alreadyRated.map(ratedKey)), [alreadyRated]);

  // Working queue — combos the user hasn't rated yet.
  const initialQueue = useMemo(
    () => allCombos.filter((c) => !ratedSet.has(comboKey(c))),
    [allCombos, ratedSet],
  );
  const [queue, setQueue] = useState<Combo[]>(initialQueue);
  const [completed, setCompleted] = useState(alreadyRated.length);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const current = queue[0];

  const totalToShow = Math.min(totalCombos, allCombos.length);
  const progress = Math.min(completed, totalToShow);

  const onChoice = (choiceId: 'a' | 'b' | 'c' | 'd') => {
    if (!current) return;
    const combo = current;
    // Optimistic — pop the queue, increment completed, hit the server.
    setQueue((q) => q.slice(1));
    setCompleted((c) => c + 1);
    setFeedback(combo.kind === 'descriptive' ? 'Locked in' : 'Hot take locked');

    startTransition(async () => {
      const res = await submitPerception({
        token,
        targetProfileId: combo.target.profileId,
        scenarioId: combo.scenario.id,
        choice: choiceId,
        kind: combo.kind,
      });
      // On failure, put it back at the head and decrement.
      if (!res.ok) {
        setQueue((q) => [combo, ...q]);
        setCompleted((c) => Math.max(0, c - 1));
        setFeedback('Couldn’t save — try again');
      }
      // Clear feedback after a beat
      setTimeout(() => setFeedback(null), 900);
    });
  };

  // Done state
  if (!current) {
    return (
      <V3PageShell>
        <V3Ribbon />
        <V3IdentityLine
          context={`Perception · ${squadName}`}
          showDot={false}
          marginBottom={20}
        />
        <V3Heading size="large">
          Hot takes<br />locked in.
        </V3Heading>
        <p
          style={{
            fontFamily: TYPE.mono,
            fontSize: 14,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 18,
            marginBottom: 28,
            maxWidth: 480,
          }}
        >
          You&apos;ve weighed in on every scenario. Now check what the
          group said about you — the perception report unlocks once
          5+ lads have rated you too.
        </p>

        <V3CTAButton href={`/preview/${encodeURIComponent(token)}/perceived`} marginBottom={12}>
          See what the lads said about me →
        </V3CTAButton>
        <V3CTAButton href={`/preview/${encodeURIComponent(token)}`} variant="secondary">
          Back to your card
        </V3CTAButton>
      </V3PageShell>
    );
  }

  // Active question
  const prompt = current.scenario.prompt.replace(/\{name\}/g, current.target.firstName);

  return (
    <V3PageShell>
      <V3Ribbon />
      <V3IdentityLine context={`Perception · ${squadName}`} showDot={false} marginBottom={20} />

      {/* Progress band */}
      <div
        style={{
          background: PALETTE.ink,
          color: PALETTE.cream,
          padding: '12px 16px',
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          borderLeft: `4px solid ${current.kind === 'descriptive' ? PALETTE.mustard : PALETTE.red}`,
        }}
      >
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {progress + 1} / {totalToShow}
        </span>
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            opacity: 0.85,
          }}
        >
          {current.kind === 'descriptive' ? 'What they do' : 'What they SHOULD do'}
        </span>
      </div>

      {/* Target line — small avatar + name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 16,
        }}
      >
        <MiniAvatar {...current.target.avatar} size={56} />
        <div>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.navy,
              marginBottom: 2,
            }}
          >
            {current.target.position ?? 'No position set'}
          </div>
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 26,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
            }}
          >
            {current.target.name}
          </div>
        </div>
      </div>

      {/* Prompt */}
      <div
        style={{
          fontFamily: TYPE.display,
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: PALETTE.ink,
          marginBottom: 12,
        }}
      >
        {prompt}
      </div>
      {current.scenario.context && (
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 12,
            fontStyle: 'italic',
            color: PALETTE.inkLight,
            marginBottom: 20,
          }}
        >
          {current.scenario.context}
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {current.scenario.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            disabled={pending}
            onClick={() => onChoice(opt.id)}
            style={{
              background: PALETTE.cream,
              color: PALETTE.ink,
              border: `2px solid ${PALETTE.ink}`,
              padding: '16px 18px',
              fontFamily: TYPE.mono,
              fontSize: 14,
              lineHeight: 1.45,
              textAlign: 'left',
              cursor: pending ? 'wait' : 'pointer',
              opacity: pending ? 0.7 : 1,
              width: '100%',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <span
              style={{
                fontFamily: TYPE.display,
                fontSize: 22,
                fontWeight: 800,
                color: current.kind === 'descriptive' ? PALETTE.mustard : PALETTE.red,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                minWidth: 22,
                paddingTop: 1,
              }}
            >
              {opt.id.toUpperCase()}
            </span>
            <span style={{ flex: 1 }}>{opt.label}</span>
          </button>
        ))}
      </div>

      {feedback && (
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            color: PALETTE.sage,
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          {feedback}
        </div>
      )}

      <Link
        href={`/preview/${encodeURIComponent(token)}`}
        style={{
          fontFamily: TYPE.mono,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: TRACKING.cap,
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          textDecoration: 'none',
          textAlign: 'center',
          display: 'block',
          marginTop: 12,
        }}
      >
        Pause — back to your card
      </Link>
    </V3PageShell>
  );
}
