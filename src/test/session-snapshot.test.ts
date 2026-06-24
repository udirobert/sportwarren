/**
 * Tests for the session attribute snapshot logic in startSession() and endSession().
 *
 * Validates that:
 *   1. startSession() captures beforeAttributes for all squad members with twins
 *   2. endSession() captures afterAttributes for all players who participated
 *   3. The snapshot degrades gracefully when no twins exist (empty object)
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

// Build mock before vi.mock hoisting — use vi.hoisted to ensure
// the object exists when the factory runs
const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  session: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  match: {
    create: vi.fn(),
    update: vi.fn(),
  },
  squadMember: {
    findMany: vi.fn(),
  },
  playerMatchStats: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  sessionAttendee: {
    upsert: vi.fn(),
  },
  playerProfile: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: mockPrisma,
}));

// Mock revalidatePath so it doesn't actually run
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

// Import the actions AFTER mocks are set up
import { startSession, endSession } from '@/app/session/live/[token]/_actions';

beforeEach(() => {
  vi.clearAllMocks();
});

const CAPTAIN_TOKEN = 'captain-wallet-123';
const CAPTAIN_USER_ID = 'user-captain-1';
const SQUAD_ID = 'squad-1';

function makeCaptainUser() {
  return {
    id: CAPTAIN_USER_ID,
    walletAddress: CAPTAIN_TOKEN,
    squads: [
      {
        role: 'captain',
        squadId: SQUAD_ID,
        squad: { id: SQUAD_ID, name: 'Test Squad' },
      },
    ],
  };
}

function makeMember(overrides: Partial<{
  userId: string;
  name: string;
  profileId: string;
  twinId: string;
  attrs: Record<string, number>;
}> = {}) {
  const {
    userId = 'user-1',
    name = 'Player One',
    profileId = 'profile-1',
    twinId = 'twin-1',
    attrs = { pace: 55, shooting: 50, passing: 60, dribbling: 52, defending: 58, physical: 53 },
  } = overrides;
  return {
    userId,
    user: {
      id: userId,
      name,
      playerProfile: {
        id: profileId,
        twin: {
          id: twinId,
          baseAttributes: attrs,
        },
      },
    },
  };
}

describe('startSession snapshot', () => {
  it('captures beforeAttributes for all squad members with twins', async () => {
    // Arrange
    mockPrisma.user.findUnique.mockResolvedValue(makeCaptainUser());
    mockPrisma.session.findFirst.mockResolvedValue(null);
    const mockSession = { id: 'session-1', squadId: SQUAD_ID };
    mockPrisma.session.create.mockResolvedValue(mockSession);
    mockPrisma.match.create.mockResolvedValue({ id: 'match-1' });

    const members = [
      makeMember({ userId: 'user-1', name: 'Player One', profileId: 'profile-1', twinId: 'twin-1', attrs: { pace: 55, shooting: 50, passing: 60, dribbling: 52, defending: 58, physical: 53 } }),
      makeMember({ userId: 'user-2', name: 'Player Two', profileId: 'profile-2', twinId: 'twin-2', attrs: { pace: 60, shooting: 45, passing: 55, dribbling: 65, defending: 50, physical: 48 } }),
      makeMember({ userId: 'user-3', name: 'No Twin Player', profileId: 'profile-3', twinId: 'twin-3' }),
    ];
    // Remove twin from third member
    (members[2].user.playerProfile as any).twin = null;

    mockPrisma.squadMember.findMany.mockResolvedValue(members);
    mockPrisma.playerMatchStats.create.mockResolvedValue({});
    mockPrisma.sessionAttendee.upsert.mockResolvedValue({});
    mockPrisma.session.update.mockResolvedValue(mockSession);

    // Act
    const result = await startSession(CAPTAIN_TOKEN);

    // Assert
    expect(result.sessionId).toBe('session-1');
    expect(result.matchId).toBe('match-1');

    // Verify beforeAttributes was set on the session
    expect(mockPrisma.session.update).toHaveBeenCalledWith({
      where: { id: 'session-1' },
      data: {
        beforeAttributes: {
          'profile-1': { pace: 55, shooting: 50, passing: 60, dribbling: 52, defending: 58, physical: 53 },
          'profile-2': { pace: 60, shooting: 45, passing: 55, dribbling: 65, defending: 50, physical: 48 },
        },
      },
    });
  });

  it('handles the case where no members have twins', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeCaptainUser());
    mockPrisma.session.findFirst.mockResolvedValue(null);
    const mockSession = { id: 'session-2', squadId: SQUAD_ID };
    mockPrisma.session.create.mockResolvedValue(mockSession);
    mockPrisma.match.create.mockResolvedValue({ id: 'match-2' });

    const members = [
      {
        userId: 'user-1',
        user: {
          id: 'user-1',
          name: 'No Twin Player',
          playerProfile: { id: 'profile-1', twin: null },
        },
      },
    ];
    mockPrisma.squadMember.findMany.mockResolvedValue(members);
    mockPrisma.playerMatchStats.create.mockResolvedValue({});
    mockPrisma.sessionAttendee.upsert.mockResolvedValue({});
    // session.update should NOT be called for beforeAttributes when no twins exist
    mockPrisma.session.update.mockResolvedValue(mockSession);

    const result = await startSession(CAPTAIN_TOKEN);

    expect(result.sessionId).toBe('session-2');

    // The update call is for status (from match seeding), not for beforeAttributes
    // Actually, session.update won't be called for beforeAttributes at all
    // since profileIdsWithTwins.length === 0
    const updateCalls = mockPrisma.session.update.mock.calls;
    const beforeAttrsCalls = updateCalls.filter(
      (call: any) => call[0]?.data?.beforeAttributes,
    );
    expect(beforeAttrsCalls).toHaveLength(0);
  });

  it('fails with an error when captain token is invalid', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(startSession('invalid-token')).rejects.toThrow('Captain not found');
  });
});

describe('endSession snapshot', () => {
  it('captures afterAttributes for all participating players', async () => {
    // Arrange
    mockPrisma.user.findUnique.mockResolvedValue(makeCaptainUser());

    const stats = [
      { profileId: 'profile-1', goals: 2, assists: 1, minutesPlayed: 90 },
      { profileId: 'profile-2', goals: 0, assists: 0, minutesPlayed: 45 },
    ];
    mockPrisma.playerMatchStats.findMany.mockResolvedValue(stats);

    // Mock match update
    mockPrisma.match.update.mockResolvedValue({});

    // Mock profiles with twins for afterAttributes
    mockPrisma.playerProfile.findMany.mockResolvedValue([
      {
        id: 'profile-1',
        twin: {
          baseAttributes: { pace: 56, shooting: 52, passing: 61, dribbling: 53, defending: 58, physical: 54 },
        },
      },
      {
        id: 'profile-2',
        twin: {
          baseAttributes: { pace: 61, shooting: 45, passing: 55, dribbling: 65, defending: 50, physical: 48 },
        },
      },
    ]);

    mockPrisma.playerProfile.update.mockResolvedValue({});

    const mockSession = { id: 'session-1' };
    mockPrisma.session.update.mockResolvedValue(mockSession);

    // Act
    await endSession(CAPTAIN_TOKEN, 'session-1', 'match-1');

    // Assert
    const updateCalls = mockPrisma.session.update.mock.calls;
    const afterAttrsCall = updateCalls.find(
      (call: any) => call[0]?.where?.id === 'session-1',
    );

    expect(afterAttrsCall).toBeDefined();
    const data = afterAttrsCall[0].data;
    expect(data.status).toBe('completed');
    expect(data.afterAttributes).toEqual({
      'profile-1': { pace: 56, shooting: 52, passing: 61, dribbling: 53, defending: 58, physical: 54 },
      'profile-2': { pace: 61, shooting: 45, passing: 55, dribbling: 65, defending: 50, physical: 48 },
    });
  });

  it('handles the case where participating players have no twins', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(makeCaptainUser());

    const stats = [
      { profileId: 'profile-1', goals: 0, assists: 0, minutesPlayed: 0 },
    ];
    mockPrisma.playerMatchStats.findMany.mockResolvedValue(stats);
    mockPrisma.match.update.mockResolvedValue({});

    // Profile exists but has no twin
    mockPrisma.playerProfile.findMany.mockResolvedValue([
      { id: 'profile-1', twin: null },
    ]);

    mockPrisma.playerProfile.update.mockResolvedValue({});
    const mockSession = { id: 'session-1' };
    mockPrisma.session.update.mockResolvedValue(mockSession);

    await endSession(CAPTAIN_TOKEN, 'session-1', 'match-1');

    // Session update should set status=completed WITHOUT afterAttributes
    const updateCalls = mockPrisma.session.update.mock.calls;
    const completedCall = updateCalls.find(
      (call: any) => call[0]?.where?.id === 'session-1',
    );
    expect(completedCall).toBeDefined();
    expect(completedCall[0].data.status).toBe('completed');
    // afterAttributes should not be in the data when empty
    expect(completedCall[0].data.afterAttributes).toBeUndefined();
  });
});
