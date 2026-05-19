import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPlatformIdentityFindUnique = vi.hoisted(() => vi.fn());
const mockGenerateInference = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  prisma: {
    platformIdentity: {
      findUnique: mockPlatformIdentityFindUnique,
      upsert: vi.fn(),
    },
    agentInteraction: {
      findMany: vi.fn(),
    },
    attestation: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/ai/inference', () => ({
  generateInference: mockGenerateInference,
}));

vi.mock('@/server/services/ai/kite', () => ({
  kiteAIService: {
    searchMarketplace: vi.fn().mockResolvedValue([]),
    getSquadSpending: vi.fn().mockResolvedValue({ spent: 0, remaining: 2.5, limit: 2.5 }),
    getUserSpending: vi.fn().mockResolvedValue({ spent: 0, remaining: 0.5, limit: 0.5 }),
    getScoutUserDailyLimit: vi.fn().mockReturnValue(0.5),
    getScoutSquadDailyLimit: vi.fn().mockReturnValue(2.5),
  },
}));

vi.mock('@/server/services/ai/autonomy-policy', () => ({
  autonomyPolicy: {
    isConfirmed: vi.fn().mockReturnValue(false),
    evaluateAndRecord: vi.fn().mockResolvedValue({ allowed: true }),
    getStatus: vi.fn().mockResolvedValue({
      level: 'automate',
      confirmationsEnabled: true,
      limits: [],
    }),
  },
}));

vi.mock('@/server/services/ai/tinyfish', () => ({
  tinyfishConfigured: vi.fn().mockReturnValue(true),
  tinyfishService: {
    search: vi.fn(),
    fetch: vi.fn(),
    scout: vi.fn(),
  },
}));

vi.mock('@/server/services/blockchain/x402-client', () => ({
  readX402Config: vi.fn().mockReturnValue({ enabled: true }),
}));

vi.mock('@/server/services/redis', () => ({
  redisService: {
    get: vi.fn(),
    del: vi.fn(),
  },
}));

import { dispatchWhatsAppCommand } from '@/server/services/communication/whatsapp-agent';

describe('WhatsApp agent command discovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows linked users a command overview instead of a linking prompt', async () => {
    mockPlatformIdentityFindUnique.mockResolvedValue({
      userId: 'user_1',
      user: {
        name: 'Papa',
        email: null,
        squads: [{ squadId: 'squad_1' }],
      },
    });

    const reply = await dispatchWhatsAppCommand('what can you do?', '447852705196');

    expect(reply).toContain("You're linked as Papa");
    expect(reply).toContain('`budget`');
    expect(reply).toContain('`scout <opponent>`');
    expect(reply).toContain('`topup`');
    expect(reply).not.toContain('To unlock full commands');
    expect(mockGenerateInference).not.toHaveBeenCalled();
  });

  it('does not append the Telegram unlock prompt to linked fallback explanations', async () => {
    mockPlatformIdentityFindUnique.mockResolvedValue({
      userId: 'user_1',
      user: {
        name: 'Papa',
        email: null,
        squads: [{ squadId: 'squad_1' }],
      },
    });
    mockGenerateInference.mockResolvedValue({
      content: 'I run your squad agent on Kite. Try `budget`.',
    });

    const reply = await dispatchWhatsAppCommand('explain the platform', '447852705196');

    expect(reply).toBe('I run your squad agent on Kite. Try `budget`.');
    expect(reply).not.toContain('To unlock full commands');
  });

  it('keeps the Telegram linking prompt for unlinked fallback explanations', async () => {
    mockPlatformIdentityFindUnique.mockResolvedValue(null);
    mockGenerateInference.mockResolvedValue({
      content: 'I can help once this WhatsApp is linked.',
    });

    const reply = await dispatchWhatsAppCommand('how do i use this', '15551234567');

    expect(reply).toContain('I can help once this WhatsApp is linked.');
    expect(reply).toContain('To unlock full commands');
    expect(reply).toContain('https://t.me/sportwarrenbot');
  });
});
