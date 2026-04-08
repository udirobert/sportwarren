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
import { trpc } from '@/lib/trpc-client';
import { AvatarHeroCard } from '@/components/ui/AvatarHeroCard';

const avalancheNetworkLabel = getAvalancheNetworkLabel();

export const AchievementGallery: React.FC = () => {
  const { address, chain, hasWallet } = useWallet();
  const { achievements, loading, error } = useAchievements();
  const { data: avatarPresentation } = trpc.player.getAvatarPresentation.useQuery(
    { squadId: undefined },
    {
      enabled: hasWallet,
      retry: false,
      staleTime: 30 * 1000,
    },
  );

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
    <div className="space-y-4">
      {avatarPresentation && (
        <AvatarHeroCard
          presentation={avatarPresentation}
          title="Achievement Identity"
          subtitle="Your avatar now reflects the progression story behind every verified trophy and season milestone."
          statLine={`${achievements.length} on-chain trophy${achievements.length === 1 ? '' : 'ies'} on ${avalancheNetworkLabel}`}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((nft) => (
          <Card key={nft.tokenId} className="group overflow-hidden border-none bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {nft.metadata?.image ? (
                <img
                  src={nft.metadata.image}
                  alt={nft.metadata.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                  <Trophy className="h-20 w-20 text-white/20" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={getAchievementExplorerUrl(nft.tokenId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-white p-2 text-blue-600 transition-transform hover:scale-110"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
              <div className="absolute left-3 top-3">
                <span className="rounded border border-white/20 bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                  #{nft.tokenId}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-1 flex items-center space-x-2">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-blue-600">Verified Achievement</span>
              </div>
              <h4 className="truncate font-bold text-gray-900">{nft.metadata?.name || 'Achievement NFT'}</h4>
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">{nft.metadata?.description || 'Earned via SportWarren match performance.'}</p>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex -space-x-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-200">
                      <Shield className="h-2.5 w-2.5 text-gray-400" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{avalancheNetworkLabel}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
