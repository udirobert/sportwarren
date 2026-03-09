"use client";

import { useEffect, useRef, useState } from 'react';
import {
  createAuthRequestMessage,
  createAuthVerifyMessageFromChallenge,
  createEIP712AuthMessageSigner,
  parseAnyRPCResponse,
} from '@erc7824/nitrolite';
import { createWalletClient, custom, type Hex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { useWallet } from '@/contexts/WalletContext';

type YellowConnectionStatus =
  | 'disabled'
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
  return value === 'true';
}

function isEvmChain(chain: string | null) {
  return chain === 'avalanche' || chain === 'lens';
}

export function useYellowSession(sessionId?: string | null) {
  const { address, chain, connected } = useWallet();
  const [state, setState] = useState<YellowSessionState>(() => ({
    ...DEFAULT_STATE,
    enabled: readBooleanEnv(process.env.NEXT_PUBLIC_YELLOW_ENABLED),
    assetSymbol: process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || 'USDC',
    sessionId: sessionId ?? null,
    status: readBooleanEnv(process.env.NEXT_PUBLIC_YELLOW_ENABLED) ? 'idle' : 'disabled',
  }));
  const websocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    setState((current) => ({
      ...current,
      enabled: readBooleanEnv(process.env.NEXT_PUBLIC_YELLOW_ENABLED),
      assetSymbol: process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || 'USDC',
      sessionId: sessionId ?? null,
      status: readBooleanEnv(process.env.NEXT_PUBLIC_YELLOW_ENABLED)
        ? current.status === 'disabled' ? 'idle' : current.status
        : 'disabled',
    }));
  }, [sessionId]);

  useEffect(() => {
    const enabled = readBooleanEnv(process.env.NEXT_PUBLIC_YELLOW_ENABLED);

    if (!enabled) {
      setState((current) => ({
        ...current,
        enabled: false,
        status: 'disabled',
        error: null,
      }));
      return;
    }

    if (!connected || !address) {
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
    const application = process.env.NEXT_PUBLIC_YELLOW_APP_ID;
    const scope = process.env.NEXT_PUBLIC_YELLOW_SCOPE || 'sportwarren';
    const domainName =
      process.env.NEXT_PUBLIC_YELLOW_EIP712_DOMAIN_NAME || 'Yellow Network';
    const allowanceAmount =
      process.env.NEXT_PUBLIC_YELLOW_ALLOWANCE_AMOUNT || '1000000000';

    if (!application) {
      setState((current) => ({
        ...current,
        enabled: true,
        status: 'error',
        accountAddress: address,
        error: 'NEXT_PUBLIC_YELLOW_APP_ID is not configured.',
      }));
      return;
    }

    let cancelled = false;

    const appId = application;

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
                asset: (process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || 'USDC').toLowerCase(),
                amount: allowanceAmount,
              },
            ],
          },
          { name: domainName },
        );

        const socket = new WebSocket(clearnodeUrl);
        websocketRef.current = socket;

        await new Promise<void>((resolve, reject) => {
          socket.onopen = () => resolve();
          socket.onerror = () => reject(new Error('Failed to connect to Yellow ClearNode.'));
        });

        const authRequest = await createAuthRequestMessage({
          address: address as Hex,
          session_key: sessionAccount.address,
          application: appId,
          allowances: [
            {
              asset: (process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || 'USDC').toLowerCase(),
              amount: allowanceAmount,
            },
          ],
          expires_at: BigInt(Math.floor(Date.now() / 1000) + 60 * 60),
          scope,
        });

        const challenge = await new Promise<string>((resolve, reject) => {
          socket.onmessage = (event) => {
            try {
              const response = parseAnyRPCResponse(event.data);
              if (response.method === 'error') {
                reject(new Error(response.params.error));
                return;
              }
              if (response.method === 'auth_request') {
                resolve(response.params.challengeMessage);
              }
            } catch (error) {
              reject(error);
            }
          };
          socket.send(authRequest);
        });

        const verifyMessage = await createAuthVerifyMessageFromChallenge(authSigner, challenge);

        const jwtToken = await new Promise<string | null>((resolve, reject) => {
          socket.onmessage = (event) => {
            try {
              const response = parseAnyRPCResponse(event.data);
              if (response.method === 'error') {
                reject(new Error(response.params.error));
                return;
              }
              if (response.method === 'auth_verify') {
                resolve(response.params.jwtToken || null);
              }
            } catch (error) {
              reject(error);
            }
          };
          socket.send(verifyMessage);
        });

        if (cancelled) {
          socket.close();
          return;
        }

        setState((current) => ({
          ...current,
          enabled: true,
          status: 'authenticated',
          accountAddress: address,
          sessionKeyAddress: sessionAccount.address,
          jwtToken,
          error: null,
        }));
      } catch (error) {
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
      websocketRef.current?.close();
      websocketRef.current = null;
    };
  }, [address, chain, connected]);

  return state;
}
