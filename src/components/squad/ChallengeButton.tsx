'use client';

import React, { useCallback, useState } from 'react';
import { Swords, Copy, Check, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  buildChallengeUrl,
  buildChallengeWhatsAppUrl,
  buildChallengeShareText,
} from '@/lib/share/challenge-link';

interface ChallengeButtonProps {
  squadId: string;
  squadName: string;
  variant?: 'full' | 'compact';
}

export function ChallengeButton({ squadId, squadName, variant = 'compact' }: ChallengeButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const url = buildChallengeUrl(squadId);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  const handleWhatsApp = useCallback(() => {
    window.open(buildChallengeWhatsAppUrl(squadName, squadId), '_blank');
  }, [squadName, squadId]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${squadName} Challenge`,
          text: buildChallengeShareText(squadName),
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      setShowOptions(true);
    }
  }, [squadName, url]);

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleNativeShare}
        className="gap-1.5"
      >
        <Swords className="w-3.5 h-3.5" />
        Challenge
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="primary"
        size="sm"
        onClick={handleNativeShare}
        className="w-full gap-2"
      >
        <Swords className="w-4 h-4" />
        Challenge a Rival
      </Button>

      {showOptions && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 gap-1.5">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp} className="flex-1 gap-1.5">
            <MessageCircle className="w-3 h-3" />
            WhatsApp
          </Button>
        </div>
      )}
    </div>
  );
}
