import { createConfig } from '@privy-io/wagmi';
import { http } from 'wagmi';
import { polygon, polygonAmoy } from 'viem/chains';

export const config = createConfig({
  chains: [polygon, polygonAmoy],
  transports: {
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});