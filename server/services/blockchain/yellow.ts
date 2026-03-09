import { randomUUID } from 'node:crypto';

export type YellowMode = 'disabled' | 'simulated' | 'nitrolite';
export type TransferSettlementTarget = 'buyer' | 'seller';
export type MatchSettlementResult = 'home' | 'away' | 'draw' | 'disputed';

export interface YellowRailStatus {
  enabled: boolean;
  mode: YellowMode;
  assetSymbol: string;
  clearnodeUrl: string;
  matchFeeAmount: number;
}

function readBooleanEnv(value: string | undefined, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}

function readNumberEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function createSessionId(scope: string) {
  return `${scope}_${randomUUID().replace(/-/g, '')}`;
}

function createReference(scope: string) {
  return `${scope}_ref_${randomUUID().replace(/-/g, '')}`;
}

class YellowService {
  getRailStatus(): YellowRailStatus {
    const enabled = readBooleanEnv(
      process.env.YELLOW_ENABLED ?? process.env.NEXT_PUBLIC_YELLOW_ENABLED,
      false,
    );

    return {
      enabled,
      mode: enabled ? 'simulated' : 'disabled',
      assetSymbol: process.env.YELLOW_ASSET_SYMBOL ?? process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL ?? 'USDC',
      clearnodeUrl:
        process.env.YELLOW_CLEARNODE_URL ?? 'wss://clearnet-sandbox.yellow.com/ws',
      matchFeeAmount: readNumberEnv(process.env.YELLOW_MATCH_FEE_AMOUNT, 1),
    };
  }

  isEnabled() {
    return this.getRailStatus().enabled;
  }

  getMatchFeeAmount() {
    return this.getRailStatus().matchFeeAmount;
  }

  async ensureTreasurySession(existingSessionId: string | null | undefined, squadId: string) {
    const status = this.getRailStatus();
    return {
      ...status,
      sessionId: status.enabled ? existingSessionId ?? createSessionId(`treasury_${squadId}`) : existingSessionId ?? null,
    };
  }

  async depositToTreasury(params: {
    existingSessionId?: string | null;
    squadId: string;
    walletAddress: string;
    amount: number;
  }) {
    const session = await this.ensureTreasurySession(params.existingSessionId, params.squadId);

    return {
      ...session,
      counterparty: params.walletAddress,
      amount: params.amount,
      settlementId: session.enabled ? createReference(`treasury_deposit_${params.squadId}`) : null,
    };
  }

  async withdrawFromTreasury(params: {
    existingSessionId?: string | null;
    squadId: string;
    walletAddress: string;
    amount: number;
  }) {
    const session = await this.ensureTreasurySession(params.existingSessionId, params.squadId);

    return {
      ...session,
      counterparty: params.walletAddress,
      amount: params.amount,
      settlementId: session.enabled ? createReference(`treasury_withdraw_${params.squadId}`) : null,
    };
  }

  async createTransferEscrow(params: {
    offerId: string;
    buyerAddress: string;
    sellerAddress?: string | null;
    amount: number;
  }) {
    const status = this.getRailStatus();
    return {
      ...status,
      sessionId: status.enabled ? createSessionId(`transfer_${params.offerId}`) : null,
      amount: params.amount,
      buyerAddress: params.buyerAddress,
      sellerAddress: params.sellerAddress ?? null,
      settlementId: status.enabled ? createReference(`transfer_lock_${params.offerId}`) : null,
    };
  }

  async settleTransferEscrow(params: {
    sessionId: string;
    offerId: string;
    amount: number;
    recipient: TransferSettlementTarget;
  }) {
    const status = this.getRailStatus();
    return {
      ...status,
      sessionId: params.sessionId,
      amount: params.amount,
      recipient: params.recipient,
      settlementId: status.enabled ? createReference(`transfer_settle_${params.offerId}`) : null,
    };
  }

  async createMatchFeeSession(params: {
    matchId: string;
    homeSquadId: string;
    awaySquadId: string;
    feeAmount: number;
  }) {
    const status = this.getRailStatus();
    return {
      ...status,
      sessionId: status.enabled ? createSessionId(`match_${params.matchId}`) : null,
      feeAmount: params.feeAmount,
      homeSquadId: params.homeSquadId,
      awaySquadId: params.awaySquadId,
      settlementId: status.enabled ? createReference(`match_lock_${params.matchId}`) : null,
    };
  }

  async settleMatchFeeSession(params: {
    sessionId: string;
    matchId: string;
    result: MatchSettlementResult;
    homeAmount: number;
    awayAmount: number;
    platformAmount: number;
  }) {
    const status = this.getRailStatus();
    return {
      ...status,
      sessionId: params.sessionId,
      result: params.result,
      payouts: {
        home: params.homeAmount,
        away: params.awayAmount,
        platform: params.platformAmount,
      },
      settlementId: status.enabled ? createReference(`match_settle_${params.matchId}`) : null,
    };
  }
}

export const yellowService = new YellowService();
