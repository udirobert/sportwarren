"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import type { SkillRating, AttributeType } from '@/types';

interface AttributeProgressProps {
  skill: SkillRating;
  showHistory?: boolean;
}

// Attribute display names
const ATTRIBUTE_NAMES: Record<AttributeType, string> = {
  pace: 'Pace',
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
  gk_diving: 'GK Diving',
  gk_handling: 'GK Handling',
  gk_kicking: 'GK Kicking',
  gk_reflexes: 'GK Reflexes',
  gk_speed: 'GK Speed',
  gk_positioning: 'GK Positioning',
};

// Attribute color coding (FIFA style)
const getAttributeColor = (rating: number): string => {
  if (rating >= 90) return 'from-purple-500 to-purple-600';
  if (rating >= 80) return 'from-green-500 to-green-600';
  if (rating >= 70) return 'from-yellow-500 to-yellow-600';
  if (rating >= 60) return 'from-orange-500 to-orange-600';
  return 'from-red-500 to-red-600';
};

const getAttributeTextColor = (rating: number): string => {
  if (rating >= 90) return 'text-purple-600';
  if (rating >= 80) return 'text-green-600';
  if (rating >= 70) return 'text-yellow-600';
  if (rating >= 60) return 'text-orange-600';
  return 'text-red-600';
};

export const AttributeProgress: React.FC<AttributeProgressProps> = ({ 
  skill, 
  showHistory = false 
}) => {
  const percentage = (skill.xp / skill.xpToNextLevel) * 100;
  const isMaxed = skill.rating >= skill.maxRating;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">
            {ATTRIBUTE_NAMES[skill.skill]}
          </span>
          {skill.verified && (
            <span className="text-xs text-green-600" title="Verified on-chain">✓</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`text-lg font-bold ${getAttributeTextColor(skill.rating)}`}>
            {skill.rating}
          </span>
          <span className="text-sm text-gray-400">/ {skill.maxRating}</span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getAttributeColor(skill.rating)} transition-all duration-500`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        
        {/* XP Text */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">
            {isMaxed ? (
              <span className="text-purple-600 font-medium">MAX</span>
            ) : (
              <>
                <span className="font-medium text-gray-700">{skill.xp}</span>
                <span className="text-gray-400"> / {skill.xpToNextLevel} XP</span>
              </>
            )}
          </span>
          {!isMaxed && (
            <span className="text-xs text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>

      {/* History Sparkline */}
      {showHistory && skill.history.length > 0 && (
        <div className="flex items-center space-x-1 pt-1">
          <span className="text-xs text-gray-400 mr-2">Last 5:</span>
          {skill.history.slice(-5).map((rating, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                rating >= 80 ? 'bg-green-100 text-green-700' :
                rating >= 70 ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}
              title={`Match ${idx + 1}: ${rating}`}
            >
              {rating}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Compact version for cards
export const AttributeBadge: React.FC<{ skill: SkillRating }> = ({ skill }) => {
  return (
    <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg">
      <span className="text-sm text-gray-600">{ATTRIBUTE_NAMES[skill.skill]}</span>
      <span className={`font-bold ${getAttributeTextColor(skill.rating)}`}>
        {skill.rating}
      </span>
    </div>
  );
};

// Overall attributes summary card
interface AttributesSummaryProps {
  skills: SkillRating[];
  position?: string;
}

export const AttributesSummary: React.FC<AttributesSummaryProps> = ({ skills, position }) => {
  // Calculate overall rating (average of key attributes for position)
  const overall = Math.round(
    skills.reduce((sum, s) => sum + s.rating, 0) / skills.length
  );

  // Get top 3 attributes
  const topAttributes = [...skills]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Attributes</h3>
          {position && <p className="text-sm text-gray-500">{position}</p>}
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold ${getAttributeTextColor(overall)}`}>
            {overall}
          </div>
          <div className="text-xs text-gray-500">Overall</div>
        </div>
      </div>

      <div className="space-y-3">
        {skills.slice(0, 6).map((skill) => (
          <AttributeProgress key={skill.skill} skill={skill} />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-2">Top Attributes:</p>
        <div className="flex flex-wrap gap-2">
          {topAttributes.map((skill) => (
            <AttributeBadge key={skill.skill} skill={skill} />
          ))}
        </div>
      </div>
    </Card>
  );
};
