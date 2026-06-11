import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockPlatformIdentityFindUnique = vi.hoisted(() => vi.fn());
const mockPlatformIdentityFindFirst = vi.hoisted(() => vi.fn());
const mockGenerateInference = vi.hoisted(() => vi.fn());
const mockCreateScoutReport = vi.hoisted(() => vi.fn());
const mockExecuteKiteDemoPayment = vi.hoisted(() => vi.fn());
const mockSendText = vi.hoisted(() => vi.fn());
const mockAttestationFindMany = vi.hoisted(() => vi.fn());

vi.mock('@/lib/db', () => ({
  prisma: {
    platformIdentity: {
      findUnique: mockPlatformIdentityFindUnique,
      findFirst: mockPlatformIdentityFindFirst,
      upsert: vi.fn(),
    },
    agentInteraction: {
      findMany: vi.fn(),
    },
    attestation: {
      findMany: mockAttestationFindMany,
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

vi.mock('@/server/services/ai/scout-report', () => ({
  createScoutReport: mockCreateScoutReport,
}));

vi.mock('@/server/services/blockchain/x402-client', () => ({
  createPlatformSettlement: vi.fn().mockResolvedValue({
    success: true,
    simulated: true,
    network: 'eip155:2368',
    facilitator: 'sportwarren-internal',
    payer: '0x1234567890123456789012345678901234567890',
    payee: '0x1234567890123456789012345678901234567890',
    amount: '5000000000000000',
  }),
  executeKiteDemoPayment: mockExecuteKiteDemoPayment.mockResolvedValue({
    ok: true,
    serviceUrl: 'https://weather.hugen.tokyo/weather/current?city=London',
    explorerUrl: 'https://testnet.kitescan.ai/tx/0xDemo',
  }),
}));

vi.mock('@/server/services/redis', () => ({
  redisService: {
    get: vi.fn(),
    del: vi.fn(),
  },
}));

// Mock the WhatsApp service used by the settlement-receipt push helper.
vi.mock('@/server/services/communication/whatsapp', () => ({
  WhatsAppService: class {
    isConfigured() { return true; }
    sendText = mockSendText.mockResolvedValue(undefined);
  },
}));

import { dispatchWhatsAppCommand, sendSettlementReceipt } from '@/server/services/communication/whatsapp-agent';

describe('WhatsApp agent command discovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.KITE_DEMO_MODE;
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
      content: 'I run your squad agent. Try `budget`.',
    });

    const reply = await dispatchWhatsAppCommand('explain the platform', '447852705196');

    expect(reply).toBe('I run your squad agent. Try `budget`.');
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

  it('runs linked WhatsApp scouts through the internal scout service and shows verifying-receipt state', async () => {
    mockPlatformIdentityFindUnique.mockResolvedValue({
      userId: 'user_1',
      user: {
        name: 'Papa',
        email: null,
        squads: [{ squadId: 'squad_1' }],
      },
    });
    mockCreateScoutReport.mockResolvedValue({
      opponent: 'Liverpool',
      summary: 'Liverpool press high, leave space behind fullbacks, and can be attacked early.',
      attestationId: 'att_1',
      txHash: 'internal-scout-1', // pending: not yet settled
      simulated: true,
      network: 'kite-testnet',
      priceUsdc: 0.005,
      dataSources: ['no stored match data - report is AI-generated from general knowledge only'],
      subjectType: 'squad',
      subjectId: 'squad_1',
    });

    const reply = await dispatchWhatsAppCommand('scout Liverpool', '447852705196');

    expect(mockCreateScoutReport).toHaveBeenCalledWith(expect.objectContaining({
      opponent: 'Liverpool',
      requestedBy: 'user_1',
      enforceUserLimit: true,
      enforceSquadLimit: true,
    }));

    // Reply is now the { text, list } shape; the list body contains the
    // new "Verifying receipt" copy and no longer leaks the internal-*
    // placeholder as a "receipt URL".
    const replyObj = reply as { text: string; list: { sections: Array<{ rows: Array<{ title: string; description: string }> }> } };
    expect(replyObj.text).toContain('Scouting Report');
    const allRows = replyObj.list.sections.flatMap((s) => s.rows);
    const settleRow = allRows.find((r) => r.title.toLowerCase().includes('verifying'));
    expect(settleRow).toBeDefined();
    expect(settleRow?.description).toBe('Receipt status');
    // The internal- placeholder must not appear in any user-visible row.
    const joined = JSON.stringify(replyObj);
    expect(joined).not.toContain('internal-scout-1');
    // The old jargon must not appear in the response.
    expect(joined).not.toContain('SportWarren attestation');
    expect(joined).not.toContain('On-chain attestation');
  });

  it('shows the real explorer link when the scout has a settled txHash', async () => {
    mockPlatformIdentityFindUnique.mockResolvedValue({
      userId: 'user_1',
      user: {
        name: 'Papa',
        email: null,
        squads: [{ squadId: 'squad_1' }],
      },
    });
    mockCreateScoutReport.mockResolvedValue({
      opponent: 'Arsenal',
      summary: 'Arsenal play narrow.',
      attestationId: 'att_2',
      txHash: '0xRealTxHashFromFacilitator',
      simulated: false,
      network: 'eip155:2368',
      priceUsdc: 0.005,
      dataSources: ['no stored match data - report is AI-generated from general knowledge only'],
      subjectType: 'squad',
      subjectId: 'squad_1',
    });

    const reply = await dispatchWhatsAppCommand('scout Arsenal', '447852705196') as {
      list: { sections: Array<{ rows: Array<{ title: string; description: string }> }> };
    };
    const settleRow = reply.list.sections.flatMap((s) => s.rows).find((r) => r.title.toLowerCase().includes('receipt confirmed'));
    expect(settleRow).toBeDefined();
    expect(settleRow?.title).toContain('0xRealTxHashFromFacilitator');
  });
});

describe('WhatsApp help and copy do not leak jargon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Strings the user should never see in the help text or scout response.
  const JARGON = ['x402', 'USDC', 'Kite', 'Yellow', 'facilitator', 'attestation', 'on-chain', 'KiteScan', 'EIP-3009'];

  it('help text contains no crypto jargon', async () => {
    const reply = await dispatchWhatsAppCommand('help', '15551234567');
    const text = typeof reply === 'string' ? reply : JSON.stringify(reply);
    const lower = text.toLowerCase();
    for (const word of JARGON) {
      expect(lower, `help text should not contain "${word}"`).not.toContain(word.toLowerCase());
    }
  });

  it('linked overview does not name chains or protocols', async () => {
    mockPlatformIdentityFindUnique.mockResolvedValue({
      userId: 'user_1',
      user: { name: 'Papa', email: null, squads: [{ squadId: 'squad_1' }] },
    });
    const reply = await dispatchWhatsAppCommand('what can you do?', '447852705196');
    const text = typeof reply === 'string' ? reply : JSON.stringify(reply);
    const lower = text.toLowerCase();
    for (const word of ['x402', 'kite', 'yellow', 'usdc', 'on-chain']) {
      expect(lower, `linked overview should not contain "${word}"`).not.toContain(word);
    }
  });
});

describe('WhatsApp kite-proof demo gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlatformIdentityFindUnique.mockResolvedValue({
      userId: 'user_1',
      user: { name: 'Papa', email: null, squads: [{ squadId: 'squad_1' }] },
    });
  });

  it('refuses kite-proof when KITE_DEMO_MODE is unset', async () => {
    delete process.env.KITE_DEMO_MODE;
    const reply = await dispatchWhatsAppCommand('kite-proof', '447852705196');
    expect(reply).toContain('Unknown command');
    expect(mockExecuteKiteDemoPayment).not.toHaveBeenCalled();
  });

  it('refuses kite-proof when KITE_DEMO_MODE is "false"', async () => {
    process.env.KITE_DEMO_MODE = 'false';
    const reply = await dispatchWhatsAppCommand('kite-proof', '447852705196');
    expect(reply).toContain('Unknown command');
    expect(mockExecuteKiteDemoPayment).not.toHaveBeenCalled();
  });

  it('runs kite-proof when KITE_DEMO_MODE is "true"', async () => {
    process.env.KITE_DEMO_MODE = 'true';
    const reply = await dispatchWhatsAppCommand('kite-proof', '447852705196');
    expect(mockExecuteKiteDemoPayment).toHaveBeenCalled();
    expect(reply).toContain('Kite Passport x402 payment succeeded');
  });
});

describe('sendSettlementReceipt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns reason when there is no requester', async () => {
    const result = await sendSettlementReceipt({
      id: 'att_x',
      txHash: '0xReal',
      payload: { opponent: 'Arsenal', requestedBy: null },
    });
    expect(result).toEqual({ pushed: false, reason: 'no-requester' });
    expect(mockSendText).not.toHaveBeenCalled();
  });

  it('returns reason when the txHash is still an internal- placeholder', async () => {
    const result = await sendSettlementReceipt({
      id: 'att_x',
      txHash: 'internal-scout-123',
      payload: { opponent: 'Arsenal', requestedBy: 'user_1' },
    });
    expect(result).toEqual({ pushed: false, reason: 'no-real-tx' });
    expect(mockSendText).not.toHaveBeenCalled();
  });

  it('returns reason when the requester has no WhatsApp identity', async () => {
    mockPlatformIdentityFindFirst.mockResolvedValue(null);
    const result = await sendSettlementReceipt({
      id: 'att_x',
      txHash: '0xReal',
      payload: { opponent: 'Arsenal', requestedBy: 'user_1' },
    });
    expect(result).toEqual({ pushed: false, reason: 'no-whatsapp-identity' });
    expect(mockSendText).not.toHaveBeenCalled();
  });

  it('pushes a receipt message to the linked WhatsApp number', async () => {
    mockPlatformIdentityFindFirst.mockResolvedValue({ platformUserId: '447852705196' });
    const result = await sendSettlementReceipt({
      id: 'att_x',
      txHash: '0xRealHash',
      payload: { opponent: 'Arsenal', requestedBy: 'user_1' },
    });
    expect(result).toEqual({ pushed: true });
    expect(mockSendText).toHaveBeenCalledWith(
      '447852705196',
      expect.stringContaining('Receipt confirmed: scout-vs-Arsenal'),
    );
  });
});
