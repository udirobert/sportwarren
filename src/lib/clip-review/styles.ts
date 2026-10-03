/**
 * Overlay style system — port of video-agents-hack `pipeline/prompt_guide.md`.
 *
 * Five styles, one per variant, never mixed. Each style is a pure function of
 * (pressure events, clip duration) → overlay items. Shared rules enforced in
 * the builder: one idea at a time, every word up ≥1.4s, banners ≤3 words,
 * captions ≤6 words, only what the events support.
 *
 * Adaptation note: the hack's items reference persistent `track`/`to` ids from
 * scene.json. Our detections are per-frame box indices, so items reference
 * *roles* (`carrier` | `closer`) resolved live per frame. Same kinds, same
 * timing semantics — ready for a future server burn-in without rework.
 */
import type { PressureEvent } from './detections';

export type OverlayStyleId = 'role-marker' | 'telestrator' | 'social-hook' | 'broadcast-strap' | 'data-chip';

export type OverlayKind = 'disc' | 'ring' | 'arrow' | 'chip' | 'banner';
export type OverlayRole = 'carrier' | 'closer' | '';

export interface OverlayItem {
  id: string;
  kind: OverlayKind;
  /** Role resolved per frame (carrier = ball carrier, closer = nearest opponent). */
  track: OverlayRole;
  to: OverlayRole;
  start: number;
  end: number;
  text: string;
  color: 'mustard' | 'white' | 'cyan' | 'red' | 'sage' | 'navy';
  /** Where free-floating text sits. Defaults: banner → top, ring/disc text → above shape, chip → top-right. */
  place: 'top' | 'center' | 'bottom';
}

export interface StyleDef {
  id: OverlayStyleId;
  label: string;
  blurb: string;
}

export const OVERLAY_STYLES: StyleDef[] = [
  { id: 'role-marker', label: 'Marker', blurb: 'Disc under the carrier + one short role word' },
  { id: 'telestrator', label: 'Pundit', blurb: 'Ring, then arrow — one picture at a time' },
  { id: 'social-hook', label: 'Hype', blurb: 'Huge timed words for the group chat' },
  { id: 'broadcast-strap', label: 'Strap', blurb: 'Clean name-and-story strap, out of the way' },
  { id: 'data-chip', label: 'Data', blurb: 'One checkable fact next to the picture' },
];

/** Minimum on-screen time for any word (mirrors MIN_ON_SCREEN 1.5 ≈ 1.4s rule). */
export const MIN_ON_SCREEN_S = 1.4;

const clampSpan = (start: number, end: number, duration: number): [number, number] => {
  const s = Math.min(Math.max(start, 0), Math.max(0, duration - MIN_ON_SCREEN_S));
  const e = Math.min(Math.max(end, s + MIN_ON_SCREEN_S), duration);
  return [Math.round(s * 100) / 100, Math.round(e * 100) / 100];
};

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

function banner(text: string): string {
  // Banners are 1–3 words. Hard-truncate rather than emit a paragraph.
  return text.split(/\s+/).filter(Boolean).slice(0, 3).join(' ').toUpperCase();
}

function caption(text: string): string {
  // Explanation lines are at most 6 words.
  return text.split(/\s+/).filter(Boolean).slice(0, 6).join(' ');
}

/**
 * Build the overlay item list for one style. Deterministic — same events +
 * duration always produce the same items, so shares render identically.
 */
export function buildOverlay(
  events: PressureEvent[],
  duration: number,
  style: OverlayStyleId,
): OverlayItem[] {
  if (duration <= 0) return [];
  const items: OverlayItem[] = [];
  const eventWindow = (e: PressureEvent, pad = 1): [number, number] =>
    clampSpan(e.t - pad, e.t + pad, duration);

  switch (style) {
    case 'role-marker': {
      // One mustard disc on the carrier for most of the clip + one-word role.
      const [s, e] = clampSpan(0.4, duration - 0.3, duration);
      items.push({ id: 'o1', kind: 'disc', track: 'carrier', to: '', start: s, end: e, text: 'On it', color: 'mustard', place: 'top' });
      // A second disc on the closer, only while a squeeze is live.
      events.forEach((ev, i) => {
        const [ws, we] = eventWindow(ev, 0.8);
        items.push({ id: `o${i + 2}`, kind: 'disc', track: 'closer', to: '', start: ws, end: we, text: '', color: 'red', place: 'top' });
      });
      break;
    }
    case 'telestrator': {
      // Beat A: ring on the carrier around the first squeeze. Beat B: arrow
      // carrier → closer on the next one. Never both at once.
      if (events.length > 0) {
        const [s, e] = eventWindow(events[0], 1.2);
        items.push({ id: 'o1', kind: 'ring', track: 'carrier', to: '', start: s, end: e, text: caption(`Squeezed — ${events[0].distM.toFixed(1)}m of trouble`), color: 'white', place: 'bottom' });
      }
      if (events.length > 1) {
        const [s, e] = eventWindow(events[1], 1.2);
        // Start beat B after beat A ends (take the first graphic off first).
        const prevEnd = items[0]?.end ?? 0;
        const [cs, ce] = clampSpan(Math.max(s, prevEnd + 0.1), e, duration);
        if (ce - cs >= MIN_ON_SCREEN_S) {
          items.push({ id: 'o2', kind: 'arrow', track: 'carrier', to: 'closer', start: cs, end: ce, text: caption('Closed down again'), color: 'white', place: 'bottom' });
        }
      }
      if (events.length === 0) {
        const [s, e] = clampSpan(0.4, Math.min(3, duration - 0.3), duration);
        items.push({ id: 'o1', kind: 'ring', track: 'carrier', to: '', start: s, end: e, text: caption('Time on the ball'), color: 'white', place: 'bottom' });
      }
      break;
    }
    case 'social-hook': {
      // One banner per squeeze, ~2s on the moment it describes. No sentences.
      const hooks = ['SQUEEZE', 'UNDER PRESSURE', 'INTO SPACE', 'TOO SLICK'];
      events.forEach((ev, i) => {
        const [s, e] = clampSpan(ev.t - 0.6, ev.t + 1.4, duration);
        items.push({ id: `o${i + 1}`, kind: 'banner', track: '', to: '', start: s, end: e, text: banner(hooks[i % hooks.length]), color: 'mustard', place: 'center' });
        items.push({ id: `d${i + 1}`, kind: 'disc', track: 'carrier', to: '', start: s, end: e, text: '', color: 'mustard', place: 'top' });
      });
      break;
    }
    case 'broadcast-strap': {
      // One bottom strap that stays up ≥3s while the story is the squeeze.
      const line =
        events.length > 0
          ? caption(`Pressure x${events.length} — closest ${Math.min(...events.map((v) => v.distM)).toFixed(1)}m est.`)
          : caption('Clip review — no squeezes under 3m');
      const [s, e] = clampSpan(0.4, Math.max(3.4, Math.min(duration - 0.3, events[events.length - 1]?.t ?? 3.4 + 1)), duration);
      items.push({ id: 'o1', kind: 'banner', track: '', to: '', start: s, end: e, text: line, color: 'white', place: 'bottom' });
      events.forEach((ev, i) => {
        const [ws, we] = eventWindow(ev, 1);
        items.push({ id: `r${i + 1}`, kind: 'ring', track: 'carrier', to: '', start: ws, end: we, text: '', color: 'cyan', place: 'top' });
      });
      break;
    }
    case 'data-chip': {
      // One factual chip per squeeze. Only what a viewer can check by looking.
      events.forEach((ev, i) => {
        const [s, e] = eventWindow(ev, 1.4);
        items.push({ id: `o${i + 1}`, kind: 'chip', track: '', to: '', start: s, end: e, text: caption(`Squeeze ${ev.mmss} · ${ev.distM.toFixed(1)}m est.`), color: 'white', place: 'top' });
        items.push({ id: `d${i + 1}`, kind: 'disc', track: 'carrier', to: '', start: s, end: e, text: '', color: 'sage', place: 'top' });
      });
      break;
    }
  }
  return items;
}

/** Items live at time t. */
export function itemsAt(items: OverlayItem[], t: number): OverlayItem[] {
  return items.filter((it) => t >= it.start && t <= it.end);
}

/** Sanity used by tests: every word-bearing item respects the timing rules. */
export function overlayIsSane(items: OverlayItem[], duration: number): boolean {
  return items.every((it) => {
    if (it.start < 0 || it.end > duration + 1e-6 || it.end - it.start < MIN_ON_SCREEN_S - 1e-6) return false;
    if (it.kind === 'banner' && words(it.text) > 6) return false;
    if (it.text && it.kind !== 'banner' && it.kind !== 'chip' && words(it.text) > 6) return false;
    return true;
  });
}
