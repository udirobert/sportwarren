"use client";

import React, { useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Share2, Zap, ShieldCheck, Trophy, Download, Check, Loader2 } from 'lucide-react';
import { 
  getOverallColor, 
  getAttributeTextColor, 
  calculateOverallRating,
  POSITION_COLORS,
  POSITION_NAMES
} from '@/lib/utils';
import { exportElementAsImage, copyToClipboard } from '@/lib/utils/export';
import { useLens } from '@/contexts/LensContext';
import type { PlayerAttributes, PlayerPosition } from '@/types';

interface HighlightCardProps {
  player: PlayerAttributes;
  matchStats?: {
    goals: number;
    assists: number;
    rating: number;
    opponent: string;
  };
  attributeGains?: Array<{
    attribute: string;
    oldRating: number;
    newRating: number;
  }>;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({ 
  player, 
  matchStats,
  attributeGains 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isConnected: lensConnected, postHighlight, profile: lensProfile } = useLens();
  const [isExporting, setIsExporting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [postPubId, setPostPubId] = useState<string | null>(null);

  const overall = calculateOverallRating(player.skills);
  const position = player.position as PlayerPosition || 'MF';

  const handleExport = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    await exportElementAsImage(cardRef.current, `sportwarren-${player.playerName.toLowerCase().replace(/\s+/g, '-')}-stats`);
    setIsExporting(false);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/player/${player.playerName.toLowerCase().replace(/\s+/g, '-')}`;
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleLensPost = async () => {
    if (!lensConnected) return;
    setIsPosting(true);
    
    const content = `Just finished a match on @sportwarren! ⚽️
    Opponent: ${matchStats?.opponent || 'Rivals'}
    Goals: ${matchStats?.goals || 0}
    Rating: ${matchStats?.rating || 0}
    
    My shooting improved to ${player.skills.find(s => s.skill === 'shooting')?.rating || 0}!
    #SportWarren #Phygital #SundayLeague`;

    const pubId = await postHighlight(content);
    if (pubId) {
      setPostPubId(pubId);
      setTimeout(() => setPostPubId(null), 5000);
    }
    setIsPosting(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md">
      <div ref={cardRef} className="w-full">
        <Card className="overflow-hidden bg-gradient-to-br from-gray-900 to-black border-2 border-green-500/30 p-0 shadow-2xl shadow-green-500/10">
          {/* Background Graphic Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

          <div className="relative p-6 space-y-6">
            {/* Header - Brand & Verified Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-bold text-white italic">
                  W
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold tracking-tight uppercase text-sm leading-none">SportWarren</span>
                  {lensProfile && (
                    <span className="text-[8px] text-green-400 font-bold tracking-widest uppercase">@{lensProfile.handle}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1.5 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Verified on Algorand</span>
              </div>
            </div>

            {/* Player Main Info */}
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black ${getOverallColor(overall)} shadow-lg shadow-green-500/20`}>
                  {overall}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-white px-2 py-0.5 rounded text-[10px] font-black text-black uppercase shadow-sm">
                  Level {player.xp.level}
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-white leading-none mb-1">{player.playerName}</h2>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${POSITION_COLORS[position]}`}>
                    {POSITION_NAMES[position]}
                  </span>
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">Season 2026</span>
                </div>
              </div>
            </div>

            {/* Match Highlight Stats */}
            {matchStats && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Match vs {matchStats.opponent}</span>
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs font-bold text-white">Match MVP</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-black text-green-500">{matchStats.goals}</div>
                    <div className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tighter">Goals</div>
                  </div>
                  <div className="text-center border-x border-white/10">
                    <div className="text-xl font-black text-blue-500">{matchStats.assists}</div>
                    <div className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tighter">Assists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-white">{matchStats.rating.toFixed(1)}</div>
                    <div className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-tighter">Rating</div>
                  </div>
                </div>
              </div>
            )}

            {/* Attribute Progression */}
            {attributeGains && attributeGains.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">Evolution</h3>
                <div className="grid grid-cols-2 gap-2">
                  {attributeGains.map((gain, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                      <span className="text-xs font-bold text-gray-300 capitalize">{gain.attribute}</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs text-gray-600 dark:text-gray-400">{gain.oldRating}</span>
                        <Zap className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                        <span className={`text-xs font-black ${getAttributeTextColor(gain.newRating)}`}>{gain.newRating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Bar Branding */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[8px] font-bold text-white">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">Squad Chemistry 88%</span>
              </div>
              <div className="text-right">
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Build Your Legend</span>
                <div className="text-[6px] text-gray-600 dark:text-gray-400 uppercase tracking-widest">sportwarren.com</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons (Not part of exported image) */}
      <div className="flex flex-col w-full gap-3">
        <div className="grid grid-cols-2 gap-3 w-full">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? <Zap className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>{isExporting ? 'Generating...' : 'Download'}</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
            <span>{isCopied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
        
        {lensConnected && (
          <button 
            onClick={handleLensPost}
            disabled={isPosting || !!postPubId}
            className={`w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg ${
              postPubId 
                ? 'bg-green-500 text-white' 
                : 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700 shadow-green-500/20'
            }`}
          >
            {isPosting ? <Loader2 className="w-5 h-5 animate-spin" /> : postPubId ? <Check className="w-5 h-5" /> : <span className="italic mr-1">L</span>}
            <span>{isPosting ? 'Posting...' : postPubId ? 'Posted to Lens!' : 'Post to Lens feed'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
