'use client';

import React, { useCallback, useState } from 'react';
import { UserPlus, Copy, Check, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { buildReferralLink, buildReferralShareText, REFERRAL_REWARDS } from '@/lib/engagement/referral';

interface ReferralWidgetProps {
  userId: string;
  playerName: string;
  referralCount?: number;
}

export function ReferralWidget({ userId, playerName, referralCount = 0 }: ReferralWidgetProps) {
  const [copied, setCopied] = useState(false);
  const link = buildReferralLink(userId);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = link;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [link]);

  const handleShare = useCallback(async () => {
    const text = buildReferralShareText(playerName);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join SportWarren', text, url: link });
        return;
      } catch {
        // User cancelled
      }
    }
    const encoded = encodeURIComponent(`${text}\n${link}`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }, [playerName, link]);

  const totalPossibleXP = Object.values(REFERRAL_REWARDS).reduce((s, r) => s + r.xp, 0);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Invite & Earn</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            Earn up to <span className="font-bold text-green-600">{totalPossibleXP} XP</span> per referral
          </p>
        </div>
        {referralCount > 0 && (
          <span className="ml-auto text-xs font-black text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
            {referralCount} invited
          </span>
        )}
      </div>

      {/* Reward tiers */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {Object.values(REFERRAL_REWARDS).map((reward) => (
          <div
            key={reward.event}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <span className="text-[10px] font-bold text-green-600">+{reward.xp}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {reward.description.replace('Referred player ', '')}
            </span>
          </div>
        ))}
      </div>

      {/* Share actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1 gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleShare}
          className="flex-1 gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      </div>
    </Card>
  );
}
