"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { HeroSection } from "@/components/common/HeroSection";
import { BrandStory } from "@/components/common/BrandStory";
import { useWallet } from "@/contexts/WalletContext";

export default function Home() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <BrandStory />
      </>
    );
  }

  // Import dynamically to avoid loading on landing page
  const { AdaptiveDashboard } = require("@/components/adaptive/AdaptiveDashboard");
  return <AdaptiveDashboard />;
}

// Problem Section - Frame the pain point
function ProblemSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative py-32 bg-gray-900 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-2 bg-red-500/10 text-red-400 rounded-full text-sm font-medium mb-6">
            The Problem
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Your Sunday League Goals
            <span className="block text-gray-500">Deserve to Be Remembered</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              stat: "0",
              label: "Games Tracked",
              desc: "Most amateur players have no record of their matches, goals, or progress over time.",
              icon: "📊",
              delay: 0
            },
            {
              stat: "100%",
              label: "Forgotten",
              desc: "That hat-trick you scored last season? Gone. The clean sheet? Lost to time.",
              icon: "⏰",
              delay: 150
            },
            {
              stat: "No",
              label: "Recognition",
              desc: "Your improvement goes unnoticed. No stats, no highlights, no legacy.",
              icon: "😔",
              delay: 300
            }
          ].map((item, i) => (
            <div 
              key={i}
              className={`group relative p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-red-500/30 transition-all duration-700 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${item.delay}ms` }}
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="text-5xl font-black text-red-400 mb-2">{item.stat}</div>
              <div className="text-xl font-bold text-white mb-3">{item.label}</div>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Solution Section - Present SportWarren
function SolutionSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="relative py-32 bg-gradient-to-b from-gray-900 to-green-950 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-2 bg-green-500/10 text-green-400 rounded-full text-sm font-medium mb-6">
            The Solution
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            Championship Manager
            <span className="block bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              For Your Real Team
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Every match you play becomes part of your permanent on-chain legacy. 
            Track stats, earn XP, build rivalries, and let AI agents manage your squad.
          </p>
        </div>

        {/* Feature comparison */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className={`p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
          }`}>
            <h3 className="text-2xl font-bold text-gray-400 mb-6">Before SportWarren</h3>
            <ul className="space-y-4">
              {[
                "Goals forgotten after the weekend",
                "No idea if you're improving",
                "Rivalries exist only in banter",
                "Managing the team via WhatsApp chaos"
              ].map((item, i) => (
                <li key={i} className="flex items-center text-gray-500">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mr-3 text-red-400 text-sm">✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className={`p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-3xl border border-green-500/30 transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
          }`}>
            <h3 className="text-2xl font-bold text-white mb-6">With SportWarren</h3>
            <ul className="space-y-4">
              {[
                "Every goal verified on-chain forever",
                "FIFA-style attributes track your growth",
                "Rivalries with XP bonuses and history",
                "AI agents handle tactics & transfers"
              ].map((item, i) => (
                <li key={i} className="flex items-center text-gray-200">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center mr-3 text-green-400 text-sm">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// How It Works - The journey
function HowItWorksSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const steps = [
    {
      step: "01",
      title: "Play Your Match",
      desc: "Sunday league as usual. But now, your captain logs the score and stats.",
      icon: "⚽",
      color: "from-green-500 to-emerald-600"
    },
    {
      step: "02",
      title: "Verify & Mint",
      desc: "Both teams confirm the result. Goals, assists, and clean sheets are verified on-chain.",
      icon: "⛓️",
      color: "from-blue-500 to-cyan-600"
    },
    {
      step: "03",
      title: "Earn XP & Grow",
      desc: "Your attributes improve based on real performance. Shooting, passing, defending - all tracked.",
      icon: "📈",
      color: "from-purple-500 to-pink-600"
    },
    {
      step: "04",
      title: "Build Your Legacy",
      desc: "Rivalries form. Agents scout. Your Sunday league career becomes a permanent record.",
      icon: "🏆",
      color: "from-yellow-500 to-orange-600"
    }
  ];

  return (
    <section ref={ref} className="relative py-32 bg-gray-950 overflow-hidden">
      {/* Connection line */}
      <div className="absolute left-1/2 top-32 bottom-32 w-px bg-gradient-to-b from-green-500/50 via-emerald-500/50 to-transparent hidden lg:block" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium mb-6">
            How It Works
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
            From Pitch to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">
              Blockchain
            </span>
          </h2>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {steps.map((item, i) => (
            <div 
              key={i}
              className={`relative flex flex-col lg:flex-row items-center gap-8 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${i * 200}ms` }}
            >
              {/* Content */}
              <div className={`flex-1 ${i % 2 === 1 ? 'lg:text-right lg:order-2' : ''}`}>
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl text-4xl mb-6 shadow-lg hover:scale-110 transition-transform cursor-default`}>
                  {item.icon}
                </div>
                <div className="text-6xl font-black text-white/10 mb-2">{item.step}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-lg max-w-md">{item.desc}</p>
              </div>
              
              {/* Center dot */}
              <div className={`hidden lg:flex w-6 h-6 rounded-full bg-gradient-to-br ${item.color} shadow-lg z-10 items-center justify-center`}>
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              
              {/* Spacer */}
              <div className="flex-1" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
