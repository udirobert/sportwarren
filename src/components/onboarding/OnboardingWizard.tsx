'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ChevronRight } from 'lucide-react';
import { useOnboarding, ONBOARDING_STEPS } from '@/hooks/useOnboarding';

export const OnboardingWizard: React.FC = () => {
    const { hydrated, wizardDone, wizardStep, advanceWizard, completeWizard } = useOnboarding();

    if (!hydrated || wizardDone) return null;

    const step = ONBOARDING_STEPS[wizardStep];
    const isLast = wizardStep === ONBOARDING_STEPS.length - 1;
    const progress = ((wizardStep + 1) / ONBOARDING_STEPS.length) * 100;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 30, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full max-w-lg"
                >
                    <div className="relative bg-gray-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
                        {/* Progress bar */}
                        <div className="h-1 bg-white/5">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        {/* Skip button */}
                        <button
                            onClick={completeWizard}
                            className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-300 transition-colors rounded-full hover:bg-white/5"
                            aria-label="Skip onboarding"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-8 md:p-12">
                            {/* Step indicator */}
                            <div className="flex items-center space-x-1.5 mb-8">
                                {ONBOARDING_STEPS.map((s, i) => (
                                    <div
                                        key={s.id}
                                        className={`h-1 rounded-full flex-1 transition-all duration-500 ${i < wizardStep
                                                ? 'bg-green-500'
                                                : i === wizardStep
                                                    ? 'bg-green-400'
                                                    : 'bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* Emoji hero */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl flex items-center justify-center text-5xl mb-8 border border-white/10 shadow-xl"
                            >
                                {step.emoji}
                            </motion.div>

                            {/* Content */}
                            <div className="mb-10">
                                <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.25em] mb-3">
                                    Step {wizardStep + 1} of {ONBOARDING_STEPS.length}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight mb-4">
                                    {step.title}
                                </h2>
                                <p className="text-gray-400 text-base leading-relaxed">
                                    {step.description}
                                </p>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={isLast ? completeWizard : advanceWizard}
                                className="group w-full flex items-center justify-between px-6 py-4 bg-white text-gray-900 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-green-400 transition-colors shadow-xl"
                            >
                                <span>{step.action}</span>
                                {isLast
                                    ? <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                }
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
