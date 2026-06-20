/**
 * LiveCapture — client-side grid the captain taps to record goals.
 *
 * Uses React useOptimistic so taps feel instant while server actions
 * persist in the background. Phone-friendly: large hit targets, no
 * accidental double-tap on a single render (uses transition).
 */

'use client';

import React, { useOptimistic, useTransition, useState } from 'react';
import { PALETTE, MiniAvatar } from '../../../../preview/_components/MiniAvatar';
import { addGoal, undoLastGoal, endSession } from '../_actions';

interface PlayerSlot {
  profileId: string;
  userId: string;
  name: string;
  position: string | null;
  goals: number;
  avatar: {
    kit?: string;
    accent?: string;
    skin?: string;
    hair?: string;
    hairStyle?: string;
    number?: string;
  };
}

interface LiveCaptureProps {
  token: string;
  sessionId: string;
  matchId: string;
  players: PlayerSlot[];
}

type OptimisticUpdate =
  | { type: 'add'; profileId: string }
  | { type: 'undo'; profileId: string };

export function LiveCapture({ token, sessionId, matchId, players }: LiveCaptureProps) {
  const [, startTransition] = useTransition();
  const [optimisticPlayers, applyOptimistic] = useOptimistic(
    players,
    (state: PlayerSlot[], update: OptimisticUpdate) => {
      return state.map((p) => {
        if (p.profileId !== update.profileId) return p;
        const newGoals = update.type === 'add' ? p.goals + 1 : Math.max(0, p.goals - 1);
        return { ...p, goals: newGoals };
      });
    },
  );
  const [showEndModal, setShowEndModal] = useState(false);

  const totalGoals = optimisticPlayers.reduce((s, p) => s + p.goals, 0);

  const handleGoal = (profileId: string) => {
    startTransition(() => {
      applyOptimistic({ type: 'add', profileId });
      addGoal(token, matchId, profileId).catch(() => {});
    });
  };

  const handleUndo = (profileId: string) => {
    startTransition(() => {
      applyOptimistic({ type: 'undo', profileId });
      undoLastGoal(token, matchId, profileId).catch(() => {});
    });
  };

  const handleEnd = () => {
    startTransition(() => {
      endSession(token, sessionId, matchId).catch(() => {});
      window.location.href = `/session/live/${encodeURIComponent(token)}?done=1`;
    });
  };

  // Sort: highest scorers first
  const sortedPlayers = [...optimisticPlayers].sort((a, b) => b.goals - a.goals);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '20px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
        paddingBottom: 120,
      }}
    >
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        {/* Top: session info + total score */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: '20px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: `6px solid ${PALETTE.mustard}`,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              Live · Session running
            </div>
            <div
              style={{
                fontFamily: 'Antonio, Impact, sans-serif',
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
              }}
            >
              {totalGoals} goals tonight
            </div>
          </div>
          <button
            onClick={() => setShowEndModal(true)}
            style={{
              background: 'transparent',
              color: PALETTE.cream,
              border: `2px solid ${PALETTE.cream}`,
              padding: '8px 14px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            End
          </button>
        </div>

        {/* Instructions */}
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: PALETTE.inkLight,
            lineHeight: 1.5,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          Tap a player to add a goal. Long-press to undo. Goals add up
          across the whole night — no per-game stress.
        </p>

        {/* Player grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          {sortedPlayers.map((player) => (
            <PlayerTap
              key={player.profileId}
              player={player}
              onGoal={() => handleGoal(player.profileId)}
              onUndo={() => handleUndo(player.profileId)}
            />
          ))}
        </div>

        {/* End session modal */}
        {showEndModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
              zIndex: 100,
            }}
            onClick={() => setShowEndModal(false)}
          >
            <div
              style={{
                background: PALETTE.cream,
                padding: 28,
                maxWidth: 360,
                width: '100%',
                border: `2px solid ${PALETTE.ink}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  fontFamily: 'Antonio, Impact, sans-serif',
                  fontSize: 32,
                  fontWeight: 800,
                  marginBottom: 12,
                  textTransform: 'uppercase',
                }}
              >
                End session?
              </div>
              <p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 13,
                  color: PALETTE.inkLight,
                  lineHeight: 1.6,
                  marginBottom: 24,
                }}
              >
                Final total: {totalGoals} goals. After this, twins update
                and recap cards generate. No more goals can be added.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleEnd}
                  style={{
                    background: PALETTE.mustard,
                    color: PALETTE.ink,
                    padding: '14px',
                    border: `2px solid ${PALETTE.red}`,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  End it · finalize
                </button>
                <button
                  onClick={() => setShowEndModal(false)}
                  style={{
                    background: 'transparent',
                    color: PALETTE.ink,
                    padding: '14px',
                    border: `2px solid ${PALETTE.ink}`,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Nope, keep going
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerTap({
  player,
  onGoal,
  onUndo,
}: {
  player: PlayerSlot;
  onGoal: () => void;
  onUndo: () => void;
}) {
  const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  const startPress = () => {
    setIsPressing(true);
    const t = setTimeout(() => {
      onUndo();
      setPressTimer(null);
      setIsPressing(false);
    }, 600);
    setPressTimer(t);
  };

  const endPress = (didTap: boolean) => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
      if (didTap) onGoal();
    }
    setIsPressing(false);
  };

  return (
    <button
      onMouseDown={startPress}
      onTouchStart={startPress}
      onMouseUp={() => endPress(true)}
      onTouchEnd={() => endPress(true)}
      onMouseLeave={() => endPress(false)}
      style={{
        position: 'relative',
        background: player.goals > 0 ? 'rgba(74,117,73,0.12)' : PALETTE.cream,
        border: `2px solid ${player.goals > 0 ? PALETTE.sage : PALETTE.ink}`,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        transition: 'transform 0.05s, background 0.15s',
        transform: isPressing ? 'scale(0.96)' : 'scale(1)',
        userSelect: 'none',
        touchAction: 'manipulation',
      }}
    >
      <MiniAvatar
        kit={player.avatar.kit}
        accent={player.avatar.accent}
        skin={player.avatar.skin}
        hair={player.avatar.hair}
        hairStyle={player.avatar.hairStyle}
        number={player.avatar.number}
        size={72}
      />
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 13,
          fontWeight: 700,
          color: PALETTE.ink,
          textAlign: 'center',
        }}
      >
        {player.name}
      </div>
      {player.goals > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: PALETTE.ink,
            color: PALETTE.cream,
            width: 32,
            height: 32,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {player.goals}
        </div>
      )}
    </button>
  );
}
