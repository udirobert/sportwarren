import { describe, it, expect } from 'vitest';
import {
  resolveLocale,
  milestoneTelegramCopy,
  milestoneWhatsAppCopy,
  momentTelegramCopy,
  NOTIFY_LOCALES,
} from '@/server/services/personalization/notify-i18n';
import type { MilestoneHint } from '@/server/services/personalization/twin-types';

const m = (kind: MilestoneHint['kind'], payload: unknown = {}): MilestoneHint =>
  ({ kind, payload }) as MilestoneHint;

describe('resolveLocale', () => {
  it.each([
    ['es', 'es'], ['es-MX', 'es'], ['pt_BR', 'pt'], ['FR', 'fr'],
    ['de-CH', 'de'], ['sw-KE', 'sw'], ['ha_NG', 'ha'], ['yo-NG', 'yo'],
    ['zu-ZA', 'zu'], [null, 'en'], [undefined, 'en'], ['', 'en'], ['zh', 'en'],
  ])('normalizes %s → %s', (raw, expected) => {
    expect(resolveLocale(raw as string)).toBe(expected);
  });
});

describe('milestoneTelegramCopy', () => {
  it('renders English by default', () => {
    const out = milestoneTelegramCopy('en', 'player', m('level_up', { to: 7 }));
    expect(out).toContain('Your twin');
    expect(out).toContain('L7');
  });

  it.each(NOTIFY_LOCALES.filter((l) => l !== 'en'))('localizes to %s', (locale) => {
    const out = milestoneTelegramCopy(locale, 'player', m('twin_created'));
    expect(out).not.toContain('Your twin just woke up');
    expect(out.length).toBeGreaterThan(10);
  });

  it('uses squad subject for squad scope', () => {
    expect(milestoneTelegramCopy('en', 'squad', m('sim_win'))).toContain('squad twin');
    expect(milestoneTelegramCopy('es', 'squad', m('sim_win'))).toContain('equipo');
  });

  it('falls back to the default template for unknown kinds', () => {
    const out = milestoneTelegramCopy('fr', 'player', m('mystery' as MilestoneHint['kind']));
    expect(out).toContain('jalon');
  });
});

describe('milestoneWhatsAppCopy', () => {
  it('localizes WhatsApp copy without Markdown', () => {
    const en = milestoneWhatsAppCopy('en', 'player', m('record_broken'));
    const es = milestoneWhatsAppCopy('es', 'player', m('record_broken'));
    expect(en).toContain('broke a record');
    expect(es).toContain('récord');
    expect(en).not.toContain('*');
    expect(es).not.toContain('*');
  });
});

describe('momentTelegramCopy', () => {
  it('frames the moment label in the locale', () => {
    const out = momentTelegramCopy('de', 'player', 'Hat-trick hero');
    expect(out).toContain('Hat-trick hero'); // labels are data, verbatim
    expect(out).toContain('freigeschaltet');
  });
});

describe('African locale coverage', () => {
  // every locale must produce copy for every milestone kind + moment frame —
  // a missing template would silently fall to 'default' and look English-ish
  it.each(NOTIFY_LOCALES)('covers all milestone kinds for %s', (locale) => {
    const kinds: MilestoneHint['kind'][] = [
      'twin_created', 'level_up', 'sim_win', 'sim_podium',
      'attestation_milestone', 'record_broken', 'season_end', 'coaching_expired',
    ];
    for (const kind of kinds) {
      const out = milestoneTelegramCopy(locale, 'player', m(kind, { to: 3 }));
      expect(out.length).toBeGreaterThan(10);
    }
  });
});
