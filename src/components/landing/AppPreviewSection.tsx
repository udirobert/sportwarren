"use client";

import React from 'react';
import { Monitor, Smartphone, Trophy, TrendingUp, Users, Target, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const features = [
  {
    icon: Trophy,
    title: 'Live Stats & XP',
    description: 'Every goal, assist, and clean sheet earns XP. Watch your attributes grow after each match.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Target,
    title: 'Tactical Simulation',
    description: 'Set formations, assign roles, and simulate match outcomes before kickoff.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Player Progression',
    description: 'Six attributes (pace, shooting, passing, dribbling, defending, physical) that evolve with every game.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Users,
    title: 'Squad Hub',
    description: 'Roster management, availability tracking, and team chemistry all in one place.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
];

export const AppPreviewSection: React.FC = () => (
  <section aria-label="App preview" className="relative py-16 sm:py-32 bg-gray-900">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="text-center mb-10 sm:mb-16">
        <ScrollReveal>
          <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>The App</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6">
            Your <span className="text-green-400">Command Center</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto">
            Dashboard, match center, tactics board, and squad management — everything you need to run your team like a pro.
          </p>
        </ScrollReveal>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
        {features.map((feature, i) => (
          <ScrollReveal key={feature.title} delay={i * 100}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 hover:border-green-500/40 transition-all h-full">
              <div className={`w-10 sm:w-12 h-10 sm:h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-3 sm:mb-4`}>
                <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-sm text-gray-400">{feature.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Device mockup area */}
      <ScrollReveal delay={200}>
        <a
          href="/dashboard"
          className="block relative group cursor-pointer"
        >
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 via-transparent to-transparent" />
            <div className="relative p-4 sm:p-8">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">SportWarren</div>
                    <div className="text-xs text-gray-500">Dashboard</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                    JD
                  </div>
                </div>
              </div>

              {/* Dashboard content mockup */}
              <div className="grid grid-cols-12 gap-4">
                {/* Sidebar stats */}
                <div className="col-span-12 md:col-span-4 space-y-3">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Level</div>
                    <div className="text-2xl font-black text-white">12</div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-2">
                      <div className="w-3/5 h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Season XP</div>
                    <div className="text-2xl font-black text-white">2,450</div>
                    <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                      <TrendingUp className="w-3 h-3" /> +340 this week
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-xs text-gray-500 mb-1">Matches</div>
                    <div className="text-2xl font-black text-white">14</div>
                    <div className="text-xs text-gray-400">8W - 3D - 3L</div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="col-span-12 md:col-span-8 space-y-3">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold text-white">Next Match</div>
                      <div className="text-xs text-gray-500">Sat 4:00 PM</div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400">FC</div>
                        <span className="text-sm font-bold text-white">FC Unity</span>
                      </div>
                      <div className="text-lg font-black text-green-400">VS</div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-sm font-bold text-white">SportWarren FC</span>
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-400">SW</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-sm font-bold text-white mb-3">Recent Matches</div>
                    <div className="space-y-2">
                      {[
                        { opponent: 'Red Lions', score: '4-2', result: 'W', xp: '+85' },
                        { opponent: 'City Rangers', score: '1-1', result: 'D', xp: '+50' },
                        { opponent: 'United FC', score: '3-0', result: 'W', xp: '+110' },
                      ].map((m) => (
                        <div key={m.opponent} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${
                              m.result === 'W' ? 'bg-green-500/20 text-green-400' :
                              m.result === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>{m.result}</span>
                            <span className="text-sm text-gray-300">{m.opponent}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white">{m.score}</span>
                            <span className="text-xs text-green-400">{m.xp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors" />
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
            <span>Open the live dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>
      </ScrollReveal>
    </div>
  </section>
);
