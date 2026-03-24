"use client";

type EmbeddedWalletProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type EmbeddedWalletCandidate = {
  address: string;
  type?: string;
  walletClientType?: string;
  sign?: (message: string) => Promise<string>;
  getEthereumProvider?: () => Promise<EmbeddedWalletProvider>;
};

const PRIVY_WALLET_CLIENT_TYPES = new Set(["privy", "privy-v2"]);

export function getPrivyEmbeddedWallet<T extends EmbeddedWalletCandidate>(
  wallets: readonly T[],
  address?: string | null,
): T | null {
  const normalizedAddress = address?.toLowerCase();

  return (
    wallets.find((wallet) => {
      if (!PRIVY_WALLET_CLIENT_TYPES.has(wallet.walletClientType || "")) {
        return false;
      }
      if (wallet.type && wallet.type !== "ethereum") {
        return false;
      }
      if (!normalizedAddress) {
        return true;
      }
      return wallet.address.toLowerCase() === normalizedAddress;
    }) || null
  );
}

export async function signWithPrivyEmbeddedWallet<T extends EmbeddedWalletCandidate>(
  wallets: readonly T[],
  message: string,
  address?: string | null,
): Promise<{ address: string; signature: string }> {
  const wallet = getPrivyEmbeddedWallet(wallets, address);

  if (!wallet) {
    throw new Error("Embedded wallet is still loading. Please wait a moment and try again.");
  }

  if (typeof wallet.sign === "function") {
    try {
      const signature = await wallet.sign(message);
      if (signature) {
        return { address: wallet.address, signature };
      }
    } catch (error) {
      console.warn("Embedded wallet sign() failed, falling back to provider request:", error);
    }
  }

  if (typeof wallet.getEthereumProvider !== "function") {
    throw new Error("Embedded wallet signer is unavailable. Please reconnect and try again.");
  }

  const provider = await wallet.getEthereumProvider();
  const signature = await provider.request({
    method: "personal_sign",
    params: [message, wallet.address],
  });

  if (typeof signature !== "string" || !signature) {
    throw new Error("Embedded wallet returned an invalid signature.");
  }

  return { address: wallet.address, signature };
}
