/**
 * PerceptionBars — shared bar-chart render for perception aggregates.
 *
 * Used by PreviewCardDashboard (and future surfaces that need to show
 * "what the lads said" — e.g. captain doctrine, share card).
 *
 * Pure presentational: no data fetching, no router calls. Consumes the
 * aggregate shape from `@/server/services/perception/aggregate.ts`.
 */

import React from 'react';
import { PALETTE, TYPE } from '@/components/v3';
import type {
  ChoiceCounts,
  PerceptionAggregate,
} from '@/server/services/perception/aggregate';

const EASE_OUT = 'cubic-bezier(0.16, 1, 0.3, 1)';

export interface ScenarioMeta {
  id: string;
  prompt: string;
  context?: string;
  hasPrescriptive: boolean;
  options: Array<{ id: string; label: string }>;
}

export interface PerceptionBarsProps {
  aggregate: PerceptionAggregate;
  scenarios: ScenarioMeta[];
  /**
   * The {name} substitution in the scenario prompts. Defaults to "you"
   * (for the target viewing their own perceptions). When rendering for
   * a third party (e.g. captain doctrine), pass the player's first name.
   */
  nameSubstitution?: string;
  /** Inline style hook for the wrapping div — used for animation delay. */
  style?: React.CSSProperties;
  /** Empty-state copy override. */
  emptyMessage?: string;
}

export function PerceptionBars({
  aggregate,
  scenarios,
  nameSubstitution = 'you',
  style,
  emptyMessage,
}: PerceptionBarsProps) {
  const scenarioMap = new Map(scenarios.map((s) => [s.id, s]));
  const hasAnyData = Object.values(aggregate).some(
    (s) => s.descriptive.total > 0 || s.prescriptive.total > 0,
  );

  return (
    <div style={style}>
      {Object.entries(aggregate).map(([scenarioId, buckets]) => {
        const scenario = scenarioMap.get(scenarioId);
        if (!scenario) return null;

        const kinds: Array<'descriptive' | 'prescriptive'> = ['descriptive'];
        if (scenario.hasPrescriptive && buckets.prescriptive.total > 0) {
          kinds.push('prescriptive');
        }

        return kinds.map((kind) => {
          const data = buckets[kind];
          if (data.total === 0) return null;
          const prompt = scenario.prompt.replace(/\{name\}/g, nameSubstitution);
          return (
            <ScenarioBarBlock
              key={`${scenarioId}-${kind}`}
              prompt={prompt}
              kind={kind}
              counts={data}
              options={scenario.options}
            />
          );
        });
      })}

      {!hasAnyData && (
        <p
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            color: PALETTE.inkLight,
            fontStyle: 'italic',
          }}
        >
          {emptyMessage ?? 'No one has rated you yet. Takes fill in as the group weighs in.'}
        </p>
      )}
    </div>
  );
}

interface ScenarioBarBlockProps {
  prompt: string;
  kind: 'descriptive' | 'prescriptive';
  counts: ChoiceCounts;
  options: Array<{ id: string; label: string }>;
}

function ScenarioBarBlock({ prompt, kind, counts, options }: ScenarioBarBlockProps) {
  const barColor = kind === 'descriptive' ? PALETTE.sage : PALETTE.navy;
  return (
    <div style={{ marginBottom: 24 }}>
      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 11,
          lineHeight: 1.5,
          color: PALETTE.ink,
          marginBottom: 4,
        }}
      >
        {prompt}
      </p>
      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          marginBottom: 8,
        }}
      >
        {kind === 'descriptive' ? 'What you do' : 'What you should do'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {options.map((opt) => {
          const count = counts[opt.id as keyof ChoiceCounts] as number;
          const pct = counts.total > 0 ? Math.round((count / counts.total) * 100) : 0;
          return (
            <div key={opt.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: TYPE.mono,
                  fontSize: 11,
                  color: PALETTE.ink,
                  marginBottom: 2,
                }}
              >
                <span>{opt.id.toUpperCase()}. {opt.label}</span>
                <span style={{ fontWeight: 700, color: count > 0 ? PALETTE.navy : PALETTE.inkLight }}>
                  {count}
                </span>
              </div>
              {count > 0 && (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 4,
                    background: 'rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${pct}%`,
                      background: barColor,
                      transition: `width 400ms ${EASE_OUT}`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
