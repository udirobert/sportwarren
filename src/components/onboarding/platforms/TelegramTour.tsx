'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Cpu, Zap, Users, CheckCircle } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { getTourStepsForPlatform, TOUR_STORAGE_KEY, TOUR_COMPLETED_KEY } from '@/lib/onboarding/tour';
import type { TourStepConfig } from '@/lib/onboarding/types';
import { triggerHaptic } from '@/lib/utils/haptics';

const ICONS: Record<string, React.ComponentType<any>> = {
    Sparkles,
    Cpu,
    Zap,
    Users,
};

interface TelegramTourProps {
    onVisibilityChange?: (isVisible: boolean) => void;
    onComplete?: () => void;
}

const TELEGRAM_STEPS: TourStepConfig[] = [
    {
        id: 'welcome',
        targetId: 'telegram-header',
        title: "Welcome to SportWarren",
        content: "Log matches, build your squad, and track your season progress right from Telegram.",
        emoji: '⚽',
        position: 'center',
    },
    {
        id: 'create-squad',
        targetId: 'create-squad',
        title: "Create Your Squad",
        content: "Start by creating your squad. Invite friends to join and track results together.",
        emoji: '👥',
        position: 'center',
        checklistId: 'view_match_engine',
    },
    {
        id: 'log-match',
        targetId: 'log-match',
        title: "Log a Match",
        content: "Record match results with our easy form. Your opponent confirms to verify the score.",
        emoji: '📝',
        position: 'center',
        checklistId: 'verify_match',
    },
    {
        id: 'connect-wallet',
        targetId: 'connect-wallet',
        title: "Connect Wallet (Optional)",
        content: "Add a wallet for protected actions, or skip for now.",
        emoji: '💳',
        position: 'center',
        checklistId: 'claim_identity',
    },
];

const TelegramTourCard: React.FC<{
    step: TourStepConfig;
    stepIndex: number;
    totalSteps: number;
    onClose: () => void;
    onNext: () => void;
}> = ({ step, stepIndex, totalSteps, onClose, onNext }) => {
    const Icon = ICONS[step.iconName || ''] || Sparkles;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 z-[350] flex items-center justify-center pointer-events-auto"
            style={{ inset: 16 }}
        >
            <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-1 rounded-full transition-all ${i === stepIndex ? 'w-4 bg-green-500' : 'w-1 bg-gray-700'}`}
                                />
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-white">
                        <CheckCircle className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl flex items-center justify-center text-4xl">
                        {step.emoji}
                    </div>
                </div>

                <h3 className="text-lg font-black text-white text-center uppercase tracking-tight mb-2">
                    {step.title}
                </h3>

                <p className="text-sm text-gray-400 text-center leading-relaxed mb-6">
                    {step.content}
                </p>

                <button
                    onClick={onNext}
                    className="w-full bg-green-500 text-black font-black uppercase tracking-wider py-4 rounded-2xl hover:bg-green-400 transition-all active:scale-[0.98]"
                >
                    {stepIndex === totalSteps - 1 ? 'Get Started' : 'Continue'}
                </button>
            </div>
        </motion.div>
    );
};

export const TelegramTour: React.FC<TelegramTourProps> = ({ onVisibilityChange, onComplete }) => {
    const { isGuest } = useWallet();
    const { completeChecklistItem } = useOnboarding();
    const [activeStep, setActiveStep] = useState(-1);
    const hasTriggeredConfetti = useRef(false);
    const tgRef = useRef<{ ready: () => void; close: () => void; MainButton?: { setText: (text: string) => void; onClick: (handler: () => void) => void; offClick: (handler: () => void) => void; show: () => void; hide: () => void }; BackButton?: { onClick: (handler: () => void) => void; offClick: (handler: () => void) => void; show: () => void; hide: () => void } } | null>(null);

    const steps = useMemo(() => {
        const filtered = getTourStepsForPlatform('telegram');
        return filtered.length > 0 ? filtered : TELEGRAM_STEPS;
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
            tgRef.current = window.Telegram.WebApp;
            tgRef.current.ready();
        }
    }, []);

    useEffect(() => {
        const seen = localStorage.getItem(TOUR_COMPLETED_KEY);
        if (isGuest && !seen) {
            setActiveStep(0);
            triggerHaptic('light');
        }
    }, [isGuest]);

    useEffect(() => {
        if (activeStep >= 0) {
            localStorage.setItem(TOUR_STORAGE_KEY, String(activeStep));
            triggerHaptic('light');

            if (activeStep === steps.length - 1 && !hasTriggeredConfetti.current) {
                hasTriggeredConfetti.current = true;
                triggerHaptic('success');
            }
        }
    }, [activeStep, steps.length]);

    const handleComplete = useCallback(() => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        localStorage.removeItem(TOUR_STORAGE_KEY);
        setActiveStep(-1);
        onComplete?.();
        triggerHaptic('success');

        if (tgRef.current) {
            tgRef.current.close();
        }
    }, [onComplete]);

    const handleNext = useCallback(() => {
        if (activeStep < steps.length - 1) {
            setActiveStep(prev => prev + 1);
            triggerHaptic('light');
        } else {
            handleComplete();
        }
    }, [activeStep, handleComplete, steps.length]);

    useEffect(() => {
        onVisibilityChange?.(activeStep >= 0);
    }, [activeStep, onVisibilityChange]);

    useEffect(() => {
        if (activeStep >= 0 && activeStep < steps.length) {
            const step = steps[activeStep];
            window.dispatchEvent(new CustomEvent('sw-tour-step', { detail: { id: step.id, activeStep } }));

            if (step.checklistId) {
                completeChecklistItem(step.checklistId);
            }
        }
    }, [activeStep, steps, completeChecklistItem]);

    useEffect(() => {
        if (activeStep >= 0 && tgRef.current) {
            const tg = tgRef.current;
            
            tg.MainButton?.setText(activeStep === steps.length - 1 ? 'Get Started' : 'Continue');
            tg.MainButton?.onClick(handleNext);
            tg.MainButton?.show();
            tg.BackButton?.onClick(() => {
                if (activeStep > 0) {
                    setActiveStep(prev => prev - 1);
                    triggerHaptic('light');
                }
            });
            
            if (activeStep === 0) {
                tg.BackButton?.hide();
            } else {
                tg.BackButton?.show();
            }
        } else if (tgRef.current) {
            tgRef.current.MainButton?.hide();
            tgRef.current.BackButton?.hide();
        }

        return () => {
            if (tgRef.current) {
                tgRef.current.MainButton?.offClick(handleNext);
            }
        };
    }, [activeStep, handleNext, steps.length]);

    if (activeStep < 0 || !isGuest) {
        return null;
    }

    const step = steps[activeStep];

    return (
        <div className="fixed inset-0 z-[300] pointer-events-none">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/80 pointer-events-auto"
            />

            <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence mode="wait">
                    <TelegramTourCard
                        key={activeStep}
                        step={step}
                        stepIndex={activeStep}
                        totalSteps={steps.length}
                        onClose={handleComplete}
                        onNext={handleNext}
                    />
                </AnimatePresence>
            </div>
        </div>
    );
};
