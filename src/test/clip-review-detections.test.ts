import { describe, expect, it } from 'vitest';
import {
  carrierPressureM,
  detectPressureEvents,
  findCarrier,
  formatMmSs,
  frameAt,
  nearestOpponent,
  pixelDistToMetres,
  pressureForFrame,
  type ClipFrame,
} from '@/lib/clip-review/detections';
function person(x: number, y2 = 0.8, w = 0.03, h = 0.1): ClipFrame['boxes'][number] {
  return { cls: 'person', x1: x, y1: y2 - h, x2: x + w, y2, conf: 0.9 };
}
function ball(x: number): ClipFrame['boxes'][number] {
  return { cls: 'sports ball', x1: x, y1: 0.78, x2: x + 0.012, y2: 0.8, conf: 0.8 };
}

describe('findCarrier', () => {
  it('picks the person nearest the ball', () => {
    const frame: ClipFrame = { t: 0, boxes: [person(0.1), person(0.5), ball(0.52)] };
    expect(findCarrier(frame)).toBe(1);
  });
  it('returns null without a ball or without people', () => {
    expect(findCarrier({ t: 0, boxes: [person(0.1)] })).toBeNull();
    expect(findCarrier({ t: 0, boxes: [ball(0.5)] })).toBeNull();
  });
});

describe('nearestOpponent', () => {
  it('treats the nearest other person as the opponent', () => {
    const frame: ClipFrame = { t: 0, boxes: [person(0.5), person(0.56), person(0.8), ball(0.51)] };
    expect(nearestOpponent(frame, 0)).toBe(1);
  });
});

describe('pixelDistToMetres', () => {
  it('scales by the assumed 50m pitch width', () => {
    expect(pixelDistToMetres(0.06)).toBeCloseTo(3.0);
  });
});

describe('detectPressureEvents', () => {
  // Carrier at 0.5, opponent closing from 0.62 → 0.53 across three frames.
  const frames: ClipFrame[] = [
    { t: 0.0, boxes: [person(0.5), person(0.62), ball(0.51)] },
    { t: 0.5, boxes: [person(0.5), person(0.56), ball(0.51)] },
    { t: 1.0, boxes: [person(0.5), person(0.53), ball(0.51)] },
    { t: 1.5, boxes: [person(0.5), person(0.53), ball(0.51)] },
    { t: 3.0, boxes: [person(0.5), person(0.62), ball(0.51)] },
    { t: 3.5, boxes: [person(0.5), person(0.53), ball(0.51)] },
  ];
  it('fires once per squeeze with debounce', () => {
    const events = detectPressureEvents(frames);
    expect(events).toHaveLength(2);
    expect(events[0].mmss).toBe('00:01');
    expect(events[0].distM).toBeLessThan(3);
    expect(carrierPressureM(frames[0])).toBeGreaterThan(3);
  });
  it('holds the last carrier across ball-missed frames', () => {
    const gap: ClipFrame[] = [
      { t: 0.0, boxes: [person(0.5), person(0.53), ball(0.51)] },
      { t: 0.5, boxes: [person(0.5), person(0.53)] },
    ];
    expect(detectPressureEvents(gap)).toHaveLength(1);
  });
});

describe('frameAt / formatMmSs', () => {  it('picks the nearest frame at or before t', () => {
    const frames: ClipFrame[] = [{ t: 0, boxes: [] }, { t: 1, boxes: [] }];
    expect(frameAt(frames, 1.4)?.t).toBe(1);
    expect(frameAt([], 1)).toBeNull();
  });
  it('formats mm:ss', () => {
    expect(formatMmSs(61)).toBe('01:01');
  });
});

describe('pressureForFrame', () => {
  it('reports carrier, closer, distance and the under flag', () => {
    const tight: ClipFrame = { t: 0, boxes: [person(0.5), person(0.53), ball(0.51)] };
    const p = pressureForFrame(tight);
    expect(p).not.toBeNull();
    expect(p!.carrierIdx).toBe(0);
    expect(p!.oppIdx).toBe(1);
    expect(p!.under).toBe(true);
    const loose: ClipFrame = { t: 0, boxes: [person(0.5), person(0.7), ball(0.51)] };
    expect(pressureForFrame(loose)?.under).toBe(false);
  });
  it('returns null when the frame cannot hold a squeeze', () => {
    expect(pressureForFrame({ t: 0, boxes: [person(0.5)] })).toBeNull();
    expect(pressureForFrame({ t: 0, boxes: [person(0.5), ball(0.51)] })).toBeNull();
  });
});

describe('demo detections', () => {
  it('produces pressure events for the pilot clip', async () => {
    const { generateDemoDetections } = await import('@/lib/clip-review/demo');
    const events = detectPressureEvents(generateDemoDetections());
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0].distM).toBeLessThan(3);
  });
});
