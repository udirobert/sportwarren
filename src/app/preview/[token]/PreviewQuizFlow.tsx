'use client';

import React, { useMemo, useState, useTransition, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../_components/MiniAvatar';
import { TYPE } from '@/components/v3';
import { submitPerception, type PerceptionPeek } from './_actions';

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';
const STAGGER_STEP = 50;

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

interface Option {
  id: 'a' | 'b' | 'c' | 'd';
  label: string;
}

interface ScenarioPayload {
  id: string;
  prompt: string;
  context?: string;
  hasPrescriptive: boolean;
  options: Option[];
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

function comboKey(c: Combo): string { return `${c.target.profileId}::${c.scenario.id}::${c.kind}`; }
function ratedKey(r: RatedRow): string { return `${r.targetId}::${r.scenarioId}::${r.kind}`; }

function buildCombos(targets: Target[], scenarios: ScenarioPayload[]): Combo[] {
  const out: Combo[] = [];
  for (const t of targets) {
    for (const s of scenarios) {
      out.push({ target: t, scenario: s, kind: 'descriptive' });
      if (s.hasPrescriptive) out.push({ target: t, scenario: s, kind: 'prescriptive' });
    }
  }
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const STYLE_ID = 'pqf-anim';
function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes swFadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes swFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .sw-stagger { opacity: 0; animation: swFadeUp 300ms ${EASE_OUT} forwards; }
    .sw-stagger-peek { opacity: 0; animation: swFadeIn 300ms ${EASE_OUT} forwards; }
    .sw-stagger-card { opacity: 0; animation: swFadeUp 500ms ${EASE_OUT} forwards; }

    @media (hover: hover) and (pointer: fine) {
      .sw-opt-btn:hover { opacity: 0.6 !important; }
    }

    .sw-opt-btn { transition: opacity 160ms ${EASE_OUT}, transform 160ms ${EASE_OUT}; cursor: pointer; }
    .sw-opt-btn:active { transform: scale(0.97) !important; }
    .sw-opt-btn:disabled { cursor: wait; }

    @media (prefers-reduced-motion: reduce) {
      .sw-stagger, .sw-stagger-peek, .sw-stagger-card {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
      .sw-opt-btn { transition: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export function PreviewQuizFlow({
  token,
  squadName,
  raterName,
  targets,
  scenarios,
  alreadyRated,
  totalCombos,
  completedInit,
}: {
  token: string;
  squadName: string;
  raterName: string;
  targets: Target[];
  scenarios: ScenarioPayload[];
  alreadyRated: RatedRow[];
  totalCombos: number;
  completedInit: number;
}) {
  const allCombos = useMemo(() => buildCombos(targets, scenarios), [targets, scenarios]);
  const ratedSet = useMemo(() => new Set(alreadyRated.map(ratedKey)), [alreadyRated]);
  const initialQueue = useMemo(() => allCombos.filter((c) => !ratedSet.has(comboKey(c))), [allCombos, ratedSet]);

  const [queue, setQueue] = useState<Combo[]>(initialQueue);
  const [completed, setCompleted] = useState(completedInit);
  const [pending, startTransition] = useTransition();
  const [currentExit, setCurrentExit] = useState(false);
  const [peek, setPeek] = useState<{ combo: Combo; data: PerceptionPeek } | null>(null);
  const [showCard, setShowCard] = useState(completedInit >= 5 && initialQueue.length === 0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [milestoneLabel, setMilestoneLabel] = useState<string | null>(null);
  const injected = useRef(false);
  const milestonesRef = useRef(new Set<number>());

  // Seed already-reached milestones on mount
  if (injected.current === false) {
    if (completedInit >= 5) milestonesRef.current.add(5);
    if (completedInit >= 10) milestonesRef.current.add(10);
    if (completedInit >= 20) milestonesRef.current.add(20);
  }

  if (!injected.current) { injectStyles(); injected.current = true; }

  const current = queue[0];
  const totalToShow = Math.min(totalCombos, allCombos.length);

  const handleChoice = useCallback((choiceId: 'a' | 'b' | 'c' | 'd') => {
    if (!current || pending) return;
    const combo = current;
    const prevCompleted = completed;

    setCurrentExit(true);
    setTimeout(() => {
      setQueue((q) => q.slice(1));
      setCompleted((c) => c + 1);

      startTransition(async () => {
        const res = await submitPerception({
          token,
          targetProfileId: combo.target.profileId,
          scenarioId: combo.scenario.id,
          choice: choiceId,
          kind: combo.kind,
        });
        if (res.ok && res.peek) {
          setPeek({ combo, data: res.peek });
          setTimeout(() => {
            setPeek(null);
            setCurrentExit(false);
            setQuestionIndex((i) => i + 1);

            const gc = res.givenCount ?? 0;
            if (gc >= 20 && !milestonesRef.current.has(20)) {
              milestonesRef.current.add(20); milestonesRef.current.add(10); milestonesRef.current.add(5);
              setShowCard(true); setMilestoneLabel('Perception report unlocked');
            } else if (gc >= 10 && !milestonesRef.current.has(10)) {
              milestonesRef.current.add(10); milestonesRef.current.add(5);
              setShowCard(true); setMilestoneLabel('Your full card is ready');
            } else if (gc >= 5 && !milestonesRef.current.has(5)) {
              milestonesRef.current.add(5);
              setShowCard(true); setMilestoneLabel('Your card is ready');
            }
          }, 1400);
        } else {
          setQueue((q) => [combo, ...q]);
          setCompleted((c) => Math.max(0, c - 1));
          setCurrentExit(false);
        }
      });
    }, 200);
  }, [current, pending, token, queue.length, completed]);

  // ── Complete state ──
  if (showCard) {
    return <CardReveal raterName={raterName} token={token} label={milestoneLabel} />;
  }

  // ── Peek interstitial ──
  if (peek) {
    return (
      <PeekScreen
        combo={peek.combo}
        data={peek.data}
      />
    );
  }

  // ── No more combos ──
  if (!current) {
    return (
      <div style={{ background: PALETTE.cream, minHeight: '100vh', padding: '48px 24px' }}>
        <p style={{ fontFamily: TYPE.mono, fontSize: 13, fontWeight: 700, color: PALETTE.navy, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
          {squadName}
        </p>
        <h1 style={{ fontFamily: TYPE.display, fontSize: 40, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', textTransform: 'uppercase', color: PALETTE.ink, margin: '0 0 20px' }}>
          All hot takes<br />locked in.
        </h1>
        <p style={{ fontFamily: TYPE.mono, fontSize: 14, lineHeight: 1.6, color: PALETTE.inkLight, maxWidth: 420, marginBottom: 28 }}>
          {completed >= 5
            ? `You've rated ${completed} lads. Your card is ready.`
            : `You've weighed in ${completed} times. Your perception report unlocks once 5+ lads have rated you too.`}
        </p>
        <Link
          href={`/preview/${encodeURIComponent(token)}`}
          style={{
            fontFamily: TYPE.display,
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            textDecoration: 'none',
            borderBottom: `2px solid ${PALETTE.mustard}`,
            paddingBottom: 2,
          }}
        >
          {completed >= 5 ? 'See your card →' : 'Back'}
        </Link>
      </div>
    );
  }

  // ── Active question ──
  const prompt = current.scenario.prompt.replace(/\{name\}/g, current.target.firstName);

  return (
    <div style={{
      background: PALETTE.cream,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '48px 24px 32px',
      transition: `opacity 200ms ${EASE_OUT}`,
      opacity: currentExit ? 0 : 1,
    }}>
      <p style={{
        fontFamily: TYPE.mono,
        fontSize: 12,
        fontWeight: 700,
        color: PALETTE.navy,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: 24,
        animationDelay: '0ms',
      }} className="sw-stagger">
        {raterName} · {squadName}
      </p>

      <div key={questionIndex} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 520, margin: '0 auto', width: '100%' }}>
        <p style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          marginBottom: 8,
          animationDelay: `${STAGGER_STEP}ms`,
        }} className="sw-stagger">
          {current.kind === 'descriptive' ? 'They do' : 'They should'}
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 12,
          animationDelay: `${STAGGER_STEP * 2}ms`,
        }} className="sw-stagger">
          <MiniAvatar {...current.target.avatar} size={32} />
          <span style={{
            fontFamily: TYPE.display,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: PALETTE.ink,
            lineHeight: 1,
          }}>
            {current.target.firstName}
          </span>
        </div>

        <h2 style={{
          fontFamily: TYPE.display,
          fontSize: 30,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: PALETTE.ink,
          margin: '0 0 6px',
          animationDelay: `${STAGGER_STEP * 3}ms`,
        }} className="sw-stagger">
          {prompt}
        </h2>

        {current.scenario.context && (
          <p style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            fontStyle: 'italic',
            color: PALETTE.inkLight,
            margin: '0 0 32px',
            animationDelay: `${STAGGER_STEP * 4}ms`,
          }} className="sw-stagger">
            {current.scenario.context}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {current.scenario.options.map((opt, i) => (
            <button
              key={opt.id}
              type="button"
              disabled={pending}
              onClick={() => handleChoice(opt.id)}
              className="sw-opt-btn sw-stagger"
              style={{
                animationDelay: `${STAGGER_STEP * (5 + i)}ms`,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${PALETTE.ink}20`,
                padding: '14px 0',
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
                textAlign: 'left',
                width: '100%',
              }}
            >
              <span style={{
                fontFamily: TYPE.display,
                fontSize: 20,
                fontWeight: 800,
                color: current.kind === 'descriptive' ? PALETTE.sage : PALETTE.navy,
                lineHeight: 1.2,
                minWidth: 24,
                letterSpacing: '-0.01em',
              }}>
                {opt.id.toUpperCase()}
              </span>
              <span style={{
                fontFamily: TYPE.mono,
                fontSize: 14,
                lineHeight: 1.5,
                color: PALETTE.ink,
                flex: 1,
              }}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <p style={{
        fontFamily: TYPE.mono,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: PALETTE.inkLight,
        textAlign: 'center',
        marginTop: 32,
        animationDelay: `${STAGGER_STEP * 9}ms`,
      }} className="sw-stagger">
        {completed + 1} / {totalToShow}
      </p>
    </div>
  );
}

// ── Peek screen ──
function PeekScreen({ combo, data }: {
  combo: Combo;
  data: PerceptionPeek;
}) {
  const prompt = combo.scenario.prompt.replace(/\{name\}/g, combo.target.firstName);
  const myOption = combo.scenario.options.find((o) => o.id === data.myChoice);

  return (
    <div style={{
      background: PALETTE.cream,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <p style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          marginBottom: 6,
          animationDelay: '0ms',
        }} className="sw-stagger-peek">
          You said {data.myChoice.toUpperCase()} about {combo.target.firstName}
        </p>

        <p style={{
          fontFamily: TYPE.mono,
          fontSize: 12,
          lineHeight: 1.5,
          color: PALETTE.inkLight,
          marginBottom: 12,
          animationDelay: '60ms',
        }} className="sw-stagger-peek">
          {prompt}
        </p>

        {myOption && (
          <p style={{
            fontFamily: TYPE.mono,
            fontSize: 13,
            fontWeight: 700,
            color: PALETTE.ink,
            lineHeight: 1.5,
            marginBottom: 16,
            animationDelay: '120ms',
          }} className="sw-stagger-peek">
            {data.myChoice.toUpperCase()}. {myOption.label}
          </p>
        )}

        <p style={{
          fontFamily: TYPE.display,
          fontSize: 26,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: PALETTE.navy,
          margin: '0 0 16px',
          animationDelay: '180ms',
        }} className="sw-stagger-peek">
          {data.headline}
        </p>

        <div style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          color: PALETTE.inkLight,
          letterSpacing: '0.06em',
          animationDelay: '240ms',
        }} className="sw-stagger-peek">
          {data.counts.total} total ·{' '}
          {(['a','b','c','d'] as const).map((k, i) => (
            <span key={k}>
              {i > 0 && ' · '}
              {k.toUpperCase()}: {data.counts[k]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Card reveal ──
function CardReveal({ token, raterName, label }: { token: string; raterName: string; label?: string | null }) {
  const injected = useRef(false);
  if (!injected.current) { injectStyles(); injected.current = true; }

  return (
    <div style={{
      background: PALETTE.cream,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <p style={{
        fontFamily: TYPE.display,
        fontSize: 36,
        fontWeight: 800,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        color: PALETTE.ink,
        margin: '0 0 12px',
        textAlign: 'center',
        animationDelay: '0ms',
      }} className="sw-stagger-card">
        {label ?? 'Your card is ready'}
      </p>
      <p style={{
        fontFamily: TYPE.mono,
        fontSize: 13,
        lineHeight: 1.5,
        color: PALETTE.inkLight,
        maxWidth: 360,
        textAlign: 'center',
        marginBottom: 48,
        animationDelay: '100ms',
      }} className="sw-stagger-card">
        {raterName}, the lads have spoken. Here&apos;s how they see you.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        <Link
          href={`/preview/${encodeURIComponent(token)}`}
          style={{
            fontFamily: TYPE.display,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            textDecoration: 'none',
            borderBottom: `3px solid ${PALETTE.mustard}`,
            paddingBottom: 3,
            animationDelay: '200ms',
          }} className="sw-stagger-card"
        >
          See your card →
        </Link>
      </div>
    </div>
  );
}
