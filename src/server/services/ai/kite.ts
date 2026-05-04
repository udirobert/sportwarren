/**
 * Kite AI integration — agent passports, spending sessions, paid actions.
 *
 * This module is the only place SportWarren talks to Kite. It composes:
 *   • Local persistence: AiAgent / KiteSession / Attestation / CoachingEffect
 *   • Outbound paid calls via x402 (services/blockchain/x402-client)
 *   • Service discovery via the `ksearch` CLI when available
 *
 * The exported `kiteAIService` keeps the same surface that existing routers
 * already depend on (searchMarketplace, hireAgent, processSquadWagePayment,
 * recordInteraction, getAgentAnalytics) so callers stay untouched.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { ethers } from 'ethers';
import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

import { redisService } from '../redis';
import { prisma } from '@/lib/db';
import {
  paidFetch,
  readX402Config,
  type SettlementResult,
} from '../blockchain/x402-client';

const execFileAsync = promisify(execFile);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const KITE_DAILY_REQUEST_LIMIT = Number(process.env.KITE_DAILY_REQUEST_LIMIT || '1000');
const MAX_SINGLE_PAYMENT_USDC = Number(process.env.KITE_MAX_SINGLE_PAYMENT_USDC || '50');
const DAILY_PAYOUT_BUDGET_USDC = Number(process.env.KITE_DAILY_PAYOUT_BUDGET_USDC || '200');

export type KiteServiceStatus = {
  enabled: boolean;
  rpcUrl: string;
  hasPrivateKey: boolean;
  hasFacilitator: boolean;
  reason?: string;
};

export function getKiteServiceStatus(): KiteServiceStatus {
  const cfg = readX402Config();
  const hasPrivateKey = Boolean(process.env.WEB3_PRIVATE_KEY?.trim());
  const enabled = hasPrivateKey;
  return {
    enabled,
    rpcUrl: cfg.rpcUrl,
    hasPrivateKey,
    hasFacilitator: Boolean(cfg.facilitatorUrl),
    reason: enabled ? undefined : 'WEB3_PRIVATE_KEY is not configured for Kite agent operations.',
  };
}

// ---------------------------------------------------------------------------
// Types (public)
// ---------------------------------------------------------------------------

export interface KiteAgentPassport {
  id: string;
  agentId: string;
  passportId: string;
  name: string;
  type: string;
  description: string;
  reputation: number;
  walletAddress: string;
  capabilities: string[];
  serviceUrl: string | null;
  servicePrice: string | null;
  ownerType: string | null;
  ownerId: string | null;
  verified: boolean;
}

export interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  price: string;
  rating?: number;
  author?: string;
  url?: string;
  verified?: boolean;
}

export interface AgentAnalytics {
  totalInteractions: number;
  successRate: number;
  averageRating: number;
  revenue: string;
  topUsers: string[];
}

export interface RegisterAgentInput {
  name: string;
  description: string;
  type: 'squad_manager' | 'scout' | 'fitness' | 'social' | 'twin_player' | 'twin_squad' | 'coach_external';
  capabilities: string[];
  ownerType?: 'player' | 'squad' | 'platform' | 'external';
  ownerId?: string;
  /** Optional pre-existing wallet — defaults to the platform wallet. */
  walletAddress?: string;
  /** If this agent provides a paid x402 service, provide the URL + price. */
  service?: { url: string; priceUsdc: string; asset?: 'USDC' | 'USDT' };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export class KiteAIService {
  private db: PrismaClient;
  private platformWallet: string | null;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
    const pk = process.env.WEB3_PRIVATE_KEY?.trim();
    this.platformWallet = pk ? new ethers.Wallet(pk).address : null;
  }

  // -----------------------------------------------------------------------
  // Rate / budget guards (kept from previous implementation)
  // -----------------------------------------------------------------------

  private async checkRequestLimit(): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const key = `kite:usage:${today}`;
    try {
      const used = await redisService.get(key);
      if (used && parseInt(used) >= KITE_DAILY_REQUEST_LIMIT) {
        console.warn(`[Kite] daily request limit reached (${KITE_DAILY_REQUEST_LIMIT})`);
        return false;
      }
    } catch {
      /* redis optional */
    }
    return true;
  }

  private async checkPayoutBudget(amount: number): Promise<boolean> {
    if (amount > MAX_SINGLE_PAYMENT_USDC) {
      console.error(`[Kite] single payout ${amount} > limit ${MAX_SINGLE_PAYMENT_USDC}`);
      return false;
    }
    const today = new Date().toISOString().split('T')[0];
    const key = `kite:payouts:${today}`;
    try {
      const spent = parseFloat((await redisService.get(key)) || '0');
      if (spent + amount > DAILY_PAYOUT_BUDGET_USDC) return false;
      await redisService.incrbyfloat(key, amount, 86400);
    } catch {
      return amount <= 5;
    }
    return true;
  }

  private async trackRequest() {
    const today = new Date().toISOString().split('T')[0];
    try {
      await redisService.incr(`kite:usage:${today}`, 86400);
    } catch {
      /* best-effort */
    }
  }

  // -----------------------------------------------------------------------
  // Agent passport registry (DB-backed)
  // -----------------------------------------------------------------------

  async registerAgent(input: RegisterAgentInput): Promise<KiteAgentPassport | null> {
    if (!(await this.checkRequestLimit())) return null;
    const wallet = input.walletAddress || this.platformWallet;
    if (!wallet) {
      console.warn('[Kite] cannot register agent: no wallet available');
      return null;
    }

    // Idempotent on (ownerType, ownerId, type) where ownerId is set.
    const existing = input.ownerType && input.ownerId
      ? await this.db.aiAgent.findFirst({
          where: { ownerType: input.ownerType, ownerId: input.ownerId, type: input.type },
        })
      : null;

    const record = existing
      ? await this.db.aiAgent.update({
          where: { id: existing.id },
          data: {
            name: input.name,
            description: input.description,
            capabilities: input.capabilities,
            walletAddress: wallet,
            serviceUrl: input.service?.url ?? existing.serviceUrl,
            servicePrice: input.service?.priceUsdc ?? existing.servicePrice,
            serviceAsset: input.service?.asset ?? existing.serviceAsset ?? 'USDC',
            serviceActive: input.service ? true : existing.serviceActive,
          },
        })
      : await this.db.aiAgent.create({
          data: {
            agentId: `kite-${input.type}-${Date.now()}`,
            passportId: `KP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            name: input.name,
            description: input.description,
            type: input.type,
            capabilities: input.capabilities,
            ownerType: input.ownerType,
            ownerId: input.ownerId,
            walletAddress: wallet,
            serviceUrl: input.service?.url,
            servicePrice: input.service?.priceUsdc,
            serviceAsset: input.service?.asset ?? 'USDC',
            serviceActive: Boolean(input.service),
          },
        });

    await this.trackRequest();
    return this.toPassport(record);
  }

  async getAgentPassport(agentId: string): Promise<KiteAgentPassport | null> {
    const record = await this.db.aiAgent.findFirst({
      where: { OR: [{ id: agentId }, { agentId }, { passportId: agentId }] },
    });
    return record ? this.toPassport(record) : null;
  }

  async updateAgentReputation(agentId: string, change: number, reason: string): Promise<boolean> {
    const record = await this.db.aiAgent.findFirst({
      where: { OR: [{ id: agentId }, { agentId }, { passportId: agentId }] },
    });
    if (!record) return false;
    const next = Math.max(0, Math.min(1000, record.reputation + change));
    await this.db.aiAgent.update({ where: { id: record.id }, data: { reputation: next } });
    // Reputation movement is itself an attestable event.
    await this.db.attestation.create({
      data: {
        subjectType: 'agent',
        subjectId: record.id,
        kind: 'reputation_delta',
        payload: { change, reason, before: record.reputation, after: next },
      },
    });
    return true;
  }

  // -----------------------------------------------------------------------
  // Spending sessions (mirrors `kpass agent:session create/...`)
  // -----------------------------------------------------------------------

  async createSession(input: {
    agentId: string;
    taskSummary: string;
    maxPerTxUsdc: number;
    maxTotalUsdc: number;
    ttlSeconds: number;
    scope?: Record<string, unknown>;
    approvedBy?: string;
  }) {
    const agent = await this.db.aiAgent.findFirst({
      where: { OR: [{ id: input.agentId }, { agentId: input.agentId }] },
    });
    if (!agent) throw new Error(`agent not found: ${input.agentId}`);

    return this.db.kiteSession.create({
      data: {
        agentId: agent.id,
        taskSummary: input.taskSummary,
        maxPerTx: input.maxPerTxUsdc,
        maxTotal: input.maxTotalUsdc,
        scope: (input.scope as any) ?? Prisma.JsonNull,
        expiresAt: new Date(Date.now() + input.ttlSeconds * 1000),
        status: 'active',
        approvedBy: input.approvedBy,
      },
    });
  }

  async revokeSession(sessionId: string) {
    return this.db.kiteSession.update({
      where: { id: sessionId },
      data: { status: 'revoked' },
    });
  }

  /** Find an active session that can cover `amount` for an agent, or null. */
  private async findUsableSession(agentId: string, amount: number) {
    const now = new Date();
    const sessions = await this.db.kiteSession.findMany({
      where: {
        agentId,
        status: 'active',
        expiresAt: { gt: now },
        maxPerTx: { gte: amount },
      },
      orderBy: { createdAt: 'desc' },
    });
    return sessions.find((s) => s.spent + amount <= s.maxTotal) ?? null;
  }

  // -----------------------------------------------------------------------
  // Paid x402 calls (sessions enforce budget)
  // -----------------------------------------------------------------------

  /**
   * Execute a paid x402 request on behalf of an agent. Mirrors:
   *   `kpass agent:session execute --url ... --method ...`
   *
   * Persists an `Attestation` row for every successful settlement.
   */
  async executePaidRequest<T = unknown>(input: {
    agentId: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    maxAmountUsdc: number;
    /** Subject the resulting attestation should attach to. */
    subject?: { type: 'player' | 'squad' | 'match' | 'agent'; id: string };
    kind?: string;
  }): Promise<{ ok: boolean; data?: T; payment?: SettlementResult; error?: string }> {
    if (!(await this.checkRequestLimit())) return { ok: false, error: 'daily request limit reached' };
    if (!(await this.checkPayoutBudget(input.maxAmountUsdc))) {
      return { ok: false, error: 'platform daily payout budget reached' };
    }

    const agent = await this.db.aiAgent.findFirst({
      where: { OR: [{ id: input.agentId }, { agentId: input.agentId }] },
    });
    if (!agent) return { ok: false, error: 'agent not found' };

    const session = await this.findUsableSession(agent.id, input.maxAmountUsdc);
    if (!session) {
      return { ok: false, error: 'no active session with sufficient budget — call createSession first' };
    }

    let result;
    try {
      result = await paidFetch<T>({
        url: input.url,
        method: input.method,
        headers: input.headers,
        body: input.body,
        maxAmountUsdc: Math.min(input.maxAmountUsdc, session.maxPerTx),
        sessionId: session.id,
      });
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }

    await this.trackRequest();

    // Update session counters
    const amountUsdc = result.payment
      ? Number(ethers.formatUnits(result.payment.amount, 6))
      : 0;
    if (amountUsdc > 0) {
      await this.db.kiteSession.update({
        where: { id: session.id },
        data: {
          spent: { increment: amountUsdc },
          txCount: { increment: 1 },
          status: session.spent + amountUsdc >= session.maxTotal ? 'exhausted' : 'active',
        },
      });
    }

    // Persist attestation (only when we actually got a settlement record)
    if (result.payment && input.subject) {
      await this.db.attestation.create({
        data: {
          subjectType: input.subject.type,
          subjectId: input.subject.id,
          kind: input.kind ?? 'paid_call',
          payload: {
            url: input.url,
            method: input.method ?? 'GET',
            body: input.body ?? null,
            response: result.data ?? null,
          },
          signerAgentId: agent.id,
          network: result.payment.network,
          txHash: result.payment.txHash,
          facilitator: result.payment.facilitator,
          amountUsdc,
          sessionId: session.id,
        },
      });
    }

    return { ok: true, data: result.data, payment: result.payment };
  }

  // -----------------------------------------------------------------------
  // Wage payouts — direct USDC transfer on Kite (no service involved).
  // Kept as a public method so existing squad router stays untouched.
  // -----------------------------------------------------------------------

  async processSquadWagePayment(
    squadId: string,
    playerWallet: string,
    amount: number,
    agentId: string = 'squad_manager',
  ) {
    if (!(await this.checkRequestLimit())) return null;
    if (!(await this.checkPayoutBudget(amount))) return null;

    const status = getKiteServiceStatus();
    if (!status.enabled || !this.platformWallet) {
      const tx = `sim-kite-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      console.warn(`[Kite] simulated wage payment ${amount} USDC → ${playerWallet}`);
      await this.db.attestation.create({
        data: {
          subjectType: 'squad',
          subjectId: squadId,
          kind: 'wage_payment',
          payload: { to: playerWallet, amountUsdc: amount, agentId, simulated: true },
          network: readX402Config().network,
          txHash: tx,
          amountUsdc: amount,
        },
      });
      return {
        transactionId: tx,
        from: 'platform',
        to: playerWallet,
        amount: amount.toString(),
        currency: 'USDC',
        status: 'completed' as const,
        timestamp: new Date().toISOString(),
        simulated: true,
      };
    }

    const txHash = await this.directUsdcTransfer(playerWallet, amount);
    await this.db.attestation.create({
      data: {
        subjectType: 'squad',
        subjectId: squadId,
        kind: 'wage_payment',
        payload: { to: playerWallet, amountUsdc: amount, agentId },
        network: readX402Config().network,
        txHash,
        amountUsdc: amount,
      },
    });
    return {
      transactionId: txHash,
      from: this.platformWallet,
      to: playerWallet,
      amount: amount.toString(),
      currency: 'USDC',
      status: 'completed' as const,
      timestamp: new Date().toISOString(),
    };
  }

  /** ERC20 transfer on Kite chain — used for direct payouts (not x402). */
  private async directUsdcTransfer(to: string, amountUsdc: number): Promise<string> {
    const cfg = readX402Config();
    const pk = process.env.WEB3_PRIVATE_KEY!.trim();
    const provider = new ethers.JsonRpcProvider(cfg.rpcUrl);
    const wallet = new ethers.Wallet(pk, provider);
    const erc20 = new ethers.Contract(
      cfg.assetAddress,
      ['function transfer(address to, uint256 value) returns (bool)'],
      wallet,
    );
    const value = ethers.parseUnits(amountUsdc.toFixed(6), 6);
    const tx = await erc20.transfer(to, value);
    const receipt = await tx.wait();
    return receipt?.hash ?? tx.hash;
  }

  // -----------------------------------------------------------------------
  // Service discovery — `ksearch` CLI when present, DB catalogue otherwise.
  // -----------------------------------------------------------------------

  async searchMarketplace(
    query: string | { category?: string; minReputation?: number; maxPrice?: string },
  ): Promise<MarketplaceAgent[]> {
    const q = typeof query === 'string' ? query : (query.category ?? 'sports');

    // 1) ksearch CLI (preferred) — installed by passport-skills
    try {
      const { stdout } = await execFileAsync('ksearch', [
        'services', 'list',
        '--query', q,
        '--payment-approach', 'x402_http',
        '--asset', 'USDC',
        '--limit', '10',
        '--output', 'json',
      ], { timeout: 10_000 });
      const parsed = JSON.parse(stdout);
      const services = Array.isArray(parsed) ? parsed : (parsed?.services ?? parsed?.results ?? []);
      if (Array.isArray(services) && services.length) {
        return services.map((s: any) => ({
          id: s.id ?? s.serviceId ?? s.url,
          name: s.name ?? s.merchantName ?? 'Unknown service',
          description: s.description ?? '',
          price: s.price ?? s.maxAmountRequired ?? 'variable',
          rating: typeof s.rating === 'number' ? s.rating : undefined,
          author: s.author ?? s.publisher,
          url: s.url ?? s.endpoint,
          verified: Boolean(s.verified),
        }));
      }
    } catch {
      /* fall through to local catalogue */
    }

    // 2) Local agent catalogue (our own service-providing agents)
    const where = typeof query === 'string'
      ? { serviceActive: true, OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
          { capabilities: { has: query } },
        ] }
      : { serviceActive: true, reputation: { gte: query.minReputation ?? 0 } };

    const local = await this.db.aiAgent.findMany({ where, take: 10 });
    return local.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      price: a.servicePrice ?? 'variable',
      rating: a.reputation / 100,
      author: a.ownerType ?? 'sportwarren',
      url: a.serviceUrl ?? undefined,
      verified: true,
    }));
  }

  /**
   * Hire an agent: creates an active KiteSession on our side that authorises
   * `durationDays` worth of paid calls to that agent's service.
   */
  async hireAgent(targetAgentId: string, squadId: string, durationDays = 7): Promise<boolean> {
    const target = await this.db.aiAgent.findFirst({
      where: { OR: [{ id: targetAgentId }, { agentId: targetAgentId }, { passportId: targetAgentId }] },
    });
    if (!target?.serviceUrl) {
      console.warn('[Kite] hireAgent: target has no service URL');
      return false;
    }

    // The hiring squad's manager agent acts as the spender.
    const manager = await this.upsertSquadManagerAgent(squadId);

    const price = Number(target.servicePrice ?? '0.10');
    const totalBudget = price * 30 * durationDays; // ~30 calls/day cap

    await this.createSession({
      agentId: manager.id,
      taskSummary: `Hire ${target.name} for ${durationDays}d on behalf of squad ${squadId}`,
      maxPerTxUsdc: Math.max(price, MAX_SINGLE_PAYMENT_USDC),
      maxTotalUsdc: totalBudget,
      ttlSeconds: durationDays * 86400,
      scope: { hiredAgentId: target.id, serviceUrl: target.serviceUrl, squadId },
    });

    await this.db.attestation.create({
      data: {
        subjectType: 'squad',
        subjectId: squadId,
        kind: 'agent_hire',
        payload: { hiredAgentId: target.id, name: target.name, durationDays, price },
      },
    });
    return true;
  }

  // -----------------------------------------------------------------------
  // Analytics — aggregate from local audit tables.
  // -----------------------------------------------------------------------

  async getAgentAnalytics(agentId: string): Promise<AgentAnalytics | null> {
    const agent = await this.db.aiAgent.findFirst({
      where: { OR: [{ id: agentId }, { agentId }, { passportId: agentId }] },
    });
    if (!agent) return null;

    const [sessions, attestations] = await Promise.all([
      this.db.kiteSession.findMany({ where: { agentId: agent.id } }),
      this.db.attestation.findMany({ where: { signerAgentId: agent.id } }),
    ]);

    const totalSpent = sessions.reduce((s, x) => s + x.spent, 0);
    const totalCalls = sessions.reduce((s, x) => s + x.txCount, 0);
    const failed = attestations.filter((a) => !a.txHash).length;
    const successRate = totalCalls === 0 ? 1 : (totalCalls - failed) / totalCalls;

    return {
      totalInteractions: totalCalls,
      successRate,
      averageRating: agent.reputation / 100,
      revenue: totalSpent.toFixed(2),
      topUsers: [],
    };
  }

  /**
   * No-op interaction logger kept for backwards compatibility with player
   * router calls. Writes a lightweight attestation row instead of hitting a
   * fictitious external API.
   */
  async recordInteraction(agentRef: string, interactionType: string, metadata: any) {
    const agent = await this.db.aiAgent.findFirst({
      where: { OR: [{ id: agentRef }, { agentId: agentRef }, { passportId: agentRef }] },
    });
    await this.db.attestation.create({
      data: {
        subjectType: 'agent',
        subjectId: agent?.id ?? agentRef,
        kind: `interaction:${interactionType}`,
        payload: metadata ?? {},
        signerAgentId: agent?.id,
      },
    });
    return true;
  }

  // -----------------------------------------------------------------------
  // Bootstrap helpers
  // -----------------------------------------------------------------------

  async upsertSquadManagerAgent(squadId: string) {
    return (
      (await this.db.aiAgent.findFirst({
        where: { ownerType: 'squad', ownerId: squadId, type: 'twin_squad' },
      })) ??
      (await this.registerAgent({
        name: `Squad ${squadId.slice(0, 6)} Manager`,
        description: 'Autonomous squad manager twin (Kite Passport).',
        type: 'twin_squad',
        capabilities: ['hire_coach', 'rotate_squad', 'pay_wages', 'attest_match'],
        ownerType: 'squad',
        ownerId: squadId,
      }))!
    );
  }

  async upsertPlayerTwinAgent(profileId: string, displayName: string) {
    return (
      (await this.db.aiAgent.findFirst({
        where: { ownerType: 'player', ownerId: profileId, type: 'twin_player' },
      })) ??
      (await this.registerAgent({
        name: `${displayName} (Twin)`,
        description: 'Phygital player twin — stats are an attested function of IRL performance.',
        type: 'twin_player',
        capabilities: ['accept_attestations', 'subscribe_coaching', 'compete_in_simulations'],
        ownerType: 'player',
        ownerId: profileId,
      }))!
    );
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private toPassport(r: any): KiteAgentPassport {
    return {
      id: r.id,
      agentId: r.agentId,
      passportId: r.passportId,
      name: r.name,
      type: r.type,
      description: r.description,
      reputation: r.reputation,
      walletAddress: r.walletAddress ?? this.platformWallet ?? '',
      capabilities: r.capabilities ?? [],
      serviceUrl: r.serviceUrl ?? null,
      servicePrice: r.servicePrice ?? null,
      ownerType: r.ownerType ?? null,
      ownerId: r.ownerId ?? null,
      verified: true,
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton accessor (preserves existing import shape)
// ---------------------------------------------------------------------------

let instance: KiteAIService | null = null;
export function getKiteAIService(): KiteAIService {
  if (!instance) instance = new KiteAIService();
  return instance;
}

export const kiteAIService = new Proxy({} as KiteAIService, {
  get(_t, p, r) {
    const i = getKiteAIService();
    const v = Reflect.get(i, p, r);
    return typeof v === 'function' ? v.bind(i) : v;
  },
});
