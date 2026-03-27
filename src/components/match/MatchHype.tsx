"use client";

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap,
  Shield,
  Sword,
  Users,
  Flame,
  Star,
  Calendar,
  MapPin
} from 'lucide-react';

interface MatchHypeProps {
  /** Match date */
  matchDate: Date;
  /** Home squad name */
  homeSquad: string;
  /** Away squad name */
  awaySquad: string;
  /** Venue */
  venue?: string;
  /** Home squad recent form (W/D/L array) */
  homeForm?: ('W' | 'D' | 'L')[];
  /** Away squad recent form (W/D/L array) */
  awayForm?: ('W' | 'D' | 'L')[];
  /** Head to head record for home */
  h2hHomeWins?: number;
  /** Head to head record for away */
  h2hAwayWins?: number;
  /** Head to head draws */
  h2hDraws?: number;
  /** Is this a rivalry match */
  isRivalry?: boolean;
  /** Rivalry name (e.g., "North vs South") */
  rivalryName?: string;
  /** Key player to watch */
  keyPlayer?: { name: string; team: 'home' | 'away'; reason: string };
  /** Tactical insight */
  tacticalInsight?: string;
  /** Loading state */
  loading?: boolean;
}

/**
 * MatchHype - Pre-match excitement UI component
 * Displays countdown, rivalry indicators, form, and scouting info
 */
export const MatchHype: React.FC<MatchHypeProps> = ({
  matchDate,
  homeSquad,
  awaySquad,
  venue,
  homeForm = [],
  awayForm = [],
  h2hHomeWins = 0,
  h2hAwayWins = 0,
  h2hDraws = 0,
  isRivalry = false,
  rivalryName,
  keyPlayer,
  tacticalInsight,
  loading = false,
}) => {
  // Calculate countdown
  const countdown = useMemo(() => {
    const now = new Date();
    const diff = matchDate.getTime() - now.getTime();
    
    if (diff <= 0) return { text: 'Today', value: 0, unit: 'match' };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return { text: `${days}d ${hours}h`, value: days, unit: 'days' };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, value: hours, unit: 'hours' };
    return { text: `${minutes}m`, value: minutes, unit: 'minutes' };
  }, [matchDate]);

  // Calculate form points
  const homeFormPoints = useMemo(() => {
    return homeForm.reduce((acc, r) => acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
  }, [homeForm]);

  const awayFormPoints = useMemo(() => {
    return awayForm.reduce((acc, r) => acc + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
  }, [awayForm]);

  // Form streak
  const homeStreak = useMemo(() => {
    const wins = homeForm.filter(r => r === 'W').length;
    const losses = homeForm.filter(r => r === 'L').length;
    if (wins >= 3) return { text: `${wins} wins`, color: 'text-green-500', bg: 'bg-green-500/20' };
    if (losses >= 3) return { text: `${losses} losses`, color: 'text-red-500', bg: 'bg-red-500/20' };
    return null;
  }, [homeForm]);

  const awayStreak = useMemo(() => {
    const wins = awayForm.filter(r => r === 'W').length;
    const losses = awayForm.filter(r => r === 'L').length;
    if (wins >= 3) return { text: `${wins} wins`, color: 'text-green-500', bg: 'bg-green-500/20' };
    if (losses >= 3) return { text: `${losses} losses`, color: 'text-red-500', bg: 'bg-red-500/20' };
    return null;
  }, [awayForm]);

  // H2H dominance
  const h2hDominance = useMemo(() => {
    const total = h2hHomeWins + h2hAwayWins + h2hDraws;
    if (total === 0) return null;
    if (h2hHomeWins > h2hAwayWins) return { team: 'home', text: `${homeSquad} leads ${h2hHomeWins}-${h2hAwayWins}` };
    if (h2hAwayWins > h2hHomeWins) return { team: 'away', text: `${awaySquad} leads ${h2hAwayWins}-${h2hHomeWins}` };
    return { team: 'draw', text: 'Even record' };
  }, [h2hHomeWins, h2hAwayWins, h2hDraws, homeSquad, awaySquad]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header with countdown */}
      <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 px-6 py-4 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/30 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Kick-off</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{countdown.text}</p>
            </div>
          </div>
          
          {isRivalry && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-400/30 rounded-full">
              <Sword className="w-4 h-4 text-red-500" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                {rivalryName || 'Rivalry'}
              </span>
            </div>
          )}
        </div>

        {/* Match info */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{matchDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
          </div>
          {venue && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{venue}</span>
            </div>
          )}
        </div>
      </div>

      {/* Teams comparison */}
      <div className="px-6 py-4 space-y-4">
        {/* Squad names */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">{homeSquad}</h3>
            {homeStreak && (
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${homeStreak.bg} ${homeStreak.color}`}>
                {homeStreak.text}
              </span>
            )}
          </div>
          <div className="px-4">
            <span className="text-2xl font-black text-gray-400">VS</span>
          </div>
          <div className="text-center flex-1">
            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">{awaySquad}</h3>
            {awayStreak && (
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${awayStreak.bg} ${awayStreak.color}`}>
                {awayStreak.text}
              </span>
            )}
          </div>
        </div>

        {/* Form indicators */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {homeForm.slice(0, 5).map((result, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  result === 'W' ? 'bg-green-500 text-white' :
                  result === 'D' ? 'bg-gray-400 text-white' :
                  'bg-red-500 text-white'
                }`}
              >
                {result}
              </div>
            ))}
          {homeForm.length === 0 && <span className="text-xs text-gray-400">No recent form</span>}
          <span className="text-xs font-bold text-gray-500">{homeFormPoints} pts</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {awayForm.slice(0, 5).map((result, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                  result === 'W' ? 'bg-green-500 text-white' :
                  result === 'D' ? 'bg-gray-400 text-white' :
                  'bg-red-500 text-white'
                }`}
              >
                {result}
              </div>
            ))}
            {awayForm.length === 0 && <span className="text-xs text-gray-400">No recent form</span>}
          <span className="text-xs font-bold text-gray-500">{awayFormPoints} pts</span>
        </div>

        {/* Head to Head */}
        {h2hDominance && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {h2hDominance.text}
            </span>
          </div>
        )}
      </div>

      {/* Key Player Spotlight */}
      {keyPlayer && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player to Watch</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {keyPlayer.name}
                <span className="text-gray-400 font-normal"> ({keyPlayer.team === 'home' ? homeSquad : awaySquad})</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{keyPlayer.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tactical Insight */}
      {tacticalInsight && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Scouting Report</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{tacticalInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* Match prediction */}
      <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Prediction</span>
          </div>
          <div className="flex items-center gap-1">
            {homeFormPoints > awayFormPoints && (
              <span className="text-sm font-bold text-green-600">{homeSquad} favored</span>
            )}
            {awayFormPoints > homeFormPoints && (
              <span className="text-sm font-bold text-green-600">{awaySquad} favored</span>
            )}
            {homeFormPoints === awayFormPoints && (
              <span className="text-sm font-bold text-gray-500">Too close to call</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MatchHype;