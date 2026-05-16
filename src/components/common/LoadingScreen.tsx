'use client';

import React from 'react';
import { SoccerLoader } from '@/components/ui/SoccerLoader';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Initializing Tactical Command Center...' 
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-amber-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 text-center px-4">
        {/* Animated Soccer Ball Loader */}
        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse-slow"></div>
            <SoccerLoader size={80} />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          Sport<span className="text-emerald-600">Warren</span>
        </h1>
        
        {/* Tactical Kicker */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
            Tactically Elevated
          </span>
        </div>

        {/* Loading message */}
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 max-w-[240px] mx-auto leading-relaxed">
          {message}
        </p>

        {/* Progress Bar (Visual only for now) */}
        <div className="w-48 h-1 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto overflow-hidden">
          <div 
            className="h-full bg-emerald-600 rounded-full animate-pulse-slow"
            style={{ width: '65%' }}
          ></div>
        </div>

        {/* Kite AI Infrastructure Hint */}
        <div className="mt-6 flex items-center justify-center gap-1.5 opacity-40">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
            Agentic Infrastructure via <span className="text-emerald-500">Kite AI</span>
          </span>
        </div>

        {/* Tech Stack Hints */}
        <div className="mt-12 grid grid-cols-3 gap-8 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
          <div className="flex flex-col items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            <span className="text-[8px] font-bold uppercase tracking-tighter dark:text-gray-400">Match AI</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-amber-500"></div>
            <span className="text-[8px] font-bold uppercase tracking-tighter dark:text-gray-400">XP Engine</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
            <span className="text-[8px] font-bold uppercase tracking-tighter dark:text-gray-400">Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
