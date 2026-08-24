'use client';

import { AUTH_STORAGE_KEYS } from '@/lib/auth/constants';

/** Mirrors the signed wallet headers used by the tRPC client for route handlers. */
export function walletAuthHeaders(address?: string | null, chain?: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (address) headers['x-wallet-address'] = address;
  if (chain) headers['x-chain'] = chain;
  const signature = localStorage.getItem(AUTH_STORAGE_KEYS.SIGNATURE);
  const message = localStorage.getItem(AUTH_STORAGE_KEYS.MESSAGE);
  const timestamp = localStorage.getItem(AUTH_STORAGE_KEYS.TIMESTAMP);
  if (signature) headers['x-wallet-signature'] = signature;
  if (message) headers['x-auth-message'] = message;
  if (timestamp) headers['x-auth-timestamp'] = timestamp;
  return headers;
}
