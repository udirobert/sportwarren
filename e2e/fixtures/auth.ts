import { Wallet } from 'ethers';

const TEST_PRIVATE_KEY = '0x59c6995e998f97a5a0044966f0945382db7f4a9d94f93f3c2878d8c4d8d8f0f1';

export interface AuthState {
  address: string;
  chain: string;
  message: string;
  timestamp: string;
  signature: string;
}

export async function generateAuthState(baseUrl: string = 'http://localhost:3000'): Promise<AuthState> {
  const wallet = new Wallet(TEST_PRIVATE_KEY);

  const challengeRes = await fetch(`${baseUrl}/api/auth/challenge`);
  const { message, timestamp } = await challengeRes.json();

  const signature = await wallet.signMessage(message);

  return {
    address: wallet.address,
    chain: 'social',
    message,
    timestamp: String(timestamp),
    signature,
  };
}

export function getAuthHeaders(auth: AuthState): Record<string, string> {
  return {
    'x-wallet-address': auth.address,
    'x-chain': auth.chain,
    'x-wallet-signature': auth.signature,
    'x-auth-message': auth.message,
    'x-auth-timestamp': auth.timestamp,
  };
}

export async function injectAuthToPage(page: any, auth: AuthState): Promise<void> {
  await page.evaluate((a: AuthState) => {
    localStorage.setItem('sw_auth_signature', a.signature);
    localStorage.setItem('sw_auth_message', a.message);
    localStorage.setItem('sw_auth_timestamp', a.timestamp);
    localStorage.setItem('sw_auth_address', a.address);
    localStorage.setItem('sw_auth_chain', a.chain);
  }, auth);
}
