"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Shield, Users, Target, TrendingUp, Sparkles, ArrowRight, Play } from 'lucide-react';

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

  useEffect(() => {
    fetch('/api/platform/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        setStats({
          totalPlayers: 0,
          totalMatches: 0,
          totalAgents: 0,
        });
      });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-green-900 to-gray-900">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        {/* Badge */}
        <div className="flex justify-center mb-8 animate-fade-in-down">
          <div className="inline-flex items-center space-x-2 bg-green-500/10 backdrop-blur-sm border border-green-500/20 text-green-400 px-6 py-3 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" />
            <span>FIFA Partnership • Chainlink Verified • Kite AI Powered</span>
          </div>
        </div>

        {/* Main Headline with Gradient Text */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="block text-white">Your Sunday League,</span>
            <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent animate-gradient">
              Championship Manager Style
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Play real matches. Build your legend. Let AI agents manage your squad.
            <br />
            <span className="text-white font-semibold">The parallel season starts now.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl overflow-hidden shadow-2xl shadow-green-500/50 hover:shadow-green-500/70 transition-all duration-300 hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Start Your Season
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
            
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </div>

          {/* Animated Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{stats.totalPlayers.toLocaleString()}+</div>
                <div className="text-xs text-gray-400">Players</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-white">{stats.totalMatches.toLocaleString()}+</div>
                <div className="text-xs text-gray-400">Matches Verified</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group">
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

        {/* Feature Cards with Glass Morphism */}
        <div id="how-it-works" className="grid md:grid-cols-3 gap-6 mt-24">
          {/* Real Matches */}
          <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/50">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Play Real Matches</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Your Sunday league matches drive the game. Score goals, win matches, build your reputation on-chain.
              </p>
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

          {/* Game Rewards */}
          <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/50">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Earn Game Rewards</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Real performance = in-game attributes. Your shooting, passing, defending stats evolve with every match.
              </p>
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

          {/* AI Agents */}
          <div className="group relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Agent Assistance</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Kite AI-powered agents analyze tactics, scout opponents, manage fitness, and boost team morale.
              </p>
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

        {/* Tech Stack Badges */}
        <div className="mt-24 text-center">
          <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider">Powered by industry-leading infrastructure</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { icon: '⚡', label: 'Algorand', subtitle: 'FIFA Official' },
              { icon: '🔗', label: 'Chainlink', subtitle: 'Oracles' },
              { icon: '🤖', label: 'Kite AI', subtitle: '17.8M+ Agents' },
              { icon: '🏔️', label: 'Avalanche', subtitle: 'Subnet' },
            ].map((tech, i) => (
              <div
                key={i}
                className="group px-6 py-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 transition-all hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{tech.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">{tech.label}</div>
                    <div className="text-xs text-gray-400">{tech.subtitle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
};
