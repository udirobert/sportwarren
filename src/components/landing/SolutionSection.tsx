import React from 'react';
import { CheckCircle2, Cpu, Target, Users, Sparkles, ArrowRight, Zap, TrendingUp, Trophy } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const simulationFeatures = [
  { label: 'Simulate Match Engine', Icon: Cpu },
  { label: 'Scout Opponent Tactics', Icon: Target },
  { label: 'Optimize Lineups', Icon: Users },
  { label: 'AI Staff Briefings', Icon: Sparkles },
];

const impactItems = [
  { label: 'Unlock Player Potential', Icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { label: 'Shooting XP +125', Icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { label: 'Squad Reputation +50', Icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { label: 'On-Chain Verifiable Result', Icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
];

export const SolutionSection: React.FC = () => (
  <section aria-label="The solution" className="relative py-32 bg-gradient-to-b from-gray-900 to-green-900/20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <ScrollReveal>
          <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>The Solution</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            A <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Tactical Simulation</span> That Matters
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            SportWarren brings a high-fidelity match engine to your real-world games. Scout your opponents, simulate tactics, and watch your squad&apos;s performance evolve.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left" className="space-y-6">
            <h3 className="text-3xl font-bold text-white mb-6">Tactical Preview</h3>
            {simulationFeatures.map((item) => (
              <div key={item.label} className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <item.Icon className="w-5 h-5 text-gray-300" aria-hidden="true" />
                </div>
                <span className="text-lg text-gray-300">{item.label}</span>
              </div>
            ))}
          </ScrollReveal>

          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <ArrowRight className="w-12 h-12 text-blue-400 animate-pulse" />
          </div>

          <ScrollReveal direction="right" className="space-y-6">
            <h3 className="text-3xl font-bold text-white mb-6">Real World Impact</h3>
            {impactItems.map((item) => (
              <div key={item.label} className={`flex items-center space-x-4 ${item.bg} backdrop-blur-sm border ${item.border} rounded-xl p-4`}>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <item.Icon className={`w-5 h-5 ${item.color}`} aria-hidden="true" />
                </div>
                <span className="text-lg text-white font-medium">{item.label}</span>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </div>
  </section>
);
