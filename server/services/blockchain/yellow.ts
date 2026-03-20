export type YellowMode = 'disabled' | 'unconfigured' | 'nitrolite';
export type TransferSettlementTarget = 'buyer' | 'seller';
export type MatchSettlementResult = 'home' | 'away' | 'draw' | 'disputed';

export interface YellowRailStatus {
  enabled: boolean;
  mode: YellowMode;
  assetSymbol: string;
  clearnodeUrl: string;
  matchFeeAmount: number;
  appId?: string;
  reason?: string;
}

export interface YellowClientSettlement {
  sessionId: string;
  version: number;
  settlementId?: string | null;
}

function readBooleanEnv(value: string | undefined, fallback = false) {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === 'true' || value === '1';
}

function readNumberEnv(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

class YellowService {
  private getRequestedStatus() {
    return readBooleanEnv(
      process.env.YELLOW_ENABLED ?? process.env.NEXT_PUBLIC_YELLOW_ENABLED,
      false,
    );
  }

  private getAppId() {
    return process.env.YELLOW_APP_ID ?? process.env.NEXT_PUBLIC_YELLOW_APP_ID;
  }

  getRailStatus(): YellowRailStatus {
    const requested = this.getRequestedStatus();
    const appId = this.getAppId();
    const enabled = requested && Boolean(appId);

    return {
      enabled,
      mode: !requested ? 'disabled' : enabled ? 'nitrolite' : 'unconfigured',
      assetSymbol: process.env.YELLOW_ASSET_SYMBOL ?? process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL ?? 'USDC',
      clearnodeUrl:
        process.env.YELLOW_CLEARNODE_URL ?? 'wss://clearnet-sandbox.yellow.com/ws',
      matchFeeAmount: readNumberEnv(process.env.YELLOW_MATCH_FEE_AMOUNT, 1),
      appId: appId || undefined,
      reason: requested && !enabled ? 'Yellow is enabled but YELLOW_APP_ID is not configured.' : undefined,
    };
  }

  isEnabled() {
    return this.getRailStatus().enabled;
  }

  getMatchFeeAmount() {
    return this.getRailStatus().matchFeeAmount;
  }

  recordClientSettlement(params: YellowClientSettlement) {
    const status = this.getRailStatus();

    return {
      ...status,
      sessionId: status.enabled ? params.sessionId : null,
      version: params.version,
      settlementId:
        status.enabled
          ? (params.settlementId ?? `${params.sessionId}:v${params.version}`)
          : null,
    };
  }

  async ensureTreasurySession(existingSessionId: string | null | undefined, squadId: string) {
    const status = this.getRailStatus();
    return {
      ...status,
      sessionId: status.enabled ? existingSessionId ?? null : null,
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
      settlementId: null,
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
      settlementId: null,
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
      sessionId: null,
      amount: params.amount,
      buyerAddress: params.buyerAddress,
      sellerAddress: params.sellerAddress ?? null,
      settlementId: null,
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
      sessionId: status.enabled ? params.sessionId : null,
      amount: params.amount,
      recipient: params.recipient,
      settlementId: null,
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
      sessionId: null,
      feeAmount: params.feeAmount,
      homeSquadId: params.homeSquadId,
      awaySquadId: params.awaySquadId,
      settlementId: null,
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
      sessionId: status.enabled ? params.sessionId : null,
      result: params.result,
      payouts: {
        home: params.homeAmount,
        away: params.awayAmount,
        platform: params.platformAmount,
      },
      settlementId: null,
    };
  }
}

export const yellowService = new YellowService();
