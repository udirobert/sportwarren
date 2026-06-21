/**
 * Tactics puzzle — scaffold for the chess.com lichess-training equivalent.
 *
 *   /preview/<token>/tactics
 *
 * SCAFFOLD HONESTLY: this is a single hardcoded puzzle, no library yet,
 * no drag-and-drop, no real "TACTICS" attribute on the twin. The full
 * implementation is a multi-week project documented in
 * `docs/product-calibration.md` (Tactics puzzle library — post-Tuesday).
 *
 * What ships now:
 *   - One puzzle: "4-3-3 vs the high press — where do you receive?"
 *   - Multiple-choice answer with right/wrong feedback
 *   - +5 XP on correct first try (no attribute deltas — that's blocked
 *     until the TACTICS attribute is added in a future migration)
 *
 * What's intentionally NOT shipped (Tuesday):
 *   - Drag-and-drop formation board (the spyderkam/Tactics-Board pattern)
 *   - Puzzle authoring tools
 *   - A `tactics` 7th attribute on PlayerTwin (requires migration + clamp logic)
 *   - Solve streak / difficulty progression
 *
 * The placeholder UI tells the player exactly what's coming so they
 * know this is the direction of travel.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PALETTE } from '../../_components/MiniAvatar';
import { TacticsPuzzleClient } from './TacticsPuzzleClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

// Single proof-of-concept puzzle. Post-Tuesday: replace with a puzzle
// table + content authoring flow.
const PUZZLE = {
  id: 'pp-001',
  title: 'You receive the ball under press.',
  scenario:
    "You're the CM in a 4-3-3. Your CB plays you a vertical pass. Two opposition midfielders close you down hard — one from your left shoulder, one head-on. You have ~1.5 seconds.",
  question: 'Best first touch?',
  options: [
    { id: 'a', label: 'Open your body — take it on the half-turn into space behind your back foot.', correct: true },
    { id: 'b', label: 'Cushion it back to your CB first time. Reset.', correct: false },
    { id: 'c', label: 'Take it square across the pitch with your strong foot.', correct: false },
    { id: 'd', label: 'Drop the shoulder and shape to shoot.', correct: false },
  ],
  explanation:
    "Half-turn under press is the foundational receiving skill — it splits the press, finds the pocket, and protects the ball from both pressers simultaneously. Cushioning back works but cedes territory. Square pass under press is how interceptions happen.",
};

export default async function TacticsPage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: { playerProfile: { include: { twin: true } } },
  });

  if (!user || user.chain !== 'preview') notFound();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Ribbon */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
        </div>

        {/* Header */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 12,
          }}
        >
          Tactics · puzzle 1 of 1 (preview)
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          {PUZZLE.title}
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            color: PALETTE.inkLight,
            lineHeight: 1.6,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          {PUZZLE.scenario}
        </p>

        {/* Honesty note — this is a scaffold */}
        <div
          style={{
            background: 'rgba(28,58,94,0.06)',
            border: `1px dashed ${PALETTE.navy}`,
            padding: '12px 14px',
            marginTop: 16,
            marginBottom: 24,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            lineHeight: 1.55,
            color: PALETTE.navy,
            letterSpacing: '0.02em',
          }}
        >
          <strong>This is a scaffold.</strong> The full library — drag-and-drop
          tactics board, scenario library, a <code>TACTICS</code> attribute
          that climbs as you solve — is the post-Tuesday build. This puzzle
          is one real proof of the direction.
        </div>

        <TacticsPuzzleClient puzzle={PUZZLE} token={token} />

        <Link
          href={`/preview/${encodeURIComponent(token)}`}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block',
            marginTop: 32,
          }}
        >
          ← Back to your twin
        </Link>
      </div>
    </div>
  );
}
