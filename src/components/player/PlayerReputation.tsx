"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Shield, Trophy, Star, CheckCircle, TrendingUp, Award, Search, History, Zap, Brain, Cpu, Settings } from 'lucide-react';
import { usePlayerForm } from '@/hooks/player/usePlayerForm';
import { AttributeProgress, AttributesSummary } from './AttributeProgress';
import { FormIndicator, FormBadge } from './FormIndicator';
import type { PlayerAttributes as PlayerReputationData } from '@/types';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { buildAvatarPresentationFromPlayerAttributes } from '@/lib/avatar/adapters';
import { KiteVerificationBadge } from '@/components/ui/KiteVerificationBadge';
import { AttestationTimeline } from '@/components/ui/AttestationTimeline';
import { SoccerLoader } from '@/components/ui/SoccerLoader';

interface PlayerReputationProps {
  attributes: PlayerReputationData | null;
  loading?: boolean;
}

const ADVANCED_PREF_KEY = 'sw_reputation_advanced';

export const PlayerReputation: React.FC<PlayerReputationProps> = ({
  attributes,
  loading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'achievements' | 'endorsements' | 'scouts'>('overview');
  const [isAdvanced, setIsAdvanced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ADVANCED_PREF_KEY) === 'true';
  });
  const [showSample, setShowSample] = useState(false);
  const { form } = usePlayerForm(attributes);

  useEffect(() => {
    localStorage.setItem(ADVANCED_PREF_KEY, String(isAdvanced));
  }, [isAdvanced]);

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

  const displayAttributes = showSample ? SAMPLE_ATTRIBUTES : attributes;

  if (!displayAttributes) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No player data found</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">Verify your first match result to start building your reputation card and tracking skill progress.</p>
          <div className="flex justify-center gap-3">
            <Link href="/match">
              <Button>Play a Match</Button>
            </Link>
            <Button variant="outline" onClick={() => setShowSample(true)}>
              See Elite Player Sample
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const attributesToUse = displayAttributes;
  const reputationLevel = getReputationLevel(attributesToUse.reputationScore);
  const careerHighlights = attributesToUse.careerHighlights.slice(0, 3);
  const recentAchievements = attributesToUse.achievements.slice(0, 3);
  const endorsements = attributesToUse.endorsements ?? [];
  const scoutInterest = attributesToUse.professionalInterest ?? [];
  const seasonProgress = Math.min((attributesToUse.xp.seasonXP / attributesToUse.xp.nextLevelXP) * 100, 100);
  const avatarPresentation = buildAvatarPresentationFromPlayerAttributes(attributesToUse);

  const scoutXPToNext = attributesToUse.scoutTier === 'rookie' ? 100 : attributesToUse.scoutTier === 'trusted' ? 500 : null;
  const scoutProgress = scoutXPToNext ? Math.min((attributesToUse.scoutXP / scoutXPToNext) * 100, 100) : 100;

  const tabsToDisplay = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'skills', label: 'Skills', icon: TrendingUp },
    { key: 'achievements', label: 'Achievements', icon: Trophy },
    { key: 'twin', label: 'Digital Twin', icon: Brain },
    ...(isAdvanced ? [
      { key: 'endorsements', label: 'Endorsements', icon: Star },
      { key: 'scouts', label: 'Scout Interest', icon: Shield },
    ] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {showSample && (
        <div className="bg-blue-600 px-4 py-2 rounded-xl text-white flex items-center justify-between shadow-lg">
          <span className="text-sm font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Viewing Elite Player Sample — This is what your profile could look like after a successful season.
          </span>
          <button onClick={() => setShowSample(false)} className="text-xs font-black uppercase tracking-widest hover:text-blue-200">
            Exit Sample
          </button>
        </div>
      )}

      {/* Player Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <PlayerAvatar
              presentation={avatarPresentation}
              size="hero"
              showBadge={false}
            />
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{attributesToUse.playerName}</h1>
                <div className="flex items-center gap-2">
                  {attributesToUse.verifiedStats && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {attributesToUse.kitePassport && (
                    <KiteVerificationBadge 
                      passportId={attributesToUse.kitePassport.passportId} 
                      verified={attributesToUse.kitePassport.verified}
                    />
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2 font-mono truncate max-w-[150px]">{attributesToUse.address}</p>
              <div className="flex items-center space-x-2 flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${reputationLevel.bg} ${reputationLevel.color}`}>
                  {reputationLevel.level}
                </span>
                {isAdvanced && (
                  <span className="text-sm text-gray-600">
                    Rep: {attributesToUse.reputationScore.toLocaleString()}
                  </span>
                )}
                <FormBadge form={form.value} size="sm" />
                {isAdvanced && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    <Search className="w-3 h-3" />
                    Scout: {attributesToUse.scoutTier.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setIsAdvanced(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!isAdvanced ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Basic
              </button>
              <button
                onClick={() => setIsAdvanced(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isAdvanced ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Advanced
              </button>
            </div>

            {/* Level & XP & Scout XP */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{attributesToUse.xp.level}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-bold uppercase tracking-tighter">Level</div>
                </div>
                <div className="w-px h-10 bg-gray-300" />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Player XP</span>
                    <span className="text-[10px] font-bold text-blue-600">{Math.round(seasonProgress)}%</span>
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                      style={{ width: `${seasonProgress}%` }}
                    />
                  </div>
                  {isAdvanced && (
                    <div className="text-[9px] text-gray-500 mt-1 font-medium">
                      {attributesToUse.xp.seasonXP.toLocaleString()} / {attributesToUse.xp.nextLevelXP.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {isAdvanced && (
                <div className="flex items-center space-x-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">{attributesToUse.scoutXP}</div>
                    <div className="text-xs text-indigo-600/70 font-black uppercase tracking-tighter">Scout XP</div>
                  </div>
                  <div className="w-px h-10 bg-indigo-200" />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Reputation</span>
                      <span className="text-[10px] font-bold text-indigo-600">{Math.round(scoutProgress)}%</span>
                    </div>
                    <div className="w-32 bg-indigo-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full transition-all duration-500"
                        style={{ width: `${scoutProgress}%` }}
                      />
                    </div>
                    <div className="text-[9px] text-indigo-500 mt-1 font-medium">
                      {scoutXPToNext ? `${attributesToUse.scoutXP} / ${scoutXPToNext} XP` : 'MAX TIER'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{attributesToUse.totalMatches}</div>
            <div className="text-sm text-gray-600">Matches</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{attributesToUse.totalGoals}</div>
            <div className="text-sm text-gray-600">Goals</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{attributesToUse.totalAssists}</div>
            <div className="text-sm text-gray-600">Assists</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{attributesToUse.achievements.length}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabsToDisplay.map(({ key, label, icon: Icon }) => (
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
      {activeTab === 'twin' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <History className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Agentic History</h3>
                    <p className="text-xs text-gray-500">Cryptographically verifiable on-chain attestations</p>
                  </div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Scan Kite Chain
                </button>
              </div>

              <AttestationTimeline 
                attestations={attributesToUse.kitePassport?.attestations || []} 
              />
            </Card>
          </div>

          <div className="space-y-6">
            {/* Twin Status Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400">Autonomous Twin</h3>
                  <p className="text-[10px] text-gray-400">Kite AI Global Agent ID</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Agent Reputation</span>
                    <span className="text-xs font-black text-emerald-400">{attributesToUse.kitePassport?.reputation || 100}/1000</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full" 
                      style={{ width: `${(attributesToUse.kitePassport?.reputation || 100) / 10}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Weekly Budget</div>
                    <div className="text-sm font-black text-white">${attributesToUse.kitePassport?.weeklyBudgetUsdc || '5.00'} <span className="text-[8px] text-gray-400">USDC</span></div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                    <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">Spent (7d)</div>
                    <div className="text-sm font-black text-emerald-400">${attributesToUse.kitePassport?.spentUsdc || '0.00'} <span className="text-[8px] text-gray-400">USDC</span></div>
                  </div>
                </div>

                <div className="pt-2">
                  <button className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2">
                    <Settings className="w-3 h-3" />
                    Configure Twin Skills
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all">
                  <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest">Powered by Kite AI</span>
                </div>
              </div>
            </Card>

            {/* Tactical Intelligence Card */}
            <Card className="bg-emerald-600 border-emerald-500 text-white overflow-hidden relative">
               <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
               <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Tactical Intelligence</h3>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 mb-4 font-medium">
                  Your digital twin uses <span className="font-bold">x402 protocol</span> to autonomously hire scouts and analysts while you sleep.
                </p>
                <div className="flex items-center gap-2">
                  <SoccerLoader size={20} color1="white" color2="rgba(255,255,255,0.3)" color3="rgba(255,255,255,0.6)" />
                  <span className="text-[9px] font-black uppercase tracking-tighter animate-pulse">Analyzing Season Data...</span>
                </div>
               </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Card */}
          <FormIndicator attributes={attributesToUse} showChart={isAdvanced} />

          {/* Attributes Summary */}
          <AttributesSummary skills={attributesToUse.skills} position={attributesToUse.position} />

          {/* Career Highlights */}
          <Card className={!isAdvanced ? 'lg:col-span-2' : ''}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Highlights</h3>
            {careerHighlights.length > 0 ? (
              <div className={`grid ${!isAdvanced ? 'md:grid-cols-3' : 'grid-cols-1'} gap-3`}>
                {careerHighlights.map((highlight) => (
                  <div key={highlight.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{highlight.title}</h4>
                        {highlight.verified && <CheckCircle className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-sm text-gray-600">{highlight.description}</p>
                      {isAdvanced && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{highlight.date.toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPanel
                icon={Trophy}
                title="No verified highlights yet"
                description="Log and settle the first result to start building a real highlight reel."
              />
            )}
          </Card>

          {/* Recent Achievements */}
          {isAdvanced && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              {recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
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
              ) : (
                <EmptyPanel
                  icon={Award}
                  title="No live milestones yet"
                  description="The first verified matches, goals, and assists will start filling this panel."
                />
              )}
            </Card>
          )}
        </div>
      )}

      {activeTab === 'skills' && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Skill Ratings & Progress</h3>
            {!isAdvanced && <p className="text-xs text-gray-500 italic">Advanced stats hidden. Enable Advanced mode for detailed history.</p>}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {attributesToUse.skills.map((skill) => (
              <AttributeProgress key={skill.skill} skill={skill} showHistory={isAdvanced} />
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'achievements' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">All Achievements</h3>
          {attributesToUse.achievements.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {attributesToUse.achievements.map((achievement) => (
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
                  <p className="text-xs text-gray-600 dark:text-gray-300">Earned: {achievement.dateEarned?.toLocaleDateString() || 'Not yet earned'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={Award}
              title="No achievements unlocked yet"
              description="Use verified matches to turn live season progress into visible milestones."
            />
          )}
        </Card>
      )}

      {isAdvanced && activeTab === 'endorsements' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Player Endorsements</h3>
          {endorsements.length > 0 ? (
            <div className="space-y-4">
              {endorsements.map((endorsement, index) => (
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
                  <p className="text-xs text-gray-600 dark:text-gray-300">{endorsement.date.toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={Star}
              title="No endorsements yet"
              description="Endorsements appear once teammates, opponents, or officials have a reason to back your season."
            />
          )}
        </Card>
      )}

      {isAdvanced && activeTab === 'scouts' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Scout Interest</h3>
          {scoutInterest.length > 0 ? (
            <div className="space-y-4">
              {scoutInterest.map((interest, index) => (
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
                  <p className="text-xs text-gray-600 dark:text-gray-300">{interest.date.toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={Shield}
              title="No scout signal yet"
              description="Strong verified runs and rising reputation will turn this from empty to actionable."
            />
          )}
        </Card>
      )}
    </div>
  );
};

// Mock sample data for visualization
const SAMPLE_ATTRIBUTES: PlayerReputationData = {
  playerName: "Cristiano Junior",
  address: "0x7a...4e19",
  verifiedStats: true,
  reputationScore: 8450,
  position: "ST",
  totalMatches: 42,
  totalGoals: 28,
  totalAssists: 12,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cristiano",
  xp: { level: 18, seasonXP: 450, nextLevelXP: 1000, totalXP: 4500 },
  scoutXP: 380,
  scoutTier: "trusted",
  form: { current: 3, history: [7, 8, 6, 9, 7], trend: 'up' },
  skills: [
    { skill: "pace", rating: 88, xp: 40, xpToNextLevel: 100, maxRating: 99, verified: true, lastUpdated: new Date(), history: [85, 86, 88, 88, 88] },
    { skill: "shooting", rating: 92, xp: 80, xpToNextLevel: 100, maxRating: 99, verified: true, lastUpdated: new Date(), history: [89, 90, 91, 92, 92] },
    { skill: "passing", rating: 78, xp: 20, xpToNextLevel: 100, maxRating: 99, verified: true, lastUpdated: new Date(), history: [75, 76, 77, 78, 78] },
    { skill: "dribbling", rating: 85, xp: 60, xpToNextLevel: 100, maxRating: 99, verified: true, lastUpdated: new Date(), history: [82, 83, 84, 85, 85] },
    { skill: "defending", rating: 45, xp: 10, xpToNextLevel: 100, maxRating: 99, verified: true, lastUpdated: new Date(), history: [40, 42, 44, 45, 45] },
    { skill: "physical", rating: 82, xp: 30, xpToNextLevel: 100, maxRating: 99, verified: true, lastUpdated: new Date(), history: [78, 79, 81, 82, 82] },
  ],
  careerHighlights: [
    { id: "h1", title: "Hat-trick in Cup Final", description: "Scored 3 goals in a single verified match.", date: new Date(), verified: true },
    { id: "h2", title: "Season MVP", description: "Voted MVP by teammates for 5 matches in a row.", date: new Date(), verified: true },
    { id: "h3", title: "Golden Boot", description: "Most goals in the regional amateur league.", date: new Date(), verified: true },
  ],
  achievements: [
    { id: "a1", title: "Sharp Shooter", description: "10 goals scored from outside the box.", rarity: "rare", verified: true },
    { id: "a2", title: "Team Player", description: "Reached 10 verified assists.", rarity: "rare", verified: true },
    { id: "a3", title: "Marathon Man", description: "Ran 10km+ in 5 consecutive matches.", rarity: "epic", verified: true },
  ],
  endorsements: [
    { endorser: "Coach Alex", endorserRole: "coach", rating: 9, skill: "Shooting", comment: "Clinical finisher, always finds the space.", date: new Date(), verified: true },
    { endorser: "Opponent Captain", endorserRole: "opponent", rating: 8, skill: "Pace", comment: "Impossible to catch on the break.", date: new Date(), verified: true },
  ],
  professionalInterest: [
    { scoutName: "Regional Scout", organization: "City Football Group", interestLevel: "watching", notes: "Consistently outperforming peers. Strong physical profile.", date: new Date() },
  ],
};

const EmptyPanel = ({
  icon: Icon,
  title,
  description,
  sampleLabel,
  onSample,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  sampleLabel?: string;
  onSample?: () => void;
}) => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
    <Icon className="mx-auto h-5 w-5 text-gray-400" />
    <h4 className="mt-3 text-sm font-semibold text-gray-900">{title}</h4>
    <p className="mt-1 text-sm text-gray-600">{description}</p>
    {sampleLabel && onSample && (
      <button
        onClick={onSample}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
      >
        <Search className="w-3 h-3" />
        {sampleLabel}
      </button>
    )}
  </div>
);

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
