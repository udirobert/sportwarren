"use client";

import React, { useEffect, useState } from 'react';
import { Settings, Wallet, User, Bell, Link2, Check, X, Copy, LogOut, Trophy, Target, Star, MessageCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useMySquads } from '@/hooks/squad/useSquad';
import { usePlatformConnections } from '@/hooks/usePlatformConnections';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc-client';
import { WalletConnectModal } from '@/components/common/WalletConnectModal';
import { PlatformType, NotificationPreferences, PLATFORM_CONFIG } from '@/types';
import type { PlayerPosition } from '@/types';
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

const POSITION_OPTIONS: PlayerPosition[] = ['GK', 'DF', 'MF', 'WG', 'ST'];
const POSITION_LABELS: Record<PlayerPosition, string> = {
  GK: 'Goalkeeper',
  DF: 'Defender',
  MF: 'Midfielder',
  WG: 'Winger',
  ST: 'Striker',
};

function normalizeEditableName(name?: string | null): string {
  if (!name) {
    return '';
  }

  return /^Player_[a-z0-9]+$/i.test(name) ? '' : name;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');
  const [profilePosition, setProfilePosition] = useState<PlayerPosition>('MF');
  const { address, chain, balance, isGuest, hasAccount, hasWallet, loginMethod, authStatus, disconnect, isVerified } = useWallet();
  const { memberships } = useMySquads();
  const [notifications, setNotifications] = useState<NotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [copied, setCopied] = useState(false);
  const utils = trpc.useUtils();

  const primarySquad = memberships?.[0]?.squad;
  const { data: currentProfile, isLoading: currentProfileLoading } = trpc.player.getCurrentProfile.useQuery(
    undefined,
    { enabled: isVerified, staleTime: 30 * 1000 }
  );
  const updateProfileMutation = trpc.player.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.player.getCurrentProfile.invalidate();
      setProfileNotice('Profile updated. Your squad will now see your real name and preferred position.');
    },
    onError: (error) => {
      setProfileNotice(error.message || 'Could not update your profile.');
    },
  });
  const {
    connections,
    createTelegramLink,
    disconnectPlatform,
    isCreatingTelegramLink,
    isDisconnectingPlatform,
  } = usePlatformConnections({ squadId: primarySquad?.id });
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

  useEffect(() => {
    if (!currentProfile) {
      return;
    }

    setProfileName(normalizeEditableName(currentProfile.user?.name));
    setProfilePosition((currentProfile.user?.position as PlayerPosition | undefined) ?? 'MF');
  }, [currentProfile]);

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

  const handleConnect = async (platform: PlatformType) => {
    if (platform !== 'telegram') {
      return;
    }

    if (!primarySquad?.id) {
      setConnectionNotice('Create or join a squad before linking Telegram.');
      return;
    }

    if (!isVerified) {
      setConnectionNotice('Verify your wallet before linking Telegram to a squad.');
      return;
    }

    try {
      const result = await createTelegramLink();
      trackFeatureUsed('channel_connect', { platform, squad_id: primarySquad.id });
      setConnectionNotice('Telegram link created. Open the bot and tap Start to finish linking this squad chat.');

      if (typeof window !== 'undefined') {
        window.open(result.botUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      setConnectionNotice((error as Error).message || 'Telegram linking is unavailable right now.');
    }
  };

  const handleDisconnect = async (platform: PlatformType) => {
    try {
      await disconnectPlatform(platform);
      setConnectionNotice(`${PLATFORM_CONFIG[platform].name} was unlinked from this squad.`);
    } catch (error) {
      setConnectionNotice((error as Error).message || `Could not unlink ${PLATFORM_CONFIG[platform].name}.`);
    }
  };

  const handleSaveProfile = async () => {
    if (!isVerified) {
      setProfileNotice('Verify your wallet before saving your player identity.');
      return;
    }

    const trimmedName = profileName.trim();
    if (trimmedName.length < 2) {
      setProfileNotice('Use the name your squad will recognise tonight.');
      return;
    }

    setProfileNotice(null);
    await updateProfileMutation.mutateAsync({
      name: trimmedName,
      position: profilePosition,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 nav-spacer-top nav-spacer-bottom space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-900 dark:bg-gray-700 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage your account, connections, and preferences</p>
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
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Player Identity</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Claim the name and position that should appear when your squad sets tactics and logs tonight&apos;s match.
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {isVerified ? 'Ready' : 'Verify first'}
              </span>
            </div>

            {profileNotice && (
              <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
                updateProfileMutation.error
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-blue-200 bg-blue-50 text-blue-900'
              }`}>
                {profileNotice}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Display name
                </span>
                <input
                  type="text"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  placeholder={currentProfileLoading ? 'Loading...' : 'Your name on the pitch'}
                  disabled={!isVerified || updateProfileMutation.isPending}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                  Preferred position
                </span>
                <select
                  value={profilePosition}
                  onChange={(event) => setProfilePosition(event.target.value as PlayerPosition)}
                  disabled={!isVerified || updateProfileMutation.isPending}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {POSITION_OPTIONS.map((position) => (
                    <option key={position} value={position}>
                      {position} · {POSITION_LABELS[position]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => void handleSaveProfile()}
                loading={updateProfileMutation.isPending}
                disabled={!isVerified}
              >
                <User className="w-4 h-4 mr-2" />
                Save player identity
              </Button>
              {!isVerified && (
                <Button variant="outline" onClick={() => setShowWalletModal(true)}>
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Verify wallet first
                </Button>
              )}
            </div>
          </Card>

          {/* Account Summary */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Account</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
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
                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wide">Account Reference</p>
                <p className={`${hasWallet ? 'font-mono' : 'font-medium'} text-sm text-gray-900 dark:text-white`}>
                  {accountReference}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wide">Network</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{networkLabel}</p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wide">Verification</p>
                <p className={`font-medium ${needsVerification ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
                  {verificationLabel}
                </p>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wide">Yellow Rail</p>
                <p className={`font-medium ${hasYellowEligibleWallet && !needsVerification ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                  {yellowRailLabel}
                </p>
              </div>
            </div>

            {hasWallet && balance > 0 && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300 uppercase tracking-wide">Balance</p>
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
                    <p className="text-xs text-gray-600 dark:text-gray-300 capitalize">{memberships?.[0]?.role || 'Player'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-sm">Not a member of any squad yet</p>
            )}
          </Card>

          {/* Player Stats Summary */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Stats</h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">{currentProfile?.totalMatches ?? 0}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Matches</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Target className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">{currentProfile?.totalGoals ?? 0}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Goals</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MessageCircle className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">{currentProfile?.totalAssists ?? 0}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Assists</p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Star className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="text-xl font-bold text-gray-900 dark:text-white">{currentProfile?.level ?? 1}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Level</p>
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
            <div className="rounded-xl border border-blue-300 bg-blue-100 px-4 py-4 text-sm text-blue-900">
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
              <p className="text-sm text-gray-600 dark:text-gray-300">Link real messaging channels to the active squad instead of storing local-only connection flags</p>
            </div>
            {connectionNotice && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                {connectionNotice}
              </div>
            )}
            <div className="space-y-3">
              {(Object.keys(PLATFORM_CONFIG) as PlatformType[]).map(platform => {
                const info = PLATFORM_CONFIG[platform];
                const connection = connections[platform];
                const isConnected = connection?.connected;
                const isPending = connection?.status === 'pending';
                const actionDisabled = isCreatingTelegramLink || isDisconnectingPlatform;
                return (
                  <div key={platform} className={`p-4 border rounded-xl transition-all ${
                    isConnected
                      ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/20'
                      : isPending
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${info.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                          {info.icon}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{info.name}</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{info.description}</p>
                        </div>
                      </div>
                      {isConnected ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleDisconnect(platform)}
                          disabled={actionDisabled}
                          className="text-red-600 shrink-0"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Unlink
                        </Button>
                      ) : info.selfServe ? (
                        isPending && connection?.linkUrl ? (
                          <a
                            href={connection.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <Button size="sm" variant="outline" className="shrink-0">
                              <Link2 className="w-3 h-3 mr-1" />
                              Open Bot
                            </Button>
                          </a>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => void handleConnect(platform)}
                            disabled={actionDisabled}
                            className="shrink-0"
                          >
                            <Link2 className="w-3 h-3 mr-1" />
                            {isVerified ? 'Connect' : 'Verify Wallet'}
                          </Button>
                        )
                      ) : (
                        <div className="text-xs font-semibold text-gray-500 shrink-0">
                          Admin managed
                        </div>
                      )}
                    </div>
                    {(isConnected || isPending) && (
                      <div className="mt-3 pt-3 border-t border-green-200/50 dark:border-green-800/50">
                        <p className={`text-xs font-medium mb-2 ${
                          isConnected
                            ? 'text-green-700 dark:text-green-400'
                            : 'text-blue-700 dark:text-blue-300'
                        }`}>
                          {isConnected ? "You'll receive:" : 'Pending link:'}
                        </p>
                        <code className="block text-xs bg-gray-900 text-gray-100 p-2 rounded-lg overflow-x-auto">
                          {info.preview}
                        </code>
                        {connection?.username && (
                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                            Telegram username: @{connection.username}
                          </p>
                        )}
                        {isPending && platform === 'telegram' && (
                          <p className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                            Finish linking in Telegram, then this page will refresh automatically.
                          </p>
                        )}
                      </div>
                    )}
                    {!isConnected && !isPending && info.selfServe && (
                      <div className="mt-3 pt-3 border-t border-gray-200/70 dark:border-gray-700/70">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {primarySquad
                            ? isVerified
                              ? `This will link Telegram to ${primarySquad.name}.`
                              : 'Verify your wallet first so SportWarren can bind Telegram to the correct squad.'
                            : 'Create or join a squad before linking Telegram.'}
                        </p>
                      </div>
                    )}
                    {!info.selfServe && !isConnected && (
                      <div className="mt-3 pt-3 border-t border-gray-200/70 dark:border-gray-700/70">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          This channel is not self-serve in the current deployment. Keep Telegram as the user-facing path for now.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl border border-blue-300 dark:border-blue-700">
            <p className="text-sm text-blue-900 dark:text-blue-100">
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
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Choose which notifications you want to receive</p>
            <div className="space-y-1">
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
                    <p className="text-xs text-gray-600 dark:text-gray-300">{desc}</p>
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
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Choose which channels receive your notifications</p>
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
                <p className="text-sm text-gray-600 dark:text-gray-300">
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
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">Current State</div>
                <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{accountStatusLabel}</div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
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
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">Yellow Rail</div>
                <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">{yellowRailLabel}</div>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
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
            <Card className="border-blue-300 bg-blue-100">
              <p className="text-sm text-blue-900">
                Algorand wallets can still unlock SportWarren identity and protected data, but Yellow settlement currently requires Avalanche or Lens because the rail is EVM-based.
              </p>
            </Card>
          )}
        </div>
      )}

      <WalletConnectModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnected={() => setShowWalletModal(false)}
      />
    </div>
  );
}
