'use client';

import { useMemo } from 'react';
import {
  User,
  Zap,
  Target,
  TrendingUp,
  Award,
  Activity,
  Star,
  Shield,
  ChevronUp,
  Flame,
  Heart,
  Wind,
  Footprints,
  Brain,
  Eye,
  Hand,
} from 'lucide-react';
import type { MiniAppContext, PlayerContext } from './TelegramMiniAppShell';

interface TelegramPlayerProfileProps {
  context: MiniAppContext;
  onRefresh?: () => void;
}

// Attribute icon mapping
const ATTRIBUTE_ICONS: Record<string, typeof Zap> = {
  pace: Wind,
  shooting: Target,
  passing: Footprints,
  dribbling: Activity,
  defending: Shield,
  physical: Flame,
  gk_diving: Hand,
  gk_reflexes: Eye,
  gk_positioning: Brain,
  gk_handling: Hand,
  gk_kicking: Footprints,
};

// Attribute color mapping based on rating
function getAttributeColor(rating: number): string {
  if (rating >= 85) return 'text-emerald-400';
  if (rating >= 75) return 'text-lime-400';
  if (rating >= 65) return 'text-amber-400';
  if (rating >= 50) return 'text-orange-400';
  return 'text-rose-400';
}

function getAttributeBgColor(rating: number): string {
  if (rating >= 85) return 'bg-emerald-500';
  if (rating >= 75) return 'bg-lime-500';
  if (rating >= 65) return 'bg-amber-500';
  if (rating >= 50) return 'bg-orange-500';
  return 'bg-rose-500';
}

// Format attribute name for display
function formatAttributeName(attribute: string): string {
  return attribute
    .replace(/_/g, ' ')
    .replace(/gk /i, 'GK ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Calculate overall rating from attributes
function calculateOverall(attributes: PlayerContext['attributes']): number {
  if (attributes.length === 0) return 50;

  const sum = attributes.reduce((acc, attr) => acc + attr.rating, 0);
  return Math.round(sum / attributes.length);
}

// Attribute progress bar component
function AttributeBar({
  attribute,
  rating,
  xp,
  xpToNext,
}: {
  attribute: string;
  rating: number;
  xp: number;
  xpToNext: number;
}) {
  const Icon = ATTRIBUTE_ICONS[attribute.toLowerCase()] || Activity;
  const xpProgress = xpToNext > 0 ? Math.min((xp / xpToNext) * 100, 100) : 0;

  return (
    <div className="group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
            <Icon className={`h-3.5 w-3.5 ${getAttributeColor(rating)}`} />
          </div>
          <span className="text-xs font-medium text-slate-300">
            {formatAttributeName(attribute)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black ${getAttributeColor(rating)}`}>
            {rating}
          </span>
        </div>
      </div>

      {/* Main rating bar */}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getAttributeBgColor(rating)}`}
          style={{ width: `${rating}%` }}
        />
      </div>

      {/* XP progress to next level */}
      {xpToNext > 0 && (
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <span className="text-[9px] text-slate-500">
            {xp}/{xpToNext} XP
          </span>
        </div>
      )}
    </div>
  );
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color = 'cyan',
}: {
  icon: typeof Zap;
  label: string;
  value: string | number;
  subtext?: string;
  color?: 'cyan' | 'amber' | 'emerald' | 'purple' | 'rose';
}) {
  const colors = {
    cyan: 'from-cyan-900/30 bg-cyan-400/10 text-cyan-400',
    amber: 'from-amber-900/30 bg-amber-400/10 text-amber-400',
    emerald: 'from-emerald-900/30 bg-emerald-400/10 text-emerald-400',
    purple: 'from-purple-900/30 bg-purple-400/10 text-purple-400',
    rose: 'from-rose-900/30 bg-rose-400/10 text-rose-400',
  };

  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${colors[color].split(' ')[0]} to-slate-900/50 p-4`}>
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${colors[color].split(' ')[1]}`}>
        <Icon className={`h-4 w-4 ${colors[color].split(' ')[2]}`} />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
      {subtext && <p className="mt-0.5 text-[10px] text-slate-400">{subtext}</p>}
    </div>
  );
}

// Sharpness meter component
function SharpnessMeter({ value }: { value: number }) {
  const getSharpnessColor = () => {
    if (value >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', label: 'Peak' };
    if (value >= 60) return { text: 'text-lime-400', bg: 'bg-lime-500', label: 'Sharp' };
    if (value >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500', label: 'Moderate' };
    if (value >= 20) return { text: 'text-orange-400', bg: 'bg-orange-500', label: 'Rusty' };
    return { text: 'text-rose-400', bg: 'bg-rose-500', label: 'Unfit' };
  };

  const status = getSharpnessColor();

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Sharpness</span>
        </div>
        <span className={`text-xs font-bold ${status.text}`}>{status.label}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="h-3 overflow-hidden rounded-full bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${status.bg}`}
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
        <span className={`text-lg font-black ${status.text}`}>{value}%</span>
      </div>

      <p className="mt-2 text-[10px] text-slate-500">
        {value < 50 ? 'Log training or play matches to improve sharpness' : 'You\'re match ready!'}
      </p>
    </div>
  );
}

export function TelegramPlayerProfile({ context }: TelegramPlayerProfileProps) {
  const { player, squad } = context;

  // Calculate overall rating
  const overall = useMemo(() => {
    if (!player) return 50;
    return calculateOverall(player.attributes);
  }, [player]);

  // Get position label
  const positionLabel = useMemo(() => {
    if (!player?.position) return 'Unknown';
    const positions: Record<string, string> = {
      GK: 'Goalkeeper',
      DF: 'Defender',
      MF: 'Midfielder',
      WG: 'Winger',
      ST: 'Striker',
    };
    return positions[player.position] || player.position;
  }, [player?.position]);

  // Calculate XP to next level
  const xpProgress = useMemo(() => {
    if (!player) return { current: 0, toNext: 100, percentage: 0 };
    const baseXP = player.level * 500; // Simplified progression
    const toNext = baseXP;
    const current = player.totalXP % baseXP || player.seasonXP;
    return {
      current,
      toNext,
      percentage: Math.min((current / toNext) * 100, 100),
    };
  }, [player]);

  // If no player profile exists
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-2xl bg-slate-700/50 p-4">
          <User className="h-8 w-8 text-slate-500" />
        </div>
        <p className="text-sm font-medium text-white">Profile Not Set Up</p>
        <p className="mt-1 text-xs text-slate-500">Complete a match to create your player profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Player Card Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-900/20 via-slate-800/50 to-slate-900/50">
        {/* Decorative elements */}
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            {/* Avatar/Overall Circle */}
            <div className="relative">
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                <span className="text-3xl font-black text-white">{overall}</span>
                <span className="text-[10px] font-bold uppercase text-white/80">OVR</span>
              </div>
              {/* Level badge */}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white shadow-lg">
                {player.level}
              </div>
            </div>

            {/* Player Info */}
            <div className="flex-1">
              <h2 className="text-xl font-black text-white">
                {player.name || 'Player'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {positionLabel} • {squad.name}
              </p>

              {/* Level Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-amber-400">Level {player.level}</span>
                  <span className="text-slate-500">{xpProgress.current}/{xpProgress.toNext} XP</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                    style={{ width: `${xpProgress.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="mt-4 flex items-center justify-around rounded-xl bg-black/20 py-3">
            <div className="text-center">
              <p className="text-lg font-black text-white">{player.stats.matches}</p>
              <p className="text-[10px] text-slate-400">Matches</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-black text-white">{player.stats.goals}</p>
              <p className="text-[10px] text-slate-400">Goals</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-black text-white">{player.stats.assists}</p>
              <p className="text-[10px] text-slate-400">Assists</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-black text-amber-400">{player.totalXP.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">Total XP</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sharpness Meter */}
      <SharpnessMeter value={player.sharpness} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Target}
          label="Goals/Match"
          value={(player.stats.matches > 0 ? (player.stats.goals / player.stats.matches).toFixed(2) : '0.00')}
          subtext={`${player.stats.goals} total`}
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Season XP"
          value={player.seasonXP.toLocaleString()}
          subtext="This season"
          color="amber"
        />
        <StatCard
          icon={Award}
          label="Reputation"
          value={player.reputationScore}
          subtext={player.reputationScore >= 100 ? 'Good standing' : 'Needs improvement'}
          color={player.reputationScore >= 100 ? 'purple' : 'rose'}
        />
        <StatCard
          icon={Star}
          label="Contrib/Game"
          value={(player.stats.matches > 0 ? ((player.stats.goals + player.stats.assists) / player.stats.matches).toFixed(2) : '0.00')}
          subtext="G+A average"
          color="cyan"
        />
      </div>

      {/* Attributes Section */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <div className="border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attributes</span>
            </div>
            <span className="text-xs text-slate-500">{player.attributes.length} skills</span>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {player.attributes.length > 0 ? (
            player.attributes.map((attr) => (
              <AttributeBar
                key={attr.attribute}
                attribute={attr.attribute}
                rating={attr.rating}
                xp={attr.xp}
                xpToNext={attr.xpToNext}
              />
            ))
          ) : (
            <div className="py-4 text-center">
              <p className="text-xs text-slate-500">Play matches to unlock attribute tracking</p>
            </div>
          )}
        </div>
      </section>

      {/* Tips Card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-900/20 to-slate-900/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-400/10">
            <ChevronUp className="h-4 w-4 text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">Level Up Tips</p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
              <li>• Play and verify matches to earn XP</li>
              <li>• Scoring goals boosts Shooting attribute</li>
              <li>• Clean sheets improve Defending</li>
              <li>• Log training sessions for Sharpness</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TelegramPlayerProfile;
