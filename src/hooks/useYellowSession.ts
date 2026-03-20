"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createAppSessionMessage,
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createCloseAppSessionMessage,
  createECDSAMessageSigner,
  createEIP712AuthMessageSigner,
  createGetAppSessionsMessageV2,
  createSubmitAppStateMessage,
  parseAnyRPCResponse,
  RPCAppStateIntent,
  RPCProtocolVersion,
  type RPCAppSessionAllocation,
} from '@erc7824/nitrolite';
import { createWalletClient, custom, type Hex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { useWallet } from '@/contexts/WalletContext';

type YellowConnectionStatus =
  | 'disabled'
  | 'unconfigured'
  | 'idle'
  | 'unsupported'
  | 'connecting'
  | 'authenticated'
  | 'error';

interface YellowSessionState {
  enabled: boolean;
  assetSymbol: string;
  sessionId: string | null;
  status: YellowConnectionStatus;
  accountAddress: string | null;
  sessionKeyAddress: string | null;
  jwtToken: string | null;
  error: string | null;
}

interface YellowRpcResponse {
  method: string;
  params: any;
  requestId?: number;
}

export interface YellowAppDefinitionInput {
  application: string;
  participants: Hex[];
  weights: number[];
  quorum: number;
  challenge: number;
  nonce?: number;
  protocol?: RPCProtocolVersion;
}

export interface YellowCreateSessionInput {
  definition: YellowAppDefinitionInput;
  allocations: RPCAppSessionAllocation[];
  sessionData?: string;
}

export interface YellowSubmitStateInput {
  appSessionId: Hex;
  version: number;
  allocations: RPCAppSessionAllocation[];
  sessionData?: string;
  intent?: RPCAppStateIntent;
}

export interface YellowCloseSessionInput {
  appSessionId: Hex;
  allocations: RPCAppSessionAllocation[];
  sessionData?: string;
}

type PendingResolver = {
  resolve: (value: YellowRpcResponse) => void;
  reject: (reason?: unknown) => void;
};

const DEFAULT_STATE: YellowSessionState = {
  enabled: false,
  assetSymbol: 'USDC',
  sessionId: null,
  status: 'disabled',
  accountAddress: null,
  sessionKeyAddress: null,
  jwtToken: null,
  error: null,
};

function readBooleanEnv(value: string | undefined) {
  return value === 'true' || value === '1';
}

function isEvmChain(chain: string | null) {
  return chain === 'avalanche' || chain === 'lens';
}

function getYellowClientConfig() {
  const requested = readBooleanEnv(process.env.NEXT_PUBLIC_YELLOW_ENABLED);
  const application = process.env.NEXT_PUBLIC_YELLOW_APP_ID;
  const configured = requested && Boolean(application);

  return {
    requested,
    configured,
    application,
    assetSymbol: process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || 'USDC',
  };
}

function getRequestIdFromMessage(raw: string) {
  const message = JSON.parse(raw) as { req?: [number]; res?: [number] };
  if (message.req?.[0] !== undefined) {
    return message.req[0];
  }
  if (message.res?.[0] !== undefined) {
    return message.res[0];
  }
  throw new Error('Yellow RPC message is missing a request id.');
}

function createPendingError(message: string) {
  return new Error(`Yellow RPC: ${message}`);
}

export function useYellowSession(sessionId?: string | null) {
  const { address, chain, hasWallet } = useWallet();
  const {
    requested,
    configured,
    application,
    assetSymbol,
  } = getYellowClientConfig();
  const [state, setState] = useState<YellowSessionState>(() => ({
    ...DEFAULT_STATE,
    enabled: configured,
    assetSymbol,
    sessionId: sessionId ?? null,
    status: requested
      ? (configured ? 'idle' : 'unconfigured')
      : 'disabled',
    error: requested && !configured
      ? 'NEXT_PUBLIC_YELLOW_APP_ID is not configured.'
      : null,
  }));

  const websocketRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<Map<number, PendingResolver>>(new Map());
  const sessionSignerRef = useRef<ReturnType<typeof createECDSAMessageSigner> | null>(null);
  const authenticatedRef = useRef(false);

  const sendRawMessage = useCallback(async (rawMessage: string) => {
    const socket = websocketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error('Yellow ClearNode connection is not open.');
    }

    const requestId = getRequestIdFromMessage(rawMessage);

    return await new Promise<YellowRpcResponse>((resolve, reject) => {
      pendingRef.current.set(requestId, { resolve, reject });
      socket.send(rawMessage);
    });
  }, []);

  const ensureAuthenticated = useCallback(() => {
    if (!authenticatedRef.current || !sessionSignerRef.current) {
      throw new Error('Yellow session is not authenticated.');
    }

    return sessionSignerRef.current;
  }, []);

  const getAppSessions = useCallback(async (participant?: Hex) => {
    const participantAddress = participant ?? (address as Hex | null);
    if (!participantAddress) {
      throw new Error('Yellow getAppSessions requires a participant address.');
    }

    const rawMessage = createGetAppSessionsMessageV2(participantAddress);
    const response = await sendRawMessage(rawMessage);
    return response.params.appSessions;
  }, [address, sendRawMessage]);

  const createSession = useCallback(async (input: YellowCreateSessionInput) => {
    const signer = ensureAuthenticated();
    const rawMessage = await createAppSessionMessage(signer, {
      definition: {
        application: input.definition.application,
        protocol: input.definition.protocol ?? RPCProtocolVersion.NitroRPC_0_4,
        participants: input.definition.participants,
        weights: input.definition.weights,
        quorum: input.definition.quorum,
        challenge: input.definition.challenge,
        nonce: input.definition.nonce,
      },
      allocations: input.allocations,
      session_data: input.sessionData,
    });
    const response = await sendRawMessage(rawMessage);
    return response.params as { appSessionId: Hex; version: number; status: string };
  }, [ensureAuthenticated, sendRawMessage]);

  const submitState = useCallback(async (input: YellowSubmitStateInput) => {
    const signer = ensureAuthenticated();
    const rawMessage = await createSubmitAppStateMessage(signer, {
      app_session_id: input.appSessionId,
      intent: input.intent ?? RPCAppStateIntent.Operate,
      version: input.version,
      allocations: input.allocations,
      session_data: input.sessionData,
    });
    const response = await sendRawMessage(rawMessage);
    return response.params as { appSessionId: Hex; version: number; status: string };
  }, [ensureAuthenticated, sendRawMessage]);

  const closeSession = useCallback(async (input: YellowCloseSessionInput) => {
    const signer = ensureAuthenticated();
    const rawMessage = await createCloseAppSessionMessage(signer, {
      app_session_id: input.appSessionId,
      allocations: input.allocations,
      session_data: input.sessionData,
    });
    const response = await sendRawMessage(rawMessage);
    return response.params as { appSessionId: Hex; version: number; status: string };
  }, [ensureAuthenticated, sendRawMessage]);

  useEffect(() => {
    setState((current) => ({
      ...current,
      enabled: configured,
      assetSymbol,
      sessionId: sessionId ?? null,
      status: requested
        ? (
            configured
              ? (current.status === 'disabled' || current.status === 'unconfigured' ? 'idle' : current.status)
              : 'unconfigured'
          )
        : 'disabled',
      error: requested && !configured
        ? 'NEXT_PUBLIC_YELLOW_APP_ID is not configured.'
        : current.status === 'unconfigured'
          ? null
          : current.error,
    }));
  }, [assetSymbol, configured, requested, sessionId]);

  useEffect(() => {
    if (!requested) {
      authenticatedRef.current = false;
      sessionSignerRef.current = null;
      setState((current) => ({
        ...current,
        enabled: false,
        status: 'disabled',
        error: null,
      }));
      return;
    }

    if (!configured) {
      authenticatedRef.current = false;
      sessionSignerRef.current = null;
      setState((current) => ({
        ...current,
        enabled: false,
        status: 'unconfigured',
        error: 'NEXT_PUBLIC_YELLOW_APP_ID is not configured.',
      }));
      return;
    }

    if (!hasWallet || !address) {
      authenticatedRef.current = false;
      sessionSignerRef.current = null;
      setState((current) => ({
        ...current,
        enabled: true,
        status: 'idle',
        accountAddress: null,
        sessionKeyAddress: null,
        jwtToken: null,
        error: null,
      }));
      return;
    }

    if (!isEvmChain(chain)) {
      authenticatedRef.current = false;
      sessionSignerRef.current = null;
      setState((current) => ({
        ...current,
        enabled: true,
        status: 'unsupported',
        accountAddress: address,
        error: 'Yellow requires an EVM wallet connection.',
      }));
      return;
    }

    if (typeof window === 'undefined' || !(window as any).ethereum) {
      authenticatedRef.current = false;
      sessionSignerRef.current = null;
      setState((current) => ({
        ...current,
        enabled: true,
        status: 'unsupported',
        accountAddress: address,
        error: 'No EVM wallet provider found for Yellow authentication.',
      }));
      return;
    }

    const clearnodeUrl =
      process.env.NEXT_PUBLIC_YELLOW_CLEARNODE_URL || 'wss://clearnet-sandbox.yellow.com/ws';
    const scope = process.env.NEXT_PUBLIC_YELLOW_SCOPE || 'sportwarren';
    const domainName =
      process.env.NEXT_PUBLIC_YELLOW_EIP712_DOMAIN_NAME || 'Yellow Network';
    const allowanceAmount =
      process.env.NEXT_PUBLIC_YELLOW_ALLOWANCE_AMOUNT || '1000000000';

    let cancelled = false;
    const appId = application as string;

    async function authenticate() {
      setState((current) => ({
        ...current,
        enabled: true,
        status: 'connecting',
        accountAddress: address,
        error: null,
      }));

      try {
        const provider = (window as any).ethereum;
        const sessionPrivateKey = generatePrivateKey();
        const sessionAccount = privateKeyToAccount(sessionPrivateKey);
        const walletClient = createWalletClient({
          account: address as Hex,
          transport: custom(provider),
        });

        const authSigner = createEIP712AuthMessageSigner(
          walletClient,
          {
            scope,
            session_key: sessionAccount.address,
            expires_at: BigInt(Math.floor(Date.now() / 1000) + 60 * 60),
            allowances: [
              {
                asset: assetSymbol.toLowerCase(),
                amount: allowanceAmount,
              },
            ],
          },
          { name: domainName },
        );

        const sessionSigner = createECDSAMessageSigner(sessionPrivateKey);
        const socket = new WebSocket(clearnodeUrl);

        socket.onmessage = (event) => {
          try {
            const requestId = getRequestIdFromMessage(event.data);
            const pending = pendingRef.current.get(requestId);
            if (!pending) {
              return;
            }

            pendingRef.current.delete(requestId);
            const response = parseAnyRPCResponse(event.data) as YellowRpcResponse;
            pending.resolve(response);
          } catch (error) {
            console.error('Failed to parse Yellow RPC response:', error);
          }
        };

        socket.onerror = () => {
          for (const [requestId, pending] of pendingRef.current.entries()) {
            pending.reject(createPendingError(`socket error for request ${requestId}`));
          }
          pendingRef.current.clear();
        };

        await new Promise<void>((resolve, reject) => {
          socket.onopen = () => resolve();
          socket.onerror = () => reject(new Error('Failed to connect to Yellow ClearNode.'));
        });

        websocketRef.current = socket;

        const authRequest = await createAuthRequestMessage({
          address: address as Hex,
          session_key: sessionAccount.address,
          application: appId,
          allowances: [
            {
              asset: assetSymbol.toLowerCase(),
              amount: allowanceAmount,
            },
          ],
          expires_at: BigInt(Math.floor(Date.now() / 1000) + 60 * 60),
          scope,
        });

        const authChallengeResponse = await sendRawMessage(authRequest);
        if (authChallengeResponse.method === 'error') {
          throw new Error(authChallengeResponse.params.error);
        }

        const verifyMessage = await createAuthVerifyMessageFromChallenge(
          authSigner,
          authChallengeResponse.params.challengeMessage,
        );

        const authVerifyResponse = await sendRawMessage(verifyMessage);
        if (authVerifyResponse.method === 'error') {
          throw new Error(authVerifyResponse.params.error);
        }

        if (cancelled) {
          socket.close();
          return;
        }

        authenticatedRef.current = true;
        sessionSignerRef.current = sessionSigner;

        setState((current) => ({
          ...current,
          enabled: true,
          status: 'authenticated',
          accountAddress: address,
          sessionKeyAddress: sessionAccount.address,
          jwtToken: authVerifyResponse.params.jwtToken || null,
          error: null,
        }));
      } catch (error) {
        authenticatedRef.current = false;
        sessionSignerRef.current = null;

        if (cancelled) {
          return;
        }

        setState((current) => ({
          ...current,
          enabled: true,
          status: 'error',
          accountAddress: address,
          error: error instanceof Error ? error.message : 'Yellow authentication failed.',
        }));
      }
    }

    authenticate();

    return () => {
      cancelled = true;
      authenticatedRef.current = false;
      sessionSignerRef.current = null;
      websocketRef.current?.close();
      websocketRef.current = null;
      pendingRef.current.clear();
    };
  }, [address, application, assetSymbol, chain, configured, hasWallet, requested, sendRawMessage]);

  return {
    ...state,
    getAppSessions,
    createSession,
    submitState,
    closeSession,
  };
}
