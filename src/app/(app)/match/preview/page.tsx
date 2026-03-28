"use client";

import React, { useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MatchPreviewCard } from '@/components/match/MatchPreviewCard';
import { MatchEnginePreview } from '@/components/dashboard/MatchEnginePreview';
import { trpc } from '@/lib/trpc-client';
import { useActiveSquad } from '@/contexts/ActiveSquadContext';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { FORMATIONS, PLAY_STYLE_LABELS, TACTICAL_PRESETS } from '@/lib/formations';
import type { Formation, PlayStyle, Player } from '@/types';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Zap,
  Shield,
  Share2,
  Play,
  Settings,
  Clock,
  Trophy,
  Activity
} from 'lucide-react';

export default function MatchPreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <MatchPreviewContent />
    </Suspense>
  );
}

function MatchPreviewContent() {
  const searchParams = useSearchParams();
  const _router = useRouter();
  const { isGuest: _isGuest, isVerified: _isVerified } = useWallet();
  const { venue } = useEnvironment();
  const { activeSquad, activeSquadId } = useActiveSquad();

  // Get query params
  const homeSquadName = searchParams.get('home') || activeSquad?.squad?.name || 'Your Squad';
  const awaySquadName = searchParams.get('away') || 'Opponent';
  const _matchId = searchParams.get('match');

  // State for formation selection
  const [selectedFormation, setSelectedFormation] = useState<Formation>('4-4-2');
  const [selectedPlayStyle, setSelectedPlayStyle] = useState<PlayStyle>('balanced');
  const [showSimulation, setShowSimulation] = useState(false);

  // Fetch squad members for lineup
  const { data: squadData, isLoading: squadLoading } = trpc.squad.getById.useQuery(
    { id: activeSquadId || '' },
    { enabled: !!activeSquadId }
  );

  // Fetch match preview/simulation data
  const { data: previewData, isLoading: previewLoading, refetch: _refreshPreview } = trpc.match.preview.useQuery(
    { 
      homeSquadId: activeSquadId || '', 
      awaySquadId: 'opponent' // Would come from match or opponent selection
    },
    { 
      enabled: !!activeSquadId,
      staleTime: 1000 * 60 * 5,
    }
  );

  // Build lineup from squad members
  const players: Player[] = useMemo(() => {
    if (!squadData?.members) return [];
    return squadData.members
      .filter(m => m.user)
      .map(m => ({
        id: m.userId,
        name: m.user.name || 'Player',
        position: m.user.position || 'MF',
        status: 'available',
        avatar: m.user.avatar,
      })) as Player[];
  }, [squadData]);

  // Auto-build lineup when formation changes
  const lineup = useMemo(() => {
    const formationPositions = FORMATIONS[selectedFormation];
    const assigned = new Set<string>();
    return formationPositions.map((role) => {
      const candidates = players.filter(p => !assigned.has(p.id));
      // Simple auto-assign based on position match
      const rolePos = getRolePosition(role.role);
      const best = candidates.find(p => p.position === rolePos) || candidates[0];
      if (best) assigned.add(best.id);
      return best?.id || '';
    });
  }, [players, selectedFormation]);

// Helper to map tactical role to player position
function getRolePosition(role: string): string {
  if (['GK'].includes(role)) return 'GK';
  if (['LB', 'RB', 'CB', 'LWB', 'RWB'].includes(role)) return 'DF';
  if (['CM', 'CDM', 'CAM', 'LM', 'RM'].includes(role)) return 'MF';
  if (['ST', 'LW', 'RW'].includes(role)) return 'FW';
  return 'MF';
}

  // Calculate days until match (mock for now)
  const daysUntil = useMemo(() => {
    // In real app, this would come from scheduled match
    const matchDate = new Date();
    matchDate.setDate(matchDate.getDate() + 3); // 3 days from now
    const today = new Date();
    const diff = Math.ceil((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, []);

  // Win probabilities from preview data
  const winProbs = useMemo(() => {
    if (!previewData?.probability) return null;
    return {
      homeWinPct: Math.round(previewData.probability.homeWin * 100),
      awayWinPct: Math.round(previewData.probability.awayWin * 100),
      drawPct: Math.round(previewData.probability.draw * 100),
    };
  }, [previewData]);

  // Tactical insight based on formation
  const tacticalInsight = useMemo(() => {
    const insights: Partial<Record<Formation, string>> = {
      '4-4-2': 'Classic balanced formation. Good for maintaining shape and hitting on the counter.',
      '4-3-3': 'Attacking formation with width. Press high and create overloads on the flanks.',
      '4-2-3-1': 'Defensive solidity with creative play through the middle. Control the game.',
      '3-5-2': 'Aggressive with wingbacks. Overload the midfield and dominate possession.',
      '5-3-2': 'Defensive deep. Absorb pressure and hit on the break.',
      '4-5-1': 'Compact and counter-attacking. Let them have the ball and punish mistakes.',
      '4-1-4-1': 'Defensive midfielder protects the back four. Solid and structured.',
      '3-4-3': 'High intensity. Press aggressively and create chances through the middle.',
      '4-3-1-2': 'Two strikers with a playmaker behind. Technical and creative.',
      '5-4-1': 'Defensive with width. Stay compact and use wide players for transitions.',
    };
    return insights[selectedFormation] || 'Balanced approach.';
  }, [selectedFormation]);

  // Handle share
  const handleShare = async () => {
    const shareData = {
      title: `${homeSquadName} vs ${awaySquadName}`,
      text: `Check out our match preview! Playing ${selectedFormation} formation.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Handle export (download as image)
  const handleExport = async () => {
    // Would use html-to-image to export the preview card
    console.log('Exporting match preview...');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Match Preview
          </h1>
          <p className="text-green-200 mt-1">
            {homeSquadName} vs {awaySquadName}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Match Preview Card */}
        <MatchPreviewCard
          homeSquad={homeSquadName}
          awaySquad={awaySquadName}
          matchDate={new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000)}
          venue={venue}
          homeFormation={selectedFormation}
          awayFormation="4-4-2"
          homePlayers={players}
          awayPlayers={[]}
          homeLineup={lineup}
          awayLineup={[]}
          homeWinPct={winProbs?.homeWinPct}
          awayWinPct={winProbs?.awayWinPct}
          drawPct={winProbs?.drawPct}
          tacticalInsight={tacticalInsight}
          isRivalry={false}
          daysUntil={daysUntil}
          loading={squadLoading || previewLoading}
          onShare={handleShare}
          onExport={handleExport}
        />

        {/* Formation Selector */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Customize Formation
            </h3>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
            {(Object.keys(FORMATIONS) as Formation[]).map((formation) => (
              <button
                key={formation}
                onClick={() => setSelectedFormation(formation)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  selectedFormation === formation
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-bold text-gray-900 dark:text-white">{formation}</span>
              </button>
            ))}
          </div>

          {/* Play Style */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Play Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(PLAY_STYLE_LABELS).map(([style, { name, description, icon }]) => (
                <button
                  key={style}
                  onClick={() => setSelectedPlayStyle(style as PlayStyle)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedPlayStyle === style
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tactical Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TACTICAL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedFormation(preset.formation);
                    setSelectedPlayStyle(preset.style);
                  }}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:border-green-500 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">{preset.name}</span>
                    <span className="text-xs text-gray-500">{preset.formation}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Interactive Match Simulation */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Match Simulation
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSimulation(!showSimulation)}
            >
              {showSimulation ? 'Hide' : 'Preview'}
            </Button>
          </div>

          {showSimulation ? (
            <MatchEnginePreview
              squadId={activeSquadId}
              formation={selectedFormation}
              playersPerSide={11}
            />
          ) : (
            <div className="text-center py-8">
              <Play className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">
                See how your squad performs with the {selectedFormation} formation
              </p>
              <Button onClick={() => setShowSimulation(true)}>
                <Zap className="w-4 h-4 mr-2" />
                Run Simulation
              </Button>
            </div>
          )}
        </Card>

        {/* Pre-Match Hype */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Match Day Hype
          </h3>
          
          <div className="space-y-4">
            {/* Countdown */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Kick-off</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `in ${daysUntil} days`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Next match scheduled</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {new Date(Date.now() + daysUntil * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>

            {/* Squad Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900 dark:text-white">Squad Ready</span>
                </div>
                <p className="text-2xl font-black text-blue-600">{players.length}</p>
                <p className="text-xs text-gray-500">players available</p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="font-bold text-gray-900 dark:text-white">Formation</span>
                </div>
                <p className="text-2xl font-black text-purple-600">{selectedFormation}</p>
                <p className="text-xs text-gray-500">{PLAY_STYLE_LABELS[selectedPlayStyle]?.name}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Preview
          </Button>
          <Link href="/squad?tab=tactics" className="flex-1">
            <Button variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Full Tactics
            </Button>
          </Link>
        </div>

        {/* CTA to log match */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-3">
            After the match, come back to log the result
          </p>
          <Link href="/match?mode=capture">
            <Button>
              Log Match Result
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
