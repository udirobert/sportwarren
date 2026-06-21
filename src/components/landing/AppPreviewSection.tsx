/**
 * AppPreviewSection — V4 verdant register.
 *
 * "The app" moment — what playing in the system actually feels like.
 * Pitch background, dusk-paneled dashboard mockup with cream type.
 *
 * Note: the dashboard mockup here is forward-looking — it represents
 * what the dashboard will look like once the (app) shell migrates to
 * V4 cream + ink. The current in-app dashboard is still Tailwind dark
 * and will catch up in a later pass.
 */

"use client";

import React from 'react';
import { Monitor, Smartphone, Trophy, TrendingUp, Users, Target, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { PALETTE, TYPE, TRACKING, V4PaperGrain, V4ChalkLine } from '@/components/v4';

const features = [
  {
    icon: Trophy,
    title: 'Live Stats & XP',
    description: 'Every goal, assist, and clean sheet earns XP. Watch your attributes grow after each match.',
  },
  {
    icon: Target,
    title: 'Tactical Simulation',
    description: 'Set formations, assign roles, and simulate match outcomes before kickoff.',
  },
  {
    icon: TrendingUp,
    title: 'Player Progression',
    description: 'Six attributes (pace, shooting, passing, dribbling, defending, physical) that evolve with every game.',
  },
  {
    icon: Users,
    title: 'Squad Hub',
    description: 'Roster management, availability tracking, and team chemistry all in one place.',
  },
];

export const AppPreviewSection: React.FC = () => (
  <section
    aria-label="App preview"
    className="relative overflow-hidden py-16 sm:py-32"
    style={{
      background: `linear-gradient(180deg, ${PALETTE.dusk} 0%, #4a6428 18%, ${PALETTE.pitch} 50%, #4a6428 82%, ${PALETTE.dusk} 100%)`,
      color: PALETTE.cream,
    }}
  >
    <div
      className="absolute top-0 -right-4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-20"
      style={{ background: PALETTE.mustard }}
      aria-hidden="true"
    />
    <div
      className="absolute bottom-0 -left-4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-15"
      style={{ background: PALETTE.sage }}
      aria-hidden="true"
    />
    <V4PaperGrain opacity={0.09} zIndex={1} />
    <div className="absolute top-0 left-0 right-0 z-[2]" aria-hidden="true">
      <V4ChalkLine thickness={2} opacity={0.45} />
    </div>
    <div className="absolute bottom-0 left-0 right-0 z-[2]" aria-hidden="true">
      <V4ChalkLine thickness={2} opacity={0.45} />
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="text-center mb-10 sm:mb-16">
        <ScrollReveal>
          <div
            className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            style={{
              background: 'rgba(212,164,55,0.18)',
              border: `1px solid ${PALETTE.mustard}`,
              color: PALETTE.mustard,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              fontFamily: TYPE.mono,
            }}
          >
            <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>The App</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-[0.95]"
            style={{
              fontFamily: TYPE.display,
              letterSpacing: TRACKING.displayTight,
              textTransform: 'uppercase',
              color: PALETTE.cream,
            }}
          >
            Your <span style={{ color: PALETTE.mustard }}>Command Center</span>
          </h2>
          <p
            className="text-sm sm:text-base lg:text-xl max-w-3xl mx-auto"
            style={{ color: PALETTE.chalk, opacity: 0.9, fontFamily: TYPE.mono, lineHeight: 1.55 }}
          >
            Dashboard, match center, tactics board, and squad management — everything you need to run your team like a pro.
          </p>
        </ScrollReveal>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
        {features.map((feature, i) => (
          <ScrollReveal key={feature.title} delay={i * 100}>
            <div
              className="p-4 sm:p-6 lg:p-8 h-full transition-colors"
              style={{
                background: PALETTE.dusk,
                border: `1px solid rgba(244,237,224,0.18)`,
                borderLeft: `6px solid ${PALETTE.mustard}`,
              }}
            >
              <div
                className="w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center mb-3 sm:mb-4"
                style={{ background: 'rgba(212,164,55,0.18)' }}
              >
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: PALETTE.mustard }} />
              </div>
              <h3
                className="text-base sm:text-lg lg:text-xl font-bold mb-2"
                style={{
                  fontFamily: TYPE.display,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  color: PALETTE.cream,
                }}
              >
                {feature.title}
              </h3>
              <p
                className="text-xs sm:text-sm"
                style={{ color: PALETTE.chalk, opacity: 0.8, fontFamily: TYPE.mono, lineHeight: 1.55 }}
              >
                {feature.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Dashboard mockup — V4 cream paper on dusk panel.
          Forward-looking: this is what the in-app dashboard will
          look like once it migrates from Tailwind dark. */}
      <ScrollReveal delay={200}>
        <a href="/dashboard" className="block relative group cursor-pointer">
          <div
            className="relative overflow-hidden"
            style={{
              background: PALETTE.cream,
              border: `2px solid ${PALETTE.ink}`,
              color: PALETTE.ink,
            }}
          >
            <div className="relative p-4 sm:p-8">
              {/* Top bar */}
              <div
                className="flex items-center justify-between mb-6 pb-4"
                style={{ borderBottom: `1px solid rgba(0,0,0,0.1)` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ background: PALETTE.ink }}
                  >
                    <Target className="w-4 h-4" style={{ color: PALETTE.mustard }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: PALETTE.ink }}>SportWarren</div>
                    <div
                      className="text-[10px] uppercase"
                      style={{ letterSpacing: TRACKING.cap, color: PALETTE.inkLight, fontFamily: TYPE.mono }}
                    >
                      Dashboard
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold"
                    style={{ background: PALETTE.navy, color: PALETTE.cream, fontFamily: TYPE.mono }}
                  >
                    JD
                  </div>
                </div>
              </div>

              {/* Dashboard content mockup */}
              <div className="grid grid-cols-12 gap-4">
                {/* Sidebar stats */}
                <div className="col-span-12 md:col-span-4 space-y-3">
                  <div
                    className="p-4"
                    style={{
                      background: PALETTE.ink,
                      color: PALETTE.cream,
                      borderLeft: `4px solid ${PALETTE.mustard}`,
                    }}
                  >
                    <div className="text-[10px] uppercase mb-1" style={{ letterSpacing: TRACKING.cap, color: PALETTE.mustard, fontFamily: TYPE.mono }}>Level</div>
                    <div
                      className="text-3xl font-black"
                      style={{ fontFamily: TYPE.display, color: PALETTE.cream }}
                    >
                      12
                    </div>
                    <div className="w-full h-1.5 mt-2" style={{ background: 'rgba(244,237,224,0.15)' }}>
                      <div className="w-3/5 h-full" style={{ background: PALETTE.mustard }} />
                    </div>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      background: PALETTE.cream,
                      border: `1px solid ${PALETTE.ink}`,
                    }}
                  >
                    <div className="text-[10px] uppercase mb-1" style={{ letterSpacing: TRACKING.cap, color: PALETTE.inkLight, fontFamily: TYPE.mono }}>Season XP</div>
                    <div className="text-3xl font-black" style={{ fontFamily: TYPE.display, color: PALETTE.ink }}>2,450</div>
                    <div className="flex items-center gap-1 text-xs mt-1" style={{ color: PALETTE.sage, fontFamily: TYPE.mono }}>
                      <TrendingUp className="w-3 h-3" /> +340 this week
                    </div>
                  </div>
                  <div
                    className="p-4"
                    style={{
                      background: PALETTE.cream,
                      border: `1px solid ${PALETTE.ink}`,
                    }}
                  >
                    <div className="text-[10px] uppercase mb-1" style={{ letterSpacing: TRACKING.cap, color: PALETTE.inkLight, fontFamily: TYPE.mono }}>Matches</div>
                    <div className="text-3xl font-black" style={{ fontFamily: TYPE.display, color: PALETTE.ink }}>14</div>
                    <div className="text-xs" style={{ color: PALETTE.inkLight, fontFamily: TYPE.mono }}>8W - 3D - 3L</div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="col-span-12 md:col-span-8 space-y-3">
                  <div className="p-4" style={{ background: PALETTE.cream, border: `1px solid ${PALETTE.ink}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-bold" style={{ color: PALETTE.ink, fontFamily: TYPE.mono }}>Next Match</div>
                      <div className="text-[10px] uppercase" style={{ letterSpacing: TRACKING.cap, color: PALETTE.inkLight, fontFamily: TYPE.mono }}>Sat 4:00 PM</div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 flex items-center justify-center text-xs font-bold" style={{ background: PALETTE.navy, color: PALETTE.cream, fontFamily: TYPE.mono }}>FC</div>
                        <span className="text-sm font-bold" style={{ color: PALETTE.ink, fontFamily: TYPE.mono }}>FC Unity</span>
                      </div>
                      <div className="text-lg font-black" style={{ color: PALETTE.red, fontFamily: TYPE.display }}>VS</div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-sm font-bold" style={{ color: PALETTE.ink, fontFamily: TYPE.mono }}>SportWarren FC</span>
                        <div className="w-8 h-8 flex items-center justify-center text-xs font-bold" style={{ background: PALETTE.mustard, color: PALETTE.ink, fontFamily: TYPE.mono }}>SW</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4" style={{ background: PALETTE.cream, border: `1px solid ${PALETTE.ink}` }}>
                    <div className="text-sm font-bold mb-3" style={{ color: PALETTE.ink, fontFamily: TYPE.mono }}>Recent Matches</div>
                    <div className="space-y-2">
                      {[
                        { opponent: 'Red Lions', score: '4-2', result: 'W', xp: '+85' },
                        { opponent: 'City Rangers', score: '1-1', result: 'D', xp: '+50' },
                        { opponent: 'United FC', score: '3-0', result: 'W', xp: '+110' },
                      ].map((m) => {
                        const accent = m.result === 'W' ? PALETTE.sage : m.result === 'D' ? PALETTE.mustard : PALETTE.red;
                        return (
                          <div
                            key={m.opponent}
                            className="flex items-center justify-between py-1.5"
                            style={{ borderBottom: `1px solid rgba(0,0,0,0.06)` }}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-6 h-6 text-xs font-bold flex items-center justify-center"
                                style={{ background: accent, color: PALETTE.cream, fontFamily: TYPE.mono }}
                              >
                                {m.result}
                              </span>
                              <span className="text-sm" style={{ color: PALETTE.ink, fontFamily: TYPE.mono }}>{m.opponent}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold" style={{ color: PALETTE.ink, fontFamily: TYPE.mono }}>{m.score}</span>
                              <span className="text-xs" style={{ color: PALETTE.sage, fontFamily: TYPE.mono }}>{m.xp}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-6 flex items-center justify-center gap-2 text-sm group-hover:opacity-100 transition-opacity"
            style={{ color: PALETTE.chalk, opacity: 0.8, fontFamily: TYPE.mono, letterSpacing: TRACKING.capNarrow, textTransform: 'uppercase' }}
          >
            <span>Open the live dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </a>
      </ScrollReveal>
    </div>
  </section>
);
