'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Cpu, Zap, Hand } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { getTourStepsForPlatform, TOUR_STORAGE_KEY, TOUR_COMPLETED_KEY } from '@/lib/onboarding/tour';
import type { TourStepConfig } from '@/lib/onboarding/types';
import { triggerHaptic } from '@/lib/utils/haptics';

const ICONS: Record<string, React.ComponentType<any>> = {
    Sparkles,
    Cpu,
    Zap,
};

interface MobileTourProps {
    onVisibilityChange?: (isVisible: boolean) => void;
}

const MobileTourCard: React.FC<{
    step: TourStepConfig;
    stepIndex: number;
    totalSteps: number;
    onClose: () => void;
    onNext: () => void;
    onBack: () => void;
    canGoBack: boolean;
}> = ({ step, stepIndex, totalSteps, onClose, onNext, onBack, canGoBack }) => {
    const Icon = ICONS[step.iconName || ''] || Sparkles;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed z-[350] pointer-events-auto"
            style={{ bottom: 20, left: 16, right: 16 }}
        >
            <div className="bg-gray-900 border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">
                        {step.emoji}
                    </div>
                    <div className="flex-1 pr-8">
                        <div className="text-[10px] font-black text-green-400 uppercase tracking-widest leading-none mb-1">
                            Step {stepIndex + 1} / {totalSteps}
                        </div>
                        <h3 className="text-base font-black text-white uppercase tracking-tight">
                            {step.title}
                        </h3>
                    </div>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {step.content}
                </p>

                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        disabled={!canGoBack}
                        className={`p-3 rounded-full transition-all ${!canGoBack ? 'text-gray-700 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="flex space-x-1.5">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === stepIndex ? 'w-6 bg-green-500' : 'w-1.5 bg-gray-700'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={onNext}
                        className="flex items-center space-x-2 bg-green-500 text-black px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-green-400 transition-all active:scale-95"
                    >
                        <span>{stepIndex === totalSteps - 1 ? 'Done' : 'Next'}</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-center mt-3 text-gray-600">
                    <Hand className="w-4 h-4 mr-1.5" />
                    <span className="text-xs">Swipe to navigate</span>
                </div>
            </div>
        </motion.div>
    );
};

export const MobileTour: React.FC<MobileTourProps> = ({ onVisibilityChange }) => {
    const { isGuest } = useWallet();
    const { venue } = useEnvironment();
    const { completeChecklistItem } = useOnboarding();
    const [activeStep, setActiveStep] = useState(-1);
    const [showBanner, setShowBanner] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const hasTriggeredConfetti = useRef(false);
    const touchStartX = useRef<number | null>(null);

    const steps = useMemo(() => getTourStepsForPlatform('mobile'), []);

    const localizedSteps = useMemo(() => steps.map(step => {
        if (step.id === 'welcome') {
            return {
                ...step,
                title: venue === 'your next ground' ? 'Welcome to the Preview' : `Preview at ${venue}`,
                content: venue === 'your next ground'
                    ? "You're currently in Preview Mode. This guided walkthrough shows how SportWarren moves from one logged result into verification, squad operations, and season momentum."
                    : `You're currently in Preview Mode. This guided walkthrough uses ${venue} as sample context so you can inspect the flow before you start your own season.`,
            };
        }
        return step;
    }), [steps, venue]);

    useEffect(() => {
        const seen = localStorage.getItem(TOUR_COMPLETED_KEY);
        if (isGuest && !seen) {
            setShowBanner(true);
        }
    }, [isGuest]);

    useEffect(() => {
        if (activeStep >= 0) {
            localStorage.setItem(TOUR_STORAGE_KEY, String(activeStep));
            
            const isFinalStep = activeStep === steps.length - 1;
            if (isFinalStep && !hasTriggeredConfetti.current) {
                hasTriggeredConfetti.current = true;
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
                triggerHaptic('success');
            }
        }
    }, [activeStep, steps.length]);

    const handleComplete = useCallback(() => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        localStorage.removeItem(TOUR_STORAGE_KEY);
        setActiveStep(-1);
        triggerHaptic('light');
    }, []);

    useEffect(() => {
        const handleTourRestart = () => {
            localStorage.removeItem(TOUR_COMPLETED_KEY);
            localStorage.removeItem(TOUR_STORAGE_KEY);
            hasTriggeredConfetti.current = false;
            if (isGuest) {
                setActiveStep(0);
            }
        };
        window.addEventListener('sw-tour-restart', handleTourRestart);
        return () => window.removeEventListener('sw-tour-restart', handleTourRestart);
    }, [isGuest]);

    useEffect(() => {
        onVisibilityChange?.(isGuest && activeStep >= 0);
    }, [activeStep, isGuest, onVisibilityChange]);

    const handleNext = useCallback(() => {
        triggerHaptic('light');
        if (activeStep < localizedSteps.length - 1) {
            setActiveStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    }, [activeStep, handleComplete, localizedSteps.length]);

    const handleBack = useCallback(() => {
        triggerHaptic('light');
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
        }
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        const threshold = 50;
        
        if (diff < -threshold) {
            handleNext();
        } else if (diff > threshold) {
            handleBack();
        }
        
        touchStartX.current = null;
    }, [handleNext, handleBack]);

    useEffect(() => {
        if (activeStep >= 0) {
            const step = localizedSteps[activeStep];
            window.dispatchEvent(new CustomEvent('sw-tour-step', { detail: { id: step.id, activeStep } }));

            if (step.checklistId) {
                completeChecklistItem(step.checklistId);
            }
        }
    }, [activeStep, localizedSteps, completeChecklistItem]);

    if (activeStep < 0 || !isGuest) {
        if (showBanner && isGuest) {
            return (
                <div 
                    className="fixed bottom-6 left-4 right-4 z-[300] pointer-events-auto"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="bg-gray-900 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-green-400 flex-shrink-0" />
                            <div>
                                <div className="text-sm text-white font-bold">Take a quick tour?</div>
                                <div className="text-xs text-gray-500">Learn the core loop</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { triggerHaptic('light'); setShowBanner(false); setActiveStep(0); }}
                                className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2.5 rounded-xl transition-colors active:scale-95"
                            >
                                Start
                            </button>
                            <button 
                                onClick={() => { triggerHaptic('light'); setShowBanner(false); }}
                                className="p-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }

    const step = localizedSteps[activeStep];

    const ConfettiOverlay = () => {
        if (!showConfetti) return null;
        
        const colors = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];
        const particles = Array.from({ length: 30 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 5 + Math.random() * 5,
            duration: 2 + Math.random() * 2,
        }));

        return (
            <div className="fixed inset-0 pointer-events-none z-[400] overflow-hidden">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ x: `${p.x}vw`, y: -20, rotate: 0, opacity: 1 }}
                        animate={{ y: '110vh', rotate: 720, opacity: [1, 1, 0] }}
                        transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
                        className="absolute rounded-sm"
                        style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div 
            className="fixed inset-0 z-[300] pointer-events-none" 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <ConfettiOverlay />
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/70 pointer-events-auto"
            />

            <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence mode="wait">
                    <MobileTourCard
                        key={activeStep}
                        step={step}
                        stepIndex={activeStep}
                        totalSteps={localizedSteps.length}
                        onClose={handleComplete}
                        onNext={handleNext}
                        onBack={handleBack}
                        canGoBack={activeStep > 0}
                    />
                </AnimatePresence>
            </div>
        </div>
    );
};
