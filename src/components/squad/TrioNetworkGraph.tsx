"use client";

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { TrioStat } from '@/server/services/squad/composition-insights';

// ── Types ───────────────────────────────────────────────────────────────────

interface TrioNetworkGraphProps {
  trios: TrioStat[];
  className?: string;
}

interface LayoutNode {
  userId: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  trioCount: number;
}

interface LayoutEdge {
  sourceId: string;
  targetId: string;
  winRate: number;
}

// ── Layout engine ───────────────────────────────────────────────────────────

function computeCircularLayout(trios: TrioStat[]): {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
} {
  // 1. Count how many trios each player appears in (centrality)
  const playerTrioCount = new Map<string, { name: string; count: number }>();

  for (const trio of trios) {
    for (const p of trio.players) {
      const entry = playerTrioCount.get(p.userId);
      if (entry) {
        entry.count += 1;
      } else {
        playerTrioCount.set(p.userId, { name: p.name, count: 1 });
      }
    }
  }

  const entries = Array.from(playerTrioCount.entries());
  const n = entries.length;
  if (n < 2) return { nodes: [], edges: [] };

  const countValues = entries.map(([, v]) => v.count);
  const maxCount = Math.max(...countValues);
  const minCount = Math.min(...countValues);
  const range = maxCount - minCount || 1;

  // 2. Arrange nodes in a circle
  const padding = 6; // extra padding around edge labels
  const svgSize = 300;
  const radius = Math.min(svgSize / 2 - 40 - padding, 110);
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  const nodes: LayoutNode[] = entries.map(([userId, data], i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // start at 12 o'clock
    const centrality = (data.count - minCount) / range; // 0..1
    return {
      userId,
      name: data.name,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
      radius: 7 + centrality * 9, // 7–16px
      trioCount: data.count,
    };
  });

  // 3. Build edge list from trios (deduplicate, keep highest win rate)
  const edgeMap = new Map<string, LayoutEdge>();

  for (const trio of trios) {
    const [a, b, c] = trio.players;
    // All 3 pair combos in the trio
    const pairs: [string, string, number][] = [
      [a.userId, b.userId, trio.winRate],
      [b.userId, c.userId, trio.winRate],
      [a.userId, c.userId, trio.winRate],
    ];

    for (const [u1, u2, wr] of pairs) {
      const key = u1 < u2 ? `${u1}::${u2}` : `${u2}::${u1}`;
      const existing = edgeMap.get(key);
      if (!existing || wr > existing.winRate) {
        const [src, tgt] = u1 < u2 ? [u1, u2] : [u2, u1];
        edgeMap.set(key, { sourceId: src, targetId: tgt, winRate: wr });
      }
    }
  }

  const edges = Array.from(edgeMap.values());

  return { nodes, edges };
}

// ── Color helpers ───────────────────────────────────────────────────────────

function edgeColor(wr: number): string {
  if (wr >= 70) return '#34d399'; // emerald-400
  if (wr >= 50) return '#fbbf24'; // amber-400
  return '#f87171'; // red-400
}

function edgeOpacity(wr: number): number {
  return 0.25 + (wr / 100) * 0.55; // 0.25–0.80
}

// ── Component ───────────────────────────────────────────────────────────────

export default function TrioNetworkGraph({ trios, className = '' }: TrioNetworkGraphProps) {
  const layout = useMemo(() => computeCircularLayout(trios), [trios]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const nodeMap = useMemo(() => {
    const map = new Map<string, LayoutNode>();
    for (const node of layout.nodes) map.set(node.userId, node);
    return map;
  }, [layout.nodes]);

  if (layout.nodes.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-500 text-xs">
        Not enough trio data to generate a network graph
      </div>
    );
  }

  const hoveredNode = hoveredId ? nodeMap.get(hoveredId) : null;

  // Determine which edges connect to the hovered node
  const connectedEdgeKeys = new Set<string>();
  if (hoveredId) {
    for (const edge of layout.edges) {
      if (edge.sourceId === hoveredId || edge.targetId === hoveredId) {
        const key = `${edge.sourceId}::${edge.targetId}`;
        connectedEdgeKeys.add(key);
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Tooltip */}
      {hoveredNode && (
        <div className="absolute top-1 left-1 z-10 rounded-lg bg-gray-900/95 border border-white/[0.08] px-2.5 py-1.5 text-xs shadow-lg pointer-events-none">
          <span className="font-bold text-white">{hoveredNode.name}</span>
          <span className="text-gray-400 ml-1">
            · {hoveredNode.trioCount} trio{hoveredNode.trioCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <svg viewBox="0 0 300 300" className="w-full h-auto" aria-label="Trio connection network graph">
        {/* Edges */}
        {layout.edges.map((edge) => {
          const source = nodeMap.get(edge.sourceId);
          const target = nodeMap.get(edge.targetId);
          if (!source || !target) return null;

          const edgeKey = `${edge.sourceId}::${edge.targetId}`;
          const isHighlighted = hoveredId === null || connectedEdgeKeys.has(edgeKey);
          const highlightOpacity = hoveredId === null
            ? edgeOpacity(edge.winRate)
            : isHighlighted
              ? Math.min(edgeOpacity(edge.winRate) + 0.3, 0.95)
              : 0.06;

          return (
            <motion.line
              key={edgeKey}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={edgeColor(edge.winRate)}
              strokeWidth={1.2 + (edge.winRate / 100) * 3}
              strokeOpacity={highlightOpacity}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="transition-[stroke-opacity] duration-150"
            />
          );
        })}

        {/* Nodes */}
        {layout.nodes.map((node, idx) => {
          const isHovered = hoveredId === node.userId;

          return (
            <g
              key={node.userId}
              onMouseEnter={() => setHoveredId(node.userId)}
              onMouseLeave={() => setHoveredId(null)}
              className="cursor-pointer"
              role="graphics-symbol"
              aria-label={node.name}
            >
              {/* Glow ring on hover */}
              {isHovered && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + 4}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                  strokeOpacity={0.3}
                  initial={{ r: node.radius, opacity: 0 }}
                  animate={{ r: node.radius + 4, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}

              {/* Node circle */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={isHovered ? '#fbbf24' : '#57534e'}
                stroke={isHovered ? '#fbbf24' : '#78716c'}
                strokeWidth={isHovered ? 2 : 1}
                initial={{ r: 0 }}
                animate={{ r: node.radius }}
                transition={{ duration: 0.4, delay: 0.08 * idx, ease: 'backOut' }}
              />

              {/* Player name label */}
              <motion.text
                x={node.x}
                y={node.y + node.radius + 13}
                textAnchor="middle"
                fill={isHovered ? '#fbbf24' : '#a8a29e'}
                fontSize="8"
                fontFamily="system-ui, sans-serif"
                fontWeight={isHovered ? 'bold' : 'normal'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.08 * idx }}
                className="pointer-events-none select-none transition-[fill,font-weight] duration-150"
              >
                {/* First name only (fits better on screen) */}
                {node.name.split(' ')[0]}
              </motion.text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(8, 278)" className="pointer-events-none">
          <line x1="0" y1="0" x2="10" y2="0" stroke="#34d399" strokeWidth="2" strokeOpacity={0.7} strokeLinecap="round" />
          <text x="13" y="3" fill="#a8a29e" fontSize="6" fontFamily="system-ui, sans-serif">≥70%</text>
          <line x1="40" y1="0" x2="50" y2="0" stroke="#fbbf24" strokeWidth="2" strokeOpacity={0.7} strokeLinecap="round" />
          <text x="53" y="3" fill="#a8a29e" fontSize="6" fontFamily="system-ui, sans-serif">≥50%</text>
          <line x1="80" y1="0" x2="90" y2="0" stroke="#f87171" strokeWidth="2" strokeOpacity={0.7} strokeLinecap="round" />
          <text x="93" y="3" fill="#a8a29e" fontSize="6" fontFamily="system-ui, sans-serif">{"<50%"}</text>
          <circle cx="120" cy="0" r="3" fill="#57534e" stroke="#78716c" strokeWidth="0.5" />
          <text x="126" y="3" fill="#a8a29e" fontSize="6" fontFamily="system-ui, sans-serif">centrality</text>
        </g>
      </svg>
    </div>
  );
}
