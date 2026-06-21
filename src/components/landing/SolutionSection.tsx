/**
 * SolutionSection — V4 verdant register.
 *
 * "The solution" is the GAME moment — the pitch, the energy, the
 * promise of what playing in the system feels like. Lives on a pitch
 * panel with chalk edges. Sister to ProblemSection (V3 cream) — the
 * narrative goes "the loss is real (cream paper)" → "the game is
 * back (pitch)."
 */

import React from 'react';
import { CheckCircle2, Trophy, Users, Sparkles, ArrowRight, TrendingUp, Target } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { PALETTE, TYPE, TRACKING, V4PaperGrain, V4ChalkLine } from '@/components/v4';

const coreFeatures = [
  { label: 'Build Your Card', Icon: Target },
  { label: 'Bring Your Squad', Icon: Users },
  { label: 'Log Real Matches', Icon: CheckCircle2 },
  { label: 'Watch Stats Grow', Icon: TrendingUp },
];

const impactItems = [
  { label: 'Verified Squad Stats', Icon: Users },
  { label: 'XP & Attribute Growth', Icon: TrendingUp },
  { label: 'Shareable Player Card', Icon: Sparkles },
  { label: 'Tournament Brackets', Icon: Trophy },
];

export const SolutionSection: React.FC = () => (
  <section
    aria-label="The solution"
    className="relative overflow-hidden py-16 sm:py-32"
    style={{
      // Same atmospheric verdant gradient as the hero — dusk →
      // pitch → dusk. The "solution" is the game returning, so it
      // gets the same atmospheric verdant register, not a flat block.
      background: `linear-gradient(180deg, ${PALETTE.dusk} 0%, #4a6428 18%, ${PALETTE.pitch} 50%, #4a6428 82%, ${PALETTE.dusk} 100%)`,
      color: PALETTE.cream,
    }}
  >
    <div
      className="absolute top-0 -left-4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-20"
      style={{ background: PALETTE.mustard }}
      aria-hidden="true"
    />
    <div
      className="absolute bottom-0 -right-4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-15"
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
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>The Solution</span>
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
            Build. <span style={{ color: PALETTE.mustard }}>Verify.</span> Grow.
          </h2>
          <p
            className="text-sm sm:text-base lg:text-xl max-w-3xl mx-auto"
            style={{
              color: PALETTE.chalk,
              opacity: 0.9,
              fontFamily: TYPE.mono,
              lineHeight: 1.55,
            }}
          >
            Your player card is the centre of everything. Build it, bring your squad to verify the stats, log real matches, and watch your attributes level up.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <ScrollReveal direction="left" className="space-y-4 sm:space-y-6">
            <h3
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6"
              style={{
                fontFamily: TYPE.display,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                color: PALETTE.cream,
              }}
            >
              The Card Lifecycle
            </h3>
            {coreFeatures.map((item) => (
              <div
                key={item.label}
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4"
                style={{
                  background: PALETTE.dusk,
                  border: `1px solid rgba(244,237,224,0.18)`,
                }}
              >
                <div
                  className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center"
                  style={{ background: 'rgba(244,237,224,0.08)' }}
                >
                  <item.Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: PALETTE.chalk }} aria-hidden="true" />
                </div>
                <span
                  className="text-sm sm:text-base lg:text-lg"
                  style={{ color: PALETTE.chalk, fontFamily: TYPE.mono }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </ScrollReveal>

          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <ArrowRight className="w-10 h-10 lg:w-12 lg:h-12 animate-pulse" style={{ color: PALETTE.mustard }} />
          </div>

          <ScrollReveal direction="right" className="space-y-4 sm:space-y-6">
            <h3
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6"
              style={{
                fontFamily: TYPE.display,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                color: PALETTE.cream,
              }}
            >
              What You Get
            </h3>
            {impactItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4"
                style={{
                  background: PALETTE.cream,
                  border: `1px solid ${PALETTE.ink}`,
                  borderLeft: `6px solid ${PALETTE.mustard}`,
                }}
              >
                <div
                  className="w-8 sm:w-10 h-8 sm:h-10 flex items-center justify-center"
                  style={{ background: 'rgba(212,164,55,0.18)' }}
                >
                  <item.Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: PALETTE.mustard }} aria-hidden="true" />
                </div>
                <span
                  className="text-sm sm:text-base lg:text-lg font-medium"
                  style={{ color: PALETTE.ink, fontFamily: TYPE.mono }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </div>
  </section>
);
