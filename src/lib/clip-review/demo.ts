/**
 * Synthetic demo detections for the ClipReview pilot.
 *
 * Clearly NOT real YOLO output — deterministic paths shaped to show one
 * clean pressure squeeze (~4s) and a second one (~6.5s) on an 8s clip.
 * Replaced by real detections.json from the upload → YOLO pipeline in phase-1.
 */
import type { ClipFrame } from './detections';

export const DEMO_CLIP_SRC =
  'https://raw.githubusercontent.com/jonhpark7966/video-agents-hack/main/samples/wz1r_VJaJZw_0-8.mp4';
export const DEMO_CLIP_SECONDS = 8;

function person(x: number, y2: number, w = 0.032, h = 0.11, conf = 0.9) {
  return { cls: 'person' as const, x1: x, y1: y2 - h, x2: x + w, y2, conf };
}
function ball(x: number, y = 0.78) {
  return { cls: 'sports ball' as const, x1: x, y1: y, x2: x + 0.014, y2: y + 0.022, conf: 0.8 };
}

const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

export function generateDemoDetections(): ClipFrame[] {
  const frames: ClipFrame[] = [];
  const FPS = 2;
  for (let i = 0; i <= DEMO_CLIP_SECONDS * FPS; i++) {
    const t = Math.round((i / FPS) * 100) / 100;
    const u = t / DEMO_CLIP_SECONDS;
    const cx = lerp(0.38, 0.66, u); // carrier drifts upfield
    // Defender: holds off, squeezes at ~4s, releases, squeezes again ~6.5s.
    const squeeze1 = Math.exp(-Math.pow((t - 4.0) / 0.7, 2));
    const squeeze2 = Math.exp(-Math.pow((t - 6.5) / 0.6, 2));
    const gap = 0.11 - 0.075 * Math.max(squeeze1, squeeze2);
    frames.push({
      t,
      boxes: [
        person(cx, 0.72), // 0 — carrier
        person(cx + gap, 0.7), // 1 — closing defender
        person(lerp(0.3, 0.44, u), 0.66), // 2 — support
        person(lerp(0.55, 0.5, u), 0.6), // 3 — far defender
        person(0.16, 0.5, 0.024, 0.08), // 4 — keeper
        ball(cx + 0.008),
      ],
    });
  }
  return frames;
}
