import React from 'react';
import { Cpu, TrendingUp, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const steps = [
  {
    icon: Cpu,
    title: 'Simulate Tactics',
    description: 'Run our advanced match engine. Test formations and playstyles against any opponent.',
    color: 'from-blue-500 to-blue-600',
    hoverBorder: 'hover:border-blue-500/50',
  },
  {
    icon: TrendingUp,
    title: 'Watch Stats Grow',
    description: 'Shooting, passing, defending — all evolve with every game.',
    color: 'from-blue-500 to-blue-600',
    hoverBorder: 'hover:border-blue-500/50',
  },
  {
    icon: CheckCircle2,
    title: 'Confirm Results',
    description: 'Log your real match. XP and reputation are awarded automatically upon verification.',
    color: 'from-green-500 to-green-600',
    hoverBorder: 'hover:border-green-500/50',
  },
];

export const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" aria-label="How it works" className="relative py-16 sm:py-32 bg-gray-900">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="text-center mb-10 sm:mb-20">
        <ScrollReveal>
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <Cpu className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>How It Works</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6">
            Experience the <span className="text-blue-400">Match Day</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-2xl mx-auto">
            Simulate matches. Optimize your squad. Prove your results on-chain.
          </p>
        </ScrollReveal>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <ScrollReveal key={step.title} delay={i * 150}>
            <div className={`group relative bg-white/5 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 ${step.hoverBorder} transition-all duration-500 hover:scale-105 h-full`}>
              <div className={`w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 bg-gradient-to-br ${step.color} rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3">{step.title}</h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-300">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
