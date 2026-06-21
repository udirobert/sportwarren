'use client';

import React, { useState } from 'react';
import { PALETTE } from '../../_components/MiniAvatar';

interface PuzzleOption {
  id: string;
  label: string;
  correct: boolean;
}

interface Puzzle {
  id: string;
  title: string;
  scenario: string;
  question: string;
  options: PuzzleOption[];
  explanation: string;
}

export function TacticsPuzzleClient({ puzzle, token }: { puzzle: Puzzle; token: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctOption = puzzle.options.find((o) => o.correct)!;
  const got = submitted && selected === correctOption.id;

  return (
    <div>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PALETTE.navy,
          marginBottom: 14,
        }}
      >
        {puzzle.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {puzzle.options.map((opt) => {
          const isSelected = selected === opt.id;
          const isCorrect = submitted && opt.correct;
          const isWrong = submitted && isSelected && !opt.correct;
          const borderColor = isCorrect
            ? PALETTE.sage
            : isWrong
            ? PALETTE.red
            : isSelected
            ? PALETTE.ink
            : PALETTE.inkLight;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={submitted}
              onClick={() => setSelected(opt.id)}
              style={{
                background: isCorrect
                  ? 'rgba(74,117,73,0.1)'
                  : isWrong
                  ? 'rgba(201,16,34,0.08)'
                  : PALETTE.cream,
                border: `2px solid ${borderColor}`,
                padding: '14px 16px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 13,
                lineHeight: 1.45,
                color: PALETTE.ink,
                textAlign: 'left',
                cursor: submitted ? 'default' : 'pointer',
                width: '100%',
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginRight: 10,
                  color: isCorrect ? PALETTE.sage : isWrong ? PALETTE.red : PALETTE.navy,
                  fontSize: 11,
                }}
              >
                {opt.id.toUpperCase()}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          type="button"
          disabled={!selected}
          onClick={() => setSubmitted(true)}
          style={{
            background: selected ? PALETTE.mustard : 'rgba(0,0,0,0.06)',
            color: PALETTE.ink,
            padding: '18px 20px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textAlign: 'center',
            border: `2px solid ${selected ? PALETTE.red : PALETTE.inkLight}`,
            cursor: selected ? 'pointer' : 'not-allowed',
            width: '100%',
          }}
        >
          Lock in answer →
        </button>
      ) : (
        <div
          style={{
            background: got ? 'rgba(74,117,73,0.08)' : 'rgba(201,16,34,0.05)',
            border: `2px solid ${got ? PALETTE.sage : PALETTE.red}`,
            borderLeft: `8px solid ${got ? PALETTE.sage : PALETTE.red}`,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: got ? PALETTE.sage : PALETTE.red,
              marginBottom: 8,
            }}
          >
            {got ? 'Correct · TACTICS XP held' : `Not it · the answer was ${correctOption.id.toUpperCase()}`}
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              lineHeight: 1.6,
              color: PALETTE.ink,
            }}
          >
            {puzzle.explanation}
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              lineHeight: 1.5,
              color: PALETTE.inkLight,
              marginTop: 14,
              fontStyle: 'italic',
            }}
          >
            Once the TACTICS attribute ships (post-Tuesday migration),
            getting puzzles right will move it. For now this is calibration
            — we're learning which scenarios resonate.
          </div>
        </div>
      )}
    </div>
  );
}
