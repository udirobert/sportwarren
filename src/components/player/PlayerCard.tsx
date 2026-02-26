"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { User, TrendingUp, Award, Shield } from 'lucide-react';
import { FormBadge } from './FormIndicator';
import type { PlayerAttributes, PlayerPosition } from '@/types';
import {
  POSITION_COLORS,
  POSITION_NAMES,
  getOverallColor,
  getAttributeColor,
  getRarityBgColor,
  calculateOverallRating,
  getTopAttributes,
  detectPositionFromSkills,
} from '@/lib/utils';

interface PlayerCardProps {
  player: PlayerAttributes;
  showForm?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  showForm = true,
  compact = false,
  onClick 
}) => {
  // Calculate overall rating using centralized utility
  const overall = calculateOverallRating(player.skills);

  // Get top 3 attributes using centralized utility
  const topSkills = getTopAttributes(player.skills, 3);

  // Get player position from highest attribute using centralized utility
  const position = detectPositionFromSkills(player.skills) as PlayerPosition;

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
                className={`w-2 h-2 rounded-full ${getRarityBgColor(a.rarity)}`}
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
  // Group by position using centralized utility
  const byPosition = players.reduce((acc, player) => {
    const position = detectPositionFromSkills(player.skills) as PlayerPosition;

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
