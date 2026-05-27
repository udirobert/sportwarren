import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import {
  evmWalletChains,
  getKiteRpcUrl,
  getGoatRpcUrl,
  goatMainnet,
  goatTestnet,
  kiteTestnet,
} from '@/lib/blockchain/evm-config';

export const config = createConfig({
  chains: evmWalletChains,
  transports: {
    [kiteTestnet.id]: http(getKiteRpcUrl()),
    [goatTestnet.id]: http(getGoatRpcUrl()),
    [goatMainnet.id]: http(goatMainnet.rpcUrls.default.http[0]),
  },
});
