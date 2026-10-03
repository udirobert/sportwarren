import { describe, expect, it } from 'vitest';
import { exportFileExtension, pickExportMime } from '@/lib/clip-review/export';

describe('pickExportMime', () => {
  it('prefers vp9 webm when available', () => {
    expect(pickExportMime(() => true)).toBe('video/webm;codecs=vp9');
  });
  it('falls through to mp4 for Safari-shaped support', () => {
    expect(pickExportMime((m) => m === 'video/mp4')).toBe('video/mp4');
  });
  it('returns null when nothing is recordable', () => {
    expect(pickExportMime(() => false)).toBeNull();
    expect(pickExportMime(() => { throw new Error('nope'); })).toBeNull();
  });
});

describe('exportFileExtension', () => {
  it('matches the container', () => {
    expect(exportFileExtension('video/webm;codecs=vp9')).toBe('webm');
    expect(exportFileExtension('video/mp4')).toBe('mp4');
  });
});
