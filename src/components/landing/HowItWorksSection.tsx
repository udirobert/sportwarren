/**
 * HowItWorksSection — V3 editorial register.
 *
 * The procedural explainer — "how the system works." This is the page
 * where you read the rules; V3 cream paper + numbered step cards is
 * the natural register. Each step gets one of the four V3 accents.
 */

import React from 'react';
import { Target, Users, CheckCircle2, Trophy } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { PALETTE, TYPE, TRACKING, type V3AccentKey } from '@/components/v3';

const steps: Array<{
  icon: typeof Target;
  title: string;
  description: string;
  accent: V3AccentKey;
}> = [
  {
    icon: Target,
    title: 'Build Your Card',
    description: 'Pick your name, position, and formation. Get provisional stats based on your role — six attributes that define you on the pitch.',
    accent: 'navy',
  },
  {
    icon: Users,
    title: 'Bring the Squad',
    description: "Create or join a squad. Teammates verify each other's stats — what starts as provisional becomes a real, trusted record.",
    accent: 'red',
  },
  {
    icon: CheckCircle2,
    title: 'Log & Verify',
    description: 'After your real match, log the result. Squadmates confirm or dispute via group verification — on Telegram or WhatsApp.',
    accent: 'sage',
  },
  {
    icon: Trophy,
    title: 'Grow & Compete',
    description: "Every verified match grows your card. Earn XP, level up attributes, enter tournaments, and build your squad's reputation.",
    accent: 'mustard',
  },
];

export const HowItWorksSection: React.FC = () => (
  <section
    id="how-it-works"
    aria-label="How it works"
    className="relative py-16 sm:py-32"
    style={{ background: PALETTE.cream, color: PALETTE.ink }}
  >
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="text-center mb-10 sm:mb-20">
        <ScrollReveal>
          <div
            className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            style={{
              background: 'rgba(28,58,94,0.08)',
              border: `1px solid ${PALETTE.navy}`,
              color: PALETTE.navy,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              fontFamily: TYPE.mono,
            }}
          >
            <Target className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>How It Works</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-[0.95]"
            style={{
              fontFamily: TYPE.display,
              letterSpacing: TRACKING.displayTight,
              textTransform: 'uppercase',
              color: PALETTE.ink,
            }}
          >
            From <span style={{ color: PALETTE.navy }}>Card</span> to{' '}
            <span style={{ color: PALETTE.mustard }}>Trophy</span>
          </h2>
          <p
            className="text-sm sm:text-base lg:text-xl max-w-2xl mx-auto"
            style={{
              color: PALETTE.inkLight,
              fontFamily: TYPE.mono,
              lineHeight: 1.55,
            }}
          >
            Four steps. Every stat verified. Every match counts.
          </p>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
        {steps.map((step, i) => {
          const accentColor = PALETTE[step.accent];
          return (
            <ScrollReveal key={step.title} delay={i * 150}>
              <div
                className="group relative p-4 sm:p-6 lg:p-8 h-full transition-transform duration-500 hover:scale-[1.02]"
                style={{
                  background: PALETTE.cream,
                  border: `2px solid ${PALETTE.ink}`,
                  borderTop: `8px solid ${accentColor}`,
                }}
              >
                <div
                  className="text-[10px] font-black uppercase mb-2"
                  style={{
                    letterSpacing: TRACKING.capWide,
                    color: accentColor,
                    fontFamily: TYPE.mono,
                  }}
                >
                  Step {i + 1}
                </div>
                <step.icon
                  className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 mb-3 sm:mb-4 transition-transform group-hover:scale-110"
                  style={{ color: accentColor }}
                  aria-hidden="true"
                />
                <h3
                  className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3"
                  style={{
                    fontFamily: TYPE.display,
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    color: PALETTE.ink,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-xs sm:text-sm lg:text-base"
                  style={{
                    color: PALETTE.inkLight,
                    fontFamily: TYPE.mono,
                    lineHeight: 1.55,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  </section>
);
