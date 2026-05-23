"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronDown, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import type { DashboardEntryAction } from '@/lib/dashboard/entry-state';

interface SquadMembership {
  squad: { id: string; name: string };
  role?: string;
}

interface DashboardHeaderProps {
  entryState: {
    eyebrow: string;
    headline: string;
    description: string;
    primaryAction: DashboardEntryAction;
    secondaryAction?: DashboardEntryAction;
    squadLabel: string;
    queueLabel: string;
    surfaceLabel: string;
  };
  avatarPresentation: any;
  currentProfile: { userId?: string; user: { avatar?: string | null; name?: string | null } } | null | undefined;
  address: string;
  isGuest: boolean;
  hasAccount: boolean;
  hasWallet: boolean;
  isVerified: boolean;
  venue: string;
  primarySquadId: string | null;
  primarySquadName: string | null;
  activeMembersCount: number;
  memberships: SquadMembership[];
  isSquadPickerOpen: boolean;
  setIsSquadPickerOpen: (open: boolean) => void;
  setActiveSquad: (id: string) => void;
  squadPickerRef: React.RefObject<HTMLDivElement | null>;
  authStatus: { state: string; isRefreshing: boolean };
  renderEntryAction: (action: DashboardEntryAction | undefined, tone: 'primary' | 'secondary') => React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  entryState,
  avatarPresentation,
  currentProfile,
  address,
  isGuest,
  hasAccount,
  hasWallet,
  isVerified,
  venue,
  primarySquadId,
  primarySquadName,
  activeMembersCount,
  memberships,
  isSquadPickerOpen,
  setIsSquadPickerOpen,
  setActiveSquad,
  squadPickerRef,
  renderEntryAction,
}) => {
  const entryAccountLabel = isGuest
    ? 'Guest preview'
    : hasWallet
      ? (isVerified ? 'Verified member' : 'Wallet connected')
      : 'Signed in';
  const entryWalletLabel = isGuest
    ? 'Preview only'
    : hasWallet
      ? (isVerified ? 'Verified' : 'Signature needed')
      : 'Not connected';
  const entrySquadLabel = primarySquadName
    ? `${primarySquadName}${memberships.find(m => m.squad.id === primarySquadId)?.role ? ` • ${memberships.find(m => m.squad.id === primarySquadId)!.role!.replace(/_/g, ' ')}` : ''}`
    : entryState.squadLabel;

  return (
    <div id="dashboard-header" className="mb-4">
      <Card className="overflow-hidden border-gray-200/80 bg-gradient-to-br from-white via-white to-gray-50 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-5">
              {avatarPresentation ? (
                <PlayerAvatar
                  presentation={avatarPresentation}
                  size="hero"
                  className="hidden md:inline-flex"
                />
              ) : (
                <Avatar
                  src={currentProfile?.user.avatar}
                  name={currentProfile?.user.name || address}
                  size="xl"
                  className="hidden md:block ring-4 ring-green-500/20"
                />
              )}
              <div className="min-w-0">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-green-600 dark:text-green-400">
                  {entryState.eyebrow}
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white md:text-4xl">
                  {entryState.headline}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300 md:text-base">
                  {entryState.description}
                </p>
                {avatarPresentation && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-300">
                    <span>Level {avatarPresentation.level}</span>
                    <span className="text-gray-300">•</span>
                    <span>{avatarPresentation.frameTier.replace('_', ' ')}</span>
                    {avatarPresentation.archetype && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="capitalize">{avatarPresentation.archetype}</span>
                      </>
                    )}
                    {avatarPresentation.badge && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span>{avatarPresentation.badge.label}</span>
                      </>
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  {isGuest ? (
                    <span>{venue} preview</span>
                  ) : primarySquadName ? (
                    memberships.length > 1 ? (
                      <div ref={squadPickerRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setIsSquadPickerOpen(!isSquadPickerOpen)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100"
                        >
                          {entrySquadLabel}
                          <ChevronDown className={`h-3 w-3 transition-transform ${isSquadPickerOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSquadPickerOpen && (
                          <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                            {memberships.map((m) => (
                              <button
                                key={m.squad.id}
                                type="button"
                                onClick={() => {
                                  setActiveSquad(m.squad.id);
                                  setIsSquadPickerOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                              >
                                <span className="flex-1 truncate">{m.squad.name}</span>
                                {m.squad.id === primarySquadId && (
                                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>{entrySquadLabel}</span>
                    )
                  ) : (
                    <span>{entryAccountLabel}</span>
                  )}
                  {hasWallet && address && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
                    </>
                  )}
                  {!hasWallet && hasAccount && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span>Wallet optional until you need protected actions</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {renderEntryAction(entryState.secondaryAction, 'secondary')}
              {renderEntryAction(entryState.primaryAction, 'primary')}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Account', value: entryAccountLabel },
              { label: 'Wallet', value: entryWalletLabel },
              { label: 'Squad', value: primarySquadName ? `${activeMembersCount || 1} active members` : entryState.squadLabel },
              { label: 'Next', value: entryState.queueLabel },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/70"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  {item.label}
                </div>
                <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
