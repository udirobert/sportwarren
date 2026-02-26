"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Shield, Users, Target, TrendingUp, Sparkles, ArrowRight, Play, AlertCircle, CheckCircle2, Cpu } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

interface PlatformStats {
  totalPlayers: number;
  totalMatches: number;
  totalAgents: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const [stats, setStats] = useState<PlatformStats>({
    totalPlayers: 0,
    totalMatches: 0,
    totalAgents: 0,
  });
  const [scrollY, setScrollY] = useState(0);
  const problemRef = useRef<HTMLDivElement>(null);
  const solutionRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        setStats({ totalPlayers: 0, totalMatches: 0, totalAgents: 0 });
      });

    // Throttled scroll handler for performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div 
            className="absolute top-0 -left-4 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            style={{ transform: `translateY(${parallaxOffset}px)` }}
          ></div>
          <div 
            className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            style={{ transform: `translateY(${parallaxOffset * 0.8}px)` }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-green-500/10 backdrop-blur-sm border border-green-500/20 text-green-400 px-6 py-3 rounded-full text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            <span>Blockchain Verified • Chainlink Oracles • Kite AI Powered</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="block text-white">Your Sunday League,</span>
            <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
              Championship Manager Style
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Turn real matches into an epic game. Build your legend with AI agents, blockchain verification, and Championship Manager gameplay.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Season
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => problemRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl hover:bg-white/20 transition-all"
            >
              <Play className="w-5 h-5 mr-2" />
              See How It Works
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{stats.totalPlayers.toLocaleString()}+</div>
                <div className="text-xs text-gray-400">Players</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{stats.totalMatches.toLocaleString()}+</div>
                <div className="text-xs text-gray-400">Matches</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{stats.totalAgents.toLocaleString()}+</div>
                <div className="text-xs text-gray-400">AI Agents</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section ref={problemRef} className="relative py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <AlertCircle className="w-4 h-4" />
              <span>The Problem</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Sunday League Players Are <span className="text-red-400">Invisible</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              You play every weekend. You score goals. You build chemistry with your squad. But none of it matters beyond the pitch.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'No Recognition',
                description: 'Your goals, assists, and performances disappear after the final whistle. No permanent record, no reputation.',
                icon: '😔',
              },
              {
                title: 'No Progression',
                description: 'Unlike video games, your real football skills don\'t translate into stats, levels, or achievements.',
                icon: '📉',
              },
              {
                title: 'No Strategy',
                description: 'You play the same way every week. No tactical analysis, no opponent scouting, no squad optimization.',
                icon: '🤷',
              },
            ].map((problem, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8 hover:border-red-500/40 transition-all"
                style={{
                  transform: `translateY(${Math.max(0, (scrollY - 400) * 0.1 - i * 20)}px)`,
                  opacity: Math.min(1, (scrollY - 300) / 200),
                }}
              >
                <div className="text-5xl mb-4">{problem.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{problem.title}</h3>
                <p className="text-gray-400">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section ref={solutionRef} className="relative py-32 bg-gradient-to-b from-gray-900 to-green-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span>The Solution</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              A <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Parallel Season</span> That Matters
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              SportWarren creates a Championship Manager-style game layer on top of your real Sunday league. Every match you play drives your in-game progression.
            </p>
          </div>

          {/* Solution Visual */}
          <div className="relative">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Real World */}
              <div 
                className="space-y-6"
                style={{
                  transform: `translateX(${Math.max(-50, (scrollY - 1200) * 0.1 - 50)}px)`,
                  opacity: Math.min(1, (scrollY - 1100) / 200),
                }}
              >
                <h3 className="text-3xl font-bold text-white mb-6">Real World Match</h3>
                {[
                  { label: 'Play 90 minutes', icon: '⚽' },
                  { label: 'Score 2 goals', icon: '🎯' },
                  { label: 'Win 3-2 vs rivals', icon: '🏆' },
                  { label: 'Team coordination', icon: '🤝' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-lg text-gray-300">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <ArrowRight className="w-12 h-12 text-green-400 animate-pulse" />
              </div>

              {/* Right: Game Layer */}
              <div 
                className="space-y-6"
                style={{
                  transform: `translateX(${Math.min(50, -(scrollY - 1200) * 0.1 + 50)}px)`,
                  opacity: Math.min(1, (scrollY - 1100) / 200),
                }}
              >
                <h3 className="text-3xl font-bold text-white mb-6">SportWarren Layer</h3>
                <div className="flex items-center space-x-4 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
                  <span className="text-3xl">✅</span>
                  <span className="text-lg text-white font-medium">Result verified on-chain</span>
                </div>
                <div className="flex items-center space-x-4 bg-blue-500/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-4">
                  <span className="text-3xl">📈</span>
                  <span className="text-lg text-white font-medium">Shooting XP +125</span>
                </div>
                <div className="flex items-center space-x-4 bg-orange-500/10 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4">
                  <span className="text-3xl">🔥</span>
                  <span className="text-lg text-white font-medium">Derby victory bonus</span>
                </div>
                <div className="flex items-center space-x-4 bg-purple-500/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
                  <span className="text-3xl">💎</span>
                  <span className="text-lg text-white font-medium">Squad chemistry +10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} id="how-it-works" className="relative py-32 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Cpu className="w-4 h-4" />
              <span>How It Works</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Three Pillars of <span className="text-blue-400">SportWarren</span>
            </h2>
          </div>

          {/* Feature Cards with 3D Effect */}
          <div className="grid md:grid-cols-3 gap-8">
            <div
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
              style={{
                transform: `translateY(${Math.max(0, (scrollY - 2000) * 0.05)}px) rotateY(${(scrollY - 2000) * 0.02}deg)`,
                opacity: Math.min(1, (scrollY - 1900) / 200),
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/50">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Play Real Matches</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">Your Sunday league matches drive the game. Score goals, win matches, build your reputation on-chain.</p>
                <ul className="space-y-3">
                  <li className="flex items-start text-gray-300">
                    <span className="text-green-400 mr-3 mt-1">✓</span>
                    <span>Chainlink oracle verification</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-green-400 mr-3 mt-1">✓</span>
                    <span>GPS + weather validation</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-green-400 mr-3 mt-1">✓</span>
                    <span>Soulbound reputation tokens</span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              style={{
                transform: `translateY(${Math.max(0, (scrollY - 2000) * 0.05 - 30)}px) rotateY(${(scrollY - 2000) * 0.02}deg)`,
                opacity: Math.min(1, (scrollY - 1900) / 200),
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/50">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Earn Game Rewards</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">Real performance = in-game attributes. Your shooting, passing, defending stats evolve with every match.</p>
                <ul className="space-y-3">
                  <li className="flex items-start text-gray-300">
                    <span className="text-blue-400 mr-3 mt-1">✓</span>
                    <span>XP for goals, assists, clean sheets</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-blue-400 mr-3 mt-1">✓</span>
                    <span>Form tracking & attribute boosts</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-blue-400 mr-3 mt-1">✓</span>
                    <span>Derby bonuses & rivalry rewards</span>
                  </li>
                </ul>
              </div>
            </div>

            <div
              className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
              style={{
                transform: `translateY(${Math.max(0, (scrollY - 2000) * 0.05 - 60)}px) rotateY(${(scrollY - 2000) * 0.02}deg)`,
                opacity: Math.min(1, (scrollY - 1900) / 200),
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/50">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Agent Assistance</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">Kite AI-powered agents analyze tactics, scout opponents, manage fitness, and boost team morale.</p>
                <ul className="space-y-3">
                  <li className="flex items-start text-gray-300">
                    <span className="text-purple-400 mr-3 mt-1">✓</span>
                    <span>Squad Manager for tactics</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-purple-400 mr-3 mt-1">✓</span>
                    <span>Scout for opponent analysis</span>
                  </li>
                  <li className="flex items-start text-gray-300">
                    <span className="text-purple-400 mr-3 mt-1">✓</span>
                    <span>Fitness Coach for training plans</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-24 text-center">
            <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider">Powered by industry-leading infrastructure</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 transition-all hover:scale-105">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔗</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Chainlink</div>
                    <div className="text-xs text-gray-400">Oracles</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 transition-all hover:scale-105">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Kite AI</div>
                    <div className="text-xs text-gray-400">17.8M+ Agents</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 transition-all hover:scale-105">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⚡</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Algorand</div>
                    <div className="text-xs text-gray-400">Blockchain</div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 transition-all hover:scale-105">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏔️</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Avalanche</div>
                    <div className="text-xs text-gray-400">Subnet</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 text-center">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 hover:scale-105"
            >
              <Zap className="w-6 h-6 mr-2" />
              Start Your Parallel Season
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-gray-400 mt-4">No credit card required • Free to start</p>
          </div>
        </div>
      </section>
    </div>
  );
};
