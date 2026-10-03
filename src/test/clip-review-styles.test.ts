import { describe, expect, it } from 'vitest';
import {
  OVERLAY_STYLES,
  buildOverlay,
  itemsAt,
  overlayIsSane,
  type OverlayStyleId,
} from '@/lib/clip-review/styles';
import type { PressureEvent } from '@/lib/clip-review/detections';

const EVENTS: PressureEvent[] = [
  { id: 'p1', t: 4.0, mmss: '00:04', carrierIdx: 0, closerIdx: 1, distM: 2.1 },
  { id: 'p2', t: 6.5, mmss: '00:06', carrierIdx: 0, closerIdx: 1, distM: 1.4 },
];
const DURATION = 8;

const ALL: OverlayStyleId[] = OVERLAY_STYLES.map((s) => s.id);

describe('buildOverlay', () => {
  it('covers all five styles', () => {
    expect(ALL).toEqual(['role-marker', 'telestrator', 'social-hook', 'broadcast-strap', 'data-chip']);
  });
  it.each(ALL)('(%s) produces sane items within the duration', (style) => {
    const items = buildOverlay(EVENTS, DURATION, style);
    expect(items.length).toBeGreaterThan(0);
    expect(overlayIsSane(items, DURATION)).toBe(true);
  });
  it('social-hook banners are 1–3 huge words, no sentences', () => {
    const banners = buildOverlay(EVENTS, DURATION, 'social-hook').filter((i) => i.kind === 'banner');
    expect(banners).toHaveLength(2);
    for (const b of banners) {
      expect(b.text.split(' ').length).toBeLessThanOrEqual(3);
      expect(b.text).toBe(b.text.toUpperCase());
    }
  });
  it('telestrator never stacks beats: arrow starts after the ring ends', () => {
    const items = buildOverlay(EVENTS, DURATION, 'telestrator');
    const ring = items.find((i) => i.kind === 'ring');
    const arrow = items.find((i) => i.kind === 'arrow');
    expect(ring).toBeDefined();
    expect(arrow).toBeDefined();
    expect(arrow!.start).toBeGreaterThanOrEqual(ring!.end);
  });
  it('is deterministic across calls', () => {
    expect(buildOverlay(EVENTS, DURATION, 'data-chip')).toEqual(buildOverlay(EVENTS, DURATION, 'data-chip'));
  });
  it('degrades gracefully with no events', () => {
    for (const style of ALL) {
      const items = buildOverlay([], DURATION, style);
      expect(overlayIsSane(items, DURATION)).toBe(true);
    }
    // Telestrator and strap still say something; hype stays silent with nothing to hype.
    expect(buildOverlay([], DURATION, 'social-hook')).toHaveLength(0);
    expect(buildOverlay([], DURATION, 'telestrator').length).toBeGreaterThan(0);
  });
});

describe('itemsAt', () => {
  it('returns only live items', () => {
    const items = buildOverlay(EVENTS, DURATION, 'data-chip');
    const live = itemsAt(items, EVENTS[0].t);
    expect(live.length).toBeGreaterThan(0);
    expect(live.every((i) => i.start <= EVENTS[0].t && i.end >= EVENTS[0].t)).toBe(true);
    expect(itemsAt(items, 0.1).filter((i) => i.kind === 'chip')).toHaveLength(0);
  });
});
