"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { User, Shield, Trophy, Star, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { usePlayerAttributes } from '@/hooks/player/usePlayerAttributes';
import { usePlayerForm } from '@/hooks/player/usePlayerForm';
import { AttributeProgress, AttributesSummary } from './AttributeProgress';
import { FormIndicator, FormBadge } from './FormIndicator';
import { XPGainPopup } from './XPGainPopup';
import type { PlayerAttributes as PlayerReputationData, Endorsement, ProfessionalInterest } from '@/types';

export const PlayerReputation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'achievements' | 'endorsements' | 'scouts'>('overview');
  const { attributes, loading } = usePlayerAttributes('ADDR_MARCUS_001');
  const { form } = usePlayerForm(attributes);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Loading player attributes...</p>
        </div>
      </div>
    );
  }

  if (!attributes) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-gray-600">No player data found</p>
        </div>
      </div>
    );
  }

  const reputationLevel = getReputationLevel(attributes.reputationScore);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* XP Gain Notifications */}
      <XPGainPopup />

      {/* Player Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{attributes.playerName}</h1>
                {attributes.verifiedStats && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">{attributes.address}</p>
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${reputationLevel.bg} ${reputationLevel.color}`}>
                  {reputationLevel.level}
                </span>
                <span className="text-sm text-gray-600">
                  Rep: {attributes.reputationScore.toLocaleString()}
                </span>
                <FormBadge form={form.value} size="sm" />
              </div>
            </div>
          </div>

          {/* Level & XP */}
          <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{attributes.xp.level}</div>
              <div className="text-xs text-gray-500">Level</div>
            </div>
            <div className="w-px h-10 bg-gray-300" />
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-700">{attributes.xp.totalXP.toLocaleString()}</span>
                <span className="text-xs text-gray-400">/ {attributes.xp.nextLevelXP.toLocaleString()} XP</span>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                  style={{ width: `${(attributes.xp.totalXP / attributes.xp.nextLevelXP) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Season: +{attributes.xp.seasonXP.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{attributes.totalMatches}</div>
            <div className="text-sm text-gray-600">Matches</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{attributes.totalGoals}</div>
            <div className="text-sm text-gray-600">Goals</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{attributes.totalAssists}</div>
            <div className="text-sm text-gray-600">Assists</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{attributes.achievements.length}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: User },
          { key: 'skills', label: 'Skills', icon: TrendingUp },
          { key: 'achievements', label: 'Achievements', icon: Trophy },
          { key: 'endorsements', label: 'Endorsements', icon: Star },
          { key: 'scouts', label: 'Scout Interest', icon: Shield },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all whitespace-nowrap ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <FormIndicator attributes={attributes} showChart />

          {/* Attributes Summary */}
          <AttributesSummary skills={attributes.skills} position="Striker" />

          {/* Career Highlights */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Highlights</h3>
            <div className="space-y-3">
              {attributes.careerHighlights.slice(0, 3).map((highlight) => (
                <div key={highlight.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{highlight.title}</h4>
                      {highlight.verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </div>
                    <p className="text-sm text-gray-600">{highlight.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{highlight.date.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {attributes.achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'skills' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Skill Ratings & Progress</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {attributes.skills.map((skill) => (
              <AttributeProgress key={skill.skill} skill={skill} showHistory />
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'achievements' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">All Achievements</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {attributes.achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <p className="text-xs text-gray-500">Earned: {achievement.dateEarned?.toLocaleDateString() || 'Not yet earned'}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'endorsements' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Player Endorsements</h3>
          <div className="space-y-4">
            {attributes.endorsements?.map((endorsement, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">{endorsement.endorser}</h4>
                      <p className="text-sm text-gray-600 capitalize">{endorsement.endorserRole}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{endorsement.rating}/10</div>
                    <div className="text-xs text-gray-600">{endorsement.skill}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">&ldquo;{endorsement.comment}&rdquo;</p>
                <p className="text-xs text-gray-500">{endorsement.date.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'scouts' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Scout Interest</h3>
          <div className="space-y-4">
            {attributes.professionalInterest?.map((interest, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{interest.scoutName}</h4>
                      <p className="text-sm text-gray-600">{interest.organization}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getInterestLevelColor(interest.interestLevel)}`}>
                    {interest.interestLevel.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">&ldquo;{interest.notes}&rdquo;</p>
                <p className="text-xs text-gray-500">{interest.date.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Helper functions
function getReputationLevel(score: number) {
  if (score >= 9000) return { level: 'Elite', color: 'text-purple-600', bg: 'bg-purple-100' };
  if (score >= 7500) return { level: 'Professional', color: 'text-blue-600', bg: 'bg-blue-100' };
  if (score >= 6000) return { level: 'Advanced', color: 'text-green-600', bg: 'bg-green-100' };
  if (score >= 4000) return { level: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
  return { level: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-100' };
}

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'legendary': return 'text-yellow-600 bg-yellow-100';
    case 'epic': return 'text-purple-600 bg-purple-100';
    case 'rare': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

function getInterestLevelColor(level: string) {
  switch (level) {
    case 'very_interested': return 'text-green-600 bg-green-100';
    case 'interested': return 'text-yellow-600 bg-yellow-100';
    case 'watching': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}
