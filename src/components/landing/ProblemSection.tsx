/**
 * ProblemSection — V3 editorial register.
 *
 * "The problem" framing belongs to V3, not V4: this is the section
 * where the player feels the loss / the gap / the betrayal of the
 * memory. Cream paper + ink + red accent reads like the diagnosis
 * page of a Sunday League programme — fitting.
 */

import React from 'react';
import { AlertCircle, Ghost, TrendingDown, HelpCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';
import { PALETTE, TYPE, TRACKING } from '@/components/v3';

const problems = [
  {
    title: 'No Record',
    description: 'Your goals, assists, and clean sheets vanish after the final whistle. No card, no stats, no proof you were ever there.',
    icon: Ghost,
  },
  {
    title: 'No Squad',
    description: 'You play every week but nobody verifies your stats. Your card stays provisional forever without teammates to back it up.',
    icon: TrendingDown,
  },
  {
    title: 'No Growth',
    description: 'Without verified matches, your attributes never level up. No XP, no progression, no way to see yourself improve over time.',
    icon: HelpCircle,
  },
];

export const ProblemSection: React.FC = () => (
  <section
    aria-label="The problem"
    className="relative py-16 sm:py-32"
    style={{ background: PALETTE.cream, color: PALETTE.ink }}
  >
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="text-center mb-10 sm:mb-16">
        <ScrollReveal>
          <div
            className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-4 sm:mb-6"
            style={{
              background: 'rgba(201,16,34,0.08)',
              border: `1px solid ${PALETTE.red}`,
              color: PALETTE.red,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              fontFamily: TYPE.mono,
            }}
          >
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>The Problem</span>
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
            Rec Players Are <span style={{ color: PALETTE.red }}>Invisible</span>
          </h2>
          <p
            className="text-sm sm:text-base lg:text-xl max-w-3xl mx-auto"
            style={{
              color: PALETTE.inkLight,
              fontFamily: TYPE.mono,
              lineHeight: 1.55,
            }}
          >
            You play every week. You score goals. You build chemistry with your squad. But none of it matters beyond the pitch.
          </p>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {problems.map((problem, i) => (
          <ScrollReveal key={problem.title} delay={i * 100}>
            <div
              className="p-4 sm:p-6 lg:p-8 h-full"
              style={{
                background: PALETTE.cream,
                border: `2px solid ${PALETTE.ink}`,
                borderLeft: `8px solid ${PALETTE.red}`,
              }}
            >
              <problem.icon
                className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mb-3 sm:mb-4"
                style={{ color: PALETTE.red }}
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
                {problem.title}
              </h3>
              <p
                className="text-xs sm:text-sm"
                style={{
                  color: PALETTE.inkLight,
                  fontFamily: TYPE.mono,
                  lineHeight: 1.6,
                }}
              >
                {problem.description}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
