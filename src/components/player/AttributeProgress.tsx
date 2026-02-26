"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import type { SkillRating, AttributeType } from '@/types';
import {
  ATTRIBUTE_NAMES,
  getAttributeColor,
  getAttributeTextColor,
  calculateAttributeProgress,
  calculateOverallRating,
  getTopAttributes,
} from '@/lib/utils';

interface AttributeProgressProps {
  skill: SkillRating;
  showHistory?: boolean;
}

export const AttributeProgress: React.FC<AttributeProgressProps> = ({ 
  skill, 
  showHistory = false 
}) => {
  const percentage = calculateAttributeProgress(skill.xp, skill.rating);
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
        
        {/* XP Label */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{skill.xp.toLocaleString()} XP</span>
          <span>{skill.xpToNextLevel.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Maxed Indicator */}
      {isMaxed && (
        <div className="text-xs text-purple-600 font-medium">
          ⭐ Maximum Rating Reached
        </div>
      )}

      {/* History Sparkline */}
      {showHistory && skill.history.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center space-x-1">
            {skill.history.map((rating, idx) => (
              <div
                key={idx}
                className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-bold ${
                  rating >= 80 ? 'bg-green-100 text-green-700' :
                  rating >= 70 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}
                title={`Match ${idx + 1}: ${rating}`}
              >
                {rating}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Last 5 match ratings</p>
        </div>
      )}
    </div>
  );
};

// Compact version for lists
interface AttributeBadgeProps {
  skill: SkillRating;
}

export const AttributeBadge: React.FC<AttributeBadgeProps> = ({ skill }) => {
  return (
    <div className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-lg">
      <span className="text-xs text-gray-600">{ATTRIBUTE_NAMES[skill.skill]}</span>
      <span className={`text-sm font-bold ${getAttributeTextColor(skill.rating)}`}>
        {skill.rating}
      </span>
    </div>
  );
};

// Overall rating display
interface OverallRatingProps {
  skills: SkillRating[];
  size?: 'sm' | 'md' | 'lg';
}

export const OverallRating: React.FC<OverallRatingProps> = ({ skills, size = 'md' }) => {
  const overall = calculateOverallRating(skills);
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center font-bold ${getAttributeColor(overall).replace('from-', 'bg-').replace(' to-', '-')}`}>
      <span className={getAttributeTextColor(overall)}>{overall}</span>
    </div>
  );
};

// Attributes Summary Card
interface AttributesSummaryProps {
  skills: SkillRating[];
  position?: string;
}

export const AttributesSummary: React.FC<AttributesSummaryProps> = ({ 
  skills, 
  position 
}) => {
  const overall = calculateOverallRating(skills);
  const topSkills = getTopAttributes(skills, 3);

  return (
    <Card>
      <div className="space-y-4">
        {/* Overall Rating */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
            {position && <p className="text-sm text-gray-600">{position}</p>}
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getAttributeTextColor(overall)}`}>
              {overall}
            </div>
            <div className="text-xs text-gray-500">Overall</div>
          </div>
        </div>

        {/* Top Attributes */}
        <div className="space-y-2">
          {topSkills.map((skill) => (
            <div key={skill.skill} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{ATTRIBUTE_NAMES[skill.skill]}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${getAttributeColor(skill.rating)}`}
                    style={{ width: `${skill.rating}%` }}
                  />
                </div>
                <span className={`text-sm font-bold ${getAttributeTextColor(skill.rating)}`}>
                  {skill.rating}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* All Attributes */}
        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            {skills.map((skill) => (
              <div key={skill.skill} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{ATTRIBUTE_NAMES[skill.skill]}</span>
                <span className={`font-medium ${getAttributeTextColor(skill.rating)}`}>
                  {skill.rating}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
