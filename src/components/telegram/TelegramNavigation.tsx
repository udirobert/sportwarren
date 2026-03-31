'use client';

import { useMemo } from 'react';
import { Home, Trophy, User, Wallet } from 'lucide-react';

export type TabId = 'squad' | 'match' | 'profile' | 'treasury';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Home;
  badge?: number;
}

interface TelegramNavigationProps {
  activeTab: TabId;
  pendingCount: number;
  pendingTopUps: number;
  safeAreaBottom: number;
  onTabChange: (tabId: TabId) => void;
}

export function TelegramNavigation({ activeTab, pendingCount, pendingTopUps, safeAreaBottom, onTabChange }: TelegramNavigationProps) {
  const tabs = useMemo<Tab[]>(() => [
    { id: 'squad', label: 'Squad', icon: Home },
    { id: 'match', label: 'Match', icon: Trophy, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'treasury', label: 'TON', icon: Wallet, badge: pendingTopUps > 0 ? pendingTopUps : undefined },
  ], [pendingCount, pendingTopUps]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-[#09111f]/95 backdrop-blur-lg">
      <div
        className="flex items-center justify-around px-2 py-2"
        style={{ paddingBottom: `calc(0.5rem + ${safeAreaBottom}px)` }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition ${
                isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 transition ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-400' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-emerald-400/50" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
