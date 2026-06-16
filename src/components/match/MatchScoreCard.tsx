'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, Copy, CheckCircle2, Share2, MessageCircle } from 'lucide-react';
import { buildTelegramShareUrl } from '@/lib/telegram/deep-links';

interface MatchScoreCardProps {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  matchDate: string;
  matchUrl: string;
}

export function MatchScoreCard({
  homeName,
  awayName,
  homeScore,
  awayScore,
  matchDate,
  matchUrl,
}: MatchScoreCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(matchUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: `${homeName} vs ${awayName}`,
        text: 'Check out this match on SportWarren',
        url: matchUrl,
      });
    } catch {
      handleCopyLink();
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-6">
      <div className="flex items-center justify-center space-x-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm font-bold text-white max-w-[7rem] truncate" title={homeName}>
            {homeName}
          </div>
        </div>
        <div className="text-center shrink-0">
          <div className="text-4xl font-black text-white font-mono">
            {homeScore} <span className="text-gray-500">-</span> {awayScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">{matchDate}</div>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="text-sm font-bold text-white max-w-[7rem] truncate" title={awayName}>
            {awayName}
          </div>
        </div>
      </div>

      {/* Share actions */}
      <div className="flex items-center justify-center space-x-3 mt-6 pt-4 border-t border-white/5">
        <Button size="sm" variant="secondary" onClick={handleCopyLink}>
          {copied ? <CheckCircle2 className="w-3 h-3 mr-1.5 text-green-400" /> : <Copy className="w-3 h-3 mr-1.5" />}
          {copied ? 'Copied' : 'Copy link'}
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button size="sm" variant="secondary" onClick={handleNativeShare}>
            <Share2 className="w-3 h-3 mr-1.5" />
            Share
          </Button>
        )}
        <a
          href={buildTelegramShareUrl(
            `⚽ ${homeName} ${homeScore} - ${awayScore} ${awayName}`,
            matchUrl,
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="sm" variant="secondary" className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30">
            <MessageCircle className="w-3 h-3 mr-1.5 text-blue-400" />
            Share to Telegram
          </Button>
        </a>
      </div>
    </Card>
  );
}
