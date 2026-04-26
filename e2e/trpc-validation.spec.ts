import { test, expect, describe } from '@playwright/test';

/**
 * tRPC Endpoint Validation Integration Tests
 * Verifies that input validation correctly rejects malformed data
 * Tests the integration between frontend forms and backend Zod schemas
 */

describe('tRPC Input Validation - Squad Router', () => {
  test.describe.configure({ mode: 'serial' });

  // Squad creation validation
  test('rejects squad name shorter than 2 characters', async ({ page }) => {
    await page.goto('/squad');
    
    // Try to trigger createSquad with invalid data (mock API call)
    const response = await page.request.post('/api/trpc/squad.create', {
      data: {
        json: {
          name: 'A', // Too short
          shortName: 'ABC',
        },
      },
    });

    // Should return validation error
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects short name longer than 5 characters', async ({ page }) => {
    await page.goto('/squad');
    
    const response = await page.request.post('/api/trpc/squad.create', {
      data: {
        json: {
          name: 'Valid Squad Name',
          shortName: 'TOOLONG', // 7 chars, max is 5
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  // Squad ID validation
  test('rejects empty squad ID in getById', async ({ page }) => {
    const response = await page.request.post('/api/trpc/squad.getById', {
      data: {
        json: {
          id: '', // Empty string should be rejected
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  // Score validation
  test('rejects negative match scores', async ({ page }) => {
    const response = await page.request.post('/api/trpc/match.submit', {
      data: {
        json: {
          homeSquadId: 'valid-squad-id',
          awaySquadId: 'valid-squad-id-2',
          homeScore: -1, // Negative should be rejected
          awayScore: 0,
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects scores above 255', async ({ page }) => {
    const response = await page.request.post('/api/trpc/match.submit', {
      data: {
        json: {
          homeSquadId: 'valid-squad-id',
          awaySquadId: 'valid-squad-id-2',
          homeScore: 256, // Exceeds max
          awayScore: 0,
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

describe('tRPC Input Validation - Match Router', () => {
  test('rejects invalid match ID format', async ({ page }) => {
    const response = await page.request.post('/api/trpc/match.getById', {
      data: {
        json: {
          id: '', // Empty string
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects invalid position values', async ({ page }) => {
    const response = await page.request.post('/api/trpc/player.update', {
      data: {
        json: {
          name: 'John Doe',
          position: 'CENTER', // Invalid - should be GK, DF, MF, ST, or WG
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects invalid formation values', async ({ page }) => {
    const response = await page.request.post('/api/trpc/squad.saveTactics', {
      data: {
        json: {
          squadId: 'valid-squad-id',
          formation: 'invalid-formation',
          playStyle: 'balanced',
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects treasury amount of zero', async ({ page }) => {
    const response = await page.request.post('/api/trpc/squad.depositToTreasury', {
      data: {
        json: {
          squadId: 'valid-squad-id',
          amount: 0, // Must be positive
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects treasury amount exceeding maximum', async ({ page }) => {
    const response = await page.request.post('/api/trpc/squad.depositToTreasury', {
      data: {
        json: {
          squadId: 'valid-squad-id',
          amount: 1_000_000_001, // Exceeds 1 billion max
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

describe('tRPC Pagination Validation', () => {
  test('rejects limit above maximum of 100', async ({ page }) => {
    const response = await page.request.post('/api/trpc/squad.list', {
      data: {
        json: {
          limit: 101, // Exceeds max
          offset: 0,
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects negative offset', async ({ page }) => {
    const response = await page.request.post('/api/trpc/squad.list', {
      data: {
        json: {
          limit: 20,
          offset: -1, // Negative should be rejected
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('accepts valid pagination parameters', async ({ page }) => {
    const response = await page.request.post('/api/trpc/squad.list', {
      data: {
        json: {
          limit: 50,
          offset: 100,
        },
      },
    });

    // Should not return validation error (may return empty data if no squads)
    expect(response.status()).not.toBe(400);
  });
});

describe('tRPC Chat/AI Input Validation', () => {
  test('rejects empty chat message', async ({ page }) => {
    const response = await page.request.post('/api/trpc/agent.chat', {
      data: {
        json: {
          staffId: 'coach-1',
          message: '', // Empty message should be rejected
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects chat message exceeding 500 characters', async ({ page }) => {
    const response = await page.request.post('/api/trpc/agent.chat', {
      data: {
        json: {
          staffId: 'coach-1',
          message: 'A'.repeat(501), // Exceeds max
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects invalid ISO 8601 timestamp in staff decision', async ({ page }) => {
    const response = await page.request.post('/api/trpc/memory.logDecision', {
      data: {
        json: {
          staffId: 'coach-1',
          action: 'Sign player',
          decision: 'confirmed',
          timestamp: 'not-a-valid-date', // Should be ISO 8601
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

describe('tRPC Peer Rating Validation', () => {
  test('rejects score outside 1-10 range', async ({ page }) => {
    const response = await page.request.post('/api/trpc/peerRating.submit', {
      data: {
        json: {
          matchId: 'valid-match-id',
          ratings: [{
            targetId: 'player-1',
            attribute: 'pace',
            score: 15, // Exceeds max of 10
          }],
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('rejects non-integer score', async ({ page }) => {
    const response = await page.request.post('/api/trpc/peerRating.submit', {
      data: {
        json: {
          matchId: 'valid-match-id',
          ratings: [{
            targetId: 'player-1',
            attribute: 'pace',
            score: 7.5, // Must be integer
          }],
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

describe('tRPC Availability Validation', () => {
  test('rejects day of week outside 1-7 range', async ({ page }) => {
    const response = await page.request.post('/api/trpc/squad.setAvailability', {
      data: {
        json: {
          squadId: 'valid-squad-id',
          dayOfWeek: 8, // Must be 1-7
          isAvailable: true,
        },
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});