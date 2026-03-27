"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PitchCanvas } from '@/components/squad/PitchCanvas';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Target, 
  TrendingUp, 
  Zap,
  ArrowRight,
  Share2,
  Download,
  Clock,
  Shield,
  Sword
} from 'lucide-react';
import type { Formation, Player } from '@/types';
import { PLAY_STYLE_LABELS } from '@/lib/formations';

interface MatchPreviewCardProps {
  /** Home squad name */
  homeSquad: string;
  /** Away squad name */
  awaySquad: string;
  /** Scheduled match date */
  matchDate?: Date;
  /** Venue name */
  venue?: string;
  /** Home squad formation */
  homeFormation?: Formation;
  /** Away squad formation */
  awayFormation?: Formation;
  /** Home squad players for lineup */
  homePlayers?: Player[];
  /** Away squad players for lineup */
  awayPlayers?: Player[];
  /** Home squad lineup (player IDs) */
  homeLineup?: string[];
  /** Away squad lineup (player IDs) */
  awayLineup?: string[];
  /** Win probability for home */
  homeWinPct?: number;
  /** Win probability for away */
  awayWinPct?: number;
  /** Draw probability */
  drawPct?: number;
  /** Match preview/simulation summary */
  simulationSummary?: string;
  /** Pre-match tactical insight */
  tacticalInsight?: string;
  /** Is this a rivalry match? */
  isRivalry?: boolean;
  /** Rivalry details (e.g., "Local derby", "Title decider") */
  rivalryContext?: string;
  /** Scouting report narrative about the opponent */
  scoutingReport?: string;
  /** Key threats identified by scouting */
  keyThreats?: string[];
  /** Key opportunities identified by scouting */
  keyOpportunities?: string[];
  /** Days until match */
  daysUntil?: number;
  /** Loading state */
  loading?: boolean;
  /** Callback when share is clicked */
  onShare?: () => void;
  /** Callback when export is clicked */
  onExport?: () => void;
  /** Hide action buttons */
  readOnly?: boolean;
}

export const MatchPreviewCard: React.FC<MatchPreviewCardProps> = ({
  homeSquad,
  awaySquad,
  matchDate,
  venue,
  homeFormation = '4-4-2',
  awayFormation = '4-4-2',
  homePlayers = [],
  awayPlayers = [],
  homeLineup = [],
  awayLineup = [],
  homeWinPct,
  awayWinPct,
  drawPct,
  simulationSummary,
  tacticalInsight,
  isRivalry = false,
  rivalryContext,
  scoutingReport,
  keyThreats = [],
  keyOpportunities = [],
  daysUntil,
  loading = false,
  onShare,
  onExport,
  readOnly = false,
}) => {
  const formattedDate = useMemo(() => {
    if (!matchDate) return 'Date TBD';
    return new Date(matchDate).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [matchDate]);

  const daysText = useMemo(() => {
    if (daysUntil === undefined) return null;
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `in ${daysUntil} days`;
  }, [daysUntil]);

  const favorite = useMemo(() => {
    if (homeWinPct === undefined || awayWinPct === undefined) return null;
    if (homeWinPct > awayWinPct) return { team: 'home', margin: homeWinPct - awayWinPct };
    if (awayWinPct > homeWinPct) return { team: 'away', margin: awayWinPct - homeWinPct };
    return { team: 'draw', margin: 0 };
  }, [homeWinPct, awayWinPct]);

  const confidence = useMemo(() => {
    if (!favorite) return null;
    if (favorite.margin > 30) return { level: 'high', label: 'Clear favorite' };
    if (favorite.margin > 15) return { level: 'medium', label: 'Slight edge' };
    return { level: 'low', label: 'Too close to call' };
  }, [favorite]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-96 bg-gray-200 rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header - Match Info */}
      <div className="bg-gradient-to-r from-green-900 to-emerald-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-100 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
            {daysText && (
              <>
                <span className="text-green-300">•</span>
                <span className="font-bold text-green-300">{daysText}</span>
              </>
            )}
          </div>
          {venue && (
            <div className="flex items-center gap-2 text-green-100 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{venue}</span>
            </div>
          )}
        </div>

        {/* Squad Names & Score Prediction */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-center flex-1">
            <h3 className="text-xl font-black text-white truncate max-w-[140px]">{homeSquad}</h3>
            <p className="text-xs text-green-300 mt-1">Home</p>
          </div>
          
          <div className="flex flex-col items-center px-6">
            {homeWinPct !== undefined && awayWinPct !== undefined ? (
              <div className="text-center">
                <div className="text-3xl font-black text-white">VS</div>
                <div className="text-xs text-green-200 mt-1">Prediction</div>
              </div>
            ) : (
              <div className="text-3xl font-black text-white">VS</div>
            )}
          </div>
          
          <div className="text-center flex-1">
            <h3 className="text-xl font-black text-white truncate max-w-[140px]">{awaySquad}</h3>
            <p className="text-xs text-green-300 mt-1">Away</p>
          </div>
        </div>

        {/* Rivalry Badge */}
        {isRivalry && (
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-400/30 rounded-full">
              <Sword className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold text-red-300 uppercase tracking-wider">Rivalry Match</span>
            </div>
          </div>
        )}

        {/* Rivalry Context */}
        {rivalryContext && (
          <div className="mt-3 text-center">
            <span className="text-xs font-medium text-red-200">{rivalryContext}</span>
          </div>
        )}
      </div>

      {/* Win Probability Bar */}
      {homeWinPct !== undefined && awayWinPct !== undefined && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-gray-600 dark:text-gray-400">{homeWinPct}%</span>
            <span className="text-gray-400">Draw {drawPct}%</span>
            <span className="font-medium text-gray-600 dark:text-gray-400">{awayWinPct}%</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${homeWinPct}%` }}
            />
            <div 
              className="h-full bg-gray-400" 
              style={{ width: `${drawPct}%` }}
            />
            <div 
              className="h-full bg-red-500" 
              style={{ width: `${awayWinPct}%` }}
            />
          </div>
          {confidence && (
            <p className="text-center text-xs text-gray-500 mt-2">
              {confidence.level === 'high' && <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />}
              {confidence.level === 'medium' && <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />}
              {confidence.label}
            </p>
          )}
        </div>
      )}

      {/* Formation Comparison */}
      <div className="px-6 py-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />
          Tactical Preview
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Home Formation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{homeFormation}</span>
              <span className="text-xs text-gray-400">{homeLineup.filter(Boolean).length} players</span>
            </div>
            <PitchCanvas
              formation={homeFormation}
              lineup={homeLineup}
              players={homePlayers}
              size="sm"
              readOnly={true}
            />
          </div>

          {/* Away Formation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{awayFormation}</span>
              <span className="text-xs text-gray-400">{awayLineup.filter(Boolean).length} players</span>
            </div>
            <PitchCanvas
              formation={awayFormation}
              lineup={awayLineup}
              players={awayPlayers}
              size="sm"
              readOnly={true}
            />
          </div>
        </div>
      </div>

      {/* Tactical Insight */}
      {tacticalInsight && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-blue-900 dark:text-blue-100">Tactical Insight</h5>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">{tacticalInsight}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Summary */}
      {simulationSummary && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-gray-900 dark:text-white">Match Prediction</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{simulationSummary}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <Button variant="outline" size="sm" onClick={onShare} className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href={`/match/preview?home=${encodeURIComponent(homeSquad)}&away=${encodeURIComponent(awaySquad)}`} className="flex-1">
            <Button size="sm" className="w-full">
              Full Preview
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};

export default MatchPreviewCard;