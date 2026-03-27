'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Card } from '@/components/ui/Card';
import { getJourneyContent } from '@/lib/journey/content';
import type { DashboardEntryStateId } from '@/lib/dashboard/entry-state';

const ROLE_OPTIONS = ['Classic 4-4-2', 'Attacking 4-3-3', 'Defensive 5-3-2', 'Modern 4-2-3-1'] as const;
const INTEREST_OPTIONS = [
    'Primary Color: Emerald',
    'Primary Color: Blue',
    'Primary Color: Crimson',
    'Primary Color: Amber',
    'Primary Color: Midnight',
] as const;

export const QuickPersonalization: React.FC<{ onComplete: () => void; journeyStage?: DashboardEntryStateId }> = ({ onComplete, journeyStage = 'account_ready' }) => {
    const { preferences, savePreferences } = useUserPreferences();
    const [step, setStep] = useState<'formation' | 'brand'>('formation');
    const [formation, setFormation] = useState<string | null>(null);
    const [brand, setBrand] = useState<string | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const journeyContent = getJourneyContent(journeyStage);

    // Skip if already personalized
    if (preferences.onboardingCompleted) return null;

    const handleComplete = () => {
        setIsCompleting(true);

        savePreferences({
            onboardingCompleted: true,
            usagePatterns: {
                ...preferences.usagePatterns,
                completedOnboarding: true,
            },
        });

        // Brief delay for visual feedback
        setTimeout(() => {
            onComplete();
        }, 400);
    };

    return (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white overflow-hidden relative">
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {step === 'formation' ? (
                        <motion.div
                            key="formation"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-1">
                                {journeyContent.personalization.eyebrow}
                            </div>
                            <h2 className="text-lg font-black uppercase tracking-tight mb-1">
                                {journeyContent.personalization.interestsTitle}
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">{journeyContent.personalization.interestsDescription}</p>

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {ROLE_OPTIONS.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setFormation(option)}
                                        className={`p-3 rounded-xl text-sm font-bold text-left transition-all ${
                                            formation === option
                                                ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                                : 'bg-white/5 border-2 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {option}
                                        {formation === option && (
                                            <Check className="w-3.5 h-3.5 inline ml-1.5 text-green-400" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => formation && setStep('brand')}
                                disabled={!formation}
                                className="w-full py-2.5 bg-white text-gray-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={onComplete}
                                className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors mt-2"
                            >
                                Skip for now
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="brand"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-1">
                                {journeyContent.personalization.eyebrow}
                            </div>
                            <h2 className="text-lg font-black uppercase tracking-tight mb-1">
                                {journeyContent.personalization.title}
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">{journeyContent.personalization.description}</p>

                            <div className="space-y-2 mb-4">
                                {INTEREST_OPTIONS.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setBrand(option)}
                                        className={`w-full p-3 rounded-xl text-sm font-bold text-left transition-all flex items-center justify-between ${
                                            brand === option
                                                ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                                : 'bg-white/5 border-2 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {option}
                                        {brand === option && (
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleComplete}
                                disabled={isCompleting || !brand}
                                className="w-full py-2.5 bg-white text-gray-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                {isCompleting ? 'Done!' : journeyContent.personalization.completeLabel}
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                                onClick={onComplete}
                                className="w-full py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors mt-2"
                            >
                                Skip for now
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
};
