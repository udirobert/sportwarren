/**
 * Clip-review detections — pure carrier + pressure logic.
 *
 * Port of the video-agents-hack Pitch Overlay heuristics, adapted to
 * SportWarren's preservation thesis: these functions produce *evidence
 * candidates*. Nothing here writes twin state; confirmed events ride into
 * submitMatchResult → PlayerMatchStats inside the existing verified window.
 *
 * Coordinates are normalized 0–1, top-left origin (same contract as the
 * hack pipeline's scene.json / detections.json).
 */

export interface DetBox {
  cls: 'person' | 'sports ball';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  conf: number;
}

export interface ClipFrame {
  t: number;
  boxes: DetBox[];
}

export interface PressureEvent {
  id: string;
  t: number;
  mmss: string;
  carrierIdx: number;
  closerIdx: number;
  distM: number;
}

/** Pixel-to-metre scale assumes ~50m of pitch visible on a fixed wide shot. */
export const ASSUMED_PITCH_WIDTH_M = 50;
/** Carrier ring turns red + event fires under this distance. */
export const PRESSURE_THRESHOLD_M = 3;
/** Edge-trigger debounce so one squeeze logs once, not per frame. */
export const PRESSURE_MIN_GAP_S = 1.0;

export function boxFeet(box: DetBox): { x: number; y: number } {
  return { x: (box.x1 + box.x2) / 2, y: box.y2 };
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Persons sorted by distance to the ball. Empty when no ball or no people. */
export function rankByBall(frame: ClipFrame): number[] {
  const ball = frame.boxes.find((b) => b.cls === 'sports ball');
  if (!ball) return [];
  const feet = boxFeet(ball);
  return frame.boxes
    .map((b, i) => ({ b, i }))
    .filter(({ b }) => b.cls === 'person')
    .sort((p, q) => dist(boxFeet(p.b), feet) - dist(boxFeet(q.b), feet))
    .map(({ i }) => i);
}

/** Index of the person box nearest the ball, or null. */
export function findCarrier(frame: ClipFrame): number | null {
  const ranked = rankByBall(frame);
  return ranked.length > 0 ? ranked[0] : null;
}

/**
 * Nearest *other* person to the carrier (the hack treats this as the
 * opponent — team colour detection is explicitly out of scope for the pilot).
 */
export function nearestOpponent(frame: ClipFrame, carrierIdx: number): number | null {
  const carrier = frame.boxes[carrierIdx];
  if (!carrier || carrier.cls !== 'person') return null;
  const c = boxFeet(carrier);
  let best: number | null = null;
  let bestD = Infinity;
  frame.boxes.forEach((b, i) => {
    if (i === carrierIdx || b.cls !== 'person') return;
    const d = dist(boxFeet(b), c);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
}

/** Normalized pixel gap → estimated metres. Label every surface "est.". */
export function pixelDistToMetres(pixelDist: number, pitchWidthM = ASSUMED_PITCH_WIDTH_M): number {
  return pixelDist * pitchWidthM;
}

export function carrierPressureM(frame: ClipFrame, pitchWidthM = ASSUMED_PITCH_WIDTH_M): number | null {
  const carrierIdx = findCarrier(frame);
  if (carrierIdx === null) return null;
  const oppIdx = nearestOpponent(frame, carrierIdx);
  if (oppIdx === null) return null;
  return pixelDistToMetres(dist(boxFeet(frame.boxes[carrierIdx]), boxFeet(frame.boxes[oppIdx])), pitchWidthM);
}

export function formatMmSs(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Edge-triggered pressure scan over sampled frames. Holds the last carrier
 * across ball-missed frames (same fallback as the hack). One event per
 * squeeze: fires on the falling edge under threshold, then debounces.
 */
export function detectPressureEvents(
  frames: ClipFrame[],
  opts: { thresholdM?: number; pitchWidthM?: number; minGapS?: number } = {},
): PressureEvent[] {
  const thresholdM = opts.thresholdM ?? PRESSURE_THRESHOLD_M;
  const pitchWidthM = opts.pitchWidthM ?? ASSUMED_PITCH_WIDTH_M;
  const minGapS = opts.minGapS ?? PRESSURE_MIN_GAP_S;

  const events: PressureEvent[] = [];
  let lastCarrier: number | null = null;
  let under = false;
  let lastEventT = -Infinity;
  let n = 0;

  const sorted = [...frames].sort((a, b) => a.t - b.t);
  for (const frame of sorted) {
    const carrierIdx: number | null = findCarrier(frame) ?? lastCarrier;
    if (carrierIdx === null || !frame.boxes[carrierIdx] || frame.boxes[carrierIdx].cls !== 'person') {
      under = false;
      continue;
    }
    lastCarrier = carrierIdx;
    const oppIdx = nearestOpponent(frame, carrierIdx);
    if (oppIdx === null) {
      under = false;
      continue;
    }
    const dM = pixelDistToMetres(
      dist(boxFeet(frame.boxes[carrierIdx]), boxFeet(frame.boxes[oppIdx])),
      pitchWidthM,
    );
    if (dM < thresholdM) {
      if (!under && frame.t - lastEventT >= minGapS) {
        n += 1;
        events.push({
          id: `p${n}`,
          t: frame.t,
          mmss: formatMmSs(frame.t),
          carrierIdx,
          closerIdx: oppIdx,
          distM: Math.round(dM * 10) / 10,
        });
        lastEventT = frame.t;
      }
      under = true;
    } else {
      under = false;
    }
  }
  return events;
}

/** Nearest sampled frame at or before `t` (overlay lookup per animation frame). */
export function frameAt(frames: ClipFrame[], t: number): ClipFrame | null {
  if (frames.length === 0) return null;
  let best = frames[0];
  for (const f of frames) {
    if (f.t <= t && f.t >= best.t) best = f;
    if (f.t > t) break;
  }
  return best;
}

export interface FramePressure {
  carrierIdx: number;
  oppIdx: number;
  dM: number;
  under: boolean;
}

/**
 * Live pressure state for one frame. Null when no ball/carrier/opponent is
 * visible — callers treat that as "no squeeze", same as the event scanner.
 */
export function pressureForFrame(
  frame: ClipFrame,
  pitchWidthM = ASSUMED_PITCH_WIDTH_M,
  thresholdM = PRESSURE_THRESHOLD_M,
): FramePressure | null {
  const carrierIdx = findCarrier(frame);
  if (carrierIdx === null) return null;
  const oppIdx = nearestOpponent(frame, carrierIdx);
  if (oppIdx === null) return null;
  const dM = pixelDistToMetres(
    dist(boxFeet(frame.boxes[carrierIdx]), boxFeet(frame.boxes[oppIdx])),
    pitchWidthM,
  );
  return { carrierIdx, oppIdx, dM, under: dM < thresholdM };
}
