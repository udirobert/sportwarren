"use client";

import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap, CheckCircle2 } from 'lucide-react';

interface CelebrationOverlayProps {
  isVisible: boolean;
  type?: 'win' | 'achievement' | 'legendary' | 'verified';
  title: string;
  subtitle?: string;
  onComplete?: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  isVisible,
  type = 'win',
  title,
  subtitle,
  onComplete
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!shouldRender) return null;

  const config = {
    win: {
      icon: <Trophy className="w-16 h-16 text-yellow-400" />,
      gradient: "from-yellow-400 via-orange-500 to-yellow-600",
      bg: "bg-yellow-500/10"
    },
    achievement: {
      icon: <Star className="w-16 h-16 text-purple-400" />,
      gradient: "from-purple-400 via-fuchsia-500 to-purple-600",
      bg: "bg-purple-500/10"
    },
    legendary: {
      icon: <Zap className="w-16 h-16 text-emerald-400" />,
      gradient: "from-emerald-400 via-green-500 to-teal-600",
      bg: "bg-emerald-500/10"
    },
    verified: {
      icon: <CheckCircle2 className="w-16 h-16 text-blue-400" />,
      gradient: "from-blue-400 via-indigo-500 to-blue-600",
      bg: "bg-blue-500/10"
    }
  }[type];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/80 backdrop-blur-md`} />
      
      {/* Confetti-like background particles (simplified with CSS) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className={`absolute w-2 h-2 rounded-full animate-ping opacity-20`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              backgroundColor: i % 2 === 0 ? '#fbbf24' : '#10b981'
            }}
          />
        ))}
      </div>

      <div className={`relative transform transition-all duration-700 ${isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-12'} text-center p-8`}>
        <div className={`w-32 h-32 ${config.bg} rounded-full flex items-center justify-center mx-auto mb-6 relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
          <div className="animate-bounce">
            {config.icon}
          </div>
        </div>

        <h2 className={`text-4xl md:text-6xl font-black mb-2 tracking-tighter bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent uppercase italic`}>
          {title}
        </h2>
        
        {subtitle && (
          <p className="text-white/80 text-lg font-medium tracking-wide">
            {subtitle}
          </p>
        )}

        <div className="mt-8 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-6 h-6 ${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} animate-pulse`} style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
};
