"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  ArrowRight,
  ArrowRightLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Shield,
  Sparkles,
  Target,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CoachKiteInsight } from './CoachKiteInsight';
import { useJourneyState } from '@/hooks/useJourneyState';
import { useMatchVerification } from '@/hooks/match/useMatchVerification';
import { useTransfers } from '@/hooks/squad/useTransfers';
import { useTreasury } from '@/hooks/squad/useTreasury';
import { getTreasuryStatus } from '@/lib/utils';

interface StaffMessage {
  id: string;
  sender: 'Coach Kite' | 'The Scout' | 'The Agent' | 'The Referee' | 'The Office';
  role: 'fitness' | 'tactical' | 'social' | 'regulatory' | 'contract';
  message: string;
  timestamp: Date;
  actionLabel?: string;
  actionHref?: string;
  priorityLevel: number;
}

interface StaffFeedProps {
  userId?: string;
  squadId?: string;
  onOpenStaffRoom?: () => void;
}

function formatTimestamp(timestamp: Date) {
  const diffMs = Date.now() - timestamp.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) {
    return 'Just now';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return timestamp.toLocaleDateString();
}

export const StaffFeed: React.FC<StaffFeedProps> = ({ userId, squadId, onOpenStaffRoom }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'priority'>('all');
  const { memberships, hasAccount, hasWallet, isGuest, isVerified } = useJourneyState();
  const { pendingMatches, settledMatches, loading: matchesLoading } = useMatchVerification(squadId);
  const { incomingOffers, loading: transfersLoading } = useTransfers(squadId);
  const { treasury, loading: treasuryLoading } = useTreasury(squadId);

  const activeSquad = useMemo(
    () => memberships.find((membership) => membership.squad.id === squadId)?.squad ?? memberships[0]?.squad,
    [memberships, squadId],
  );
  const latestSettledMatch = settledMatches[0];
  const { needsAttention: treasuryNeedsAttention, wageBudget, balance: treasuryBalance } = getTreasuryStatus(treasury);
  const loading = Boolean(squadId) && (matchesLoading || transfersLoading || treasuryLoading);

  const messages = useMemo<StaffMessage[]>(() => {
    const nextMessages: StaffMessage[] = [];

    if (!hasAccount || isGuest) {
      return [{
        id: 'preview-office',
        sender: 'The Office',
        role: 'social',
        message: 'The office is in preview until you claim an account. Start your own season to turn staff notes into live operations.',
        timestamp: new Date(),
        actionLabel: 'Start your season',
        actionHref: '/?connect=1',
        priorityLevel: 5,
      }];
    }

    if (!hasWallet || !isVerified || !userId) {
      return [{
        id: 'verify-office',
        sender: 'The Referee',
        role: 'regulatory',
        message: 'Protected staff reports stay locked until your wallet is verified. Reconnect identity so match, training, and treasury signals can sync.',
        timestamp: new Date(),
        actionLabel: 'Verify wallet',
        actionHref: '/settings?tab=wallet',
        priorityLevel: 5,
      }];
    }

    if (!squadId) {
      return [{
        id: 'no-squad-office',
        sender: 'The Agent',
        role: 'contract',
        message: 'The backroom comes online once you create or join a squad. That is what gives the office an actual season to manage.',
        timestamp: new Date(),
        actionLabel: 'Create squad',
        actionHref: '/squad',
        priorityLevel: 4,
      }];
    }

    if (pendingMatches.length > 0) {
      const firstPendingMatch = pendingMatches[0];
      nextMessages.push({
        id: 'pending-match',
        sender: 'The Referee',
        role: 'regulatory',
        message: `${pendingMatches.length} match ${pendingMatches.length === 1 ? 'report is' : 'reports are'} waiting in the verification queue. ${firstPendingMatch.homeTeam} vs ${firstPendingMatch.awayTeam} is first up.`,
        timestamp: firstPendingMatch.timestamp,
        actionLabel: 'Review queue',
        actionHref: firstPendingMatch.id ? `/match?mode=detail&matchId=${firstPendingMatch.id}` : '/match?mode=verify',
        priorityLevel: 5,
      });
    }

    if (incomingOffers.length > 0) {
      nextMessages.push({
        id: 'incoming-offers',
        sender: 'The Scout',
        role: 'contract',
        message: `${incomingOffers.length} transfer ${incomingOffers.length === 1 ? 'offer is' : 'offers are'} waiting for a response. The window stays honest only if the squad answers real business quickly.`,
        timestamp: incomingOffers[0]?.timestamp ?? new Date(),
        actionLabel: 'Review offers',
        actionHref: '/squad?tab=transfers',
        priorityLevel: 4,
      });
    }

    if (treasuryNeedsAttention) {
      nextMessages.push({
        id: 'treasury-attention',
        sender: 'The Agent',
        role: 'contract',
        message: `Treasury is carrying ${treasuryBalance.toLocaleString()} against a weekly wages budget of ${wageBudget.toLocaleString()}. Cash discipline needs attention before the next squad move.`,
        timestamp: treasury?.transactions?.[0]?.timestamp ?? new Date(),
        actionLabel: 'Open treasury',
        actionHref: '/squad?tab=treasury',
        priorityLevel: 4,
      });
    }

    if (latestSettledMatch) {
      const opponent = latestSettledMatch.homeTeam === activeSquad?.name ? latestSettledMatch.awayTeam : latestSettledMatch.homeTeam;
      const result =
        latestSettledMatch.homeScore === latestSettledMatch.awayScore
          ? 'drew'
          : (
              (latestSettledMatch.homeTeam === activeSquad?.name && latestSettledMatch.homeScore > latestSettledMatch.awayScore) ||
              (latestSettledMatch.awayTeam === activeSquad?.name && latestSettledMatch.awayScore > latestSettledMatch.homeScore)
            )
            ? 'won'
            : 'lost';

      nextMessages.push({
        id: 'latest-result',
        sender: 'Coach Kite',
        role: 'tactical',
        message: `${activeSquad?.name || 'Your squad'} ${result} ${latestSettledMatch.homeScore}-${latestSettledMatch.awayScore} against ${opponent}. Keep the match loop moving while the office context is fresh.`,
        timestamp: latestSettledMatch.timestamp,
        actionLabel: 'Open Match Center',
        actionHref: '/match?mode=history',
        priorityLevel: 3,
      });
    }

    if (nextMessages.length === 0) {
      nextMessages.push({
        id: 'office-clear',
        sender: 'The Office',
        role: 'social',
        message: `${activeSquad?.name || 'Your squad'} has no urgent backroom actions right now. Keep training, keep logging results, and the next signal will appear when it is real.`,
        timestamp: new Date(),
        actionLabel: 'Open Staff Room',
        actionHref: '/dashboard',
        priorityLevel: 2,
      });
    }

    return nextMessages;
  }, [
    activeSquad?.name,
    hasAccount,
    hasWallet,
    incomingOffers,
    isGuest,
    isVerified,
    latestSettledMatch,
    pendingMatches,
    squadId,
    treasury?.transactions,
    treasuryBalance,
    treasuryNeedsAttention,
    userId,
    wageBudget,
  ]);

  const visibleMessages = activeTab === 'priority'
    ? messages.filter((message) => message.priorityLevel >= 4)
    : messages;
  const unreadCount = messages.filter((message) => message.priorityLevel >= 4).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-2">
          <div className="bg-gray-900 p-1.5 rounded-lg border border-white/10">
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h2 className="section-title text-gray-500">Backroom Staff</h2>
            <p className="text-[10px] font-mono text-gray-400">
              {loading
                ? 'Synchronizing live reports from the office'
                : `${messages.length} live ${messages.length === 1 ? 'report' : 'reports'} from the office`}
            </p>
          </div>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Inbox
          </button>
          <button
            onClick={() => setActiveTab('priority')}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'priority' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Urgent {unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        </div>
      </div>

      {userId && hasWallet && isVerified ? (
        <CoachKiteInsight userId={userId} />
      ) : (
        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-blue-100 p-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Coach Kite Briefing Locked</h3>
              <p className="mt-1 text-sm text-gray-600">
                Verify your wallet and load a live player profile to unlock personalized coaching notes.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-3">
        {loading ? (
          [...Array(3)].map((_, idx) => (
            <Card key={idx} className="p-3 animate-pulse">
              <div className="h-4 w-32 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-full rounded bg-gray-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
            </Card>
          ))
        ) : (
          <AnimatePresence>
            {visibleMessages.map((message, idx) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Card className="p-3 border-l-2 border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 p-2 rounded-lg ${getIconBg(message.role)}`}>
                      {getIcon(message.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-tight text-gray-400">{message.sender}</span>
                        <span className="text-xs font-mono text-gray-400">{formatTimestamp(message.timestamp)}</span>
                      </div>
                      <p className="text-xs text-gray-700 font-medium leading-relaxed mt-1">
                        {message.message}
                      </p>
                      {message.actionLabel && message.actionHref && (
                        <Link
                          href={message.actionHref}
                          className="mt-2 inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 uppercase hover:text-blue-700 group"
                        >
                          <span>{message.actionLabel}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {!loading && visibleMessages.length === 0 && (
          <Card className="p-5 text-center border-dashed">
            <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
            <p className="mt-2 text-sm font-semibold text-gray-900">No urgent reports</p>
            <p className="mt-1 text-sm text-gray-600">
              The urgent queue is clear. Switch back to inbox to review lower-priority notes.
            </p>
          </Card>
        )}
      </div>

      <div className="pt-2 flex justify-center">
        {onOpenStaffRoom ? (
          <button
            type="button"
            onClick={onOpenStaffRoom}
            className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 flex items-center space-x-1 transition-colors"
          >
            <span>Go to Staff Room</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 flex items-center space-x-1 transition-colors"
          >
            <span>Go to Staff Room</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
};

const getIcon = (role: StaffMessage['role']) => {
  switch (role) {
    case 'fitness':
      return <Zap className="w-3 h-3 text-yellow-600" />;
    case 'tactical':
      return <Target className="w-3 h-3 text-purple-600" />;
    case 'social':
      return <Users className="w-3 h-3 text-blue-600" />;
    case 'contract':
      return <ArrowRightLeft className="w-3 h-3 text-sky-600" />;
    case 'regulatory':
      return <Shield className="w-3 h-3 text-orange-600" />;
    default:
      return <Wallet className="w-3 h-3 text-gray-600" />;
  }
};

const getIconBg = (role: StaffMessage['role']) => {
  switch (role) {
    case 'fitness':
      return 'bg-yellow-100';
    case 'tactical':
      return 'bg-purple-100';
    case 'social':
      return 'bg-blue-100';
    case 'contract':
      return 'bg-sky-100';
    case 'regulatory':
      return 'bg-orange-100';
    default:
      return 'bg-gray-100';
  }
};
