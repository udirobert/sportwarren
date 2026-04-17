import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
// CONSOLIDATION: Link/unlink moved to /account group in telegram.ts
import { StatsCommand } from '../server/services/communication/telegram/commands/stats';
import { AvailableCommand } from '../server/services/communication/telegram/commands/availability';
import { RosterCommand } from '../server/services/communication/telegram/commands/roster';
import type { CommandContext, ResolvedIdentity } from '../server/services/communication/telegram/types';
import { getUserSquads } from '../server/services/communication/telegram/middleware/identity';

// Mock dependencies at top level
vi.mock('@/lib/db', () => ({
  prisma: {
    platformIdentity: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    squad: {
      findFirst: vi.fn(),
    },
    match: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    squadMember: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    SquadAvailability: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock('../server/services/communication/telegram/middleware/identity', () => ({
  getUserSquads: vi.fn(),
  resolveIdentity: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

// Test command patterns
describe('Telegram command patterns', () => {
  // CONSOLIDATION: Link/unlink moved to /account group in telegram.ts
  
  it('StatsCommand has correct pattern and description', () => {
    const cmd = new StatsCommand();
    expect(cmd.pattern.source).toContain('/stats');
    expect(cmd.description).toBe('View your squad statistics');
  });

  it('AvailableCommand has correct pattern and description', () => {
    const cmd = new AvailableCommand();
    expect(cmd.pattern.source).toContain('/available');
    expect(cmd.description).toBe('Set your availability for matches (e.g., /available Saturday)');
  });

  it('RosterCommand has correct pattern and description', () => {
    const cmd = new RosterCommand();
    expect(cmd.pattern.source).toContain('/roster');
    expect(cmd.description).toBe('View squad availability for the week (captains only)');
  });
});

// Test rate limiting
describe('Command rate limits', () => {
  // CONSOLIDATION: LogCommand is now in legacy telegram.ts
  
  it('StatsCommand has no rate limit by default', () => {
    const cmd = new StatsCommand();
    expect(cmd.getRateLimit?.()).toBeUndefined();
  });
});

// Test command execution with mock context
describe('Command execution', () => {
  const createMockContext = (overrides = {}): CommandContext => ({
    bot: {
      sendMessage: vi.fn().mockResolvedValue({ message_id: 123 }),
    } as any,
    chatId: 123456,
    userId: '987654321',
    message: {
      from: { id: 987654321, first_name: 'Test', username: 'testuser' },
      chat: { id: 123456 },
    } as any,
    args: undefined,
    ...overrides,
  });

  const createMockIdentity = (): ResolvedIdentity => ({
    identityId: 'identity-123',
    userId: 'user-123',
    username: 'testuser',
    firstName: 'Test',
    squads: [
      { squadId: 'squad-1', squadName: 'Test Squad', role: 'captain' },
    ],
  });

  describe('StatsCommand', () => {
    it('returns error when user has no squads', async () => {
      vi.mocked(getUserSquads).mockResolvedValue([]);

      const cmd = new StatsCommand();
      const ctx = createMockContext({ args: undefined });
      const identity = createMockIdentity();

      await cmd.executeWithIdentity(ctx, identity);

      // Uses getErrorMessage('NO_SQUAD')
      expect(ctx.bot.sendMessage).toHaveBeenCalledWith(
        123456,
        expect.stringContaining("You're not in any squad"),
        { parse_mode: 'Markdown' }
      );
    });
  });

  describe('AvailableCommand', () => {
    it('shows usage when no args provided', async () => {
      vi.mocked(getUserSquads).mockResolvedValue([
        { squadId: 'squad-1', squadName: 'Test Squad', role: 'member' },
      ]);

      const cmd = new AvailableCommand();
      const ctx = createMockContext({ args: undefined });
      const identity = createMockIdentity();

      await cmd.executeWithIdentity(ctx, identity);

      // Shows usage with "Set Your Availability" header
      expect(ctx.bot.sendMessage).toHaveBeenCalledWith(
        123456,
        expect.stringContaining('Set Your Availability'),
        { parse_mode: 'Markdown' }
      );
    });
  });
});

// Test registry - import synchronously via top-level import
// Test registry - import synchronously via top-level import
import { COMMANDS, registerCommands } from '../server/services/communication/telegram/commands/registry';
import { buildHelpText } from '../server/services/communication/telegram/commands/help-text';

describe('Command registry', () => {
  it('includes expected modular commands', () => {
    const patterns = COMMANDS.map(cmd => cmd.pattern.source);
    // CONSOLIDATION: link/unlink moved to /account group
    // Pattern is full regex source like '/stats(?:\s+(.+))?'
    expect(patterns.some(p => p.includes('/stats'))).toBe(true);
    expect(patterns.some(p => p.includes('/available'))).toBe(true);
    expect(patterns.some(p => p.includes('/roster'))).toBe(true);
    expect(patterns.some(p => p.includes('/help'))).toBe(true);
  });

  it('builds help text with grouped structure', () => {
    const helpText = buildHelpText();
    // CONSOLIDATION: Shows grouped structure now
    expect(helpText).toContain('Squad Commands');
    expect(helpText).toContain('Account Commands');
    expect(helpText).toContain('/account link');
  });

  it('registerCommands does not throw', () => {
    const mockBot = {
      onText: vi.fn(),
    };
    expect(() => registerCommands(mockBot as any)).not.toThrow();
    // registerCommands also registers 3 legacy aliases (/app, /profile, /myteams) in addition to COMMANDS
    expect(mockBot.onText).toHaveBeenCalledTimes(COMMANDS.length + 3);
  });
});