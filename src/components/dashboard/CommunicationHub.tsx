'use client';

import React from 'react';
import Link from 'next/link';
import { Link2, Check, ArrowRight, ExternalLink, Bot, MessageCircle, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { usePlatformConnections } from '@/hooks/usePlatformConnections';
import { PLATFORM_CONFIG, PLATFORM_LIST, SELF_SERVE_PLATFORM_LIST } from '@/types';
import { buildTelegramDeepLink, getTabLabel } from '@/lib/telegram/deep-links';

interface CommunicationHubProps {
  squadId?: string;
  compact?: boolean;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  squadId,
  compact = false,
}) => {
  const { connections } = usePlatformConnections({ squadId });
  const connectedCount = PLATFORM_LIST.filter(p => connections[p]?.connected).length;
  const selfServeConnectedCount = SELF_SERVE_PLATFORM_LIST.filter((platform) => connections[platform]?.connected).length;
  const allSelfServeConnected = selfServeConnectedCount === SELF_SERVE_PLATFORM_LIST.length;

  // Compact mode for sidebar
  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white">Chat Channels</h3>
          <span className={`text-[10px] font-black ${allSelfServeConnected ? 'text-green-600' : 'text-orange-500'}`}>
            {connectedCount}/{PLATFORM_LIST.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {PLATFORM_LIST.map(platform => {
            const info = PLATFORM_CONFIG[platform];
            const isConnected = connections[platform]?.connected;
            const statusLabel = isConnected
              ? `${info.name} connected`
              : info.selfServe
                ? `${info.name} not connected`
                : `${info.name} requires manual setup`;
            return (
              <div
                key={platform}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  isConnected ? info.bgColor : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                }`}
                title={statusLabel}
              >
                {info.icon}
              </div>
            );
          })}
        </div>
        {!allSelfServeConnected && (
          <Link
            href="/settings?tab=connections"
            className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-700"
          >
            <Link2 className="w-3 h-3" />
            Manage Telegram
          </Link>
        )}
      </Card>
    );
  }

  // Full widget for dashboard
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Connect Your Squad's Chat</h2>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {allSelfServeConnected
              ? 'Telegram is linked — your squad can receive verified updates in chat'
              : 'Link Telegram and review the status of the other messaging channels'}
          </p>
        </div>
        {allSelfServeConnected && (
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <Check className="w-4 h-4" />
            Telegram linked
          </div>
        )}
      </div>

      <div className="space-y-2">
        {PLATFORM_LIST.map(platform => {
          const info = PLATFORM_CONFIG[platform];
          const connection = connections[platform];
          const isConnected = connection?.connected;

          return (
            <div
              key={platform}
              className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                isConnected
                  ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isConnected ? info.bgColor : 'bg-gray-100 dark:bg-gray-800'} rounded-lg flex items-center justify-center text-xl`}>
                  {info.icon}
                </div>
                <div>
                  <p className={`font-semibold ${isConnected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {info.name}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {isConnected ? 'Connected' : info.selfServe ? 'Not connected' : 'Manual setup'}
                  </p>
                </div>
              </div>

              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Active
                </div>
              ) : info.selfServe ? (
                <Link href="/settings?tab=connections">
                  <Button size="sm" variant="outline">
                    <Link2 className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                </Link>
              ) : (
                <div className="text-xs font-medium text-gray-500">
                  Admin managed
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Telegram Mini App Quick Access - shown when connected */}
      {connections.telegram?.connected && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Quick Actions</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">via Telegram</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={buildTelegramDeepLink({ tab: 'match' })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Log Match</span>
              <ExternalLink className="w-3 h-3 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href={buildTelegramDeepLink({ tab: 'treasury' })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Treasury</span>
              <ExternalLink className="w-3 h-3 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href={buildTelegramDeepLink({ tab: 'ai' })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Ask AI</span>
              <ExternalLink className="w-3 h-3 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href={buildTelegramDeepLink({ tab: 'squad' })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Squad</span>
              <ExternalLink className="w-3 h-3 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      )}

      {!allSelfServeConnected && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/settings?tab=connections"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Manage Telegram
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
};
