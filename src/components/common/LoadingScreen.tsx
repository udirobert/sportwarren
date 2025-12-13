import React from 'react';
import { Target } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading SportWarren...' 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 flex items-center justify-center">
      <div className="text-center animate-fade-in-up">
        {/* Animated Logo */}
        <div className="relative mb-8">
          {/* Glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-green-400 rounded-2xl animate-glow opacity-50 blur-xl"></div>
          </div>
          
          {/* Main logo */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xl animate-scale-in-bounce">
            <Target className="w-12 h-12 text-white animate-spin-slow" />
          </div>
          
          {/* Pulse rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-green-400 rounded-2xl animate-ping opacity-30"></div>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-slide-up">
          Sport<span className="text-green-600">Warren</span>
        </h1>
        
        {/* Tagline */}
        <p className="text-gray-600 mb-6 animate-fade-in">
          Track Your Legend
        </p>

        {/* Loading message */}
        <p className="text-sm text-gray-500 animate-pulse">{message}</p>

        {/* Loading bar */}
        <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-shimmer" 
               style={{ 
                 backgroundSize: '200% 100%',
                 width: '50%'
               }}></div>
        </div>

        {/* Feature hints */}
        <div className="mt-8 space-y-2 text-xs text-gray-500 animate-fade-in">
          <p>✨ Smart match tracking with AI</p>
          <p>🏆 Community-powered achievements</p>
          <p>⚡ Blockchain-verified reputation</p>
        </div>
      </div>
    </div>
  );
};
