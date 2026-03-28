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
  <section id="how-it-works" aria-label="How it works" className="relative py-32 bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-20">
        <ScrollReveal>
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Cpu className="w-4 h-4" aria-hidden="true" />
            <span>How It Works</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Experience the <span className="text-blue-400">Match Day</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Simulate matches. Optimize your squad. Prove your results on-chain.
          </p>
        </ScrollReveal>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step, i) => (
          <ScrollReveal key={step.title} delay={i * 150}>
            <div className={`group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 ${step.hoverBorder} transition-all duration-500 hover:scale-105 h-full`}>
              <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <step.icon className="w-7 h-7 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);
