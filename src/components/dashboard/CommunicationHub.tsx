'use client';

import React from 'react';
import Link from 'next/link';
import { Link2, Check, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlatformType, PlatformConnections } from '@/types';

interface PlatformInfo {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  preview: string;
}

const PLATFORMS: Record<PlatformType, PlatformInfo> = {
  telegram: {
    name: 'Telegram',
    icon: '📱',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    preview: '🏆 W 3-1 vs Sunday Legends',
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: '💬',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    preview: '🎉 We won! +150 XP',
  },
  xmtp: {
    name: 'XMTP',
    icon: '🔐',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    preview: '🔐 Match verified',
  },
};

interface CommunicationHubProps {
  connections?: PlatformConnections;
  compact?: boolean;
  onConnect?: (platform: PlatformType) => void;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  connections = {},
  compact = false,
  onConnect,
}) => {
  const platformList = (Object.keys(PLATFORMS) as PlatformType[]);
  const connectedCount = platformList.filter(p => connections[p]?.connected).length;
  const allConnected = connectedCount === platformList.length;

  // Compact mode for sidebar
  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-900 dark:text-white">Chat Channels</h3>
          <span className={`text-[10px] font-black ${allConnected ? 'text-green-600' : 'text-orange-500'}`}>
            {connectedCount}/{platformList.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {platformList.map(platform => {
            const info = PLATFORMS[platform];
            const isConnected = connections[platform]?.connected;
            return (
              <div
                key={platform}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  isConnected ? info.bgColor : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                }`}
                title={isConnected ? `${info.name} connected` : `${info.name} not connected`}
              >
                {info.icon}
              </div>
            );
          })}
        </div>
        {!allConnected && (
          <Link
            href="/settings?tab=connections"
            className="mt-2 flex items-center justify-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-700"
          >
            <Link2 className="w-3 h-3" />
            Connect channels
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
            {allConnected
              ? 'All channels connected — your squad gets updates automatically'
              : 'Link messaging platforms to share match updates with your squad'}
          </p>
        </div>
        {allConnected && (
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <Check className="w-4 h-4" />
            All connected
          </div>
        )}
      </div>

      <div className="space-y-2">
        {platformList.map(platform => {
          const info = PLATFORMS[platform];
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
                    {isConnected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Active
                </div>
              ) : (
                <Link href="/settings?tab=connections">
                  <Button size="sm" variant="outline">
                    <Link2 className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {!allConnected && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/settings?tab=connections"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700"
          >
            Manage all connections
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </Card>
  );
};
