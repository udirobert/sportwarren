"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { User, TrendingUp, Award, Shield } from 'lucide-react';
import { FormBadge } from './FormIndicator';
import type { PlayerAttributes, PlayerPosition } from '@/types';

interface PlayerCardProps {
  player: PlayerAttributes;
  showForm?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

// Position colors
const POSITION_COLORS: Record<PlayerPosition, string> = {
  GK: 'bg-orange-100 text-orange-700',
  DF: 'bg-blue-100 text-blue-700',
  MF: 'bg-green-100 text-green-700',
  ST: 'bg-red-100 text-red-700',
  WG: 'bg-purple-100 text-purple-700',
};

// Position names
const POSITION_NAMES: Record<PlayerPosition, string> = {
  GK: 'Goalkeeper',
  DF: 'Defender',
  MF: 'Midfielder',
  ST: 'Striker',
  WG: 'Winger',
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  showForm = true,
  compact = false,
  onClick 
}) => {
  // Calculate overall rating
  const overall = Math.round(
    player.skills.reduce((sum, s) => sum + s.rating, 0) / player.skills.length
  );

  // Get top 3 attributes
  const topSkills = [...player.skills]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Get player position from highest attribute
  const getPositionFromSkills = (): PlayerPosition => {
    const highestSkill = player.skills.reduce((max, s) => s.rating > max.rating ? s : max);
    if (highestSkill.skill.startsWith('gk_')) return 'GK';
    if (['defending', 'physical'].includes(highestSkill.skill)) return 'DF';
    if (['shooting', 'pace'].includes(highestSkill.skill)) return 'ST';
    if (['dribbling'].includes(highestSkill.skill)) return 'WG';
    return 'MF';
  };

  const position = getPositionFromSkills();

  if (compact) {
    return (
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900 truncate">{player.playerName}</h4>
              {showForm && <FormBadge form={player.form.current} size="sm" />}
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${POSITION_COLORS[position]}`}>
                {position}
              </span>
              <span className="text-gray-500">OVR {overall}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{player.xp.level}</div>
            <div className="text-xs text-gray-500">Lvl</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{player.playerName}</h3>
                {showForm && <FormBadge form={player.form.current} />}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-lg text-sm font-medium ${POSITION_COLORS[position]}`}>
                  {POSITION_NAMES[position]}
                </span>
                {player.verifiedStats && (
                  <span className="text-green-600 text-sm" title="Verified">✓</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getOverallColor(overall)}`}>
              {overall}
            </div>
            <div className="text-xs text-gray-500">OVR</div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{player.totalMatches}</div>
            <div className="text-xs text-gray-500">Matches</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{player.totalGoals}</div>
            <div className="text-xs text-gray-500">Goals</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{player.totalAssists}</div>
            <div className="text-xs text-gray-500">Assists</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">{player.xp.level}</div>
            <div className="text-xs text-gray-500">Level</div>
          </div>
        </div>

        {/* Top Attributes */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Top Attributes:</p>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((skill) => (
              <div 
                key={skill.skill} 
                className="flex items-center space-x-1 px-3 py-1.5 bg-gray-100 rounded-lg"
              >
                <span className="text-sm text-gray-600 capitalize">
                  {skill.skill.replace('_', ' ')}
                </span>
                <span className={`font-bold ${getAttributeColor(skill.rating)}`}>
                  {skill.rating}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Level Progress */}
        <div className="pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Level {player.xp.level}</span>
            <span className="text-sm text-gray-500">
              {player.xp.totalXP.toLocaleString()} / {player.xp.nextLevelXP.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
              style={{ width: `${(player.xp.totalXP / player.xp.nextLevelXP) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievements Preview */}
        {player.achievements.length > 0 && (
          <div className="flex items-center space-x-2 pt-2">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              {player.achievements.length} achievements
            </span>
            {player.achievements.slice(0, 3).map((a, i) => (
              <span 
                key={i} 
                className={`w-2 h-2 rounded-full ${getRarityColor(a.rarity)}`}
                title={a.title}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

// Squad list view
interface PlayerSquadListProps {
  players: PlayerAttributes[];
  onPlayerClick?: (player: PlayerAttributes) => void;
}

export const PlayerSquadList: React.FC<PlayerSquadListProps> = ({ 
  players, 
  onPlayerClick 
}) => {
  // Group by position
  const byPosition = players.reduce((acc, player) => {
    const highestSkill = player.skills.reduce((max, s) => s.rating > max.rating ? s : max);
    let position: PlayerPosition = 'MF';
    if (highestSkill.skill.startsWith('gk_')) position = 'GK';
    else if (['defending', 'physical'].includes(highestSkill.skill)) position = 'DF';
    else if (['shooting', 'pace'].includes(highestSkill.skill)) position = 'ST';
    else if (['dribbling'].includes(highestSkill.skill)) position = 'WG';

    if (!acc[position]) acc[position] = [];
    acc[position].push(player);
    return acc;
  }, {} as Record<PlayerPosition, PlayerAttributes[]>);

  const positionOrder: PlayerPosition[] = ['GK', 'DF', 'MF', 'WG', 'ST'];

  return (
    <div className="space-y-6">
      {positionOrder.map(position => {
        const positionPlayers = byPosition[position];
        if (!positionPlayers?.length) return null;

        return (
          <div key={position}>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${POSITION_COLORS[position].split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`} />
              {POSITION_NAMES[position]}s
              <span className="ml-2 text-sm font-normal text-gray-500">({positionPlayers.length})</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {positionPlayers.map(player => (
                <PlayerCard
                  key={player.address}
                  player={player}
                  compact
                  onClick={() => onPlayerClick?.(player)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper functions
function getOverallColor(rating: number): string {
  if (rating >= 90) return 'text-purple-600';
  if (rating >= 80) return 'text-green-600';
  if (rating >= 70) return 'text-yellow-600';
  return 'text-gray-600';
}

function getAttributeColor(rating: number): string {
  if (rating >= 90) return 'text-purple-600';
  if (rating >= 80) return 'text-green-600';
  if (rating >= 70) return 'text-yellow-600';
  if (rating >= 60) return 'text-orange-600';
  return 'text-red-600';
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary': return 'bg-yellow-400';
    case 'epic': return 'bg-purple-400';
    case 'rare': return 'bg-blue-400';
    default: return 'bg-gray-400';
  }
}
