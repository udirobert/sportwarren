"use client";

import React, { useEffect, useState } from 'react';
import { Settings, Wallet, User, Bell, Link2, Check, X, Copy, LogOut, Trophy, Target, Star, MessageCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useMySquads } from '@/hooks/squad/useSquad';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WalletConnectModal } from '@/components/common/WalletConnectModal';
import { PlatformType, NotificationPreferences, PLATFORM_CONFIG, PLATFORM_LIST } from '@/types';
import { trackFeatureUsed } from '@/lib/analytics';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
] as const;

type Tab = typeof tabs[number]['id'];

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  matchReminders: true,
  verificationRequests: true,
  squadUpdates: true,
  achievements: true,
  weeklyDigest: false,
  channels: {
    inApp: true,
    telegram: false,
    whatsapp: false,
    xmtp: false,
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { address, chain, balance, isGuest, hasAccount, hasWallet, loginMethod, authStatus, disconnect } = useWallet();
  const { preferences, updateConnection, disconnectPlatform } = useUserPreferences();
  const { completeChecklistItem } = useOnboarding();
  const { memberships } = useMySquads();
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [copied, setCopied] = useState(false);
  const [celebrating, setCelebrating] = useState<PlatformType | null>(null);

  const connections = preferences.connections ?? {};
  const needsVerification = hasWallet && (authStatus.state === 'missing' || authStatus.state === 'expired');
  const hasYellowEligibleWallet = hasWallet && (chain === 'avalanche' || chain === 'lens');
  const accountStatusLabel = isGuest
    ? 'Guest preview'
    : hasWallet
      ? 'Wallet connected'
      : hasAccount
        ? 'Account ready'
        : 'Not signed in';
  const accountReference = hasWallet && address
    ? `${address.slice(0, 8)}...${address.slice(-6)}`
    : hasAccount
      ? (loginMethod === 'social' ? 'Social sign-in active' : 'Account active')
      : 'No account connected';
  const networkLabel = hasWallet
    ? (chain || 'Unknown')
    : hasAccount
      ? 'Account sign-in'
      : isGuest
        ? 'Guest preview'
        : 'Not connected';
  const verificationLabel = !hasWallet
    ? 'Not required yet'
    : needsVerification
      ? (authStatus.state === 'expired' ? 'Session expired' : 'Signature needed')
      : 'Verified';
  const yellowRailLabel = !hasWallet
    ? 'Connect a wallet first'
    : needsVerification
      ? 'Verify wallet first'
      : hasYellowEligibleWallet
        ? 'Ready'
        : 'Requires Avalanche or Lens';
  const disconnectLabel = hasWallet ? 'Disconnect Wallet' : 'Sign Out';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab as Tab);
    }
  }, []);

  // Load notification preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('sw_notification_prefs');
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notification prefs:', e);
      }
    }
  }, []);

  const copyAddress = async () => {
    if (hasWallet && address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateNotifications = (key: keyof NotificationPreferences, value: boolean | NotificationPreferences['channels']) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('sw_notification_prefs', JSON.stringify(updated));
  };

  const updateNotificationChannel = (channel: keyof NotificationPreferences['channels'], value: boolean) => {
    const updated = {
      ...notifications,
      channels: { ...notifications.channels, [channel]: value },
    };
    setNotifications(updated);
    localStorage.setItem('sw_notification_prefs', JSON.stringify(updated));
  };

  const handleConnect = (platform: PlatformType) => {
    updateConnection(platform);
    setCelebrating(platform);
    trackFeatureUsed('channel_connect', { platform, total_connected: PLATFORM_LIST.filter(p => preferences.connections?.[p]?.connected || p === platform).length });
    setTimeout(() => setCelebrating(null), 3000);
  };

  const handleDisconnect = (platform: PlatformType) => {
    disconnectPlatform(platform);
  };

  const primarySquad = memberships?.[0]?.squad;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 nav-spacer-top nav-spacer-bottom space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-900 dark:bg-gray-700 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account, connections, and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* Account Summary */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account</h2>
                <p className="text-sm text-gray-500">
                  Identity, wallet access, and protected actions all start here.
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                isGuest
                  ? 'bg-blue-100 text-blue-700'
                  : hasWallet
                    ? 'bg-green-100 text-green-700'
                    : hasAccount
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
              }`}>
                {accountStatusLabel}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Account Reference</p>
                <p className={`${hasWallet ? 'font-mono' : 'font-medium'} text-sm text-gray-900 dark:text-white`}>
                  {accountReference}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Network</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{networkLabel}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Verification</p>
                <p className={`font-medium ${needsVerification ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                  {verificationLabel}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Yellow Rail</p>
                <p className={`font-medium ${hasYellowEligibleWallet && !needsVerification ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                  {yellowRailLabel}
                </p>
              </div>
            </div>

            {hasWallet && balance > 0 && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Balance</p>
                <p className="font-medium text-gray-900 dark:text-white">{balance.toLocaleString()}</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {hasWallet ? (
                <button
                  onClick={copyAddress}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  title="Copy address"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  Copy wallet
                </button>
              ) : (
                <Button onClick={() => setShowWalletModal(true)}>
                  <Wallet className="w-4 h-4 mr-2" />
                  {isGuest ? 'Start your account' : 'Connect wallet'}
                </Button>
              )}

              {needsVerification && (
                <Button variant="outline" onClick={() => setShowWalletModal(true)}>
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Verify wallet
                </Button>
              )}
            </div>
          </Card>

          {/* Squad Membership */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Squad</h2>
            {primarySquad ? (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {primarySquad.shortName?.slice(0, 2) || primarySquad.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{primarySquad.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{memberships?.[0]?.role || 'Player'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not a member of any squad yet</p>
            )}
          </Card>

          {/* Player Stats Summary */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Stats</h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-xs text-gray-500">Matches</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-xs text-gray-500">Goals</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-xs text-gray-500">Assists</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Star className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">-</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </Card>

          {/* Disconnect Button */}
          {hasAccount && !isGuest && (
            <Button
              variant="outline"
              onClick={disconnect}
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {disconnectLabel}
            </Button>
          )}

          {isGuest && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-900">
              Guest sessions are temporary. Create an account or connect a wallet when you want to save progress, unlock squad actions, and use payment rails.
            </div>
          )}
        </div>
      )}

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <Card>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Connect Your Squad's Chat</h2>
              <p className="text-sm text-gray-500">Link messaging platforms to share match updates with your squad automatically</p>
            </div>
            <div className="space-y-3">
              {(Object.keys(PLATFORM_CONFIG) as PlatformType[]).map(platform => {
                const info = PLATFORM_CONFIG[platform];
                const connection = connections[platform];
                const isConnected = connection?.connected;
                return (
                  <div key={platform} className={`p-4 border rounded-xl transition-all ${
                    isConnected
                      ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                          {info.icon}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{info.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                        </div>
                      </div>
                      {isConnected ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDisconnect(platform)}
                          className="text-red-600 shrink-0"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Unlink
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handleConnect(platform)} className="shrink-0">
                          <Link2 className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                    {isConnected && (
                      <div className="mt-3 pt-3 border-t border-green-200/50 dark:border-green-800/50">
                        <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">You'll receive:</p>
                        <code className="block text-xs bg-gray-900 text-gray-100 p-2 rounded-lg overflow-x-auto">
                          {info.preview}
                        </code>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>How it works:</strong> Once connected, match results and achievements will automatically be shared to your squad's chat. Only verified match data is shared — your personal messages stay private.
            </p>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">What to notify</h2>
            <div className="space-y-3">
              {[
                { key: 'matchReminders', label: 'Match reminders', desc: 'Get notified before your scheduled matches' },
                { key: 'verificationRequests', label: 'Verification requests', desc: 'When an opponent submits a match for you to verify' },
                { key: 'squadUpdates', label: 'Squad updates', desc: 'New members, tactics changes, and announcements' },
                { key: 'achievements', label: 'Achievements', desc: 'When you unlock a new achievement or milestone' },
                { key: 'weeklyDigest', label: 'Weekly digest', desc: 'Summary of your week\'s activity and stats' },
              ].map(({ key, label, desc }) => (
                <label key={key} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[key as keyof NotificationPreferences] as boolean}
                    onChange={(e) => updateNotifications(key as keyof NotificationPreferences, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </label>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Where to notify</h2>
            <p className="text-sm text-gray-500 mb-3">Choose which channels receive your notifications</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'inApp', label: 'In-app' },
                { key: 'telegram', label: 'Telegram', disabled: !connections.telegram?.connected },
                { key: 'whatsapp', label: 'WhatsApp', disabled: !connections.whatsapp?.connected },
                { key: 'xmtp', label: 'XMTP', disabled: !connections.xmtp?.connected },
              ].map(({ key, label, disabled }) => (
                <label
                  key={key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    disabled
                      ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : notifications.channels[key as keyof typeof notifications.channels]
                      ? 'bg-green-50 border-green-300 dark:bg-green-900/30 dark:border-green-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={notifications.channels[key as keyof typeof notifications.channels]}
                    onChange={(e) => updateNotificationChannel(key as keyof typeof notifications.channels, e.target.checked)}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium ${
                    notifications.channels[key as keyof typeof notifications.channels] ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {label}
                  </span>
                  {notifications.channels[key as keyof typeof notifications.channels] && (
                    <Check className="w-3 h-3 text-green-600" />
                  )}
                </label>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Wallet Access</h2>
                <p className="text-sm text-gray-500">
                  Wallets are optional until you need protected actions. Yellow settlement requires a verified Avalanche or Lens wallet.
                </p>
              </div>
              {hasWallet && !needsVerification ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-green-700">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
                  <ShieldAlert className="w-3 h-3" />
                  {hasWallet ? 'Needs Verification' : 'Wallet Optional'}
                </span>
              )}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Current State</div>
                <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{accountStatusLabel}</div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {hasWallet
                    ? `Connected on ${chain}. ${needsVerification ? 'Approve a signature to unlock protected actions.' : 'Protected actions are available.'}`
                    : isGuest
                      ? 'You are still exploring in preview mode. Start an account to keep progress.'
                      : hasAccount
                        ? 'Your account is ready. Connect a wallet when you want treasury actions, on-chain progression, and Yellow settlement.'
                        : 'Sign in first, then connect a wallet if you want protected actions.'}
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Yellow Rail</div>
                <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{yellowRailLabel}</div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Treasury settlements, match fee locks, and transfer escrow only activate when the connected wallet can authorize Yellow on a supported EVM chain.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(!hasWallet || needsVerification) && (
                <Button onClick={() => setShowWalletModal(true)}>
                  <Wallet className="w-4 h-4 mr-2" />
                  {hasWallet ? 'Review Wallet Access' : 'Connect Wallet'}
                </Button>
              )}
              {hasWallet && (
                <Button variant="outline" onClick={disconnect}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect Wallet
                </Button>
              )}
            </div>
          </Card>

          {hasWallet && !hasYellowEligibleWallet && (
            <Card className="border-blue-200 bg-blue-50">
              <p className="text-sm text-blue-900">
                Algorand wallets can still unlock SportWarren identity and protected data, but Yellow settlement currently requires Avalanche or Lens because the rail is EVM-based.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Celebration Toast with XP and Next Step */}
      {celebrating && (() => {
        const connectedCount = PLATFORM_LIST.filter(p => preferences.connections?.[p]?.connected || p === celebrating).length;
        const remaining = PLATFORM_LIST.length - connectedCount;
        const nextPlatform = PLATFORM_LIST.find(p => !preferences.connections?.[p]?.connected && p !== celebrating);
        
        return (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className="bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 max-w-xs">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl shrink-0">
                {PLATFORM_CONFIG[celebrating].icon}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm">{PLATFORM_CONFIG[celebrating].name} connected!</p>
                <p className="text-xs text-green-100">+50 XP for connecting your first channel</p>
                {remaining > 0 && nextPlatform && (
                  <p className="text-xs text-green-200 mt-0.5 truncate">
                    💡 Connect {PLATFORM_CONFIG[nextPlatform].name} too ({connectedCount}/{PLATFORM_LIST.length})
                  </p>
                )}
                {remaining === 0 && (
                  <p className="text-xs text-green-200 mt-0.5">🏆 All channels connected!</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnected={() => setShowWalletModal(false)}
      />
    </div>
  );
}
