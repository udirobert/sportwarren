'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export const BrandStory: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenStory = localStorage.getItem('hasSeenBrandStory');
    if (!hasSeenStory) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenBrandStory', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="max-w-2xl w-full relative animate-scale-in-bounce overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Decorative background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 opacity-50"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 rounded-full blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Target className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Welcome to <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">SportWarren</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Where every amateur footballer becomes a legend
            </p>
          </div>

          {/* Story */}
          <div className="space-y-6 mb-8">
            <p className="text-gray-700 leading-relaxed text-center">
              We believe that <strong>every goal matters</strong>, every assist counts, and every Sunday League match 
              is part of your football legacy. SportWarren transforms amateur football by combining 
              smart tracking with blockchain verification and community-powered achievements.
            </p>

            {/* Feature highlights */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-white/80 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Smart Match Tracking</h3>
                  <p className="text-sm text-gray-600">AI-powered stats, voice logs, and instant video analysis</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white/80 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Squad Management</h3>
                  <p className="text-sm text-gray-600">Build your team, track availability, and coordinate matches</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white/80 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Achievements & Rivalries</h3>
                  <p className="text-sm text-gray-600">Unlock badges, challenge opponents, build your reputation</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-white/80 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Blockchain Verified</h3>
                  <p className="text-sm text-gray-600">Your stats are immutable and trustworthy on Algorand</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              onClick={handleClose}
              variant="primary"
              size="lg"
              className="shadow-2xl shadow-green-500/30"
            >
              Start Building Your Legend
            </Button>
            <p className="text-sm text-gray-500 mt-4">
              Join thousands of players tracking their journey
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
