"use client";

import React, { useEffect, useState } from 'react';
import { Settings, Wallet, User, Bell } from 'lucide-react';
import { AlgorandWallet } from '@/components/algorand/AlgorandWallet';

const tabs = [
  { id: 'wallet', label: 'Blockchain Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const;

type Tab = typeof tabs[number]['id'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('wallet');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab === 'wallet' || tab === 'profile' || tab === 'notifications') {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account and wallet</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Wallet tab */}
      {activeTab === 'wallet' && <AlgorandWallet />}

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="text-center py-16 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Profile settings coming soon</p>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === 'notifications' && (
        <div className="text-center py-16 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Notification settings coming soon</p>
        </div>
      )}
    </div>
  );
}
