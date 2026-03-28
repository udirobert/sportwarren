"use client";

import React, { useId } from 'react';

type Props = {
  className?: string;
  stroke?: string; // line color
  strokeOpacity?: number;
  stripeA?: string;
  stripeB?: string;
  vignetteOpacity?: number;
  lineWeight?: number; // in viewBox units
  orientation?: 'vertical' | 'horizontal';
  desaturateOpacity?: number; // overlay neutral tone to reduce saturation
};

// Normalized pitch viewBox: length 120 (x), width 80 (y)
// Approximates a 105m x 68m pitch with key markings in relative units.
export const PitchMarkingsSvg: React.FC<Props> = ({
  className,
  stroke = 'rgba(255,255,255,0.6)',
  strokeOpacity = 0.9,
  stripeA = 'rgba(255,255,255,0.02)',
  stripeB = 'rgba(0,0,0,0.03)',
  vignetteOpacity = 0.14,
  lineWeight = 1.6,
  orientation = 'vertical',
  desaturateOpacity = 0,
}) => {
  const uid = useId().replace(/[:]/g, '');
  const VBW = 120; // length
  const VBH = 80; // width

  // Dimensions
  const penaltyDepth = 16.5 / 105 * VBW; // ~18.86
  const penaltyWidth = 40.32 / 68 * VBH; // ~47.5
  const sixDepth = 5.5 / 105 * VBW; // ~6.29
  const sixWidth = 18.32 / 68 * VBH; // ~21.56
  const centerR = 9.15 / 68 * VBH; // ~10.76
  const cornerR = 1 / 68 * VBH; // ~1.18
  const penaltySpotX = 11 / 105 * VBW; // distance from goal line

  const halfY = VBH / 2;
  const leftX = 0;
  const rightX = VBW;
  const topY = 0;
  const bottomY = VBH;

  const strokeProps = { stroke, strokeOpacity, strokeWidth: lineWeight, fill: 'none' } as const;

  // Penalty area rectangles centered on midline
  const penW = penaltyWidth;
  const penH = penaltyDepth;
  const sixW = sixWidth;
  const sixH = sixDepth;

  return (
    <svg className={className} viewBox={`0 0 ${VBW} ${VBH}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        {/* Stripes */}
        {orientation === 'vertical' ? (
          <pattern id={`sw-stripes-${uid}`} width="10" height="80" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="5" height="80" fill={stripeA} />
            <rect x="5" y="0" width="5" height="80" fill={stripeB} />
          </pattern>
        ) : (
          <pattern id={`sw-stripes-${uid}`} width="120" height="10" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="120" height="5" fill={stripeA} />
            <rect x="0" y="5" width="120" height="5" fill={stripeB} />
          </pattern>
        )}
        {/* Vignette */}
        <radialGradient id={`sw-vignette-${uid}`} cx="50%" cy="50%" r="65%">
          <stop offset="60%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor={`rgba(0,0,0,${vignetteOpacity})`} />
        </radialGradient>
      </defs>

      {/* Grass background (keep existing gradient in parent; we add subtle stripes) */}
      <rect x="0" y="0" width={VBW} height={VBH} fill={`url(#sw-stripes-${uid})`} />

      {/* Outer Border */}
      <rect x={leftX + lineWeight} y={topY + lineWeight} width={VBW - 2 * lineWeight} height={VBH - 2 * lineWeight} {...strokeProps} />

      {/* Halfway line */}
      <line x1={VBW / 2} y1={topY} x2={VBW / 2} y2={bottomY} {...strokeProps} />

      {/* Center circle and spot */}
      <circle cx={VBW / 2} cy={halfY} r={centerR} {...strokeProps} />
      <circle cx={VBW / 2} cy={halfY} r={lineWeight} fill={stroke} fillOpacity={strokeOpacity} />

      {/* Penalty areas (left and right) */}
      <rect x={leftX} y={halfY - penW / 2} width={penH} height={penW} {...strokeProps} />
      <rect x={rightX - penH} y={halfY - penW / 2} width={penH} height={penW} {...strokeProps} />

      {/* Six-yard boxes */}
      <rect x={leftX} y={halfY - sixW / 2} width={sixH} height={sixW} {...strokeProps} />
      <rect x={rightX - sixH} y={halfY - sixW / 2} width={sixH} height={sixW} {...strokeProps} />

      {/* Penalty spots */}
      <circle cx={leftX + penaltySpotX} cy={halfY} r={lineWeight} fill={stroke} fillOpacity={strokeOpacity} />
      <circle cx={rightX - penaltySpotX} cy={halfY} r={lineWeight} fill={stroke} fillOpacity={strokeOpacity} />

      {/* Penalty arcs ("D") - draw arcs outside box */}
      {/** Left D: arc centered at left penalty spot, open towards center */}
      <path
        d={describeArc(leftX + penaltySpotX, halfY, centerR, -40, 40)}
        {...strokeProps}
      />
      {/** Right D */}
      <path
        d={describeArc(rightX - penaltySpotX, halfY, centerR, 140, 220)}
        {...strokeProps}
      />

      {/* Corner arcs */}
      <path d={`M ${leftX} ${topY + cornerR} A ${cornerR} ${cornerR} 0 0 1 ${leftX + cornerR} ${topY}`} {...strokeProps} />
      <path d={`M ${rightX - cornerR} ${topY} A ${cornerR} ${cornerR} 0 0 1 ${rightX} ${topY + cornerR}`} {...strokeProps} />
      <path d={`M ${leftX} ${bottomY - cornerR} A ${cornerR} ${cornerR} 0 0 0 ${leftX + cornerR} ${bottomY}`} {...strokeProps} />
      <path d={`M ${rightX - cornerR} ${bottomY} A ${cornerR} ${cornerR} 0 0 0 ${rightX} ${bottomY - cornerR}`} {...strokeProps} />

      {/* Vignette overlay */}
      {/* Desaturate overlay (neutral gray) */}
      {desaturateOpacity > 0 && (
        <rect x="0" y="0" width={VBW} height={VBH} fill={`rgba(128,128,128,${desaturateOpacity})`} pointerEvents="none" />
      )}
      <rect x="0" y="0" width={VBW} height={VBH} fill={`url(#sw-vignette-${uid})`} pointerEvents="none" />
    </svg>
  );
};

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

export default PitchMarkingsSvg;
