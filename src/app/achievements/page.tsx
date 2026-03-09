"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy, Target, Users, Shield, Star, Crown, Lock, ExternalLink, Cpu } from 'lucide-react';

const NFT_CONTRACT = '0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4';
const SNOWTRACE_BASE = 'https://testnet.snowtrace.io';

const rarityColors: Record<string, string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-500 to-blue-600',
  epic: 'from-purple-500 to-purple-700',
  legendary: 'from-yellow-400 to-orange-500',
};

const rarityBadge: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-purple-100 text-purple-700',
  legendary: 'bg-yellow-100 text-yellow-800',
};

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  rarity: string;
  points: number;
  tokenId?: number;
  txHash?: string;
}

const mintedAchievements: Achievement[] = [
  {
    id: 1,
    title: 'Hat-trick Hero',
    description: 'Score 3+ goals in a single match',
    icon: Target,
    rarity: 'rare',
    points: 100,
    tokenId: 1,
    txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  },
  {
    id: 2,
    title: 'Assist Master',
    description: 'Record 10+ assists in a season',
    icon: Users,
    rarity: 'epic',
    points: 150,
    tokenId: 2,
    txHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
  },
  {
    id: 3,
    title: 'Derby Day Hero',
    description: 'Score the winning goal in a rivalry match',
    icon: Crown,
    rarity: 'legendary',
    points: 250,
    tokenId: 3,
    txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
  },
];

const lockedAchievements: Achievement[] = [
  { id: 4, title: 'Consistent Performer', description: '5 consecutive matches with 7+ rating', icon: Star, rarity: 'rare', points: 100 },
  { id: 5, title: 'Team Player', description: 'Complete a match with more assists than goals', icon: Users, rarity: 'common', points: 50 },
  { id: 6, title: 'Clean Sheet King', description: 'Keep 5 clean sheets in a row', icon: Shield, rarity: 'epic', points: 200 },
];

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<'cabinet' | 'locked'>('cabinet');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-500/20">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trophy Cabinet</h1>
        <p className="text-gray-500 text-sm">Your achievements, minted as NFTs on-chain</p>
        <a
          href={`${SNOWTRACE_BASE}/address/${NFT_CONTRACT}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Cpu className="w-3 h-3" />
          <span>Achievement NFT Contract</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{mintedAchievements.length}</div>
          <div className="text-xs text-gray-500 mt-1">NFTs Minted</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {mintedAchievements.reduce((sum, a) => sum + a.points, 0)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Points</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{lockedAchievements.length}</div>
          <div className="text-xs text-gray-500 mt-1">To Unlock</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['cabinet', 'locked'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-yellow-500 text-yellow-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'cabinet' ? '🏆 My NFTs' : '🔒 Locked'}
          </button>
        ))}
      </div>

      {/* Minted NFTs */}
      {activeTab === 'cabinet' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mintedAchievements.map(achievement => {
            const Icon = achievement.icon;
            return (
              <Card key={achievement.id} className="overflow-hidden p-0">
                <div className={`h-24 bg-gradient-to-br ${rarityColors[achievement.rarity]} flex items-center justify-center`}>
                  <Icon className="w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{achievement.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${rarityBadge[achievement.rarity]}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{achievement.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-yellow-600">+{achievement.points} pts</span>
                    {achievement.tokenId && <span className="text-xs text-gray-400">Token #{achievement.tokenId}</span>}
                  </div>
                  <div className="flex gap-3 pt-1 border-t border-gray-100">
                    {achievement.txHash && (
                      <a
                        href={`${SNOWTRACE_BASE}/tx/${achievement.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Mint tx
                      </a>
                    )}
                    {achievement.tokenId && (
                      <a
                        href={`${SNOWTRACE_BASE}/token/${NFT_CONTRACT}?a=${achievement.tokenId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View NFT
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Locked achievements */}
      {activeTab === 'locked' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lockedAchievements.map(achievement => {
            const Icon = achievement.icon;
            return (
              <Card key={achievement.id} className="overflow-hidden p-0 opacity-70">
                <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                  <Icon className="w-12 h-12 text-gray-400" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <Lock className="w-8 h-8 text-white drop-shadow" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-600 text-sm leading-tight">{achievement.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${rarityBadge[achievement.rarity]}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-gray-400">+{achievement.points} pts</span>
                    <span className="text-xs text-gray-400">Not minted</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
