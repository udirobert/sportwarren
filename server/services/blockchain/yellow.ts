import WebSocket from 'ws';
import {
  createGetAppSessionsMessageV2,
  parseAnyRPCResponse,
  RPCChannelStatus,
  RPCProtocolVersion,
  type RPCAppSession,
} from '@erc7824/nitrolite';
import { isAddress, isHex, type Address } from 'viem';

export type YellowMode = 'disabled' | 'unconfigured' | 'nitrolite';
export type TransferSettlementTarget = 'buyer' | 'seller';
export type MatchSettlementResult = 'home' | 'away' | 'draw' | 'disputed';

const DEFAULT_CLEARNODE_URL = 'wss://clearnet-sandbox.yellow.com/ws';
const REQUEST_TIMEOUT_MS = 15_000;

interface YellowRpcResponse {
  method: string;
  params: any;
  requestId?: number;
}

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

export interface YellowVerifiedSettlement extends YellowRailStatus {
  sessionId: string;
  version: number;
  settlementId: string;
  session: RPCAppSession;
  matchedParticipant: Address;
  sessionData: Record<string, unknown> | null;
}

export interface VerifyYellowSettlementOptions {
  settlement: YellowClientSettlement;
  participantCandidates: string[];
  expectedSessionId?: string | null;
  expectedApplication?: string;
  applicationPrefixes?: string[];
  expectedParticipants?: string[];
  expectedSessionData?: Record<string, unknown>;
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

function normalizeAddress(address: string) {
  return address.toLowerCase();
}

function normalizeHexId(value: string) {
  return value.toLowerCase();
}

function normalizeParticipants(participants: string[]) {
  const unique = new Map<string, Address>();

  for (const participant of participants) {
    if (!isAddress(participant)) {
      continue;
    }

    unique.set(normalizeAddress(participant), participant as Address);
  }

  return Array.from(unique.values());
}

function getRequestIdFromMessage(raw: string) {
  const message = JSON.parse(raw) as { req?: [number]; res?: [number] };
  if (message.req?.[0] !== undefined) {
    return message.req[0];
  }
  if (message.res?.[0] !== undefined) {
    return message.res[0];
  }
  return null;
}

function createYellowError(message: string) {
  return new Error(`Yellow verification: ${message}`);
}

export function buildYellowSettlementId(sessionId: string, version: number) {
  return `${sessionId}:v${version}`;
}

export function parseYellowSessionData(raw: string | undefined) {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function valuesMatch(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
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

  private getClearnodeUrl() {
    return process.env.YELLOW_CLEARNODE_URL
      ?? process.env.NEXT_PUBLIC_YELLOW_CLEARNODE_URL
      ?? DEFAULT_CLEARNODE_URL;
  }

  private async sendRpcRequest(rawMessage: string) {
    const clearnodeUrl = this.getClearnodeUrl();
    const requestId = getRequestIdFromMessage(rawMessage);

    if (requestId === null) {
      throw createYellowError('outgoing RPC message is missing a request id');
    }

    return await new Promise<YellowRpcResponse>((resolve, reject) => {
      const socket = new WebSocket(clearnodeUrl);
      let settled = false;

      const finish = (error?: Error, response?: YellowRpcResponse) => {
        if (settled) {
          return;
        }

        settled = true;
        clearTimeout(timeout);

        if (
          socket.readyState === WebSocket.OPEN
          || socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }

        if (error) {
          reject(error);
          return;
        }

        resolve(response as YellowRpcResponse);
      };

      const timeout = setTimeout(() => {
        finish(createYellowError(`ClearNode timed out after ${REQUEST_TIMEOUT_MS}ms`));
      }, REQUEST_TIMEOUT_MS);

      socket.on('open', () => {
        socket.send(rawMessage);
      });

      socket.on('message', (data) => {
        try {
          const raw = String(data);
          const incomingRequestId = getRequestIdFromMessage(raw);

          if (incomingRequestId !== requestId) {
            return;
          }

          const response = parseAnyRPCResponse(raw) as YellowRpcResponse;
          if (response.method === 'error') {
            finish(createYellowError(response.params?.error || 'ClearNode returned an error'));
            return;
          }

          finish(undefined, response);
        } catch (error) {
          finish(
            error instanceof Error
              ? error
              : createYellowError('failed to parse ClearNode response'),
          );
        }
      });

      socket.on('error', (error) => {
        finish(createYellowError(error.message || 'socket error'));
      });

      socket.on('close', (code) => {
        if (!settled) {
          finish(createYellowError(`ClearNode closed before replying (code ${code})`));
        }
      });
    });
  }

  private async getParticipantSessions(participant: Address, status?: RPCChannelStatus) {
    const rawMessage = createGetAppSessionsMessageV2(participant, status);
    const response = await this.sendRpcRequest(rawMessage);

    if (response.method !== 'get_app_sessions') {
      throw createYellowError(`unexpected ClearNode response method: ${response.method}`);
    }

    return (response.params?.appSessions || []) as RPCAppSession[];
  }

  private async getAllParticipantSessions(participant: Address) {
    const sessions = new Map<string, RPCAppSession>();
    const statuses: Array<RPCChannelStatus | undefined> = [
      undefined,
      RPCChannelStatus.Open,
      RPCChannelStatus.Closed,
      RPCChannelStatus.Challenged,
      RPCChannelStatus.Resizing,
    ];

    for (const status of statuses) {
      let responseSessions: RPCAppSession[] = [];
      try {
        responseSessions = await this.getParticipantSessions(participant, status);
      } catch (error) {
        if (status === undefined) {
          throw error;
        }
        continue;
      }

      for (const session of responseSessions) {
        const existing = sessions.get(session.appSessionId);
        if (!existing || session.version > existing.version) {
          sessions.set(session.appSessionId, session);
        }
      }
    }

    return Array.from(sessions.values());
  }

  async findSessionById(sessionId: string, participantCandidates: string[]) {
    if (!isHex(sessionId)) {
      throw createYellowError('session id must be a valid hex value');
    }

    const participants = normalizeParticipants(participantCandidates);
    if (participants.length === 0) {
      throw createYellowError('no valid participant candidates were provided');
    }

    for (const participant of participants) {
      const sessions = await this.getAllParticipantSessions(participant);
      const session = sessions.find(
        (candidate) => normalizeHexId(candidate.appSessionId) === normalizeHexId(sessionId),
      );

      if (session) {
        return {
          matchedParticipant: participant,
          session,
          sessionData: parseYellowSessionData(session.sessionData),
        };
      }
    }

    return null;
  }

  getRailStatus(): YellowRailStatus {
    const requested = this.getRequestedStatus();
    const appId = this.getAppId();
    const enabled = requested && Boolean(appId);

    return {
      enabled,
      mode: !requested ? 'disabled' : enabled ? 'nitrolite' : 'unconfigured',
      assetSymbol: process.env.YELLOW_ASSET_SYMBOL ?? process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL ?? 'USDC',
      clearnodeUrl: this.getClearnodeUrl(),
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
    const settlementId = buildYellowSettlementId(params.sessionId, params.version);

    if (status.enabled && params.settlementId && params.settlementId !== settlementId) {
      throw createYellowError('client settlement id does not match the canonical session/version pair');
    }

    return {
      ...status,
      sessionId: status.enabled ? params.sessionId : null,
      version: params.version,
      settlementId: status.enabled ? settlementId : null,
    };
  }

  async verifyClientSettlement(options: VerifyYellowSettlementOptions): Promise<YellowVerifiedSettlement> {
    const status = this.getRailStatus();

    if (!status.enabled) {
      throw createYellowError('Yellow verification requires the rail to be enabled and configured');
    }

    const settlementId = buildYellowSettlementId(
      options.settlement.sessionId,
      options.settlement.version,
    );

    if (options.settlement.settlementId && options.settlement.settlementId !== settlementId) {
      throw createYellowError('client settlement id does not match the canonical session/version pair');
    }

    const search = await this.findSessionById(
      options.settlement.sessionId,
      options.participantCandidates,
    );

    if (!search) {
      throw createYellowError(`session ${options.settlement.sessionId} was not found for the allowed participants`);
    }

    const { matchedParticipant, session, sessionData } = search;

    if (
      options.expectedSessionId
      && normalizeHexId(session.appSessionId) !== normalizeHexId(options.expectedSessionId)
    ) {
      throw createYellowError(`expected session ${options.expectedSessionId} but ClearNode returned ${session.appSessionId}`);
    }

    if (session.version !== options.settlement.version) {
      throw createYellowError(`version mismatch for session ${session.appSessionId}: client=${options.settlement.version}, clearnode=${session.version}`);
    }

    if (session.protocol !== RPCProtocolVersion.NitroRPC_0_4) {
      throw createYellowError(`unexpected protocol for session ${session.appSessionId}: ${session.protocol}`);
    }

    if (options.expectedApplication && session.application !== options.expectedApplication) {
      throw createYellowError(`unexpected Yellow application: ${session.application}`);
    }

    if (
      options.applicationPrefixes?.length
      && !options.applicationPrefixes.some((prefix) => session.application.startsWith(prefix))
    ) {
      throw createYellowError(`session ${session.appSessionId} is not one of the expected application types`);
    }

    if (options.expectedParticipants?.length) {
      const allowedParticipants = new Set(
        normalizeParticipants(options.expectedParticipants).map(normalizeAddress),
      );

      const hasUnexpectedParticipant = session.participants.some(
        (participant) => !allowedParticipants.has(normalizeAddress(participant)),
      );

      if (hasUnexpectedParticipant) {
        throw createYellowError(`session ${session.appSessionId} includes an unexpected participant`);
      }
    }

    if (options.expectedSessionData) {
      if (!sessionData) {
        throw createYellowError(`session ${session.appSessionId} is missing JSON session data`);
      }

      for (const [key, expectedValue] of Object.entries(options.expectedSessionData)) {
        if (!valuesMatch(sessionData[key], expectedValue)) {
          throw createYellowError(`session ${session.appSessionId} failed session-data verification for "${key}"`);
        }
      }
    }

    return {
      ...status,
      sessionId: session.appSessionId,
      version: session.version,
      settlementId,
      session,
      matchedParticipant,
      sessionData,
    };
  }

  async ensureTreasurySession(existingSessionId: string | null | undefined, squadId: string) {
    const status = this.getRailStatus();
    return {
      ...status,
      sessionId: status.enabled ? existingSessionId ?? null : null,
      squadId,
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
      offerId: params.offerId,
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
      offerId: params.offerId,
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
      matchId: params.matchId,
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
      matchId: params.matchId,
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
