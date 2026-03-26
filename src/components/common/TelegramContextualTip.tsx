'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, ExternalLink } from 'lucide-react';
import { buildTelegramDeepLink, type TelegramMiniAppTab } from '@/lib/telegram/deep-links';

interface TelegramContextualTipProps {
  /** The context where this tip is shown */
  context: 'match-log' | 'treasury' | 'ai-staff' | 'verification' | 'squad';
  /** Optional match ID for pre-filling */
  matchId?: string;
  /** Optional opponent name for pre-filling */
  opponentName?: string;
  /** Additional CSS classes */
  className?: string;
}

const TIP_CONFIG: Record<string, {
  title: string;
  message: string;
  tab: TelegramMiniAppTab;
  actionLabel: string;
  emoji: string;
}> = {
  'match-log': {
    title: 'Log faster via Telegram',
    message: 'Type `/log 4-2 win vs Red Lions` in Telegram to submit matches instantly.',
    tab: 'match',
    actionLabel: 'Open Match Center',
    emoji: '⚡',
  },
  'treasury': {
    title: 'Manage treasury from Telegram',
    message: 'Top up your squad treasury with TON directly from Telegram.',
    tab: 'treasury',
    actionLabel: 'Open Treasury',
    emoji: '💰',
  },
  'ai-staff': {
    title: 'Ask AI Staff via Telegram',
    message: 'Type `/ask Coach about fitness levels` to get instant tactical advice.',
    tab: 'ai',
    actionLabel: 'Ask AI Staff',
    emoji: '🤖',
  },
  'verification': {
    title: 'Verify matches faster',
    message: 'Get instant verification requests in Telegram when opponents submit results.',
    tab: 'match',
    actionLabel: 'Open Match Center',
    emoji: '✅',
  },
  'squad': {
    title: 'Squad updates in Telegram',
    message: 'Receive real-time squad notifications and manage your team from Telegram.',
    tab: 'squad',
    actionLabel: 'Open Squad',
    emoji: '👥',
  },
};

const STORAGE_KEY = 'sw_telegram_tips_dismissed';

export function TelegramContextualTip({
  context,
  matchId,
  opponentName,
  className = '',
}: TelegramContextualTipProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissedTips = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
      if (dismissedTips.includes(context)) {
        setDismissed(true);
        return;
      }
    } catch {
      // ignore
    }

    // Show tip after a short delay
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [context]);

  const handleDismiss = () => {
    setVisible(false);
    try {
      const dismissedTips = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as string[];
      if (!dismissedTips.includes(context)) {
        dismissedTips.push(context);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissedTips));
      }
    } catch {
      // ignore
    }
  };

  if (dismissed || !visible) return null;

  const config = TIP_CONFIG[context];
  if (!config) return null;

  const deepLinkOptions: { tab: TelegramMiniAppTab; prefilled?: Record<string, string> } = {
    tab: config.tab,
  };

  if (matchId && opponentName) {
    deepLinkOptions.prefilled = {
      matchId,
      opponent: opponentName,
    };
  }

  const deepLink = buildTelegramDeepLink(deepLinkOptions);

  return (
    <div
      className={`relative bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 ${className}`}
    >
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
        aria-label="Dismiss tip"
      >
        <X className="w-4 h-4 text-blue-400" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl">{config.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
            {config.title}
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            {config.message}
          </p>
          <a
            href={deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {config.actionLabel}
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        </div>
      </div>
    </div>
  );
}