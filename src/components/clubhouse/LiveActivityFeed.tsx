/**
 * LiveActivityFeed — real-time activity feed for the clubhouse.
 *
 * Replaces the static DB-snapshot ticker with a live feed that updates
 * as squad-mates rate each other. Uses the existing socket.io
 * infrastructure (useSquadSocket) to listen for perception events
 * broadcast from the quiz flow.
 *
 * 'use client' boundary. Hydrates from the initial server-rendered
 * perceptions list, then appends new ones in real-time.
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSquadSocket } from '@/hooks/useSocket';
import { SCENARIOS } from '@/server/services/perception/scenarios';
import { V3SectionLabel, V3Reveal, PALETTE, TYPE, TRACKING } from '@/components/v3';

export interface InitialPerception {
  id: string;
  scenarioId: string;
  createdAt: Date;
  rater: { user: { position: string | null } | null } | null;
  target: { user: { position: string | null } | null } | null;
}

export interface LiveActivityEvent {
  type: 'perception';
  perception: {
    scenarioId: string;
    attributeTag: string;
    raterPosition: string;
    targetFirstName: string;
    targetPosition: string;
    choice: string;
    kind: string;
  };
}

interface ActivityItem {
  id: string;
  scenarioId: string;
  raterPos: string;
  targetPos: string;
  targetFirstName: string;
  attributeTag: string;
  createdAt: Date;
  /** True for items received via socket (live), false for server-rendered initial batch */
  isLive: boolean;
}

function timeAgo(ts: Date): string {
  const seconds = Math.floor((Date.now() - ts.getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// Injected animation keyframes
const STYLE_ID = 'laf-anim';
function injectLiveStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes lafPopIn {
      from { opacity: 0; transform: translateY(-8px); background: rgba(201,16,34,0.06); }
      to { opacity: 1; transform: translateY(0); background: transparent; }
    }
    .laf-live {
      animation: lafPopIn 400ms ease-out forwards;
    }
    @media (prefers-reduced-motion: reduce) {
      .laf-live { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

export function LiveActivityFeed({
  squadId,
  token,
  initialPerceptions,
  visibleCount = 5,
}: {
  squadId: string;
  /** Viewer's preview token (walletAddress) — gates the live squad room. */
  token: string;
  initialPerceptions: InitialPerception[];
  /** Number of items to show before the collapse toggle. Default 5. */
  visibleCount?: number;
}) {
  const injected = useRef(false);
  if (!injected.current) { injectLiveStyles(); injected.current = true; }

  const { socket, reconnectState } = useSquadSocket(squadId, token);
  const [items, setItems] = useState<ActivityItem[]>(() =>
    initialPerceptions.slice(0, 50).map((p) => ({
      id: p.id,
      scenarioId: p.scenarioId,
      raterPos: p.rater?.user?.position ?? 'a lad',
      targetPos: p.target?.user?.position ?? 'a lad',
      targetFirstName: 'someone',
      attributeTag: (() => {
        const s = SCENARIOS.find((sc) => sc.id === p.scenarioId);
        return s?.attributeTag ?? 'play';
      })(),
      createdAt: p.createdAt,
      isLive: false,
    }))
  );

  // Track IDs we've seen to avoid duplicates
  const seenIds = useRef(new Set(initialPerceptions.map((p) => p.id)));

  useEffect(() => {
    const handler = (data: unknown) => {
      const event = data as { update?: { type?: string; perception?: LiveActivityEvent['perception'] } };
      const perception = event?.update?.perception ?? (data as LiveActivityEvent)?.perception;
      if (!perception) return;

      const id = `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      if (seenIds.current.has(id)) return;
      seenIds.current.add(id);

      const newItem: ActivityItem = {
        id,
        scenarioId: perception.scenarioId,
        raterPos: perception.raterPosition,
        targetPos: perception.targetPosition,
        targetFirstName: perception.targetFirstName,
        attributeTag: perception.attributeTag,
        createdAt: new Date(),
        isLive: true,
      };

      setItems((prev) => [newItem, ...prev].slice(0, 100));
    };

    socket.on('squad-update', handler);
    return () => {
      socket.off('squad-update', handler);
    };
  }, [socket]);

  const visibleItems = items.slice(0, visibleCount);
  const hiddenItems = items.slice(visibleCount);

  // ── Reconnection banner ──
  const showReconnectBanner = reconnectState.isReconnecting;

  if (items.length === 0 && !showReconnectBanner) return null;

  return (
    <V3Reveal delay={250}>
      {showReconnectBanner && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: TYPE.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            color: PALETTE.mustard,
            background: PALETTE.ink,
            padding: '8px 12px',
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>⟳</span>
          <span>
            Reconnecting{reconnectState.attempt > 0 ? ` (attempt ${reconnectState.attempt})` : ''}…
          </span>
        </div>
      )}

      {items.length > 0 && (<>
        <V3SectionLabel marginBottom={10}>Recent activity</V3SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
          {visibleItems.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      </>)}
      {hiddenItems.length > 0 && (
        <details style={{ marginBottom: 32 }}>
          <summary
            style={{
              cursor: 'pointer',
              listStyle: 'none',
              fontFamily: TYPE.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.inkLight,
              padding: '4px 0',
            }}
          >
            + {hiddenItems.length} more
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {hiddenItems.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        </details>
      )}
    </V3Reveal>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const scenario = SCENARIOS.find((s) => s.id === item.scenarioId);
  const lens = scenario ? scenario.attributeTag : item.attributeTag;

  return (
    <div
      className={item.isLive ? 'laf-live' : ''}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: TYPE.mono,
        fontSize: 11,
        color: PALETTE.inkLight,
        padding: '4px 8px',
      }}
    >
      <span>
        {item.targetFirstName !== 'someone' ? (
          <>A {item.raterPos} rated <strong>{item.targetFirstName}</strong> on {lens}</>
        ) : (
          <>A {item.raterPos} rated a {item.targetPos} on {lens}</>
        )}
      </span>
      <span style={{ opacity: 0.65 }}>
        {item.isLive ? 'just now' : timeAgo(item.createdAt)}
      </span>
    </div>
  );
}
