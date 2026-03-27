"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Shield, Target, ArrowRightLeft, Wallet, 
  Users, ChevronRight, Activity
} from 'lucide-react';
import Link from 'next/link';

interface SquadAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SquadPreviewProps {
  onCreateSquad?: () => void;
  onJoinSquad?: () => void;
  title?: string;
  description?: string;
  primaryAction?: SquadAction;
  secondaryAction?: SquadAction;
}

const PREVIEW_FORMATION = [
  { x: 50, y: 85, role: 'GK' },
  { x: 25, y: 65, role: 'DF' }, { x: 75, y: 65, role: 'DF' },
  { x: 50, y: 45, role: 'MF' },
  { x: 25, y: 25, role: 'ST' }, { x: 75, y: 25, role: 'ST' },
];

export const SquadPreview: React.FC<SquadPreviewProps> = ({ 
  onCreateSquad,
  onJoinSquad,
  title = "Start Your Captain's Journey",
  description = "Build your squad, set your tactics, and lead your team to glory in the local league.",
  primaryAction,
  secondaryAction
}) => {
  const renderAction = (action: SquadAction | undefined, tone: 'primary' | 'secondary') => {
    if (!action) return null;

    const content = (
      <Button 
        size="lg" 
        onClick={action.onClick}
        variant={tone === 'primary' ? 'primary' : 'outline'}
        className={tone === 'primary' ? "h-14 px-8 text-lg font-bold shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all" : "h-14 px-8 text-lg font-bold transition-all"}
      >
        {action.label} {tone === 'primary' && <ChevronRight className="ml-2 w-5 h-5" />}
      </Button>
    );

    if (action.href) {
      return (
        <Link key={action.label} href={action.href}>
          {content}
        </Link>
      );
    }

    return content;
  };

  const defaultPrimaryAction: SquadAction = {
    label: "Create Your Squad",
    onClick: onCreateSquad
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-2">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
          {title}
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          {renderAction(primaryAction || defaultPrimaryAction, 'primary')}
          {onJoinSquad && (
            <Button size="lg" variant="outline" onClick={onJoinSquad} className="h-14 px-8 text-lg font-bold transition-all">
              Join Existing Squad
            </Button>
          )}
          {secondaryAction && renderAction(secondaryAction, 'secondary')}
        </div>
      </div>

      {/* Visual Pitch Preview */}
      <div className="relative max-w-lg mx-auto overflow-hidden rounded-3xl border-4 border-white dark:border-gray-800 shadow-2xl">
        <div className="aspect-[4/5] bg-gradient-to-b from-emerald-500 to-emerald-700 relative overflow-hidden">
          {/* Pitch Markings */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-full" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 border-2 border-white border-t-0" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 border-2 border-white border-b-0" />
            <div className="absolute top-0 left-0 w-full h-full border-2 border-white" />
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white -translate-y-1/2" />
          </div>

          {/* Ghost Players */}
          {PREVIEW_FORMATION.map((pos, idx) => (
            <div 
              key={idx}
              className="absolute -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`,
                animationDelay: `${idx * 150}ms`
              }}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-full border-2 border-white/40 flex items-center justify-center">
                <span className="text-white/60 text-xs font-black tracking-widest">{pos.role}</span>
              </div>
            </div>
          ))}

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-6 left-0 w-full text-center px-6">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full">
              <p className="text-white text-sm font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Set Your Formation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {[
          {
            icon: Target,
            title: "Tactical Control",
            detail: "Choose from 10+ formations and customize your play style from high-press to counter-attack.",
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-950/20"
          },
          {
            icon: ArrowRightLeft,
            title: "Market Pulse",
            detail: "Scout new talent, respond to transfer offers, and build a world-class squad rotation.",
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950/20"
          },
          {
            icon: Wallet,
            title: "Treasury Hub",
            detail: "Manage team finances, fund operations, and handle match-day payments on-chain.",
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-950/20"
          }
        ].map((feature, idx) => (
          <Card key={idx} className="p-6 border-none shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-900">
            <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
              <feature.icon className={`w-6 h-6 ${feature.color}`} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {feature.detail}
            </p>
          </Card>
        ))}
      </div>

      {/* Social Proof / Activity */}
      <Card className="p-6 border-dashed border-2 border-gray-200 dark:border-gray-800 bg-transparent overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Active Local League</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-green-500" /> Squads competing across local leagues
              </p>
            </div>
          </div>
          {onCreateSquad && (
            <Button variant="outline" onClick={onCreateSquad} className="w-full md:w-auto font-bold border-2">
              Explore Features
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
