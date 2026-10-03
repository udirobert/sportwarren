/**
 * Shared canvas renderer for clip review.
 *
 * One draw path serves live playback (rAF loop) and shareable export
 * (offscreen capture canvas → MediaRecorder). Same frames, same overlay —
 * so the exported clip is exactly what the player saw. This mirrors the
 * hack pipeline's generate/render split: overlay items describe *what*,
 * this module decides *how it looks*.
 */
import { PALETTE } from '@/components/v3';
import type { ClipFrame } from './detections';
import type { OverlayItem, OverlayRole } from './styles';

const BALL_ORANGE = '#ffa200';
const RING_CYAN = '#00dcdc';

const V3_HEX: Record<OverlayItem['color'], string> = {
  mustard: PALETTE.mustard,
  white: '#ffffff',
  cyan: RING_CYAN,
  red: '#ff4040',
  sage: PALETTE.sage,
  navy: PALETTE.navy,
};

export interface PressureState {
  oppIdx: number;
  under: boolean;
  dM: number;
}

export function resolveRoleBox(
  frame: ClipFrame,
  role: OverlayRole,
  carrierIdx: number | null,
  closerIdx: number | null,
): ClipFrame['boxes'][number] | null {
  const idx = role === 'carrier' ? carrierIdx : role === 'closer' ? closerIdx : null;
  if (idx === null || !frame.boxes[idx]) return null;
  return frame.boxes[idx];
}

function ellipse(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
}

function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color = '#ffffff',
  opts: { box?: boolean; center?: boolean } = {},
) {
  ctx.save();
  ctx.font = `800 ${size}px Antonio, Impact, sans-serif`;
  ctx.textBaseline = 'alphabetic';
  const tw = ctx.measureText(text).width;
  const dx = opts.center === false ? x : x - tw / 2;
  if (opts.box) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(dx - 6, y - size - 4, tw + 12, size + 12);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, dx, y);
  ctx.restore();
}

export interface DrawOpts {
  frame: ClipFrame;
  items: OverlayItem[];
  carrierIdx: number | null;
  pressure: PressureState | null;
  pitchWidthM?: number;
  flash?: boolean;
  hypeBanner?: boolean;
}

/**
 * Draw the full overlay for one video moment. `w`/`h` are the CSS pixel
 * size of the target canvas (caller handles dpr scaling).
 */
export function drawClipFrame(ctx: CanvasRenderingContext2D, w: number, h: number, opts: DrawOpts): void {
  const { frame, items, carrierIdx, pressure } = opts;
  const flash = opts.flash ?? false;

  // ── Style items: arrows + chips + banners first (behind rings) ──
  let chipRow = 0;
  for (const it of items) {
    const color = V3_HEX[it.color];
    if (it.kind === 'arrow') {
      const a = resolveRoleBox(frame, it.track, carrierIdx, pressure?.oppIdx ?? null);
      const b = resolveRoleBox(frame, it.to, carrierIdx, pressure?.oppIdx ?? null);
      if (!a || !b) continue;
      const x1 = ((a.x1 + a.x2) / 2) * w;
      const y1 = a.y2 * h;
      const x2 = ((b.x1 + b.x2) / 2) * w;
      const y2 = b.y2 * h;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      // Arrowhead.
      const ang = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 14 * Math.cos(ang - 0.4), y2 - 14 * Math.sin(ang - 0.4));
      ctx.lineTo(x2 - 14 * Math.cos(ang + 0.4), y2 - 14 * Math.sin(ang + 0.4));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
      if (it.text) label(ctx, it.text, (x1 + x2) / 2, (y1 + y2) / 2 - 14, 15, '#ffffff', { box: true });
    } else if (it.kind === 'chip') {
      const size = 14;
      ctx.save();
      ctx.font = `700 ${size}px "JetBrains Mono", monospace`;
      const tw = ctx.measureText(it.text).width;
      const bx = w - tw - 28;
      const by = 48 + chipRow * (size + 24);
      chipRow += 1;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx - 8, by - size - 6, tw + 16, size + 16);
      ctx.fillStyle = color;
      ctx.fillRect(bx - 8, by - size - 6, 4, size + 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(it.text, bx, by);
      ctx.restore();
    } else if (it.kind === 'banner') {
      if (it.place === 'center') {
        // Social-hook: huge words over the middle of the action.
        label(ctx, it.text, w / 2, h * 0.32, Math.max(30, Math.min(64, w / 10)), color, { box: true });
      } else {
        // Broadcast-strap: bottom strap, small caps.
        ctx.save();
        ctx.font = `700 14px "JetBrains Mono", monospace`;
        const tw = ctx.measureText(it.text).width;
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.fillRect((w - tw) / 2 - 12, h - 52, tw + 24, 30);
        ctx.fillStyle = PALETTE.mustard;
        ctx.fillRect((w - tw) / 2 - 12, h - 52, 4, 30);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(it.text, (w - tw) / 2, h - 31);
        ctx.restore();
      }
    }
  }

  // ── Pressure line (under rings) ──
  if (pressure && carrierIdx !== null) {
    const c = frame.boxes[carrierIdx];
    const o = frame.boxes[pressure.oppIdx];
    if (c && o) {
      const x1 = ((c.x1 + c.x2) / 2) * w;
      const y1 = c.y2 * h;
      const x2 = ((o.x1 + o.x2) / 2) * w;
      const y2 = o.y2 * h;
      ctx.save();
      ctx.strokeStyle = pressure.under ? '#ff4040' : BALL_ORANGE;
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      const midx = (x1 + x2) / 2 + 8;
      const midy = (y1 + y2) / 2 - 8;
      label(ctx, `${pressure.dM.toFixed(1)}m est.`, midx, midy, 12, pressure.under ? '#ff8080' : '#ffd080', {
        box: true,
        center: false,
      });
    }
  }

  // ── Rings: every player, ball, carrier emphasis ──
  frame.boxes.forEach((b, i) => {
    const cx = ((b.x1 + b.x2) / 2) * w;
    const feetY = b.y2 * h;
    const rw = Math.max(14, ((b.x2 - b.x1) * w) / 2 + 12);
    const rh = Math.max(5, rw * 0.32);
    ctx.save();
    if (b.cls === 'sports ball') {
      ctx.strokeStyle = BALL_ORANGE;
      ctx.lineWidth = 2;
      ellipse(ctx, cx, ((b.y1 + b.y2) / 2) * h, 7, 5);
      ctx.stroke();
    } else {
      const isCarrier = i === carrierIdx;
      const isOpp = pressure !== null && i === pressure.oppIdx;
      ctx.strokeStyle = isCarrier && pressure?.under ? '#ff4040' : isCarrier ? '#ffffff' : isOpp ? BALL_ORANGE : RING_CYAN;
      ctx.lineWidth = isCarrier ? 3 : 2;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = isCarrier ? 10 : 6;
      ellipse(ctx, cx, feetY, rw, rh);
      ctx.stroke();
    }
    ctx.restore();
  });

  // ── Style discs/rings pinned to roles ──
  for (const it of items) {
    if (it.kind !== 'disc' && it.kind !== 'ring') continue;
    const box = resolveRoleBox(frame, it.track, carrierIdx, pressure?.oppIdx ?? null);
    if (!box || box.cls !== 'person') continue;
    const color = V3_HEX[it.color];
    const cx = ((box.x1 + box.x2) / 2) * w;
    const feetY = box.y2 * h;
    ctx.save();
    if (it.kind === 'disc') {
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.9;
      ellipse(ctx, cx, feetY, 26, 9);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ellipse(ctx, cx, feetY, Math.max(20, ((box.x2 - box.x1) * w) / 2 + 14), 12);
      ctx.stroke();
    }
    ctx.restore();
    if (it.text) {
      const size = it.kind === 'disc' ? 22 : 15;
      const ty = it.place === 'bottom' ? Math.min(h - 60, feetY + 30) : Math.max(size + 6, box.y1 * h - 10);
      label(ctx, it.text, cx, ty, size);
    }
  }

  // ── PRESSURE badge ──
  if (pressure?.under) {
    ctx.save();
    ctx.font = '800 13px "JetBrains Mono", monospace';
    const badge = '● PRESSURE';
    const bw = ctx.measureText(badge).width + 18;
    ctx.fillStyle = 'rgba(180,20,20,0.92)';
    ctx.fillRect(w - bw - 10, 10, bw, 26);
    ctx.fillStyle = '#fff';
    ctx.fillText(badge, w - bw - 10 + 9, 28);
    ctx.restore();
  }

  // ── Hype flash (slow-mo entry) ──
  if (flash) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
