"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy, Award, Shield, Star, ExternalLink, Loader2 } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { useWallet } from '@/contexts/WalletContext';
import {
  getAchievementExplorerUrl,
  getAvalancheNetworkLabel,
} from '@/lib/blockchain/evm-config';

const avalancheNetworkLabel = getAvalancheNetworkLabel();

export const AchievementGallery: React.FC = () => {
  const { address, chain, hasWallet } = useWallet();
  const { achievements, loading, error } = useAchievements();

  if (!hasWallet || !address) {
    return (
      <Card className="p-8 text-center bg-gray-50 border-dashed border-2 border-gray-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Shield className="w-8 h-8 text-gray-300" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900">Connect a Wallet for Trophy Sync</h4>
        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
          On-chain trophies are tied to a wallet address. Your live season milestones still show in the reputation card above.
        </p>
      </Card>
    );
  }

  if (chain !== 'avalanche') {
    return (
      <Card className="p-8 text-center bg-gray-50 border-dashed border-2 border-gray-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Trophy className="w-8 h-8 text-gray-300" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900">Avalanche Trophy Rail</h4>
        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
          Achievement NFTs are published on {avalancheNetworkLabel}. Switch to an Avalanche wallet to browse on-chain trophies for this account.
        </p>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Scanning {avalancheNetworkLabel} for achievements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-center">
        <Trophy className="w-10 h-10 text-red-300 mx-auto mb-3" />
        <h4 className="text-red-900 font-bold">Achievement Sync Failed</h4>
        <p className="text-red-600 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card className="p-12 text-center bg-gray-50 border-dashed border-2 border-gray-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Award className="w-8 h-8 text-gray-300" />
        </div>
        <h4 className="text-lg font-semibold text-gray-900">No On-Chain Trophies Yet</h4>
        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
          Win matches, complete challenges, and earn verified on-chain achievements on {avalancheNetworkLabel}.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((nft) => (
        <Card key={nft.tokenId} className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
          <div className="relative aspect-square bg-gray-100 overflow-hidden">
            {nft.metadata?.image ? (
              <img 
                src={nft.metadata.image} 
                alt={nft.metadata.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                <Trophy className="w-20 h-20 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <a 
                href={getAchievementExplorerUrl(nft.tokenId)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-[10px] font-bold text-white rounded uppercase tracking-widest border border-white/20">
                #{nft.tokenId}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">Verified Achievement</span>
            </div>
            <h4 className="font-bold text-gray-900 truncate">{nft.metadata?.name || 'Achievement NFT'}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{nft.metadata?.description || 'Earned via SportWarren match performance.'}</p>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex -space-x-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                    <Shield className="w-2.5 h-2.5 text-gray-400" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{avalancheNetworkLabel}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
