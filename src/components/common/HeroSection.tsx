"use client";

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Trophy, Zap, Shield, Users, Target, TrendingUp, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            <span>FIFA Partnership • Chainlink Verified • Kite AI Powered</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Sunday League,
            <br />
            <span className="text-green-600">Championship Manager Style</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Play real matches. Build your legend. Let AI agents manage your squad.
            <br />
            <span className="text-gray-900 font-medium">The parallel season starts now.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              onClick={onGetStarted}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Your Season
            </Button>
            <Button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 text-lg font-semibold rounded-xl border-2 border-gray-200 transition-all"
            >
              How It Works
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-green-600" />
              <span><strong className="text-gray-900">10,000+</strong> players</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-green-600" />
              <span><strong className="text-gray-900">5,000+</strong> matches verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span><strong className="text-gray-900">500+</strong> AI agents</span>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div id="how-it-works" className="grid md:grid-cols-3 gap-6 mt-20">
          {/* Real Matches */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Play Real Matches</h3>
            <p className="text-gray-600 mb-4">
              Your Sunday league matches drive the game. Score goals, win matches, build your reputation on-chain.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Chainlink oracle verification</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>GPS + weather validation</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Soulbound reputation tokens</span>
              </li>
            </ul>
          </div>

          {/* Game Rewards */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Game Rewards</h3>
            <p className="text-gray-600 mb-4">
              Real performance = in-game attributes. Your shooting, passing, defending stats evolve with every match.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>XP for goals, assists, clean sheets</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Form tracking & attribute boosts</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>Derby bonuses & rivalry rewards</span>
              </li>
            </ul>
          </div>

          {/* AI Agents */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Agent Assistance</h3>
            <p className="text-gray-600 mb-4">
              Kite AI-powered agents analyze tactics, scout opponents, manage fitness, and boost team morale.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                <span>Squad Manager for tactics</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                <span>Scout for opponent analysis</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                <span>Fitness Coach for training plans</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 mb-4">Powered by industry-leading infrastructure</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
              ⚡ Algorand (FIFA Official)
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
              🔗 Chainlink Oracles
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
              🤖 Kite AI (17.8M+ Agents)
            </div>
            <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
              🏔️ Avalanche Subnet
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
