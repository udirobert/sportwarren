"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';

const ACHIEVEMENT_ABI = [
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

const ACHIEVEMENT_ADDRESS = process.env.NEXT_PUBLIC_AVALANCHE_ACHIEVEMENT_NFT_ADDRESS || "0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4";

export interface AchievementNFT {
  tokenId: string;
  uri: string;
  metadata?: {
    name: string;
    description: string;
    image: string;
    attributes?: { trait_type: string; value: any }[];
  };
}

export function useAchievements() {
  const { address, chain } = useWallet();
  const [achievements, setAchievements] = useState<AchievementNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAvalanche = chain === 'avalanche';

  const provider = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum && isAvalanche) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  }, [isAvalanche]);

  const fetchAchievements = useCallback(async () => {
    if (!provider || !address) return;

    setLoading(true);
    try {
      const contract = new ethers.Contract(ACHIEVEMENT_ADDRESS, ACHIEVEMENT_ABI, provider);
      
      // Note: ERC721Enumerable is needed for tokenOfOwnerByIndex
      // If the contract doesn't implement it, we'd need to fetch via events
      // Assuming it does or we'll fallback to event-based fetching
      
      const balance = await contract.balanceOf(address);
      const fetched: AchievementNFT[] = [];

      for (let i = 0; i < Number(balance); i++) {
        try {
          // If tokenOfOwnerByIndex fails, the contract might not be Enumerable
          const tokenId = await contract.tokenOfOwnerByIndex(address, i);
          const uri = await contract.tokenURI(tokenId);
          
          let metadata = undefined;
          if (uri.startsWith('http')) {
            const res = await fetch(uri);
            metadata = await res.json();
          }

          fetched.push({
            tokenId: tokenId.toString(),
            uri,
            metadata,
          });
        } catch (e) {
          console.warn(`Failed to fetch NFT index ${i}:`, e);
        }
      }

      setAchievements(fetched);
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
      setError("Failed to load achievements from Fuji.");
    } finally {
      setLoading(false);
    }
  }, [provider, address]);

  useEffect(() => {
    if (isAvalanche && address) {
      fetchAchievements();
    }
  }, [isAvalanche, address, fetchAchievements]);

  return {
    achievements,
    loading,
    error,
    refresh: fetchAchievements,
  };
}
