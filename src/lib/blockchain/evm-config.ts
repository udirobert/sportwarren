import { defineChain } from 'viem';
import { avalanche, avalancheFuji } from 'viem/chains';

export const kiteTestnet = defineChain({
  id: 2368,
  name: 'Kite AI Testnet',
  nativeCurrency: {
    name: 'KITE',
    symbol: 'KITE',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.gokite.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'KiteScan',
      url: 'https://testnet.kitescan.ai',
    },
  },
  testnet: true,
});

const DEFAULT_AVALANCHE_CHAIN_ID = 43113;
const DEFAULT_AVALANCHE_RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
const DEFAULT_AVALANCHE_EXPLORER_BASE_URL = 'https://testnet.snowtrace.io';

const DEFAULT_AVALANCHE_CONTRACTS = {
  squadToken: '0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB',
  governor: '0x2e98aF1871bF208Ad361202884AB88F904eFf826',
  achievementNft: '0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4',
} as const;

function readNumberEnv(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readStringEnv(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized || fallback;
}

export function getConfiguredAvalancheChainId() {
  return readNumberEnv(process.env.NEXT_PUBLIC_AVALANCHE_CHAIN_ID, DEFAULT_AVALANCHE_CHAIN_ID);
}

export function getAvalancheChain() {
  return getConfiguredAvalancheChainId() === avalanche.id ? avalanche : avalancheFuji;
}

export function getAvalancheRpcUrl() {
  return readStringEnv(process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL, DEFAULT_AVALANCHE_RPC_URL);
}

export function getKiteRpcUrl() {
  return readStringEnv(process.env.NEXT_PUBLIC_KITE_RPC_URL, kiteTestnet.rpcUrls.default.http[0] as string);
}

export function getAvalancheExplorerBaseUrl() {
  return getConfiguredAvalancheChainId() === avalanche.id
    ? 'https://snowtrace.io'
    : DEFAULT_AVALANCHE_EXPLORER_BASE_URL;
}

export function getAvalancheNetworkLabel() {
  return getConfiguredAvalancheChainId() === avalanche.id
    ? 'Avalanche C-Chain'
    : 'Avalanche Fuji';
}

export function getAvalancheContracts() {
  return {
    squadToken: readStringEnv(
      process.env.NEXT_PUBLIC_AVALANCHE_SQUAD_TOKEN_ADDRESS,
      DEFAULT_AVALANCHE_CONTRACTS.squadToken,
    ),
    governor: readStringEnv(
      process.env.NEXT_PUBLIC_AVALANCHE_GOVERNOR_ADDRESS,
      DEFAULT_AVALANCHE_CONTRACTS.governor,
    ),
    achievementNft: readStringEnv(
      process.env.NEXT_PUBLIC_AVALANCHE_ACHIEVEMENT_NFT_ADDRESS,
      DEFAULT_AVALANCHE_CONTRACTS.achievementNft,
    ),
  };
}

export function getAchievementExplorerUrl(tokenId?: string | number) {
  const contractAddress = getAvalancheContracts().achievementNft;
  const suffix = tokenId === undefined ? '' : `?a=${tokenId}`;
  return `${getAvalancheExplorerBaseUrl()}/token/${contractAddress}${suffix}`;
}

export const evmWalletChains = [avalancheFuji, avalanche, kiteTestnet] as const;
