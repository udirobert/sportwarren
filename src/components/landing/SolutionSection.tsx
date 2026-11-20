import React from 'react';
import { CheckCircle2, Users, Sparkles, ArrowRight, CalendarDays, FileText } from 'lucide-react';
import { ScrollReveal } from '@/components/landing/ScrollReveal';

const coreFeatures = [
  { label: 'Bring the names you remember', Icon: Users },
  { label: 'Log the real match', Icon: CheckCircle2 },
  { label: 'Let the group verify it', Icon: Users },
  { label: 'Keep it for the next season', Icon: CalendarDays },
];

const impactItems = [
  { label: 'Verified match history', Icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { label: 'A record your group recognises', Icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { label: 'Shareable player keepsakes', Icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { label: 'The stories behind the score', Icon: CalendarDays, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
];

export const SolutionSection: React.FC = () => (
  <section aria-label="The solution" className="relative py-16 sm:py-32 bg-gradient-to-b from-gray-900 to-green-900/20">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
      <div className="text-center mb-10 sm:mb-16">
        <ScrollReveal>
          <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>The Solution</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6">
            Log it. <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">Verify it.</span> Keep it.
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-3xl mx-auto">
            SportWarren gives the games your group cares about a permanent home — with a trusted score, the people who were there, and a keepsake worth sharing.
          </p>
        </ScrollReveal>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <ScrollReveal direction="left" className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6">The Record Loop</h3>
            {coreFeatures.map((item) => (
              <div key={item.label} className="flex items-center space-x-3 sm:space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center">
                  <item.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" aria-hidden="true" />
                </div>
                <span className="text-sm sm:text-base lg:text-lg text-gray-300">{item.label}</span>
              </div>
            ))}
          </ScrollReveal>

          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
            <ArrowRight className="w-10 h-10 lg:w-12 lg:h-12 text-blue-400 animate-pulse" />
          </div>

          <ScrollReveal direction="right" className="space-y-4 sm:space-y-6">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6">What You Get</h3>
            {impactItems.map((item) => (
              <div key={item.label} className={`flex items-center space-x-3 sm:space-x-4 ${item.bg} backdrop-blur-sm border ${item.border} rounded-xl p-3 sm:p-4`}>
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 flex items-center justify-center">
                  <item.Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} aria-hidden="true" />
                </div>
                <span className="text-sm sm:text-base lg:text-lg text-white font-medium">{item.label}</span>
              </div>
            ))}
          </ScrollReveal>
        </div>
      </div>
    </div>
  </section>
);
