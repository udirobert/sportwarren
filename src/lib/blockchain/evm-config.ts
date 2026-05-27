import { defineChain } from 'viem';

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

export const goatMainnet = defineChain({
  id: 2345,
  name: 'GOAT Network',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.goat.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'GOAT Explorer',
      url: 'https://explorer.goat.network',
    },
  },
});

export const goatTestnet = defineChain({
  id: 48816,
  name: 'GOAT Testnet3',
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet3.goat.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'GOAT Testnet Explorer',
      url: 'https://explorer.testnet3.goat.network',
    },
  },
  testnet: true,
});

const DEFAULT_GOAT_CHAIN_ID = 48816;
const DEFAULT_GOAT_RPC_URL = 'https://rpc.testnet3.goat.network';
const DEFAULT_GOAT_EXPLORER_BASE_URL = 'https://explorer.testnet3.goat.network';

const DEFAULT_GOAT_ERC8004_CONTRACTS = {
  identityRegistry: '0x556089008Fc0a60cD09390Eca93477ca254A5522',
  reputationRegistry: '0xd9140951d8aE6E5F625a02F5908535e16e3af964',
} as const;

const DEFAULT_GOAT_MAINNET_ERC8004_CONTRACTS = {
  identityRegistry: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  reputationRegistry: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63',
} as const;

const DEFAULT_GOAT_GOVERNANCE_CONTRACTS = {
  governor: process.env.GOAT_GOVERNOR_ADDRESS || '',
  squadToken: process.env.GOAT_SQUAD_TOKEN_ADDRESS || '',
  achievementNft: process.env.GOAT_ACHIEVEMENT_NFT_ADDRESS || '',
} as const;
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

export function getKiteRpcUrl() {
  return readStringEnv(process.env.NEXT_PUBLIC_KITE_RPC_URL, kiteTestnet.rpcUrls.default.http[0] as string);
}

export function getConfiguredGoatChainId() {
  return readNumberEnv(process.env.NEXT_PUBLIC_GOAT_CHAIN_ID, DEFAULT_GOAT_CHAIN_ID);
}

export function getGoatChain() {
  return getConfiguredGoatChainId() === goatMainnet.id ? goatMainnet : goatTestnet;
}

export function getGoatRpcUrl() {
  return readStringEnv(process.env.NEXT_PUBLIC_GOAT_RPC_URL, DEFAULT_GOAT_RPC_URL);
}

export function getGoatExplorerBaseUrl() {
  return getConfiguredGoatChainId() === goatMainnet.id
    ? 'https://explorer.goat.network'
    : DEFAULT_GOAT_EXPLORER_BASE_URL;
}

export function getGoatNetworkLabel() {
  return getConfiguredGoatChainId() === goatMainnet.id
    ? 'GOAT Network'
    : 'GOAT Testnet3';
}

export function getGoatErc8004Contracts() {
  const isMainnet = getConfiguredGoatChainId() === goatMainnet.id;
  const defaults = isMainnet ? DEFAULT_GOAT_MAINNET_ERC8004_CONTRACTS : DEFAULT_GOAT_ERC8004_CONTRACTS;
  return {
    identityRegistry: readStringEnv(
      process.env.GOAT_IDENTITY_REGISTRY_ADDRESS,
      defaults.identityRegistry,
    ),
    reputationRegistry: readStringEnv(
      process.env.GOAT_REPUTATION_REGISTRY_ADDRESS,
      defaults.reputationRegistry,
    ),
  };
}

export function getGoatAgentRegistryId() {
  const chainId = getConfiguredGoatChainId();
  const identityAddress = getGoatErc8004Contracts().identityRegistry;
  return `eip155:${chainId}:${identityAddress}`;
}

export function getGoatContracts() {
  return {
    governor: readStringEnv(
      process.env.GOAT_GOVERNOR_ADDRESS,
      DEFAULT_GOAT_GOVERNANCE_CONTRACTS.governor,
    ),
    squadToken: readStringEnv(
      process.env.GOAT_SQUAD_TOKEN_ADDRESS,
      DEFAULT_GOAT_GOVERNANCE_CONTRACTS.squadToken,
    ),
    achievementNft: readStringEnv(
      process.env.GOAT_ACHIEVEMENT_NFT_ADDRESS,
      DEFAULT_GOAT_GOVERNANCE_CONTRACTS.achievementNft,
    ),
  };
}

export function getGoatAchievementExplorerUrl(tokenId?: string | number) {
  const contractAddress = getGoatContracts().achievementNft;
  if (!contractAddress) return getGoatExplorerBaseUrl();
  const suffix = tokenId === undefined ? '' : `?a=${tokenId}`;
  return `${getGoatExplorerBaseUrl()}/token/${contractAddress}${suffix}`;
}

export const evmWalletChains = [kiteTestnet, goatTestnet, goatMainnet] as const;
