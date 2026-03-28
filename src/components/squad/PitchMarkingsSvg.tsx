"use client";

import React, { useId } from 'react';

type Props = {
  className?: string;
  stroke?: string;
  strokeOpacity?: number;
  stripeA?: string;
  stripeB?: string;
  vignetteOpacity?: number;
  lineWeight?: number;
  orientation?: 'vertical' | 'horizontal';
  desaturateOpacity?: number;
};

/**
 * Vertical pitch markings (goals at top & bottom).
 * ViewBox: 68 wide × 105 tall — real FIFA proportions (68m × 105m).
 * Player coordinates map naturally: x = left-right, y = top (attacking) to bottom (defending).
 */
export const PitchMarkingsSvg: React.FC<Props> = ({
  className,
  stroke = 'rgba(255,255,255,0.55)',
  strokeOpacity = 1,
  stripeA = 'rgba(255,255,255,0.018)',
  stripeB = 'rgba(0,0,0,0.028)',
  vignetteOpacity = 0.18,
  lineWeight = 0.55,
  orientation = 'vertical',
  desaturateOpacity = 0,
}) => {
  const uid = useId().replace(/[:]/g, '');

  // --- FIFA standard dimensions (metres, used as viewBox units) ---
  const W = 68;   // pitch width
  const H = 105;  // pitch length
  const midX = W / 2;
  const midY = H / 2;

  // Penalty area: 40.32m wide × 16.5m deep
  const penW = 40.32;
  const penH = 16.5;
  // Six-yard box: 18.32m wide × 5.5m deep
  const sixW = 18.32;
  const sixH = 5.5;
  // Centre circle radius 9.15m
  const centreR = 9.15;
  // Corner arc radius
  const cornerR = 1;
  // Penalty spot distance from goal line
  const penSpotDist = 11;
  // Goal: 7.32m wide × 2.44m tall (depth shown as ~2.8m for visibility)
  const goalW = 7.32;
  const goalH = 2.44;
  const goalDepth = 2.8;
  const postWidth = 0.4; // Visual thickness of goal posts

  const lw = lineWeight;
  const sp = { stroke, strokeOpacity, strokeWidth: lw, fill: 'none' } as const;

  // Mow stripes — horizontal bands across the pitch (like broadcast TV pitches)
  const stripeH = orientation === 'horizontal' ? W / 8 : H / 8;

  return (
    <svg
      className={className}
      viewBox={`${-4} ${-goalDepth - 1} ${W + 8} ${H + (goalDepth + 1) * 2}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        {/* Mow stripes */}
        <pattern id={`stripes-${uid}`} width={W} height={stripeH * 2} patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width={W} height={stripeH} fill={stripeA} />
          <rect x="0" y={stripeH} width={W} height={stripeH} fill={stripeB} />
        </pattern>

        {/* Radial vignette */}
        <radialGradient id={`vig-${uid}`} cx="50%" cy="50%" r="70%">
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor={`rgba(0,0,0,${vignetteOpacity})`} />
        </radialGradient>

        {/* Goal net pattern */}
        <pattern id={`net-${uid}`} width="1.2" height="1.2" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="1.2" y2="1.2" stroke={stroke} strokeOpacity={0.15} strokeWidth="0.15" />
          <line x1="1.2" y1="0" x2="0" y2="1.2" stroke={stroke} strokeOpacity={0.15} strokeWidth="0.15" />
        </pattern>

        {/* Subtle inner shadow for pitch edges */}
        <linearGradient id={`edge-t-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id={`edge-b-${uid}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>

      {/* ── Grass stripes ── */}
      <rect x="0" y="0" width={W} height={H} fill={`url(#stripes-${uid})`} />

      {/* ── Goal nets (behind goal lines) ── */}
      {/* Top goal (opponent) */}
      <rect
        x={midX - goalW / 2}
        y={-goalDepth}
        width={goalW}
        height={goalDepth}
        fill={`url(#net-${uid})`}
        stroke={stroke}
        strokeOpacity={strokeOpacity * 0.5}
        strokeWidth={lw * 0.8}
        rx="0.3"
      />
      {/* Bottom goal (player's team) */}
      <rect
        x={midX - goalW / 2}
        y={H}
        width={goalW}
        height={goalDepth}
        fill={`url(#net-${uid})`}
        stroke={stroke}
        strokeOpacity={strokeOpacity * 0.5}
        strokeWidth={lw * 0.8}
        rx="0.3"
      />

      {/* ── Goal posts (prominent white posts) ── */}
      {/* Top goal posts */}
      <rect
        x={midX - goalW / 2 - postWidth}
        y={-goalDepth}
        width={postWidth}
        height={goalDepth + goalH}
        fill="rgba(255,255,255,0.9)"
        rx="0.1"
      />
      <rect
        x={midX + goalW / 2}
        y={-goalDepth}
        width={postWidth}
        height={goalDepth + goalH}
        fill="rgba(255,255,255,0.9)"
        rx="0.1"
      />
      <rect
        x={midX - goalW / 2}
        y={-goalDepth - goalH + postWidth}
        width={goalW + postWidth * 2}
        height={postWidth}
        fill="rgba(255,255,255,0.9)"
        rx="0.1"
      />
      {/* Bottom goal posts */}
      <rect
        x={midX - goalW / 2 - postWidth}
        y={H}
        width={postWidth}
        height={goalDepth + goalH}
        fill="rgba(255,255,255,0.9)"
        rx="0.1"
      />
      <rect
        x={midX + goalW / 2}
        y={H}
        width={postWidth}
        height={goalDepth + goalH}
        fill="rgba(255,255,255,0.9)"
        rx="0.1"
      />
      <rect
        x={midX - goalW / 2}
        y={H + goalDepth}
        width={goalW + postWidth * 2}
        height={postWidth}
        fill="rgba(255,255,255,0.9)"
        rx="0.1"
      />

      {/* ── Outer boundary ── */}
      <rect x={lw / 2} y={lw / 2} width={W - lw} height={H - lw} {...sp} rx="0.4" />

      {/* ── Halfway line ── */}
      <line x1={0} y1={midY} x2={W} y2={midY} {...sp} />

      {/* ── Centre circle & spot ── */}
      <circle cx={midX} cy={midY} r={centreR} {...sp} />
      <circle cx={midX} cy={midY} r={lw * 1.2} fill={stroke} fillOpacity={strokeOpacity} />

      {/* ── Penalty areas (top & bottom) ── */}
      {/* Top */}
      <rect x={midX - penW / 2} y={0} width={penW} height={penH} {...sp} />
      {/* Bottom */}
      <rect x={midX - penW / 2} y={H - penH} width={penW} height={penH} {...sp} />

      {/* ── Six-yard boxes ── */}
      {/* Top */}
      <rect x={midX - sixW / 2} y={0} width={sixW} height={sixH} {...sp} />
      {/* Bottom */}
      <rect x={midX - sixW / 2} y={H - sixH} width={sixW} height={sixH} {...sp} />

      {/* ── Penalty spots ── */}
      <circle cx={midX} cy={penSpotDist} r={lw * 1.2} fill={stroke} fillOpacity={strokeOpacity} />
      <circle cx={midX} cy={H - penSpotDist} r={lw * 1.2} fill={stroke} fillOpacity={strokeOpacity} />

      {/* ── Penalty arcs (D) ── */}
      {/* Top D — arc below the penalty area */}
      <path d={describeArc(midX, penSpotDist, centreR, 125, 235)} {...sp} />
      {/* Bottom D — arc above the penalty area */}
      <path d={describeArc(midX, H - penSpotDist, centreR, -55, 55)} {...sp} />

      {/* ── Corner arcs ── */}
      {/* Top-left */}
      <path d={`M 0 ${cornerR} A ${cornerR} ${cornerR} 0 0 1 ${cornerR} 0`} {...sp} />
      {/* Top-right */}
      <path d={`M ${W - cornerR} 0 A ${cornerR} ${cornerR} 0 0 1 ${W} ${cornerR}`} {...sp} />
      {/* Bottom-left */}
      <path d={`M ${cornerR} ${H} A ${cornerR} ${cornerR} 0 0 1 0 ${H - cornerR}`} {...sp} />
      {/* Bottom-right */}
      <path d={`M ${W} ${H - cornerR} A ${cornerR} ${cornerR} 0 0 1 ${W - cornerR} ${H}`} {...sp} />

      {/* ── Edge shadows for depth ── */}
      <rect x="0" y="0" width={W} height="6" fill={`url(#edge-t-${uid})`} pointerEvents="none" />
      <rect x="0" y={H - 6} width={W} height="6" fill={`url(#edge-b-${uid})`} pointerEvents="none" />

      {/* ── Desaturate overlay ── */}
      {desaturateOpacity > 0 && (
        <rect x="0" y="0" width={W} height={H} fill={`rgba(128,128,128,${desaturateOpacity})`} pointerEvents="none" />
      )}

      {/* ── Vignette ── */}
      <rect x="0" y="0" width={W} height={H} fill={`url(#vig-${uid})`} pointerEvents="none" />
    </svg>
  );
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export default PitchMarkingsSvg;
