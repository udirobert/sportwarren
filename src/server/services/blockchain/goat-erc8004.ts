/**
 * GOAT Network ERC-8004 Agent Registry service.
 *
 * Registers SportWarren AI agents (Scouts, Managers) in the canonical
 * IdentityRegistry and ReputationRegistry contracts on GOAT Network.
 *
 * Uses ethers.js v6 for on-chain interactions.
 *
 * @see https://docs.goat.network/docs/build/erc-8004
 */

import { ethers } from 'ethers';

const IDENTITY_REGISTRY_ABI = [
  'function register(string agentURI) external returns (uint256)',
  'function setAgentURI(uint256 agentId, string newURI) external',
  'function setMetadata(uint256 agentId, string key, bytes value) external',
  'function getMetadata(uint256 agentId, string key) external view returns (bytes)',
  'function getAgentWallet(uint256 agentId) external view returns (address)',
  'function setAgentWallet(uint256 agentId, address newWallet, uint256 deadline, bytes signature) external',
  'function unsetAgentWallet(uint256 agentId) external',
  'function isAuthorizedOrOwner(address spender, uint256 agentId) external view returns (bool)',
  'function ownerOf(uint256 agentId) external view returns (address)',
] as const;

const REPUTATION_REGISTRY_ABI = [
  'function giveFeedback(uint256 agentId, uint256 value, uint256 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external returns (uint256)',
  'function revokeFeedback(uint256 agentId, uint256 feedbackIndex) external',
  'function appendResponse(uint256 agentId, address clientAddress, uint256 feedbackIndex, string responseURI, bytes32 responseHash) external',
  'function readFeedback(uint256 agentId, address clientAddress, uint256 feedbackIndex) external view returns (tuple)',
  'function readAllFeedback(uint256 agentId, address[] clientAddresses, string tag1, string tag2, bool includeRevoked) external view returns (tuple[])',
  'function getSummary(uint256 agentId, address[] clientAddresses, string tag1, string tag2) external view returns (tuple)',
  'function getLastIndex(uint256 agentId, address clientAddress) external view returns (uint256)',
  'function getClients(uint256 agentId) external view returns (address[])',
] as const;

export interface GoatErc8004Config {
  rpcUrl: string;
  chainId: number;
  identityRegistry: string;
  reputationRegistry: string;
}

export interface AgentRegistration {
  agentId: number;
  txHash: string;
  agentURI: string;
}

export interface FeedbackResult {
  feedbackIndex: number;
  txHash: string;
}

function readGoatConfig(): GoatErc8004Config {
  const isMainnet = Number(process.env.GOAT_CHAIN_ID || 48816) === 2345;
  return {
    rpcUrl: process.env.GOAT_RPC_URL
      || (isMainnet ? 'https://rpc.goat.network' : 'https://rpc.testnet3.goat.network'),
    chainId: Number(process.env.GOAT_CHAIN_ID || 48816),
    identityRegistry: process.env.GOAT_IDENTITY_REGISTRY_ADDRESS
      || (isMainnet
        ? '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432'
        : '0x556089008Fc0a60cD09390Eca93477ca254A5522'),
    reputationRegistry: process.env.GOAT_REPUTATION_REGISTRY_ADDRESS
      || (isMainnet
        ? '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63'
        : '0xd9140951d8aE6E5F625a02F5908535e16e3af964'),
  };
}

function getGoatProvider(): ethers.JsonRpcProvider {
  const cfg = readGoatConfig();
  return new ethers.JsonRpcProvider(cfg.rpcUrl);
}

function getGoatSigner(): ethers.Wallet | null {
  const pk = process.env.GOAT_PRIVATE_KEY?.trim() || process.env.WEB3_PRIVATE_KEY?.trim();
  if (!pk) return null;
  const cfg = readGoatConfig();
  return new ethers.Wallet(pk, new ethers.JsonRpcProvider(cfg.rpcUrl));
}

export function getAgentRegistryIdentifier(): string {
  const cfg = readGoatConfig();
  return `eip155:${cfg.chainId}:${cfg.identityRegistry}`;
}

export function getGoatExplorerUrl(txHash: string): string {
  const cfg = readGoatConfig();
  const isMainnet = cfg.chainId === 2345;
  const base = isMainnet ? 'https://explorer.goat.network' : 'https://explorer.testnet3.goat.network';
  return `${base}/tx/${txHash}`;
}

/**
 * Build the registration JSON document for an agent.
 * This should be pinned to IPFS or hosted on HTTPS.
 */
export function buildAgentRegistrationJSON(input: {
  name: string;
  description: string;
  imageUrl?: string;
  serviceEndpoints: Array<{
    name: string;
    endpoint: string;
    version: string;
    skills?: string[];
    domains?: string[];
  }>;
  x402Support?: boolean;
}): Record<string, unknown> {
  return {
    type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
    name: input.name,
    description: input.description,
    image: input.imageUrl || 'https://sportwarren.com/agent-default.png',
    services: input.serviceEndpoints,
    x402Support: input.x402Support ?? true,
    active: true,
    registrations: [],
    supportedTrust: ['reputation', 'crypto-economic'],
  };
}

/**
 * Register an agent in the GOAT Network IdentityRegistry.
 * Returns the agentId and txHash.
 */
export async function registerAgent(agentURI: string): Promise<AgentRegistration> {
  const signer = getGoatSigner();
  if (!signer) {
    throw new Error('GOAT_PRIVATE_KEY or WEB3_PRIVATE_KEY not configured');
  }

  const cfg = readGoatConfig();
  const registry = new ethers.Contract(cfg.identityRegistry, IDENTITY_REGISTRY_ABI, signer);

  const tx = await registry.register(agentURI);
  const receipt = await tx.wait();

  let agentId = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = registry.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'Transfer' && parsed.args?.tokenId !== undefined) {
        agentId = Number(parsed.args.tokenId);
        break;
      }
    } catch {
      // not a Transfer event
    }
  }

  return {
    agentId,
    txHash: receipt.hash,
    agentURI,
  };
}

/**
 * Set metadata on a registered agent.
 */
export async function setAgentMetadata(
  agentId: number,
  key: string,
  value: string,
): Promise<string> {
  const signer = getGoatSigner();
  if (!signer) throw new Error('GOAT_PRIVATE_KEY or WEB3_PRIVATE_KEY not configured');

  const cfg = readGoatConfig();
  const registry = new ethers.Contract(cfg.identityRegistry, IDENTITY_REGISTRY_ABI, signer);
  const encodedValue = ethers.encodeBytes32String(value);

  const tx = await registry.setMetadata(agentId, key, encodedValue);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Give feedback to a registered agent via the ReputationRegistry.
 */
export async function giveFeedback(input: {
  agentId: number;
  value: number;
  valueDecimals?: number;
  tag1: string;
  tag2: string;
  endpoint: string;
  feedbackURI?: string;
  feedbackHash?: string;
}): Promise<FeedbackResult> {
  const signer = getGoatSigner();
  if (!signer) throw new Error('GOAT_PRIVATE_KEY or WEB3_PRIVATE_KEY not configured');

  const cfg = readGoatConfig();
  const registry = new ethers.Contract(cfg.reputationRegistry, REPUTATION_REGISTRY_ABI, signer);

  const tx = await registry.giveFeedback(
    input.agentId,
    input.value,
    input.valueDecimals ?? 2,
    input.tag1,
    input.tag2,
    input.endpoint,
    input.feedbackURI || '',
    input.feedbackHash || ethers.ZeroHash,
  );
  const receipt = await tx.wait();

  let feedbackIndex = 0;
  for (const log of receipt.logs) {
    try {
      const parsed = registry.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'FeedbackGiven' && parsed.args?.feedbackIndex !== undefined) {
        feedbackIndex = Number(parsed.args.feedbackIndex);
        break;
      }
    } catch {
      // not a FeedbackGiven event
    }
  }

  return { feedbackIndex, txHash: receipt.hash };
}

/**
 * Read the current reputation summary for an agent.
 */
export async function getAgentSummary(agentId: number): Promise<{
  totalFeedback: number;
  averageScore: string;
  tags: string[];
}> {
  const provider = getGoatProvider();
  const cfg = readGoatConfig();
  const registry = new ethers.Contract(cfg.reputationRegistry, REPUTATION_REGISTRY_ABI, provider);

  try {
    const clients = await registry.getClients(agentId);
    if (!clients || clients.length === 0) {
      return { totalFeedback: 0, averageScore: '0', tags: [] };
    }

    const summary = await registry.getSummary(agentId, clients, '', '');
    return {
      totalFeedback: Number(summary?.totalFeedback ?? 0),
      averageScore: summary?.averageScore?.toString() ?? '0',
      tags: summary?.tags ?? [],
    };
  } catch {
    return { totalFeedback: 0, averageScore: '0', tags: [] };
  }
}

/**
 * Check if an agent is registered and return its wallet.
 */
export async function getAgentInfo(agentId: number): Promise<{
  registered: boolean;
  wallet: string | null;
}> {
  const provider = getGoatProvider();
  const cfg = readGoatConfig();
  const registry = new ethers.Contract(cfg.identityRegistry, IDENTITY_REGISTRY_ABI, provider);

  try {
    const wallet = await registry.getAgentWallet(agentId);
    return { registered: wallet !== ethers.ZeroAddress, wallet };
  } catch {
    return { registered: false, wallet: null };
  }
}

/**
 * Is GOAT Network ERC-8004 configured (private key available)?
 */
export function isGoatErc8004Configured(): boolean {
  return !!(process.env.GOAT_PRIVATE_KEY?.trim() || process.env.WEB3_PRIVATE_KEY?.trim());
}

/**
 * Get the GOAT Network config (read-only, safe for client-facing use).
 */
export function getGoatPublicConfig() {
  const cfg = readGoatConfig();
  return {
    chainId: cfg.chainId,
    identityRegistry: cfg.identityRegistry,
    reputationRegistry: cfg.reputationRegistry,
    agentRegistryIdentifier: getAgentRegistryIdentifier(),
    explorerUrl: cfg.chainId === 2345
      ? 'https://explorer.goat.network'
      : 'https://explorer.testnet3.goat.network',
  };
}
