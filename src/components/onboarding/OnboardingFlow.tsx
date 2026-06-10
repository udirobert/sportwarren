'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, MousePointer2, Check, Users, User, Palette, Camera, Lock, TrendingUp, Plus, CheckCircle2, Share2 } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { trackEvent, trackOnboardingProgressMilestone } from '@/lib/analytics';
import { Card } from '@/components/ui/Card';
import { TermTooltip, GlossaryButton } from '@/components/ui/TermTooltip';
import { trpc } from '@/lib/trpc-client';
import type { DashboardEntryStateId } from '@/lib/dashboard/entry-state';
import type { PlayerPosition } from '@/types';
import type { ChecklistId } from '@/lib/onboarding/flow';
import type { AttributeKey } from '@/server/services/personalization/twin-types';
import {
  ONBOARDING_STORAGE_KEYS,
  TOUR_STEPS,
  PERSONALIZATION_STEPS,
  type OnboardingPhase,
  type OnboardingStep,
} from '@/lib/onboarding/flow';
import { getPendingClaim, clearPendingClaim, roleToPosition } from '@/lib/claims/context';
import { consumePendingPersona, clearPendingPersona } from '@/lib/claims/persona';
import { ATTRIBUTE_DISPLAY, ATTRIBUTE_BAR_TONES } from '@/lib/attributes/display';
import { PROVISIONAL_ATTRIBUTES, VERIFIED_DELTAS } from '@/lib/attributes/provisional';
import { FORMATIONS } from '@/lib/formations';

const FORMATION_OPTIONS = [
  { id: '1-2-1', label: '5s 1-2-1', description: 'One stays, two support, one finishes' },
  { id: '1-1-2', label: '5s 1-1-2', description: 'Aggressive two-forward small-sided shape' },
  { id: '1-3-1', label: '6s 1-3-1', description: 'Compact base with one central outlet' },
  { id: '1-2-2', label: '6s 1-2-2', description: 'Two banks with quick counter lanes' },
  { id: '1-3-2', label: '7s 1-3-2', description: 'Three-player base with two advanced runners' },
  { id: '2-3-1', label: '7s 2-3-1', description: 'Wide midfield support behind a focal point' },
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
  completeChecklistItem?: (id: ChecklistId) => void;
}

export function OnboardingFlow({ journeyStage = 'account_ready', onComplete, onVisibilityChange, completeChecklistItem }: OnboardingFlowProps) {
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
  const personalizationProgress = useMemo(() => {
    const map: Record<typeof personalizationStep, number> = { identity: 33, formation: 66, brand: 90 };
    return map[personalizationStep];
  }, [personalizationStep]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED) === 'true';
  });
  
  // Personalization state
  // These defaults are read once at mount. The persona prefill useEffect below
  // overrides `formation` and `playerName` from a fresh landing-card save when
  // one exists (precedence: persona > preferences). Position has no preference
  // default — it starts unset and is set by the persona branch or the user.
  const [playerName, setPlayerName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formation, setFormation] = useState<string | null>(preferences.squadBranding?.formation || null);
  const [primaryColor, setPrimaryColor] = useState<string>(preferences.squadBranding?.primaryColor || '#10b981');
  const [nickname, setNickname] = useState<string>(preferences.squadBranding?.nickname || '');
  const [isCompleting, setIsCompleting] = useState(false);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const updateProfile = trpc.player.updateProfile.useMutation();
  const linkShareClaim = trpc.player.linkShareClaim.useMutation();
  
  const hasCompletedPersonalization = preferences.onboardingCompleted;
  
  // Claim-context pre-fill
  const [pendingClaimPosition, setPendingClaimPosition] = useState<PlayerPosition | null>(null);
  const [pendingClaimToken, setPendingClaimToken] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [hasPendingPersona, setHasPendingPersona] = useState(false);
  const autoLinkAttemptedRef = React.useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const claim = getPendingClaim();
    if (claim) {
      setPlayerName(claim.displayName);
      setFormation(claim.formation);
      setPendingClaimPosition(roleToPosition(claim.role));
      setPendingClaimToken(claim.claimToken);
      // Skip tour — user already claimed a spot, they know the product
      setHasCompletedTour(true);
      setPhase('personalize');
      trackEvent('personalization_started', { source: 'pending_claim' });
      setShowBanner(false);
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED, 'true');
      return;
    }

    const persona = consumePendingPersona();
    if (persona) {
      setPlayerName(persona.displayName);
      setPendingClaimPosition(persona.position);
      if (persona.formation) setFormation(persona.formation);
      if (persona.avatarBase64 && persona.avatarMimeType) {
        const dataUrl = `data:${persona.avatarMimeType};base64,${persona.avatarBase64}`;
        setAvatarPreview(dataUrl);
      }
      setHasPendingPersona(true);
      // Identity already captured on the landing card — skip to formation.
      setPersonalizationStep('formation');
      setHasCompletedTour(true);
      setPhase('personalize');
      trackEvent('personalization_started', { source: 'pending_persona' });
      setShowBanner(false);
      localStorage.setItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED, 'true');
    }
  }, []);

  useEffect(() => {
    if (!preferences.onboardingCompleted || !pendingClaimToken || autoLinkAttemptedRef.current) return;
    autoLinkAttemptedRef.current = true;

    linkShareClaim.mutate(
      { claimToken: pendingClaimToken },
      {
        onSuccess: () => {
          clearPendingClaim();
          setPendingClaimToken(null);
          setPendingClaimPosition(null);
        },
        onError: (error) => {
          setProfileError(error.message || 'Could not save your claimed player card.');
        },
      },
    );
  }, [linkShareClaim, pendingClaimToken, preferences.onboardingCompleted]);

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

  // Track onboarding progress milestones (goal gradient / Zeigarnik effect)
  useEffect(() => {
    if (phase === 'personalize') {
      trackOnboardingProgressMilestone(personalizationProgress, personalizationStep);
    }
  }, [phase, personalizationStep, personalizationProgress]);

  // Tour handlers
  const startTour = useCallback(() => {
    trackEvent('tour_started');
    setShowBanner(false);
    setTourStep(0);
  }, []);
  
  const handleNextTourStep = useCallback(() => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(prev => prev + 1);
    } else {
      trackEvent('tour_completed');
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
    trackEvent('tour_skipped', { step: tourStep });
    localStorage.setItem(ONBOARDING_STORAGE_KEYS.TOUR_COMPLETED, 'true');
    setHasCompletedTour(true);
    setTourStep(-1);
    setPhase('personalize');
  }, [tourStep]);
  
  // Personalization handlers
  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };
  
  const handleCompletePersonalization = useCallback(async () => {
    setIsCompleting(true);
    setProfileError(null);
    try {
      const profileResult = await updateProfile.mutateAsync({
        name: playerName.trim(),
        position: pendingClaimPosition ?? ('MF' as PlayerPosition),
        avatar: avatarPreview || undefined,
        claimToken: pendingClaimToken ?? undefined,
      });

      clearPendingClaim();
      clearPendingPersona();
      setPendingClaimToken(null);
      setPendingClaimPosition(null);
      completeChecklistItem?.('complete_card');
      completeChecklistItem?.('set_formation');
      savePreferences({
        onboardingCompleted: true,
        squadBranding: {
          primaryColor,
          secondaryColor: '#ffffff',
          nickname: nickname || 'The Warriors',
          formation: formation || '4-4-2',
        },
      });
      setPhase('checklist');
      // Flag the match center to open in capture mode on this first session
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('sw_first_match_session', '1');
      }
      onComplete?.();

      // Fire-and-forget: register an ERC-8004 agent identity for this
      // user on the GOAT Network. This runs after the user's profile
      // is saved so the agent registration can reference their data.
      // If Goat is not configured or the network call fails, the
      // onboarding still succeeds — this is an infrastructure concern.
      registerGoatAgent(
        playerName.trim(),
        pendingClaimPosition ?? 'MF',
        profileResult?.user?.id,
      );

    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Could not save your player profile.');
    } finally {
      setIsCompleting(false);
    }
  }, [playerName, avatarPreview, primaryColor, nickname, formation, updateProfile, savePreferences, pendingClaimPosition, pendingClaimToken, onComplete, completeChecklistItem]);
  
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
          error={profileError}
          onComplete={handleCompletePersonalization}
          onBack={() => setPhase('checklist')}
          hasPendingPersona={hasPendingPersona}
          pendingClaimPosition={pendingClaimPosition}
          completeChecklistItem={completeChecklistItem}
          skipBrandStep={journeyStage !== 'season_kickoff' && journeyStage !== 'returning_manager'}
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
            <button onClick={() => setShowBanner(false)} className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg" aria-label="Dismiss tour banner">
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
            <button onClick={onSkip} className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-200/50 rounded-lg" aria-label="Close tour">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed mb-6">{step.description}</p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={onBack}
              disabled={currentStep === 0}
              className={`p-2 rounded-full ${currentStep === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
              aria-label="Previous step"
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
  error: string | null;
  onComplete: () => void;
  onBack: () => void;
  hasPendingPersona?: boolean;
  pendingClaimPosition?: PlayerPosition | null;
  completeChecklistItem?: (id: ChecklistId) => void;
  skipBrandStep?: boolean;
}

function PersonalizationCard({
  step, setStep, playerName, setPlayerName, avatarPreview, fileInputRef, onAvatarFile,
  formation, setFormation, primaryColor, setPrimaryColor, nickname, setNickname,
  isCompleting, error, onComplete, onBack, hasPendingPersona, pendingClaimPosition, completeChecklistItem, skipBrandStep
}: PersonalizationCardProps) {
  const [matchResult, setMatchResult] = useState<'won' | 'drew' | 'lost' | null>(null);
  const [teammates, setTeammates] = useState<{ name: string; position: string }[]>([]);
  const [newTeammateName, setNewTeammateName] = useState('');
  const [newTeammatePos, setNewTeammatePos] = useState('MF');

  const SCORE_OPTIONS = [
    { id: 'won' as const, label: 'Won 3-1', emoji: '🏆', boost: '+15 XP' },
    { id: 'drew' as const, label: 'Drew 2-2', emoji: '🤝', boost: '+10 XP' },
    { id: 'lost' as const, label: 'Lost 1-2', emoji: '💪', boost: '+5 XP' },
  ] as const;

  const TEAMMATE_POSITIONS = ['GK', 'DF', 'MF', 'WG', 'ST'] as const;

  const handleMatchResultClick = (result: typeof SCORE_OPTIONS[number]['id']) => {
    setMatchResult(result);
    trackEvent('onboarding_match_result_selected', { result });
  };

  // Compute provisional attributes with match-result deltas for display
  const MATCH_RESULT_XP: Record<string, number> = { won: 15, drew: 10, lost: 5 };
  const MATCH_RESULT_MULTIPLIER: Record<string, number> = { won: 1, drew: 0.6, lost: 0.3 };

  const displayAttributes: { key: AttributeKey; label: string; Icon: React.FC<{ className?: string }>; baseValue: number; boostedValue: number }[] = useMemo(() => {
    const pos = pendingClaimPosition ?? 'MF';
    const base = PROVISIONAL_ATTRIBUTES[pos];
    const delta = VERIFIED_DELTAS[pos];
    const mult = matchResult ? MATCH_RESULT_MULTIPLIER[matchResult] ?? 0 : 0;
    const allKeys = Object.keys(base) as AttributeKey[];
    return allKeys.map(key => ({
      key,
      label: ATTRIBUTE_DISPLAY[key].label,
      Icon: ATTRIBUTE_DISPLAY[key].Icon,
      baseValue: base[key],
      boostedValue: Math.min(99, Math.max(1, Math.round(base[key] + (delta[key] ?? 0) * mult))),
    }));
  }, [matchResult, pendingClaimPosition]);

  const xpGained = matchResult ? MATCH_RESULT_XP[matchResult] ?? 0 : 0;
  const [displayedXp, setDisplayedXp] = useState(0);

  useEffect(() => {
    if (!matchResult || xpGained <= 0) return;
    setDisplayedXp(0);
    const start = performance.now();
    const duration = 1200;
    const raf = requestAnimationFrame(function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedXp(Math.round(eased * xpGained));
      if (progress < 1) requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [matchResult, xpGained]);

  const addTeammate = () => {
    if (!newTeammateName.trim()) return;
    setTeammates(prev => [...prev, { name: newTeammateName.trim(), position: newTeammatePos }]);
    setNewTeammateName('');
    trackEvent('onboarding_teammate_added', { position: newTeammatePos });
  };

  const removeTeammate = (index: number) => {
    setTeammates(prev => prev.filter((_, i) => i !== index));
  };

  const positionsLabel = (formationId: string, playerCount: number) => {
    const pos = FORMATIONS[formationId as keyof typeof FORMATIONS];
    if (!pos) return '';
    const total = pos.length;
    const gk = 1;
    const outfield = total - gk;
    return `${playerCount} of ${total} — ${gk} GK, ${outfield} outfield`;
  };

  const handleShareSquad = () => {
    trackEvent('onboarding_share_squad_clicked', { formation, teammates: teammates.length });
    const shareText = `🪪 I built my squad on SportWarren\n\n👤 ${playerName || 'Me'}\n📋 ${formation || '4-4-2'}\n👥 ${teammates.length + 1} players\n\nCome join and make the stats real.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSharePlayerCard = () => {
    trackEvent('onboarding_share_player_card_clicked', { formation, matchResult });
    const resultEmoji = matchResult === 'won' ? '🏆' : matchResult === 'drew' ? '🤝' : matchResult === 'lost' ? '💪' : '🪪';
    const resultLine = matchResult ? `${resultEmoji} Last result: ${matchResult === 'won' ? 'Win' : matchResult === 'drew' ? 'Draw' : 'Loss'}` : '';
    const shareText = [
      `🪪 My player card — ${playerName || 'New Player'} (${pendingClaimPosition ?? 'MF'})`,
      resultLine,
      `📋 ${formation || '4-4-2'}`,
      'Build yours on SportWarren and make the stats real.',
    ].filter(Boolean).join('\n\n');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white overflow-hidden relative shadow-2xl max-w-lg mx-auto">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        {step === 'identity' ? <User size={120} /> : step === 'formation' ? <Users size={120} /> : <Palette size={120} />}
      </div>
      
      {/* Persistent progress indicator — goal gradient / Zeigarnik effect */}
      {(() => {
        const progress = step === 'identity' ? 33 : step === 'formation' ? 66 : 90;
        return (
          <div className="border-b border-white/10 px-8 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {step === 'identity' ? 'Step 1 of 3 — Identity' : step === 'formation' ? 'Step 2 of 3 — Tactics' : 'Step 3 of 3 — Brand'}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            {step === 'brand' && (
              <p className="mt-1.5 text-[10px] font-bold text-amber-300">
                ⚡ You&apos;re one step away from launching your season — lock it in!
              </p>
            )}
          </div>
        );
      })()}

      <div className="p-8">
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
            {error}
          </div>
        )}
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
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center cursor-pointer group shrink-0" onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}>
                  {avatarPreview ? <img src={avatarPreview} alt="Your profile photo" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-white/40" />}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onAvatarFile} />
                <div className="flex flex-col gap-1">
                  <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-green-400 hover:text-green-300 transition-colors flex items-center gap-2">
                    <Camera className="w-4 h-4" /> {avatarPreview ? 'Change photo' : 'Upload photo'}
                  </button>
                  {!avatarPreview && (
                    /* Skip link: avatar is optional, the "Choose Formation" CTA
                       doesn't gate on it. Card-savers skip the identity step
                       entirely so this is only seen by Path A visitors who
                       didn't prefill a card — still worth it for first-time
                       friction. Gated on name length so a 1-char name can't
                       slip through past the "Choose Formation" CTA's check. */
                    <button
                      type="button"
                      onClick={() => playerName.trim().length >= 2 && setStep('formation')}
                      disabled={playerName.trim().length < 2}
                      className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-4 decoration-gray-700 hover:decoration-gray-500 transition-colors text-left disabled:opacity-30 disabled:cursor-not-allowed disabled:no-underline"
                    >
                      Skip avatar for now
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mb-8">
                <label htmlFor="your-name" className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Your Name</label>
                <input
                  id="your-name"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>

              {/* ── Quick match result interaction ── */}
              {playerName.trim().length >= 2 && !hasPendingPersona && (
                <div className="mb-8">
                  <AnimatePresence mode="wait">
                    {!matchResult ? (
                      <motion.div
                        key="select-result"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-5"
                      >
                        <div className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-3.5 h-3.5" />
                          How did your last match go?
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {SCORE_OPTIONS.map(option => (
                            <button
                              key={option.id}
                              onClick={() => handleMatchResultClick(option.id)}
                              className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10"
                            >
                              <span className="text-lg">{option.emoji}</span>
                              <span className="text-xs font-bold text-white">{option.label}</span>
                              <span className="text-[9px] font-black text-emerald-400">{option.boost}</span>
                            </button>
                          ))}
                        </div>
                        <p className="mt-3 text-[10px] text-gray-600 text-center">
                          Your stats adjust based on the result
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="result-shown"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-5"
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-lg"
                          >
                            {matchResult === 'won' ? '🏆' : matchResult === 'drew' ? '🤝' : '💪'}
                          </motion.div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-white">
                              {matchResult === 'won' ? 'Great win!' : matchResult === 'drew' ? 'Hard-fought draw' : 'Tough loss — more to prove'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Your attributes adjusted for the result
                            </p>
                          </div>
                          {/* XP counter */}
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring' }}
                            className="flex shrink-0 flex-col items-center"
                          >
                            <span className="text-lg font-black tabular-nums text-emerald-400">
                              +{displayedXp}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/70">
                              XP
                            </span>
                          </motion.div>
                        </div>

                        {/* Animated attribute bars */}
                        <div className="space-y-2.5">
                          {displayAttributes.map((attr, i) => {
                            const Icon = attr.Icon;
                            const barColor = ATTRIBUTE_BAR_TONES[attr.key];
                            const isBoosted = attr.boostedValue > attr.baseValue;
                            const targetPercent = (attr.boostedValue / 99) * 100;
                            return (
                              <div key={attr.key} className="flex items-center gap-2.5">
                                <div className="flex w-20 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">
                                  <Icon className="h-3 w-3" />
                                  {attr.label}
                                </div>
                                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                                  <motion.div
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${targetPercent}%` }}
                                    transition={{ duration: 0.8, delay: 0.3 + i * 0.12, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${barColor}`}
                                  />
                                </div>
                                <div className="flex w-10 items-center justify-end gap-0.5 text-xs font-black tabular-nums text-white">
                                  <motion.span
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.12 }}
                                    className="transition-all"
                                  >
                                    {attr.boostedValue}
                                  </motion.span>
                                  {isBoosted && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.7 + i * 0.12, type: 'spring' }}
                                      className="text-[9px] font-bold text-emerald-400"
                                    >
                                      +{attr.boostedValue - attr.baseValue}
                                    </motion.span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Confirmation footer */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 1.8 }}
                          className="mt-4 flex items-center justify-center gap-1.5 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-bold text-emerald-400">Stats recorded to your card</span>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
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

              {hasPendingPersona && (
                /* Card-as-anchor: the card-saver's provisional card, visible
                   as a visual element above the formation picker. Echoes the
                   landing PlayerCardPreview so the journey reads as one
                   continuous surface ("your card is still with you"). */
                <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 shadow-lg shadow-emerald-500/5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 text-base font-black text-emerald-200">
                      {(playerName.trim().slice(0, 2) || 'SW').toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                        Your player card
                      </p>
                      <p className="truncate text-base font-black text-white">
                        {playerName || 'Your player'}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
                          {pendingClaimPosition ?? 'MF'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-200">
                          <Lock className="h-2.5 w-2.5" /> Provisional
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] leading-relaxed text-emerald-200/80">
                    These are your starting stats. They become real after your first verified match.
                  </p>
                </div>
              )}
              
              <div className="space-y-3 mb-6">
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

              {/* ── Lightweight teammate addition ── */}
              {formation && !hasPendingPersona && (
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400 mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Your Starting XI
                  </div>

                  {/* Current teammates */}
                  {teammates.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/40 bg-emerald-500/15 text-[10px] font-black text-emerald-300">
                          {(playerName.trim().slice(0, 2) || 'SW').toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-white">{playerName || 'You'}</span>
                        <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-black text-emerald-300">
                          {pendingClaimPosition ?? 'MF'}
                        </span>
                        <span className="text-[9px] text-gray-600 font-bold ml-auto">You</span>
                      </div>
                      {teammates.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 group">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[10px] font-black text-gray-400">
                            {(t.name.slice(0, 2) || 'SW').toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-white">{t.name}</span>
                          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-gray-300">
                            {t.position}
                          </span>
                          <button
                            onClick={() => removeTeammate(i)}
                            className="ml-auto opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
                            aria-label={`Remove ${t.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add teammate form */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTeammateName}
                      onChange={(e) => setNewTeammateName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addTeammate(); }}
                      placeholder="Teammate name"
                      maxLength={20}
                      className="flex-1 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white placeholder-gray-600 outline-none transition focus:border-emerald-500/60"
                    />
                    <select
                      value={newTeammatePos}
                      onChange={(e) => setNewTeammatePos(e.target.value)}
                      className="rounded-lg border border-white/10 bg-white/[0.06] px-2 py-2 text-xs font-bold text-white outline-none transition focus:border-emerald-500/60"
                    >
                      {TEAMMATE_POSITIONS.map(pos => (
                        <option key={pos} value={pos} className="bg-gray-900 text-white">{pos}</option>
                      ))}
                    </select>
                    <button
                      onClick={addTeammate}
                      disabled={!newTeammateName.trim()}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                  {teammates.length > 0 && (
                    <p className="mt-3 text-[10px] text-gray-600 text-center">
                      You + {teammates.length} teammate{teammates.length !== 1 ? 's' : ''} — add more or proceed
                    </p>
                  )}
                  {teammates.length === 0 && (
                    <p className="mt-2 text-[10px] text-gray-700 text-center">
                      Add a few teammates to see your squad come together
                    </p>
                  )}

                  {/* ── Mini pitch with formation positions ── */}
                  {teammates.length > 0 && formation && FORMATIONS[formation as keyof typeof FORMATIONS] && (
                    <div className="mt-5">
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 mb-2">
                        Matchday lineup
                      </div>
                      <div className="relative mx-auto h-52 w-full max-w-[200px] overflow-hidden rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #166534 100%)',
                        }}
                      >
                        {/* Pitch markings */}
                        <div className="absolute inset-x-0 top-1/2 h-px bg-white/15" />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-white/15" />
                        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/15" />
                        <div className="absolute bottom-0 left-1/2 h-14 w-28 -translate-x-1/2 rounded-t-full border-2 border-b-0 border-white/15" />
                        {/* Centre spot */}
                        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20" />

                        {/* Player dots */}
                        {(() => {
                          const positions = FORMATIONS[formation as keyof typeof FORMATIONS];
                          if (!positions) return null;
                          // Assign players: user is GK (first slot), teammates fill outfield
                          const allPlayers = [
                            { name: playerName || 'You', initials: (playerName.trim().slice(0, 2) || 'SW').toUpperCase(), isUser: true },
                            ...teammates.slice(0, positions.length - 1).map(t => ({
                              name: t.name,
                              initials: (t.name.slice(0, 2) || 'SW').toUpperCase(),
                              isUser: false,
                            })),
                          ];
                          return positions.map((pos, i) => {
                            const player = allPlayers[i];
                            if (!player) return null;
                            return (
                              <motion.div
                                key={`pos-${i}`}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.06, type: 'spring', stiffness: 200 }}
                                className="absolute z-10 flex flex-col items-center"
                                style={{
                                  left: `${pos.x}%`,
                                  top: `${pos.y}%`,
                                  transform: 'translate(-50%, -50%)',
                                }}
                              >
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-black shadow-lg ${
                                    player.isUser
                                      ? 'border-emerald-400 bg-emerald-500 text-white shadow-emerald-500/30'
                                      : 'border-white/40 bg-white/15 text-white'
                                  }`}
                                >
                                  {player.initials}
                                </div>
                                <span className="mt-0.5 whitespace-nowrap rounded bg-black/40 px-1 py-[1px] text-[7px] font-bold uppercase tracking-wider text-white/80">
                                  {pos.role}
                                </span>
                              </motion.div>
                            );
                          });
                        })()}

                        {/* Pitch glow */}
                        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
                      </div>
                      <p className="mt-2 text-center text-[9px] text-gray-600">
                        {positionsLabel(formation, teammates.length + 1)}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => {
                  if (formation) {
                    completeChecklistItem?.('set_formation');
                    if (skipBrandStep) {
                      onComplete();
                    } else {
                      setStep('brand');
                    }
                  }
                }}
                disabled={!formation}
                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {skipBrandStep ? 'Launch Your Season' : 'Define Your Identity'} <ChevronRight className="w-5 h-5" />
              </button>
              {!hasPendingPersona && (
                <button onClick={() => setStep('identity')} className="w-full py-3 text-xs text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest transition-colors mt-4">Back to Identity</button>
              )}
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
                <label htmlFor="squad-nickname" className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Squad Nickname</label>
                <input
                  id="squad-nickname"
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

              {/* ── Share card (squad or solo) ── */}
              {teammates.length > 0 ? (
                <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                  <div className="p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 mb-3 flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5" />
                      Your squad card
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: primaryColor + '15', borderColor: primaryColor + '40', borderWidth: 1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-base font-black text-white">{nickname || 'Your Squad'}</p>
                          <p className="text-[10px] text-gray-500">{formation} · {teammates.length + 1} players</p>
                        </div>
                        <div className="flex -space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/20 text-[8px] font-black text-emerald-300">
                            {(playerName.trim().slice(0, 2) || 'SW').toUpperCase()}
                          </div>
                          {teammates.slice(0, 3).map((t, i) => (
                            <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-[8px] font-black text-gray-300">
                              {(t.name.slice(0, 2) || 'SW').toUpperCase()}
                            </div>
                          ))}
                          {teammates.length > 3 && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 bg-white/5 text-[8px] font-black text-gray-500">
                              +{teammates.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-gray-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ready for the season</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleShareSquad}
                    className="flex w-full items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-xs font-bold text-emerald-400 transition-all hover:bg-white/[0.03] hover:text-emerald-300"
                  >
                    <Share2 className="w-4 h-4" />
                    Share with your squad
                  </button>
                </div>
              ) : (
                <div className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                  <div className="p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 mb-3 flex items-center gap-2">
                      <Share2 className="w-3.5 h-3.5" />
                      Your player card
                    </div>
                    <div
                      className="rounded-xl p-4"
                      style={{ backgroundColor: primaryColor + '15', borderColor: primaryColor + '40', borderWidth: 1 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-emerald-400/40 bg-emerald-500/15 text-base font-black text-emerald-200">
                          {(playerName.trim().slice(0, 2) || 'SW').toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-base font-black text-white">{playerName || 'New Player'}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-gray-300">
                              {pendingClaimPosition ?? 'MF'}
                            </span>
                            {matchResult && (
                              <span className="text-[9px] text-emerald-400 font-bold">
                                {matchResult === 'won' ? '🏆 Won' : matchResult === 'drew' ? '🤝 Drew' : '💪 Lost'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-gray-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Ready to share with your squad</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSharePlayerCard}
                    className="flex w-full items-center justify-center gap-2 border-t border-white/10 px-4 py-3 text-xs font-bold text-emerald-400 transition-all hover:bg-white/[0.03] hover:text-emerald-300"
                  >
                    <Share2 className="w-4 h-4" />
                    Share your player card
                  </button>
                </div>
              )}
              
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

// ── GOAT Network ERC-8004 agent registration ──
// Called fire-and-forget on personalization completion.
// Silently fails if Goat is not configured or the network is unreachable.

function registerGoatAgent(name: string, position: string, userId?: string): void {
  if (typeof window === 'undefined') return;

  fetch('/api/goat/register-agent', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: `SportWarren Player — ${name}`,
      description: `Player agent for ${name}. Position: ${position}. Registered at season launch.`,
      profileUserId: userId,
      serviceEndpoints: [{
        name: 'verify-match',
        endpoint: `${window.location.origin}/api/x402/verify-match`,
        version: '1.0.0',
        skills: ['match_verification'],
        domains: ['football', 'sport'],
      }],
    }),
  }).catch(() => {
    // Goat not configured or network error — onboarding already succeeded.
    console.debug('GOAT agent registration skipped (not configured or unreachable)');
  });
}

// Backward compatibility exports
export const GuestTour = OnboardingFlow;
export const QuickPersonalization = OnboardingFlow;
