import { ethers } from "ethers";
import {
  getGoatChain,
  getGoatExplorerBaseUrl,
  getGoatNetworkLabel,
  getGoatRpcUrl,
} from "@/lib/blockchain/evm-config";

const GOAT_RPC = getGoatRpcUrl();

interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

const getEthereum = (): EthereumProvider | undefined =>
  typeof window !== "undefined" ? (window as any).ethereum : undefined;

export const connectGoatWallet = async (): Promise<{
  address: string;
  error?: string;
}> => {
  try {
    if (typeof window === "undefined") {
      return { address: "", error: "Window is undefined" };
    }

    const eth = getEthereum();
    if (!eth) {
      return {
        address: "",
        error: "No wallet found. Please install MetaMask or another EVM-compatible wallet.",
      };
    }

    const provider = new ethers.BrowserProvider(eth);
    const accounts = await provider.send("eth_requestAccounts", []);
    const targetChain = getGoatChain();

    if (accounts && accounts.length > 0) {
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(targetChain.id)) {
        try {
          await provider.send("wallet_switchEthereumChain", [
            { chainId: ethers.toBeHex(targetChain.id) },
          ]);
        } catch (switchError) {
          const err = switchError as { code?: number };
          if (err.code === 4902) {
            await provider.send("wallet_addEthereumChain", [
              {
                chainId: ethers.toBeHex(targetChain.id),
                chainName: getGoatNetworkLabel(),
                nativeCurrency: targetChain.nativeCurrency,
                rpcUrls: [getGoatRpcUrl()],
                blockExplorerUrls: [getGoatExplorerBaseUrl()],
              },
            ]);
          }
        }
      }

      return { address: accounts[0] };
    }

    return { address: "", error: "No accounts found" };
  } catch (error) {
    const err = error as Error;
    console.error("Error connecting to GOAT Network wallet:", error);
    return { address: "", error: err.message || "Failed to connect wallet" };
  }
};

export const getGoatBalance = async (address: string): Promise<number> => {
  try {
    const provider = new ethers.JsonRpcProvider(GOAT_RPC);
    const balance = await provider.getBalance(address);
    return Number(ethers.formatEther(balance));
  } catch (error) {
    console.error("Error fetching GOAT Network balance:", error);
    return 0;
  }
};

export const disconnectGoatWallet = async (): Promise<void> => {
  // For Goat/MetaMask, disconnection is handled by the wallet itself.
  // We just clear local storage.
};
