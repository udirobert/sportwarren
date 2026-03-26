"use client";

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/common/EmptyState';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Shield,
  X,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { useMatchVerification } from '@/hooks/match/useMatchVerification';
import { useJourneyState } from '@/hooks/useJourneyState';
import { usePlatformConnections } from '@/hooks/usePlatformConnections';
import { trpc } from '@/lib/trpc-client';
import { getMatchStatusLabel } from '@/lib/match/summary';
import { buildTelegramDeepLink, buildTelegramShareUrl } from '@/lib/telegram/deep-links';

interface MatchVerificationProps {
  squadId?: string;
}

export const MatchVerification: React.FC<MatchVerificationProps> = ({ squadId }) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { memberships, hasAccount, hasWallet, isGuest, isVerified } = useJourneyState();
  const activeSquad = useMemo(
    () => memberships.find((membership) => membership.squad.id === squadId)?.squad ?? memberships[0]?.squad,
    [memberships, squadId],
  );
  const activeSquadId = activeSquad?.id;
  const { connections } = usePlatformConnections({ squadId: activeSquadId });
  const telegramConnected = connections.telegram?.connected;
  const {
    matches,
    pendingMatches,
    settledMatches,
    loading,
    error,
    verifyMatch,
  } = useMatchVerification(activeSquadId);
  const { data: currentProfile } = trpc.player.getCurrentProfile.useQuery(undefined, {
    enabled: isVerified,
    retry: false,
    staleTime: 30 * 1000,
  });
  const currentUserId = currentProfile?.userId;

  const disputedMatches = matches.filter((match) => match.status === 'disputed');

  const handleVerifyMatch = async (matchId: string, verified: boolean) => {
    try {
      setActiveAction(`${matchId}:${verified ? 'verify' : 'dispute'}`);
      await verifyMatch(matchId, verified);
    } finally {
      setActiveAction(null);
    }
  };

  const canVerify = (match: (typeof matches)[number]) => (
    match.status === 'pending' &&
    !!currentUserId &&
    !match.verifications.some((verification) => verification.verifierAddress === currentUserId)
  );

  const getStatusColor = (status: (typeof matches)[number]['status']) => {
    switch (status) {
      case 'verified':
      case 'finalized':
        return 'bg-green-100 text-green-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: (typeof matches)[number]['status']) => {
    switch (status) {
      case 'verified':
      case 'finalized':
        return CheckCircle2;
      case 'disputed':
        return X;
      case 'pending':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  if (!hasAccount || isGuest) {
    return (
      <Card>
        <EmptyState
          icon={Shield}
          title="Verification queue is locked in preview"
          description="Claim an account and join a squad to start reviewing live match submissions."
          actionLabel="Start your season"
          actionHref="/?connect=1"
        />
      </Card>
    );
  }

  if (!hasWallet || !isVerified) {
    return (
      <Card>
        <EmptyState
          icon={Shield}
          title="Verify wallet to load match review"
          description="The verification queue is a protected operational surface. Reconnect your wallet before reviewing or disputing results."
          actionLabel="Verify wallet"
          actionHref="/settings?tab=wallet"
        />
      </Card>
    );
  }

  if (!activeSquadId) {
    return (
      <Card>
        <EmptyState
          icon={Shield}
          title="No squad verification queue yet"
          description="Create or join a squad before reviewing results. The queue only exists once your club starts logging matches."
          actionLabel="Create squad"
          actionHref="/squad"
        />
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Verification</h1>
        <p className="text-gray-700 dark:text-gray-200">
          Review the live queue for {activeSquad?.name || 'your squad'} and turn submitted scorelines into settled results.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">{settledMatches.filter((match) => match.status === 'verified' || match.status === 'finalized').length}</div>
          <div className="text-sm text-gray-600">Settled Results</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingMatches.length}</div>
          <div className="text-sm text-gray-600">Pending Review</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-red-600">{disputedMatches.length}</div>
          <div className="text-sm text-gray-600">Disputed Results</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
          <div className="text-sm text-gray-600">Total Logged</div>
        </Card>
      </div>

      <Card>
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Verification Queue</h2>
            <p className="text-sm text-gray-600">
              Pending reviews stay at the top. Settled matches remain visible for audit and traceability.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Verification queue unavailable"
            description={error}
          />
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No matches to review yet"
            description="Once the squad submits scorelines, they will appear here for captain review and dispute handling."
            actionLabel="Open Match Center"
            actionHref="/match"
          />
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const StatusIcon = getStatusIcon(match.status);
              const verifiedCount = match.verifications.filter((verification) => verification.verified).length;
              const disputedCount = match.verifications.filter((verification) => !verification.verified).length;
              const isBusy = activeAction?.startsWith(match.id);

              return (
                <Card key={match.id} className="border-l-4 border-l-blue-500" hover>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{match.homeTeam}</div>
                          <div className="text-2xl font-bold text-green-600">{match.homeScore}</div>
                        </div>

                        <div className="text-gray-400 font-bold">VS</div>

                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{match.awayTeam}</div>
                          <div className="text-2xl font-bold text-red-600">{match.awayScore}</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <StatusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(match.status)}`}>
                            {getMatchStatusLabel(match.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 dark:text-gray-200 mb-3">
                        <span>Submitted by {match.submitter}</span>
                        <span>{match.timestamp.toLocaleString()}</span>
                        <span>{verifiedCount} verified • {disputedCount} disputed</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(verifiedCount / match.requiredVerifications) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-200">
                          {verifiedCount}/{match.requiredVerifications} confirmations
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:w-48">
                      {canVerify(match) ? (
                        <>
                          <button
                            onClick={() => handleVerifyMatch(match.id, true)}
                            disabled={loading || !!isBusy}
                            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>Verify</span>
                          </button>
                          <button
                            onClick={() => handleVerifyMatch(match.id, false)}
                            disabled={loading || !!isBusy}
                            className="flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Dispute</span>
                          </button>
                          {telegramConnected && (
                            <a
                              href={buildTelegramDeepLink({ tab: 'match', prefilled: { mode: 'verify', matchId: match.id } })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center space-x-2 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>Verify in Telegram</span>
                            </a>
                          )}
                        </>
                      ) : match.status === 'pending' ? (
                        <div className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700 dark:text-gray-200">
                          Awaiting another captain response or your prior review is already logged.
                        </div>
                      ) : null}

                      <a
                          href={buildTelegramShareUrl(
                            `⚽ ${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center space-x-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share to Telegram</span>
                        </a>

                      <button
                        onClick={() => setSelectedMatchId(selectedMatchId === match.id ? null : match.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {selectedMatchId === match.id ? 'Hide Details' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {selectedMatchId === match.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-3">Verification History</h4>
                      <div className="space-y-2">
                        {match.verifications.length > 0 ? (
                          match.verifications.map((verification, index) => (
                            <div key={`${match.id}-${index}`} className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {verification.verified ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <X className="w-4 h-4 text-red-600" />
                                )}
                                <span className="font-medium text-gray-900">{verification.verifier}</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  {verification.role}
                                </span>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-200">
                                {verification.timestamp.toLocaleString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-lg border border-dashed border-gray-200 px-4 py-5 text-center text-sm text-gray-700 dark:text-gray-200">
                            No captain responses logged yet.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
