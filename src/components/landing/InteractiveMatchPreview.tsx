"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PitchCanvas } from '@/components/squad/PitchCanvas';
import { FORMATIONS, PLAY_STYLE_LABELS } from '@/lib/formations';
import type { Formation, PlayStyle, Player } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { trackEvent, trackCoreGrowthEvent, trackFeatureUsed } from '@/lib/analytics';
import { 
  Shield, 
  Zap, 
  Share2, 
  Download,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportElementAsImage } from '@/lib/utils/export';

const MOCK_PLAYERS: Player[] = [
  { id: '1', name: 'Tunde', position: 'FW', status: 'available' },
  { id: '2', name: 'Kofi', position: 'MF', status: 'available' },
  { id: '3', name: 'Diallo', position: 'MF', status: 'available' },
  { id: '4', name: 'Eze', position: 'DF', status: 'available' },
  { id: '5', name: 'Yusuf', position: 'DF', status: 'available' },
  { id: '6', name: 'GK', position: 'GK', status: 'available' },
];

export const InteractiveMatchPreview: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial state from URL or defaults
  const [formation, setFormation] = useState<Formation>((searchParams.get('formation') as Formation) || '4-4-2');
  const [playStyle, setPlayStyle] = useState<PlayStyle>((searchParams.get('style') as PlayStyle) || 'balanced');
  const [primaryColor, setPrimaryColor] = useState(searchParams.get('color') || '#10b981');
  
  const [isExporting, setIsExporting] = useState(false);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const pitchRef = React.useRef<HTMLDivElement>(null);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('formation', formation);
    params.set('style', playStyle);
    params.set('color', primaryColor);
    
    // Use replace to avoid polluting history with every micro-change
    const newPathname = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newPathname);
  }, [formation, playStyle, primaryColor]);

  const formationList = Object.keys(FORMATIONS) as Formation[];
  const formationIndex = formationList.indexOf(formation);

  const nextFormation = () => {
    const nextIdx = (formationIndex + 1) % formationList.length;
    setFormation(formationList[nextIdx]);
    trackFeatureUsed('tactics_preview_change', { type: 'formation', value: formationList[nextIdx] });
  };

  const prevFormation = () => {
    const prevIdx = (formationIndex - 1 + formationList.length) % formationList.length;
    setFormation(formationList[prevIdx]);
    trackFeatureUsed('tactics_preview_change', { type: 'formation', value: formationList[prevIdx] });
  };

  const handleExport = async () => {
    if (!pitchRef.current) return;
    setIsExporting(true);
    trackFeatureUsed('tactics_preview_export', { formation, style: playStyle });
    try {
      await exportElementAsImage(pitchRef.current, `sportwarren-tactics-${formation}`, 'png');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!pitchRef.current) return;
    
    trackFeatureUsed('tactics_preview_share_click', { formation, style: playStyle });
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(pitchRef.current, { quality: 0.95, cacheBust: true });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'tactics.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `My SportWarren Tactics`,
          text: `Check out my ${formation} setup! Join me on SportWarren.`,
          files: [file],
        });
        trackCoreGrowthEvent('opponent_verification_invite_shared', { method: 'web_share_api', type: 'tactics_preview' });
      } else {
        // Fallback: Copy link and show success
        await navigator.clipboard.writeText(window.location.href);
        setShowShareSuccess(true);
        trackCoreGrowthEvent('opponent_verification_invite_shared', { method: 'clipboard_copy', type: 'tactics_preview' });
        setTimeout(() => setShowShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const lineup = useMemo(() => {
    // Just a mock lineup for the preview
    return ['1', '2', '3', '4', '5', '6'].slice(0, FORMATIONS[formation].length);
  }, [formation]);

  return (
    <div className="w-full max-w-4xl mx-auto px-1 sm:px-0">
      <Card className="bg-gray-900/40 border-white/10 backdrop-blur-md overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left: Pitch Preview */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-green-400 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Tactical Setup
              </h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={prevFormation} className="h-8 w-8 p-0 text-white hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-mono text-white w-12 text-center">{formation}</span>
                <Button variant="ghost" size="sm" onClick={nextFormation} className="h-8 w-8 p-0 text-white hover:bg-white/10">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div ref={pitchRef} className="rounded-xl overflow-hidden shadow-2xl">
              <PitchCanvas
                formation={formation}
                lineup={lineup}
                players={MOCK_PLAYERS}
                size="sm"
                readOnly={true}
                className="bg-transparent"
                primaryColor={primaryColor}
                playStyle={playStyle}
              />
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">AI Insight</span>
              </div>
              <p className="text-xs text-gray-300 italic">
                {playStyle === 'attacking' ? "High defensive line will squeeze the pitch." :
                 playStyle === 'defensive' ? "Deep block makes you impossible to break down." :
                 playStyle === 'counter' ? "Sprinting into space on the transition is key." :
                 formation === '4-3-3' ? "Aggressive width will stretch their defense." : 
                 formation === '4-4-2' ? "Solid structure, perfect for balanced play." :
                 "Highly specialized setup for technical dominance."}
              </p>
            </div>
          </div>

          {/* Right: Personalization & Share */}
          <div className="p-5 md:p-6 flex flex-col justify-between bg-gray-900/20 md:bg-transparent">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-4 md:mb-6">
                <Zap className="w-4 h-4" />
                Personalize Tactics
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Play Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['balanced', 'attacking', 'defensive', 'counter'] as PlayStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          setPlayStyle(style);
                          trackFeatureUsed('tactics_preview_change', { type: 'playStyle', value: style });
                        }}
                        className={`px-3 py-1.5 md:py-2 rounded-lg border text-left transition-all ${
                          playStyle === style 
                            ? 'bg-blue-500/20 border-blue-500/50 text-white' 
                            : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <div className="text-xs font-bold capitalize">{style}</div>
                        <div className="text-[9px] opacity-60 truncate">{PLAY_STYLE_LABELS[style]?.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2">Squad Identity</label>
                  <div className="flex gap-3">
                    {['#10b981', '#3b82f6', '#ef4444', '#f59e0b'].map((color) => (
                      <button 
                        key={color}
                        onClick={() => {
                          setPrimaryColor(color);
                          trackFeatureUsed('tactics_preview_change', { type: 'color', value: color });
                        }}
                        className={`w-8 h-8 md:w-6 md:h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                          primaryColor === color ? 'border-white' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-8 space-y-3">
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 border-0 font-bold"
                  onClick={handleShare}
                >
                  <AnimatePresence mode="wait">
                    {showShareSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Link Copied
                      </motion.div>
                    ) : (
                      <motion.div
                        key="share"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Tactics
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-white/10 text-white hover:bg-white/5"
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  <Download className={`w-4 h-4 ${isExporting ? 'animate-pulse' : ''}`} />
                </Button>
              </div>
              <p className="text-[10px] text-center text-gray-500">
                Share as image or link to your squad group chat
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Viral Loop Note */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {['JD', 'AM', 'SK'].map((initials, i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-gray-900 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                {initials}
              </div>
            ))}
          </div>
          <span className="animate-pulse flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Recently built by Sunday League stars
          </span>
        </div>
        <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
        <span>Join 420+ squads using SportWarren</span>
      </div>

      {/* Quick Guide */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: <Shield className="w-4 h-4 text-green-400" />, title: "Plan", text: "Design your formation and squad identity." },
          { icon: <Zap className="w-4 h-4 text-blue-400" />, title: "Simulate", text: "Our match engine tests your setup against the meta." },
          { icon: <Share2 className="w-4 h-4 text-purple-400" />, title: "Dominate", text: "Share with your squad and lead them to victory." }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3">
            <div className="mt-1">{item.icon}</div>
            <div>
              <div className="text-[11px] font-bold text-white uppercase tracking-wider">{item.title}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{item.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
