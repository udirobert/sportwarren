'use client';

import React from 'react';
import { Trophy, Zap, Users, Shield } from 'lucide-react';

interface HeroSectionProps {
  userName?: string;
  matchesPlayed?: number;
  winRate?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  userName = 'Champion',
  matchesPlayed = 0,
  winRate = 0
}) => {
  const milestoneReached = matchesPlayed >= 10;
  const winningStreak = winRate >= 60;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-2xl p-6 md:p-8 mb-6 md:mb-8 shadow-2xl">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full mix-blend-overlay animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Welcome message */}
          <div className="flex-1 animate-fade-in-up">
            <div className="flex items-center space-x-2 mb-3">
              <Trophy className="w-6 h-6 text-yellow-300 animate-bounce-gentle" />
              <span className="text-green-100 text-sm font-medium uppercase tracking-wider">
                Your Football Journey
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              Welcome back, <br className="md:hidden" />
              <span className="text-yellow-300">{userName}</span>! 🎯
            </h1>
            
            <p className="text-lg text-green-100 max-w-2xl leading-relaxed">
              {milestoneReached 
                ? `${matchesPlayed} matches and counting! You're building something special.`
                : "Your legend starts here. Every match, every goal, every moment matters."
              }
            </p>
            
            {winningStreak && (
              <div className="mt-4 inline-flex items-center space-x-2 bg-yellow-400 text-green-900 px-4 py-2 rounded-full font-semibold text-sm shadow-lg animate-scale-in-bounce">
                <Zap className="w-4 h-4" />
                <span>On a winning streak! 🔥</span>
              </div>
            )}
          </div>

          {/* Quick stats badges */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-green-200 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-bold text-white">{matchesPlayed}</span>
              </div>
              <p className="text-green-100 text-xs font-medium">Matches</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-yellow-300 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-bold text-white">{winRate}%</span>
              </div>
              <p className="text-green-100 text-xs font-medium">Win Rate</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group col-span-2">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Blockchain Verified</p>
                  <p className="text-green-100 text-xs">All stats immutable on Algorand</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">🎯</p>
              <p className="text-xs md:text-sm text-green-100 font-medium">Smart Tracking</p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">🤝</p>
              <p className="text-xs md:text-sm text-green-100 font-medium">Squad Building</p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">🏆</p>
              <p className="text-xs md:text-sm text-green-100 font-medium">Epic Rivalries</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
