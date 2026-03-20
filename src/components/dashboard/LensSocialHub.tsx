"use client";

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLens } from '@/contexts/LensContext';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Share2, Users, CheckCircle2, Globe, MessageSquare, Zap, ShieldCheck, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeasonSnapshot } from '@/hooks/useSeasonSnapshot';
import { describeMatchForSquad } from '@/lib/match/summary';
import { trpc } from '@/lib/trpc-client';

export const LensSocialHub: React.FC = () => {
  const { isAvailable, isConnected, profile, login, postMatchProof, error } = useLens();
  const { hasAccount, isGuest, loginMethod } = useWallet();
  const { venue, city } = useEnvironment();
  const [isSharing, setIsSharing] = useState(false);
  const [lastPubId, setLastPubId] = useState<string | null>(null);
  const {
    primarySquad,
    primarySquadId,
    latestSettledMatch,
    settledMatchesCount,
    pendingMatchesCount,
  } = useSeasonSnapshot(5);

  const isSocialUser = loginMethod === 'social';
  const latestSummary = latestSettledMatch ? describeMatchForSquad(latestSettledMatch, primarySquadId) : null;
  const { data: latestMatchDetails } = trpc.match.getById.useQuery(
    { id: latestSettledMatch?.id || '' },
    { enabled: !!latestSettledMatch?.id, staleTime: 30 * 1000 }
  );

  const shareContext = useMemo(() => {
    if (!latestSettledMatch || !latestSummary) {
      return null;
    }

    const resultLabel =
      latestSummary.result === 'W'
        ? 'Win'
        : latestSummary.result === 'D'
          ? 'Draw'
          : 'Loss';

    return {
      squadName: primarySquad?.name,
      opponent: latestSummary.opponent,
      homeScore: latestSettledMatch.homeScore ?? 0,
      awayScore: latestSettledMatch.awayScore ?? 0,
      resultLabel,
      venue: primarySquad?.homeGround || venue || 'Local ground',
      matchDate: latestSettledMatch.matchDate,
      workflowId: latestMatchDetails?.creResult?.workflowId || latestSettledMatch.id,
    };
  }, [latestMatchDetails?.creResult?.workflowId, latestSettledMatch, latestSummary, primarySquad?.homeGround, primarySquad?.name, venue]);

  const handleShareProof = async () => {
    if (!shareContext) {
      return;
    }

    setIsSharing(true);
    const pubId = await postMatchProof(shareContext);
    if (pubId) {
      setLastPubId(pubId);
    }
    setIsSharing(false);
  };

  return (
    <Card className="relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Share2 className="w-16 h-16" />
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#00501e] rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none mb-1">Social Layer</div>
            <h2 className="text-lg font-black text-gray-900 uppercase italic tracking-tight">Lens Hub</h2>
          </div>
        </div>
        {isConnected && (
          <div className="px-2 py-1 bg-green-100 border border-green-200 rounded-lg flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3 text-green-600" />
            <span className="text-xs font-black text-green-700 uppercase tracking-tighter">Lens Connected</span>
          </div>
        )}
      </div>

      {!hasAccount || isGuest ? (
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed font-semibold">
              Lens sharing becomes useful once you are running a real season. Claim an account first, then bring verified results into the social layer.
            </p>
          </div>
        </div>
      ) : !isAvailable ? (
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-900 leading-relaxed font-semibold">
              {error || 'Lens publishing is not enabled on this deployment.'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed font-semibold">
              Keep verified results inside SportWarren for now. The social layer will reopen once Lens is wired end-to-end instead of simulating posts.
            </p>
          </div>
        </div>
      ) : !isConnected ? (
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-600 leading-relaxed font-semibold">
              {isSocialUser
                ? 'You already have a social account. Link Lens to turn verified match history into a public grassroots feed.'
                : 'Connect Lens to publish real match proof and squad momentum into the broader football graph.'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={login}
              className={`w-full ${isSocialUser ? 'bg-green-600' : 'bg-[#00501e]'} hover:opacity-90 text-white rounded-xl py-6 flex items-center justify-center space-x-2 group/btn shadow-xl`}
            >
              <Globe className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
              <span className="font-black uppercase tracking-widest text-xs">
                {isSocialUser ? 'Link Lens' : 'Connect Lens'}
              </span>
            </Button>
            <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-widest">
              Share verified local football, not demo content
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-2xl border border-green-100">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.handle}
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-green-200 text-sm font-bold text-green-800 shadow-sm">
                {(profile?.handle || 'L').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">
                {profile?.handle}
              </h3>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified social identity</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-white rounded-lg border border-gray-100 text-center">
              <div className="text-xs font-black text-gray-900">{profile?.stats.totalFollowers || 0}</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Followers</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-100 text-center">
              <div className="text-xs font-black text-gray-900">{profile?.stats.totalPosts || 0}</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Posts</div>
            </div>
            <div className="p-2 bg-white rounded-lg border border-gray-100 text-center">
              <div className="text-xs font-black text-gray-900">{settledMatchesCount}</div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Verified Results</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share-Ready Proof</div>
                  <h3 className="mt-1 text-sm font-bold text-gray-900">
                    {shareContext
                      ? `${shareContext.resultLabel} ${shareContext.homeScore}-${shareContext.awayScore} vs ${shareContext.opponent}`
                      : 'No verified result ready to publish'}
                  </h3>
                  <p className="mt-1 text-xs text-gray-600">
                    {shareContext
                      ? `${shareContext.squadName || 'Your squad'} can publish the latest settled match. ${pendingMatchesCount > 0 ? `${pendingMatchesCount} more result${pendingMatchesCount === 1 ? '' : 's'} still need review.` : 'Queue is clear.'}`
                      : 'Finish and verify a match first. The social layer should only amplify settled proof.'}
                  </p>
                </div>
                <Trophy className="h-5 w-5 text-yellow-500 shrink-0" />
              </div>
            </div>

            <Button
              onClick={handleShareProof}
              disabled={isSharing || !shareContext}
              className="w-full bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest py-3 flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.02] transition-all disabled:scale-100 disabled:bg-gray-300"
            >
              {isSharing ? (
                <Zap className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 text-yellow-400" />
              )}
              <span>{shareContext ? 'Share Latest Verified Result' : 'No Result Ready'}</span>
            </Button>

            <AnimatePresence>
              {lastPubId && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-50 border border-blue-100 rounded-xl"
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Lens post submitted</span>
                  </div>
                  <p className="mt-2 text-xs text-blue-900 font-medium break-all">{lastPubId}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
            Active Chapter: {city} • {primarySquad?.homeGround || venue}
          </p>
        </div>
      )}
    </Card>
  );
};
