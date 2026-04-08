import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { avalanche, avalancheFuji } from 'viem/chains';
import {
  evmWalletChains,
  getAvalancheRpcUrl,
  getKiteRpcUrl,
  kiteTestnet,
} from '@/lib/blockchain/evm-config';

export const config = createConfig({
  chains: evmWalletChains,
  transports: {
    [avalancheFuji.id]: http(getAvalancheRpcUrl()),
    [avalanche.id]: http(avalanche.rpcUrls.default.http[0]),
    [kiteTestnet.id]: http(getKiteRpcUrl()),
  },
});
