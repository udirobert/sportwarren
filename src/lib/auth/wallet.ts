import algosdk from 'algosdk';
import { ethers } from 'ethers';
import { SIGNATURE_EXPIRY_MS } from './constants';

export type WalletChain = 'algorand' | 'avalanche' | 'lens' | 'social';

export interface WalletAuthPayload {
  address: string;
  chain: WalletChain;
  signature: string; // Base64 for Algorand, hex for EVM
  message: string;   // The message that was signed
  timestamp: number; // Unix timestamp when signed
}

export interface VerifiedWallet {
  address: string;
  chain: WalletChain;
  verified: boolean;
}

const AUTH_MESSAGE_TEMPLATE = (timestamp: number) => 
  `Sign this message to authenticate with SportWarren. Timestamp: ${timestamp}`;

/**
 * Verify an Algorand wallet signature
 */
export async function verifyAlgorandSignature(
  address: string,
  signature: string,
  message: string,
  timestamp: number
): Promise<boolean> {
  try {
    // Check if signature has expired
    const now = Date.now();
    const signatureTime = timestamp;
    if (now - signatureTime > SIGNATURE_EXPIRY_MS) {
      console.error('Signature has expired');
      return false;
    }

    // Verify the message format
    const expectedMessage = AUTH_MESSAGE_TEMPLATE(timestamp);
    if (message !== expectedMessage) {
      console.error('Message format mismatch');
      return false;
    }

    // Decode signature from base64
    const signatureBytes = Buffer.from(signature, 'base64');

    // Verify the signature using algosdk
    const messageBytes = new TextEncoder().encode(message);
    
    // Convert address to public key
    const decodedAddress = algosdk.decodeAddress(address);
    
    // Verify signature
    const isValid = algosdk.verifyBytes(messageBytes, signatureBytes, decodedAddress);
    
    return isValid;
  } catch (error) {
    console.error('Algorand signature verification failed:', error);
    return false;
  }
}

/**
 * Verify an EVM wallet signature (EIP-191 compatible)
 */
export async function verifyEvmSignature(
  address: string,
  signature: string,
  message: string,
  timestamp: number
): Promise<boolean> {
  try {
    // Check if signature has expired
    const now = Date.now();
    if (now - timestamp > SIGNATURE_EXPIRY_MS) {
      console.error('Signature has expired');
      return false;
    }

    // Verify message format
    const expectedMessage = AUTH_MESSAGE_TEMPLATE(timestamp);
    if (message !== expectedMessage) {
      console.error('Message format mismatch');
      return false;
    }

    // EIP-191 verification
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Avalanche signature verification failed:', error);
    return false;
  }
}

/**
 * Verify wallet signature based on chain
 */
export async function verifyWalletSignature(
  payload: WalletAuthPayload
): Promise<VerifiedWallet> {
  const { address, chain, signature, message, timestamp } = payload;

  let verified = false;

  if (chain === 'algorand') {
    verified = await verifyAlgorandSignature(address, signature, message, timestamp);
  } else if (chain === 'avalanche' || chain === 'lens' || chain === 'social') {
    verified = await verifyEvmSignature(address, signature, message, timestamp);
  } else {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  return {
    address,
    chain,
    verified,
  };
}

export const isSupportedWalletChain = (chain?: string): chain is WalletChain =>
  chain === 'algorand' || chain === 'avalanche' || chain === 'lens' || chain === 'social';

/**
 * Generate authentication message for wallet signing
 */
export function generateAuthMessage(): { message: string; timestamp: number } {
  const timestamp = Date.now();
  const message = AUTH_MESSAGE_TEMPLATE(timestamp);
  return { message, timestamp };
}

/**
 * Extract wallet info from request headers
 */
export function extractWalletFromHeaders(headers: Headers): {
  address?: string;
  chain?: string;
  signature?: string;
  message?: string;
  timestamp?: string;
} {
  return {
    address: headers.get('x-wallet-address') || undefined,
    chain: headers.get('x-chain') || undefined,
    signature: headers.get('x-wallet-signature') || undefined,
    message: headers.get('x-auth-message') || undefined,
    timestamp: headers.get('x-auth-timestamp') || undefined,
  };
}
