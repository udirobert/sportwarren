import React from 'react';
import { AlertCircle, Ghost, TrendingDown, HelpCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const problems = [
  {
    title: 'No Recognition',
    description: 'Your goals, assists, and performances disappear after the final whistle. No permanent record, no reputation.',
    icon: Ghost,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  {
    title: 'No Progression',
    description: "Unlike video games, your real football skills don't translate into stats, levels, or achievements.",
    icon: TrendingDown,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    title: 'No Strategy',
    description: 'You play the same way every week. No tactical analysis, no opponent scouting, no squad optimization.',
    icon: HelpCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
];

export const ProblemSection: React.FC = () => (
  <section aria-label="The problem" className="relative py-32 bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <ScrollReveal>
          <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            <span>The Problem</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Rec Players Are <span className="text-red-400">Invisible</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            You play every week. You score goals. You build chemistry with your squad. But none of it matters beyond the pitch.
          </p>
        </ScrollReveal>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {problems.map((problem, i) => (
          <ScrollReveal key={problem.title} delay={i * 100}>
            <div className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 hover:border-red-500/40 transition-all h-full">
              <div className={`w-14 h-14 rounded-2xl ${problem.bg} flex items-center justify-center mb-4`}>
                <problem.icon className={`w-7 h-7 ${problem.color}`} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
              <p className="text-gray-400">{problem.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
