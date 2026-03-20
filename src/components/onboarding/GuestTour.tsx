'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Cpu,
    Zap,
    MousePointer2,
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { useOnboarding, type ChecklistId } from '@/hooks/useOnboarding';

// Constants for tour persistence and behavior
const TOUR_STORAGE_KEY = 'sw_tour_current_step';
const TOUR_COMPLETED_KEY = 'sw_guest_tour_seen';

interface TourStep {
    id: string;
    targetId: string;
    title: string;
    content: string;
    emoji: string;
    icon: React.ComponentType<any>;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    checklistId?: ChecklistId;
}

interface GuestTourProps {
    onVisibilityChange?: (isVisible: boolean) => void;
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        targetId: 'dashboard-header',
        title: "Welcome to the Preview",
        content: "You're currently in Preview Mode. This quick walkthrough shows the core loop: log a game, share the link, start your season.",
        emoji: '🏟️',
        icon: Sparkles,
        position: 'bottom',
    },
    {
        id: 'match-engine',
        targetId: 'match-engine',
        title: "Log Your First Game",
        content: "This is the match canvas — it visualizes your game in real time. When you're ready, submit a real result and share the link with your opponent.",
        emoji: '🎮',
        icon: Cpu,
        position: 'left',
        checklistId: 'view_match_engine',
    },
    {
        id: 'claim-identity',
        targetId: 'connect-wallet-btn',
        title: "Start Your Season",
        content: "Ready to leave the preview? Create your account now. You can add a wallet later when you want protected actions.",
        emoji: '⚡',
        icon: Zap,
        position: 'bottom',
        checklistId: 'claim_identity',
    }
];

export const GuestTour: React.FC<GuestTourProps> = ({ onVisibilityChange }) => {
    const { isGuest } = useWallet();
    const { venue } = useEnvironment();
    const { completeChecklistItem } = useOnboarding();
    const [activeStep, setActiveStep] = useState(-1);
    const [showBanner, setShowBanner] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [targetResolved, setTargetResolved] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    
    // Track if tour was completed this session for confetti
    const hasTriggeredConfetti = useRef(false);

    const localizedSteps = useMemo(() => TOUR_STEPS.map(step => {
        if (step.id === 'welcome') {
            return {
                ...step,
                title: venue === 'your next ground' ? 'Welcome to the Preview' : `Preview at ${venue}`,
                content: venue === 'your next ground'
                    ? "You're currently in Preview Mode. This guided walkthrough shows how SportWarren moves from one logged result into verification, squad operations, and season momentum."
                    : `You're currently in Preview Mode. This guided walkthrough uses ${venue} as sample context so you can inspect the flow before you start your own season.`
            };
        }
        return step;
    }), [venue]);

    // Initialize tour - opt-in banner instead of auto-start
    useEffect(() => {
        const seen = localStorage.getItem(TOUR_COMPLETED_KEY);
        if (isGuest && !seen) {
            // Show banner hint but don't auto-start
            setShowBanner(true);
        }
    }, [isGuest]);

    // Persist step changes to localStorage
    useEffect(() => {
        if (activeStep >= 0) {
            localStorage.setItem(TOUR_STORAGE_KEY, String(activeStep));
            
            // Trigger confetti on final step (only once)
            const isFinalStep = activeStep === TOUR_STEPS.length - 1;
            if (isFinalStep && !hasTriggeredConfetti.current) {
                hasTriggeredConfetti.current = true;
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 3000);
            }
        }
    }, [activeStep]);

    // Handle tour completion
    const handleComplete = useCallback(() => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        localStorage.removeItem(TOUR_STORAGE_KEY);
        setActiveStep(-1);
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

    const updateCoords = useCallback(() => {
        if (activeStep < 0 || activeStep >= localizedSteps.length) return;

        const step = localizedSteps[activeStep];
        
        // Find the visible element if multiple exist with same ID (e.g. mobile/desktop variants)
        const findVisibleElement = (id: string) => {
            const elements = document.querySelectorAll(`[id="${id}"]`);
            if (elements.length === 0) return null;
            if (elements.length === 1) return elements[0] as HTMLElement;
            
            return Array.from(elements).find(el => {
                const rect = el.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            }) as HTMLElement | null;
        };

        const element = findVisibleElement(step.targetId);

        if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) {
                setTargetResolved(false);
                return;
            }
            setTargetResolved(true);
            
            // Only update if changed to avoid unnecessary re-renders
            setCoords(prev => {
                if (
                    prev.top === rect.top && 
                    prev.left === rect.left && 
                    prev.width === rect.width && 
                    prev.height === rect.height
                ) {
                    return prev;
                }
                return {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                };
            });

            // Scroll into view if not visible
            if (activeStep !== 0 && (rect.top < 0 || rect.bottom > window.innerHeight)) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else {
            setTargetResolved(false);
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            setCoords(prev => {
                if (prev.top === centerY && prev.left === centerX) return prev;
                return { top: centerY, left: centerX, width: 0, height: 0 };
            });
        }
    }, [activeStep, localizedSteps]);

    useEffect(() => {
        updateCoords();
        window.addEventListener('resize', updateCoords);
        window.addEventListener('scroll', updateCoords, { passive: true });

        const mutationObserver = new MutationObserver(() => updateCoords());
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
        });
        
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords);
            mutationObserver.disconnect();
        };
    }, [updateCoords]);

    const handleNext = useCallback(() => {
        if (activeStep < localizedSteps.length - 1) {
            setActiveStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    }, [activeStep, handleComplete, localizedSteps.length]);

    const handleBack = useCallback(() => {
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
        }
    }, [activeStep]);

    // Keyboard Navigation
    useEffect(() => {
        if (activeStep < 0) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleComplete();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handleBack();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeStep, handleBack, handleComplete, handleNext]);

    // Dispatch event to sync other components (MatchEngine, Concierge) + Link Progress
    useEffect(() => {
        if (activeStep >= 0) {
            const step = localizedSteps[activeStep];
            window.dispatchEvent(new CustomEvent('sw-tour-step', {
                detail: { id: step.id, activeStep }
            }));

            // Link to checklist progress
            if (step.checklistId) {
                completeChecklistItem(step.checklistId);
            }
        }
    }, [activeStep, localizedSteps, completeChecklistItem]);

    if (activeStep < 0 || !isGuest) {
        // Show opt-in banner when not in tour
        if (showBanner && isGuest) {
            return (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] pointer-events-auto">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl px-4 py-3 flex items-center space-x-3 shadow-2xl">
                        <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-sm text-white font-medium">Take a quick tour?</span>
                        <button
                            onClick={() => { setShowBanner(false); setActiveStep(0); }}
                            className="bg-green-500 hover:bg-green-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Start
                        </button>
                        <button
                            onClick={() => setShowBanner(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    }

    const step = localizedSteps[activeStep];
    const Icon = step.icon;

    // Confetti celebration on final step
    const ConfettiOverlay = () => {
        if (!showConfetti) return null;
        
        const colors = ['#22c55e', '#3b82f6', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];
        const particles = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 6 + Math.random() * 6,
            duration: 2 + Math.random() * 2,
        }));

        return (
            <div className="fixed inset-0 pointer-events-none z-[400] overflow-hidden">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ 
                            x: `${p.x}vw`, 
                            y: -20,
                            rotate: 0,
                            opacity: 1 
                        }}
                        animate={{ 
                            y: '110vh',
                            rotate: 720,
                            opacity: [1, 1, 0]
                        }}
                        transition={{ 
                            duration: p.duration, 
                            delay: p.delay,
                            ease: 'easeIn'
                        }}
                        className="absolute rounded-sm"
                        style={{
                            width: p.size,
                            height: p.size * 0.6,
                            backgroundColor: p.color,
                        }}
                    />
                ))}
            </div>
        );
    };

    // Smart positioning logic
    const getPopupStyle = (): React.CSSProperties => {
        if (step.position === 'center' || !targetResolved) {
            return { top: '40%', left: '50%', transform: 'translate(-50%, -40%)' };
        }

        const margin = 24;
        const popupWidth = 320;
        const popupHeight = 240;

        let top = coords.top + coords.height + margin;
        let left = coords.left + (coords.width / 2) - (popupWidth / 2);

        // Mobile: center-docked tooltips at bottom
        if (window.innerWidth < 640) {
            return { 
                top: 'auto', 
                bottom: 20, 
                left: 16, 
                right: 16,
                transform: 'none' 
            };
        }

        // Adjust based on step preference
        if (step.position === 'top') {
            top = coords.top - popupHeight - margin;
        } else if (step.position === 'left' && window.innerWidth > 800) {
            top = coords.top + (coords.height / 2) - (popupHeight / 2);
            left = coords.left - popupWidth - margin;
        } else if (step.position === 'right' && window.innerWidth > 800) {
            top = coords.top + (coords.height / 2) - (popupHeight / 2);
            left = coords.left + coords.width + margin;
        }

        // Screen boundary safety - keep within viewport
        left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - popupHeight - 16));

        return { top, left };
    };

    return (
        <div className="fixed inset-0 z-[300] pointer-events-none">
            <ConfettiOverlay />
            
            {/* Backdrop with hole */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
                style={{
                    clipPath: step.position === 'center' || !targetResolved
                        ? 'none'
                        : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
                }}
            />

            {/* Visual Ping Animation */}
            {step.position !== 'center' && targetResolved && (
                <motion.div
                    key={`ping-${activeStep}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                        opacity: [0, 0.4, 0],
                        scale: [0.8, 1.2, 1.4],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut"
                    }}
                    className="absolute border-2 border-green-400 rounded-3xl pointer-events-none"
                    style={{
                        top: coords.top - 8,
                        left: coords.left - 8,
                        width: coords.width + 16,
                        height: coords.height + 16,
                    }}
                />
            )}

            {/* Interaction Layer */}
            <div className="absolute inset-0 pointer-events-none">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed z-[350] pointer-events-auto"
                        style={getPopupStyle()}
                    >
                        <div className="bg-white rounded-3xl p-6 shadow-2xl w-[320px] relative overflow-hidden group">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                <Icon className="w-20 h-20" />
                            </div>

                            <div className="relative z-10">
                                {/* Header */}
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-xl shadow-lg">
                                        {step.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                            Step {activeStep + 1} of {TOUR_STEPS.length}
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                            {step.title}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={handleComplete}
                                        className="p-1 text-gray-300 hover:text-gray-900 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium font-sans">
                                    {step.content}
                                </p>

                                {/* Controls */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleBack}
                                        disabled={activeStep === 0}
                                        className={`p-2 rounded-full transition-all ${activeStep === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    <div className="flex space-x-1">
                                        {TOUR_STEPS.map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-1 rounded-full transition-all duration-300 ${i === activeStep ? 'w-4 bg-gray-900' : 'w-1 bg-gray-200'}`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-500 transition-all hover:scale-105 shadow-lg group"
                                    >
                                        <span>{activeStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Pointer helper */}
                            <motion.div
                                animate={{ y: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-20"
                            >
                                <MousePointer2 className="w-12 h-12 text-gray-900 fill-current" />
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
