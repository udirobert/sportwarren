"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PitchCanvas } from '@/components/squad/PitchCanvas';
import { motion, AnimatePresence } from 'framer-motion';
import { INTEL_LEVELS, type IntelLevel } from '@/lib/match/intel-disclosure';
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
  Shield,
  Sword
} from 'lucide-react';
import type { Formation, Player } from '@/types';

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
  /** Progressive Intel Level (0-4) */
  intelLevel?: IntelLevel;
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
  intelLevel = INTEL_LEVELS.FULL,
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
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

      {/* Win Probability Bar - Level 4 only */}
      <AnimatePresence>
        {intelLevel >= INTEL_LEVELS.FULL && homeWinPct !== undefined && awayWinPct !== undefined && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 py-4 border-b border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-medium text-gray-600 dark:text-gray-400">{homeWinPct}%</span>
              <span className="text-gray-400">Draw {drawPct}%</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">{awayWinPct}%</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${homeWinPct}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-blue-500" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${drawPct}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-gray-400" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${awayWinPct}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="h-full bg-red-500" 
              />
            </div>
            {confidence && (
              <p className="text-center text-xs text-gray-500 mt-2">
                {confidence.level === 'high' && <TrendingUp className="w-3 h-3 inline mr-1 text-green-500" />}
                {confidence.level === 'medium' && <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />}
                {confidence.label}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formation Comparison - Level 1+ */}
      {intelLevel >= INTEL_LEVELS.SQUAD ? (
        <div className="px-6 py-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-600" />
            Tactical Preview
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Home Formation */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
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
            </motion.div>

            {/* Away Formation */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
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
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="px-6 py-12 text-center bg-gray-50 dark:bg-gray-900/50">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Squad Intelligence Locked</h4>
          <p className="text-xs text-gray-500 mt-1">Check back in 5 days for likely lineups</p>
        </div>
      )}

      {/* Tactical Insight - Level 3+ */}
      <AnimatePresence>
        {intelLevel >= INTEL_LEVELS.TACTICAL && tacticalInsight && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-4 border-t border-gray-100 dark:border-gray-800"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scouting Report - Level 2+ */}
      <AnimatePresence>
        {intelLevel >= INTEL_LEVELS.SCOUTING && (scoutingReport || keyThreats.length > 0 || keyOpportunities.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-4 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="text-sm font-bold text-amber-900 dark:text-amber-100">Scouting Report</h5>
                  {scoutingReport && (
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">{scoutingReport}</p>
                  )}
                  
                  {keyThreats.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">Key Threats</p>
                      <ul className="space-y-1">
                        {keyThreats.map((threat, idx) => (
                          <li key={idx} className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                            <Sword className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                            {threat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {keyOpportunities.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider mb-1">Key Opportunities</p>
                      <ul className="space-y-1">
                        {keyOpportunities.map((opp, idx) => (
                          <li key={idx} className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                            <Target className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                            {opp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          {matchDate && (
            <Link href={`/match/preview?home=${encodeURIComponent(homeSquad)}&away=${encodeURIComponent(awaySquad)}`} className="flex-1">
              <Button size="sm" className="w-full">
                Full Preview
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      )}
    </Card>
  </motion.div>
);
};

export default MatchPreviewCard;