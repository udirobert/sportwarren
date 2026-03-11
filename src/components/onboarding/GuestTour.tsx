'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Cpu,
    Shield,
    Trophy,
    Users,
    Zap,
    MousePointer2,
    Share2
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Button } from '@/components/ui/Button';

interface TourStep {
    id: string;
    targetId: string;
    title: string;
    content: string;
    emoji: string;
    icon: React.ComponentType<any>;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome',
        targetId: 'dashboard-header',
        title: "Welcome to the Marshes",
        content: "You're currently in Guest Mode. This is a live demo of the Hackney Marshes Sunday League. Let's see how the squads are doing.",
        emoji: '🏟️',
        icon: Sparkles,
        position: 'bottom',
    },
    {
        id: 'match-engine',
        targetId: 'match-engine',
        title: "The Match Engine",
        content: "This isn't just a video; it's a live simulation using real player stats. Every move is determined by reputation and on-chain performance records.",
        emoji: '🎮',
        icon: Cpu,
        position: 'left',
    },
    {
        id: 'match-verification',
        targetId: 'recent-matches',
        title: "Match Verification",
        content: "Matches played on real pitches are verified here. We check GPS and weather data to ensure every goal is earned fairly.",
        emoji: '✅',
        icon: Shield,
        position: 'top',
    },
    {
        id: 'staff-room',
        targetId: 'staff-feed',
        title: "Your Agentic Squad",
        content: "These are your AI Agents. They monitor squad morale and match data around the clock, giving you tactical insights you won't find anywhere else.",
        emoji: '🎩',
        icon: Users,
        position: 'bottom',
    },
    {
        id: 'lens-social-step',
        targetId: 'lens-social',
        title: "The Social Graph",
        content: "This is where your reputation goes global. Connect your social profile to share match results and compete in the World Grassroots Rankings.",
        emoji: '🌿',
        icon: Share2,
        position: 'top',
    },
    {
        id: 'rpg-stats',
        targetId: 'quick-stats',
        title: "RPG Progression",
        content: "Your real-world performance translates into XP. Level up your attributes and build your legacy across the parallel season.",
        emoji: '📈',
        icon: Trophy,
        position: 'bottom',
    },
    {
        id: 'claim-identity',
        targetId: 'connect-wallet-btn',
        title: "Claim Your Identity",
        content: "Ready to start your own season? Connect your wallet to bridge your real-world football skills to the blockchain.",
        emoji: '⚡',
        icon: Zap,
        position: 'bottom',
    }
];

export const GuestTour: React.FC = () => {
    const { isGuest } = useWallet();
    const { venue } = useEnvironment();
    const [activeStep, setActiveStep] = useState(-1);
    const [hasSeenTour, setHasSeenTour] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

    const localizedSteps = TOUR_STEPS.map(step => {
        if (step.id === 'welcome') {
            return {
                ...step,
                title: `Welcome to ${venue.split(' ')[0]}`,
                content: `You're currently in Guest Mode. This is a live demo at ${venue}. Let's see how the local squads are doing.`
            };
        }
        return step;
    });

    useEffect(() => {
        const seen = localStorage.getItem('sw_guest_tour_seen');
        if (isGuest && !seen) {
            // Delay start for better experience
            const timer = setTimeout(() => setActiveStep(0), 1000);
            return () => clearTimeout(timer);
        }
    }, [isGuest]);

    const updateCoords = useCallback(() => {
        if (activeStep < 0 || activeStep >= localizedSteps.length) return;

        const step = localizedSteps[activeStep];
        const element = document.getElementById(step.targetId);

        if (element) {
            const rect = element.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            });

            // Scroll into view if not visible
            if (activeStep !== 0 && (rect.top < 0 || rect.bottom > window.innerHeight)) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else if (step.position === 'center') {
            setCoords({ top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 });
        }
    }, [activeStep, localizedSteps]);

    useEffect(() => {
        updateCoords();
        window.addEventListener('resize', updateCoords);
        window.addEventListener('scroll', updateCoords, { passive: true });
        return () => {
            window.removeEventListener('resize', updateCoords);
            window.removeEventListener('scroll', updateCoords);
        };
    }, [updateCoords]);

    // Dispatch event to sync other components (MatchEngine, Concierge)
    useEffect(() => {
        if (activeStep >= 0) {
            const step = localizedSteps[activeStep];
            window.dispatchEvent(new CustomEvent('sw-tour-step', {
                detail: { id: step.id, activeStep }
            }));
        }
    }, [activeStep, localizedSteps]);

    const handleNext = () => {
        if (activeStep < localizedSteps.length - 1) {
            setActiveStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (activeStep > 0) {
            setActiveStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        setActiveStep(-1);
        setHasSeenTour(true);
        localStorage.setItem('sw_guest_tour_seen', 'true');
    };

    if (activeStep < 0 || !isGuest) return null;

    const step = localizedSteps[activeStep];
    const Icon = step.icon;

    // Smart positioning logic
    const getPopupStyle = () => {
        if (step.position === 'center') {
            return { top: '40%', left: '50%', transform: 'translate(-50%, -40%)' };
        }

        const margin = 24;
        const popupWidth = 320;
        const popupHeight = 240;

        let top = coords.top + coords.height + margin;
        let left = coords.left + (coords.width / 2) - (popupWidth / 2);

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
            {/* Backdrop with hole */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
                style={{
                    clipPath: step.position === 'center'
                        ? 'none'
                        : `polygon(0% 0%, 0% 100%, ${coords.left}px 100%, ${coords.left}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top}px, ${coords.left + coords.width}px ${coords.top + coords.height}px, ${coords.left}px ${coords.top + coords.height}px, ${coords.left}px 100%, 100% 100%, 100% 0%)`
                }}
            />

            {/* Interaction Layer */}
            <div className="absolute inset-0 pointer-events-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed z-[350]"
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
                                className="absolute -bottom-6 left-1/2 -translateX-1/2 opacity-20"
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
