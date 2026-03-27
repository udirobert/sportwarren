"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Star,
  Calendar
} from 'lucide-react';

interface MatchHypeProps {
  /** Match date */
  matchDate: Date;
  /** Home squad name */
  homeSquad: string;
  /** Away squad name */
  awaySquad: string;
  /** Home form (e.g. ['W', 'D', 'L']) */
  homeForm: string[];
  /** Away form */
  awayForm: string[];
  /** Home streak text */
  homeStreak?: { text: string; color: string; bg: string };
  /** Away streak text */
  awayStreak?: { text: string; color: string; bg: string };
  /** H2H dominance indicator */
  h2hDominance?: { text: string };
  /** Key player highlight */
  keyPlayer?: { name: string; team: 'home' | 'away'; reason: string };
  /** Tactical insight snippet */
  tacticalInsight?: string;
}

/**
 * Visual "hype" card for an upcoming match.
 * Consolidates scouting, form, and tactical predictions.
 */
const MatchHype = ({
  matchDate,
  homeSquad,
  awaySquad,
  homeForm,
  awayForm,
  homeStreak,
  awayStreak,
  h2hDominance,
  keyPlayer,
  tacticalInsight
}: MatchHypeProps) => {
  // Simple form score calculation
  const calculatePoints = (form: string[]) => {
    return form.reduce((acc, curr) => {
      if (curr === 'W') return acc + 3;
      if (curr === 'D') return acc + 1;
      return acc;
    }, 0);
  };

  const homeFormPoints = calculatePoints(homeForm.slice(0, 5));
  const awayFormPoints = calculatePoints(awayForm.slice(0, 5));

  return (
    <Card className="overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-950">
      {/* Visual Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-widest">Match Day</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-widest">
            {matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Matchup row */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="text-center flex-1">
            <h3 className="text-lg font-black text-gray-900 dark:text-white truncate">{homeSquad}</h3>
            {homeStreak && (
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${homeStreak.bg} ${homeStreak.color}`}>
                {homeStreak.text}
              </span>
            )}
          </div>
          <div className="px-4">
            <span className="text-2xl font-black text-gray-400 italic">VS</span>
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
        <div className="grid grid-cols-2 gap-8 mb-6">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Home Form</p>
            <div className="flex justify-center gap-1">
              {homeForm.slice(0, 5).map((result, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                    result === 'W' ? 'bg-green-500 text-white' :
                    result === 'D' ? 'bg-gray-400 text-white' :
                    'bg-red-500 text-white'
                  }`}
                >
                  {result}
                </div>
              ))}
              {homeForm.length === 0 && <span className="text-xs text-gray-400">No data</span>}
            </div>
            <p className="text-xs font-bold text-gray-500 text-center">{homeFormPoints} pts</p>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Away Form</p>
            <div className="flex justify-center gap-1">
              {awayForm.slice(0, 5).map((result, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${
                    result === 'W' ? 'bg-green-500 text-white' :
                    result === 'D' ? 'bg-gray-400 text-white' :
                    'bg-red-500 text-white'
                  }`}
                >
                  {result}
                </div>
              ))}
              {awayForm.length === 0 && <span className="text-xs text-gray-400">No data</span>}
            </div>
            <p className="text-xs font-bold text-gray-500 text-center">{awayFormPoints} pts</p>
          </div>
        </div>

        {/* Head to Head */}
        {h2hDominance && (
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 mb-6">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {h2hDominance.text}
            </span>
          </div>
        )}

        {/* Player to Watch */}
        {keyPlayer && (
          <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 p-4 border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">Player Spotlight</p>
                <p className="font-bold text-sm text-gray-900 dark:text-white">
                  {keyPlayer.name}
                  <span className="text-gray-400 font-normal"> ({keyPlayer.team === 'home' ? homeSquad : awaySquad})</span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{keyPlayer.reason}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tactical Insight */}
        {tacticalInsight && (
          <div className="mb-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 p-4 border border-blue-100/50 dark:border-blue-900/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">AI Staff Prep</p>
                <p className="text-xs text-blue-800 dark:text-blue-300 italic leading-relaxed">"{tacticalInsight}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Prediction */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Prediction</span>
          </div>
          <div className="flex items-center gap-1">
            {homeFormPoints > awayFormPoints && (
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">{homeSquad} Favored</span>
            )}
            {awayFormPoints > homeFormPoints && (
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">{awaySquad} Favored</span>
            )}
            {homeFormPoints === awayFormPoints && (
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Too Close to Call</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MatchHype;
