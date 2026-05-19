'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Cpu, Zap, MousePointer2, Check, Users, User, Palette, Camera } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Card } from '@/components/ui/Card';
import { TermTooltip, GlossaryButton } from '@/components/ui/TermTooltip';
import { trpc } from '@/lib/trpc-client';
import type { DashboardEntryStateId } from '@/lib/dashboard/entry-state';
import type { PlayerPosition } from '@/types';
import {
  ONBOARDING_STORAGE_KEYS,
  TOUR_STEPS,
  PERSONALIZATION_STEPS,
  CHECKLIST_ITEMS,
  type OnboardingPhase,
  type OnboardingStep,
} from '@/lib/onboarding/flow';

const FORMATION_OPTIONS = [
  { id: '4-4-2', label: 'Classic 4-4-2', description: 'Balanced and structured' },
  { id: '4-3-3', label: 'Attacking 4-3-3', description: 'Wide play and high pressure' },
  { id: '5-3-2', label: 'Solid 5-3-2', description: 'Counter-attacking depth' },
  { id: '4-2-3-1', label: 'Modern 4-2-3-1', description: 'Technical and fluid' },
] as const;

const BRAND_COLORS = [
  { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500' },
  { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Crimson', hex: '#ef4444', bg: 'bg-red-500' },
  { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
  { name: 'Midnight', hex: '#1e293b', bg: 'bg-slate-800' },
  { name: 'Purple', hex: '#a855f7', bg: 'bg-purple-500' },
] as const;

interface OnboardingFlowProps {
  journeyStage?: DashboardEntryStateId;
  onComplete?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export function OnboardingFlow({ journeyStage = 'account_ready', onComplete, onVisibilityChange }: OnboardingFlowProps) {
  const { isGuest } = useWallet();
  const { venue } = useEnvironment();
  const { preferences, savePreferences } = useUserPreferences();
  
  // Phase state machine
  const [phase, setPhase] = useState<OnboardingPhase>(() => {
    if (typeof window === 'undefined') return 'tour';
    const stored = localStorage.getItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED);
    if (stored === 'true') return 'personalize';
    return 'tour';
  });
  
  const [tourStep, setTourStep] = useState(-1);
  const [personalizationStep, setPersonalizationStep] = useState<'identity' | 'formation' | 'brand'>('identity');
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED) === 'true';
  });
  
  // Personalization state
  const [playerName, setPlayerName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formation, setFormation] = useState<string | null>(preferences.squadBranding?.formation || null);
  const [primaryColor, setPrimaryColor] = useState<string>(preferences.squadBranding?.primaryColor || '#10b981');
  const [nickname, setNickname] = useState<string>(preferences.squadBranding?.nickname || '');
  const [isCompleting, setIsCompleting] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const updateProfile = trpc.player.updateProfile.useMutation();
  
  const hasCompletedPersonalization = preferences.onboardingCompleted;
  
  // Show banner for guests who haven't seen tour
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    if (isGuest && !hasCompletedTour) {
      setShowBanner(true);
    }
  }, [isGuest, hasCompletedTour]);
  
  // Persist completion
  useEffect(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED, String(hasCompletedTour));
  }, [hasCompletedTour]);
  
  useEffect(() => {
    onVisibilityChange?.(showBanner || (phase === 'tour' && tourStep >= 0));
  }, [showBanner, phase, tourStep, onVisibilityChange]);

  // Tour handlers
  const startTour = useCallback(() => {
    setShowBanner(false);
    setTourStep(0);
  }, []);
  
  const handleNextTourStep = useCallback(() => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(prev => prev + 1);
    } else {
      // Tour complete
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED, 'true');
      setHasCompletedTour(true);
      setTourStep(-1);
      setPhase('personalize');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [tourStep]);
  
  const handlePrevTourStep = useCallback(() => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1);
    }
  }, [tourStep]);
  
  const handleSkipTour = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED, 'true');
    setHasCompletedTour(true);
    setTourStep(-1);
    setPhase('personalize');
  }, []);
  
  // Personalization handlers
  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  
  const handleCompletePersonalization = useCallback(() => {
    setIsCompleting(true);
    updateProfile.mutate({
      name: playerName.trim(),
      position: 'MF' as PlayerPosition,
      avatar: avatarPreview || undefined,
    });
    savePreferences({
      onboardingCompleted: true,
      squadBranding: {
        primaryColor,
        secondaryColor: '#ffffff',
        nickname: nickname || 'The Warriors',
        formation: formation || '4-4-2',
      },
    });
    setTimeout(() => {
      setPhase('checklist');
      setIsCompleting(false);
    }, 800);
  }, [playerName, avatarPreview, primaryColor, nickname, formation, updateProfile, savePreferences]);
  
  // Skip if already completed
  if (preferences.onboardingCompleted && hasCompletedTour) {
    return null;
  }

  // Confetti overlay component
  const ConfettiOverlay = () => showConfetti ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[400] pointer-events-none"
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: Math.random() * window.innerWidth, rotate: 0 }}
          animate={{ y: window.innerHeight + 20, rotate: Math.random() * 360 }}
          transition={{ duration: 3, delay: Math.random() * 0.5 }}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'][i % 4] }}
        />
      ))}
    </motion.div>
  ) : null;

  // Tour overlay
  if (tourStep >= 0) {
    return (
      <>
        <TourOverlay
          steps={TOUR_STEPS}
          currentStep={tourStep}
          venue={venue}
          onNext={handleNextTourStep}
          onBack={handlePrevTourStep}
          onSkip={handleSkipTour}
        />
        <ConfettiOverlay />
      </>
    );
  }
  
  // Personalization card
  if (phase === 'personalize') {
    return (
      <>
        <PersonalizationCard
          step={personalizationStep}
          setStep={setPersonalizationStep}
          playerName={playerName}
          setPlayerName={setPlayerName}
          avatarPreview={avatarPreview}
          fileInputRef={fileInputRef}
          onAvatarFile={handleAvatarFile}
          formation={formation}
          setFormation={setFormation}
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          nickname={nickname}
          setNickname={setNickname}
          isCompleting={isCompleting}
          onComplete={handleCompletePersonalization}
          onBack={() => setPhase('checklist')}
        />
        <ConfettiOverlay />
      </>
    );
  }
  
  // Banner prompt (for guests)
  if (showBanner && isGuest && !hasCompletedTour) {
    return (
      <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50">
        <Card className="bg-gray-900 text-white p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Take the 60-second tour</h3>
              <p className="text-xs text-gray-400 mt-1">See how SportWarren works before you start.</p>
            </div>
            <button onClick={startTour} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-500 transition-colors">
              Start
            </button>
            <button onClick={() => setShowBanner(false)} className="p-1 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
        <div className="absolute -top-12 right-0">
          <GlossaryButton />
        </div>
      </div>
    );
  }
  
  return null;
}

// Tour overlay component
interface TourOverlayProps {
  steps: { id: OnboardingStep; title: string; description: string; emoji: string }[];
  currentStep: number;
  venue: string;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

function TourOverlay({ steps, currentStep, venue, onNext, onBack, onSkip }: TourOverlayProps) {
  const step = steps[currentStep];
  
  return (
    <div className="fixed inset-0 z-[300] pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto" />
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[350] pointer-events-auto w-[320px]">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-xl">
              {step.emoji}
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Step {currentStep + 1} of {steps.length}
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{step.title}</h3>
            </div>
            <button onClick={onSkip} className="p-1 text-gray-300 hover:text-gray-900">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{step.description}</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={onBack}
              disabled={currentStep === 0}
              className={`p-2 rounded-full ${currentStep === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-1">
              {steps.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i === currentStep ? 'w-4 bg-gray-900' : 'w-1 bg-gray-200'}`} />
              ))}
            </div>
            
            <button
              onClick={onNext}
              className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-500 transition-all"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Pointer */}
      <motion.div
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 opacity-20"
      >
        <MousePointer2 className="w-12 h-12 text-gray-900 fill-current" />
      </motion.div>
    </div>
  );
}

// Personalization card component
interface PersonalizationCardProps {
  step: 'identity' | 'formation' | 'brand';
  setStep: (step: 'identity' | 'formation' | 'brand') => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  avatarPreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onAvatarFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formation: string | null;
  setFormation: (f: string) => void;
  primaryColor: string;
  setPrimaryColor: (c: string) => void;
  nickname: string;
  setNickname: (n: string) => void;
  isCompleting: boolean;
  onComplete: () => void;
  onBack: () => void;
}

function PersonalizationCard({
  step, setStep, playerName, setPlayerName, avatarPreview, fileInputRef, onAvatarFile,
  formation, setFormation, primaryColor, setPrimaryColor, nickname, setNickname,
  isCompleting, onComplete, onBack
}: PersonalizationCardProps) {
  return (
    <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white overflow-hidden relative shadow-2xl max-w-lg mx-auto">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        {step === 'identity' ? <User size={120} /> : step === 'formation' ? <Users size={120} /> : <Palette size={120} />}
      </div>
      
      <div className="p-8">
        <AnimatePresence mode="wait">
          {step === 'identity' ? (
            <motion.div key="identity" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <User className="w-3 h-3" />
                Create Your Player
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Create Your Player</h2>
              <p className="text-sm text-gray-400 mb-8">This is how teammates and opponents will see you on the pitch.</p>
              
              <div className="mb-6 flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center cursor-pointer group shrink-0" onClick={() => fileInputRef.current?.click()}>
                  {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-white/40" />}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
                <div>
                  <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-green-400 hover:text-green-300 transition-colors flex items-center gap-2">
                    <Camera className="w-4 h-4" /> {avatarPreview ? 'Change photo' : 'Upload photo'}
                  </button>
                </div>
              </div>
              
              <div className="mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              
              <button
                onClick={() => playerName.trim().length >= 2 && setStep('formation')}
                disabled={playerName.trim().length < 2}
                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Choose Formation <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          ) : step === 'formation' ? (
            <motion.div key="formation" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <Users className="w-3 h-3" />
                Choose Your Playstyle
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Pick Your Formation</h2>
              <p className="text-sm text-gray-400 mb-8">This defines how your squad lines up on match day.</p>
              
              <div className="space-y-3 mb-8">
                {FORMATION_OPTIONS.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setFormation(option.id)}
                    className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                      formation === option.id ? 'border-green-500 bg-green-500/10' : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="bg-gray-800 rounded-xl p-3 text-xs font-black">{option.id}</div>
                    <div>
                      <div className={`text-sm font-black uppercase ${formation === option.id ? 'text-green-400' : 'text-white'}`}>{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </div>
                    {formation === option.id && <div className="ml-auto bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-black" /></div>}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => formation && setStep('brand')}
                disabled={!formation}
                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Define Your Identity <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => setStep('identity')} className="w-full py-3 text-xs text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest transition-colors mt-4">Back to Identity</button>
            </motion.div>
          ) : (
            <motion.div key="brand" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                <Palette className="w-3 h-3" />
                Make It Yours
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Brand Your Squad</h2>
              <p className="text-sm text-gray-400 mb-8">This identity will be shared with your teammates.</p>
              
              <div className="mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Squad Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. The Warriors, North London FC"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              
              <div className="mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">Squad Colors</label>
                <div className="flex flex-wrap gap-4">
                  {BRAND_COLORS.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setPrimaryColor(color.hex)}
                      className={`w-12 h-12 rounded-full ${color.bg} transition-all ${
                        primaryColor === color.hex ? 'ring-4 ring-white ring-offset-4 ring-offset-black scale-110' : 'hover:scale-105 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {primaryColor === color.hex && <div className="absolute inset-0 flex items-center justify-center"><Check className="w-6 h-6 text-white drop-shadow-md" /></div>}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={onComplete}
                disabled={isCompleting || !nickname}
                className="w-full py-4 bg-green-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCompleting ? 'Creating Season...' : 'Launch Your Season'}
                <ChevronRight className="w-5 h-5" />
              </button>
              <button onClick={() => setStep('formation')} className="w-full py-3 text-xs text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest transition-colors mt-2">Back to Tactics</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}

// Backward compatibility exports
export const GuestTour = OnboardingFlow;
export const QuickPersonalization = OnboardingFlow;
