import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  squadIdSchema,
  userIdSchema,
  matchIdSchema,
  squadNameSchema,
  shortNameSchema,
  matchScoreSchema,
  playerNameSchema,
  positionSchema,
  formationSchema,
  playStyleSchema,
  treasuryAmountSchema,
  chatMessageSchema,
  staffDecisionSchema,
  paginationSchema,
  availabilitySetSchema,
  peerRatingItemSchema,
  sessionCreateSchema,
  activitySyncSchema,
} from '@/server/lib/validation-schemas';

describe('validation-schemas', () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // CORE VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('ID schemas', () => {
    it('rejects empty string for required ID fields', () => {
      expect(() => squadIdSchema.parse('')).toThrow();
      expect(() => userIdSchema.parse('')).toThrow();
      expect(() => matchIdSchema.parse('')).toThrow();
    });

    it('rejects whitespace-only strings', () => {
      expect(() => squadIdSchema.parse('   ')).toThrow();
    });

    it('accepts valid non-empty strings', () => {
      expect(squadIdSchema.parse('abc123')).toBe('abc123');
      expect(userIdSchema.parse('user_xyz')).toBe('user_xyz');
      expect(matchIdSchema.parse('match-abc-123')).toBe('match-abc-123');
    });
  });

  describe('paginationSchema', () => {
    it('applies default values', () => {
      const result = paginationSchema.parse({});
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
    });

    it('rejects limit below minimum', () => {
      expect(() => paginationSchema.parse({ limit: 0 })).toThrow();
      expect(() => paginationSchema.parse({ limit: -1 })).toThrow();
    });

    it('rejects limit above maximum', () => {
      expect(() => paginationSchema.parse({ limit: 101 })).toThrow();
    });

    it('rejects negative offset', () => {
      expect(() => paginationSchema.parse({ offset: -1 })).toThrow();
    });

    it('accepts valid pagination values', () => {
      const result = paginationSchema.parse({ limit: 50, offset: 100 });
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(100);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SQUAD VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('squadNameSchema', () => {
    it('rejects names shorter than 2 characters', () => {
      expect(() => squadNameSchema.parse('a')).toThrow();
    });

    it('rejects names longer than 60 characters', () => {
      const longName = 'a'.repeat(61);
      expect(() => squadNameSchema.parse(longName)).toThrow();
    });

    it('trims whitespace', () => {
      expect(squadNameSchema.parse('  FC United  ')).toBe('FC United');
    });

    it('accepts valid names', () => {
      expect(squadNameSchema.parse('FC United')).toBe('FC United');
      expect(squadNameSchema.parse('AC Milan')).toBe('AC Milan');
    });
  });

  describe('shortNameSchema', () => {
    it('rejects short names shorter than 2 characters', () => {
      expect(() => shortNameSchema.parse('F')).toThrow();
    });

    it('rejects short names longer than 5 characters', () => {
      expect(() => shortNameSchema.parse('FCDU')).toThrow();
    });

    it('accepts valid short names', () => {
      expect(shortNameSchema.parse('FCU')).toBe('FCU');
      expect(shortNameSchema.parse('MIL')).toBe('MIL');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MATCH VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('matchScoreSchema', () => {
    it('rejects negative scores', () => {
      expect(() => matchScoreSchema.parse(-1)).toThrow();
    });

    it('rejects scores above 255', () => {
      expect(() => matchScoreSchema.parse(256)).toThrow();
    });

    it('rejects non-integer scores', () => {
      expect(() => matchScoreSchema.parse(1.5)).toThrow();
    });

    it('accepts valid scores', () => {
      expect(matchScoreSchema.parse(0)).toBe(0);
      expect(matchScoreSchema.parse(5)).toBe(5);
      expect(matchScoreSchema.parse(255)).toBe(255);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PLAYER VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('playerNameSchema', () => {
    it('rejects names shorter than 2 characters', () => {
      expect(() => playerNameSchema.parse('J')).toThrow();
    });

    it('rejects names longer than 40 characters', () => {
      const longName = 'J'.repeat(41);
      expect(() => playerNameSchema.parse(longName)).toThrow();
    });

    it('accepts valid player names', () => {
      expect(playerNameSchema.parse('John Smith')).toBe('John Smith');
    });
  });

  describe('positionSchema', () => {
    it('accepts valid positions', () => {
      expect(positionSchema.parse('GK')).toBe('GK');
      expect(positionSchema.parse('DF')).toBe('DF');
      expect(positionSchema.parse('MF')).toBe('MF');
      expect(positionSchema.parse('ST')).toBe('ST');
      expect(positionSchema.parse('WG')).toBe('WG');
    });

    it('rejects invalid positions', () => {
      expect(() => positionSchema.parse('QB')).toThrow();
      expect(() => positionSchema.parse('center')).toThrow();
      expect(() => positionSchema.parse('')).toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TACTICS VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('formationSchema', () => {
    it('accepts valid formations', () => {
      expect(formationSchema.parse('4-4-2')).toBe('4-4-2');
      expect(formationSchema.parse('4-3-3')).toBe('4-3-3');
      expect(formationSchema.parse('3-5-2')).toBe('3-5-2');
    });

    it('rejects invalid formations', () => {
      expect(() => formationSchema.parse('1-2-3-4')).toThrow();
      expect(() => formationSchema.parse('invalid')).toThrow();
    });
  });

  describe('playStyleSchema', () => {
    it('accepts valid play styles', () => {
      expect(playStyleSchema.parse('balanced')).toBe('balanced');
      expect(playStyleSchema.parse('possession')).toBe('possession');
      expect(playStyleSchema.parse('counter')).toBe('counter');
      expect(playStyleSchema.parse('high_press')).toBe('high_press');
    });

    it('rejects invalid play styles', () => {
      expect(() => playStyleSchema.parse('aggressive')).toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // TREASURY VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('treasuryAmountSchema', () => {
    it('rejects zero amount', () => {
      expect(() => treasuryAmountSchema.parse(0)).toThrow();
    });

    it('rejects negative amounts', () => {
      expect(() => treasuryAmountSchema.parse(-100)).toThrow();
    });

    it('rejects amounts exceeding maximum', () => {
      expect(() => treasuryAmountSchema.parse(1_000_000_001)).toThrow();
    });

    it('accepts valid positive amounts', () => {
      expect(treasuryAmountSchema.parse(1)).toBe(1);
      expect(treasuryAmountSchema.parse(1000)).toBe(1000);
      expect(treasuryAmountSchema.parse(1_000_000_000)).toBe(1_000_000_000);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CHAT/AI VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('chatMessageSchema', () => {
    it('rejects empty messages', () => {
      expect(() => chatMessageSchema.parse('')).toThrow();
    });

    it('rejects messages longer than 500 characters', () => {
      const longMessage = 'a'.repeat(501);
      expect(() => chatMessageSchema.parse(longMessage)).toThrow();
    });

    it('accepts valid messages', () => {
      expect(chatMessageSchema.parse('Hello, Coach!')).toBe('Hello, Coach!');
      expect(chatMessageSchema.parse('a'.repeat(500))).toHaveLength(500);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // MEMORY VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('staffDecisionSchema', () => {
    it('rejects invalid timestamps', () => {
      expect(() => staffDecisionSchema.parse({
        staffId: 'coach-1',
        action: 'Sign player',
        decision: 'confirmed',
        timestamp: 'not-a-date',
      })).toThrow();
    });

    it('accepts valid ISO 8601 timestamps', () => {
      const result = staffDecisionSchema.parse({
        staffId: 'coach-1',
        action: 'Sign player',
        decision: 'confirmed',
        timestamp: '2024-01-15T10:30:00Z',
      });
      expect(result.timestamp).toBe('2024-01-15T10:30:00Z');
    });

    it('rejects empty staffId', () => {
      expect(() => staffDecisionSchema.parse({
        staffId: '',
        action: 'Sign player',
        decision: 'confirmed',
        timestamp: '2024-01-15T10:30:00Z',
      })).toThrow();
    });

    it('rejects invalid decision values', () => {
      expect(() => staffDecisionSchema.parse({
        staffId: 'coach-1',
        action: 'Sign player',
        decision: 'maybe',
        timestamp: '2024-01-15T10:30:00Z',
      })).toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // AVAILABILITY VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('availabilitySetSchema', () => {
    it('rejects day of week outside 1-7 range', () => {
      expect(() => availabilitySetSchema.parse({
        squadId: 'squad-1',
        dayOfWeek: 0,
      })).toThrow();

      expect(() => availabilitySetSchema.parse({
        squadId: 'squad-1',
        dayOfWeek: 8,
      })).toThrow();
    });

    it('accepts valid day of week values', () => {
      expect(availabilitySetSchema.parse({
        squadId: 'squad-1',
        dayOfWeek: 1,
      })).toBeDefined();

      expect(availabilitySetSchema.parse({
        squadId: 'squad-1',
        dayOfWeek: 7,
      })).toBeDefined();
    });

    it('defaults isAvailable to true', () => {
      const result = availabilitySetSchema.parse({
        squadId: 'squad-1',
        dayOfWeek: 3,
      });
      expect(result.isAvailable).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // PEER RATING VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('peerRatingItemSchema', () => {
    it('rejects scores outside 1-10 range', () => {
      expect(() => peerRatingItemSchema.parse({
        targetId: 'player-1',
        attribute: 'pace',
        score: 0,
      })).toThrow();

      expect(() => peerRatingItemSchema.parse({
        targetId: 'player-1',
        attribute: 'pace',
        score: 11,
      })).toThrow();
    });

    it('rejects non-integer scores', () => {
      expect(() => peerRatingItemSchema.parse({
        targetId: 'player-1',
        attribute: 'pace',
        score: 7.5,
      })).toThrow();
    });

    it('accepts valid peer ratings', () => {
      expect(peerRatingItemSchema.parse({
        targetId: 'player-1',
        attribute: 'pace',
        score: 8,
      })).toBeDefined();
    });

    it('limits hypeTags to 5 items', () => {
      const manyTags = Array(6).fill('leader');
      expect(() => peerRatingItemSchema.parse({
        targetId: 'player-1',
        attribute: 'pace',
        score: 8,
        hypeTags: manyTags,
      })).toThrow();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // SESSION VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('sessionCreateSchema', () => {
    it('rejects session names shorter than 3 characters', () => {
      expect(() => sessionCreateSchema.parse({
        squadId: 'squad-1',
        name: 'ab',
      })).toThrow();
    });

    it('accepts valid session data', () => {
      const result = sessionCreateSchema.parse({
        squadId: 'squad-1',
        name: 'Saturday Match',
      });
      expect(result.name).toBe('Saturday Match');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIVITY/FITNESS VALIDATORS
  // ─────────────────────────────────────────────────────────────────────────────

  describe('activitySyncSchema', () => {
    it('rejects duration less than 1 minute', () => {
      expect(() => activitySyncSchema.parse({
        userId: 'user-1',
        type: 'run',
        duration: 0,
        intensity: 'medium',
      })).toThrow();
    });

    it('accepts valid activity types', () => {
      expect(activitySyncSchema.parse({
        userId: 'user-1',
        type: 'run',
        duration: 30,
        intensity: 'high',
      })).toBeDefined();

      expect(activitySyncSchema.parse({
        userId: 'user-1',
        type: 'gym',
        duration: 60,
        intensity: 'medium',
      })).toBeDefined();

      expect(activitySyncSchema.parse({
        userId: 'user-1',
        type: 'hiit',
        duration: 20,
        intensity: 'low',
      })).toBeDefined();

      expect(activitySyncSchema.parse({
        userId: 'user-1',
        type: 'field_training',
        duration: 45,
        intensity: 'medium',
      })).toBeDefined();
    });

    it('rejects invalid intensity values', () => {
      expect(() => activitySyncSchema.parse({
        userId: 'user-1',
        type: 'run',
        duration: 30,
        intensity: 'extreme',
      })).toThrow();
    });

    it('defaults source to manual', () => {
      const result = activitySyncSchema.parse({
        userId: 'user-1',
        type: 'run',
        duration: 30,
        intensity: 'medium',
      });
      expect(result.source).toBe('manual');
    });
  });
});