import { describe, it, expect } from 'vitest';
import { resolveScorers, type AttributionMember } from '../server/services/match/scorer-attribution';

const members: AttributionMember[] = [
  { profileId: 'p-sam', userId: 'u-sam', name: 'Sam Smith' },
  { profileId: 'p-dave', userId: 'u-dave', name: 'Dave Jones' },
  { profileId: 'p-kim', userId: 'u-kim', name: 'Kim' },
  { profileId: 'p-sam2', userId: 'u-sam2', name: 'Sam Taylor' },
];

const noAssists: never[] = [];

describe('resolveScorers', () => {
  it('resolves a self-reference to the submitter', () => {
    const r = resolveScorers({
      members,
      scorers: [{ name: 'I', goals: 2 }],
      assists: noAssists,
      submitterUserId: 'u-kim',
    });
    expect(r.goals).toEqual([{ profileId: 'p-kim', name: 'Kim', goals: 2 }]);
    expect(r.unresolved).toEqual([]);
  });

  it('resolves an exact full-name match (case-insensitive)', () => {
    const r = resolveScorers({
      members,
      scorers: [{ name: 'dave jones', goals: 1 }],
      assists: noAssists,
      submitterUserId: 'u-kim',
    });
    expect(r.goals).toEqual([{ profileId: 'p-dave', name: 'Dave Jones', goals: 1 }]);
  });

  it('resolves a unique first-name token', () => {
    const r = resolveScorers({
      members,
      scorers: [{ name: 'Kim', goals: 1 }],
      assists: noAssists,
      submitterUserId: 'u-sam',
    });
    expect(r.goals[0].profileId).toBe('p-kim');
  });

  it('does NOT guess when a first name is ambiguous (two Sams)', () => {
    const r = resolveScorers({
      members,
      scorers: [{ name: 'Sam', goals: 1 }],
      assists: noAssists,
      submitterUserId: 'u-kim',
    });
    expect(r.goals).toEqual([]);
    expect(r.unresolved).toEqual(['Sam']);
  });

  it('does NOT prefix-match a nickname (Sammy must not credit Sam)', () => {
    const r = resolveScorers({
      members: [{ profileId: 'p-sam', userId: 'u-sam', name: 'Sam Smith' }],
      scorers: [{ name: 'Sammy', goals: 1 }],
      assists: noAssists,
      submitterUserId: 'u-x',
    });
    expect(r.goals).toEqual([]);
    expect(r.unresolved).toEqual(['Sammy']);
  });

  it('leaves an unknown name unresolved', () => {
    const r = resolveScorers({
      members,
      scorers: [{ name: 'Ronaldo', goals: 3 }],
      assists: noAssists,
      submitterUserId: 'u-kim',
    });
    expect(r.goals).toEqual([]);
    expect(r.unresolved).toEqual(['Ronaldo']);
  });

  it('aggregates duplicate entries for the same player', () => {
    const r = resolveScorers({
      members,
      scorers: [{ name: 'Kim', goals: 1 }, { name: 'kim', goals: 2 }],
      assists: noAssists,
      submitterUserId: 'u-sam',
    });
    expect(r.goals).toEqual([{ profileId: 'p-kim', name: 'Kim', goals: 3 }]);
  });

  it('resolves assists independently and reports mixed unresolved names', () => {
    const r = resolveScorers({
      members,
      scorers: [{ name: 'Kim', goals: 1 }, { name: 'Ghost', goals: 1 }],
      assists: [{ name: 'Dave Jones', assists: 2 }],
      submitterUserId: 'u-sam',
    });
    expect(r.goals).toEqual([{ profileId: 'p-kim', name: 'Kim', goals: 1 }]);
    expect(r.assists).toEqual([{ profileId: 'p-dave', name: 'Dave Jones', assists: 2 }]);
    expect(r.unresolved).toEqual(['Ghost']);
  });

  it('ignores zero/negative goal counts', () => {
    const r = resolveScorers({
      members,
      scorers: [{ name: 'Kim', goals: 0 }],
      assists: noAssists,
      submitterUserId: 'u-sam',
    });
    expect(r.goals).toEqual([]);
    expect(r.unresolved).toEqual([]);
  });
});
