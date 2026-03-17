'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronRight, Trophy, RotateCcw, MessageCircle } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Card } from '@/components/ui/Card';
import { PLATFORM_CONFIG, PLATFORM_LIST } from '@/types';

interface OnboardingChecklistProps {
    onStepAction?: (featureKey: string) => void;
}

export const OnboardingChecklist: React.FC<OnboardingChecklistProps> = ({ onStepAction }) => {
    const {
        allChecklistDone,
        checklistItems,
        completedCount,
        totalCount,
        resetOnboarding,
    } = useOnboarding();
    const [expanded, setExpanded] = React.useState(false);

    const progress = Math.round((completedCount / totalCount) * 100);

    if (allChecklistDone) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
            >
                {/* Collapsed pill — shown on mobile when not expanded */}
                <button
                    onClick={() => setExpanded(true)}
                    className={`md:hidden w-full flex items-center justify-between bg-gradient-to-r from-gray-900 to-black border border-gray-800 text-white rounded-xl px-4 py-3 min-h-[44px] ${expanded ? 'hidden' : 'flex'}`}
                >
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-bold uppercase tracking-tight">Getting Started</span>
                        <span className="text-xs text-green-400 font-bold">{completedCount}/{totalCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                </button>

                <Card className={`bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white overflow-hidden relative ${expanded ? 'block' : 'hidden md:block'}`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Trophy className="w-40 h-40" />
                    </div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] mb-1">
                                    Getting Started
                                </div>
                                <h2 className="text-lg font-black uppercase tracking-tight">
                                    Pre-Season Checklist
                                </h2>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">{completedCount}/{totalCount}</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Complete</div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 bg-white/5 rounded-full mb-4 overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>

                        {/* Channel Progress Indicator */}
                        <div className="flex items-center gap-2 mb-4 p-2 bg-white/5 rounded-lg">
                            <MessageCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-400 font-medium">Channels:</span>
                            <div className="flex items-center gap-1 ml-auto">
                                {PLATFORM_LIST.map(platform => {
                                    const config = PLATFORM_CONFIG[platform];
                                    const item = checklistItems.find(i => i.id === `connect_${platform}`);
                                    const isConnected = item?.completed ?? false;
                                    return (
                                        <div
                                            key={platform}
                                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                                                isConnected ? 'bg-green-500/20' : 'bg-white/5 opacity-40'
                                            }`}
                                            title={isConnected ? `${config.name} connected` : `${config.name} not connected`}
                                        >
                                            {config.icon}
                                        </div>
                                    );
                                })}
                                <span className="text-xs text-gray-500 ml-1">
                                    {checklistItems.filter(i => i.id.startsWith('connect_') && i.completed).length}/{PLATFORM_LIST.length}
                                </span>
                            </div>
                        </div>

                        {/* Checklist items */}
                        <div className="space-y-2">
                            {checklistItems.map((item, index) => {
                                const inner = (
                                    <>
                                        <div className="flex-shrink-0">
                                            {item.completed ? (
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                            ) : (
                                                <Circle className="w-5 h-5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                                            )}
                                        </div>
                                        <div className="text-xl flex-shrink-0">{item.emoji}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-sm font-black uppercase tracking-tight leading-tight ${item.completed ? 'text-green-300 line-through decoration-green-500/50' : 'text-white'}`}>
                                                {item.label}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                                            {!item.completed && (
                                                <div className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                                                    {item.actionLabel}
                                                </div>
                                            )}
                                        </div>
                                        {!item.completed && (
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                                        )}
                                    </>
                                );
                                const rowClass = `w-full flex items-center space-x-4 p-3 rounded-xl transition-all text-left group ${item.completed
                                    ? 'bg-green-500/10 border border-green-500/20 cursor-default'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                }`;
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.07 }}
                                    >
                                        {item.completed ? (
                                            <div className={rowClass}>{inner}</div>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                onClick={() => onStepAction?.(item.id)}
                                                className={rowClass}
                                            >
                                                {inner}
                                            </Link>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <p className="text-[10px] text-gray-600 font-mono uppercase">
                                Progress is saved automatically
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={resetOnboarding}
                                    className="text-xs text-gray-700 hover:text-gray-400 flex items-center space-x-1 transition-colors uppercase font-bold"
                                >
                                    <RotateCcw className="w-2.5 h-2.5" />
                                    <span>Restart Tour</span>
                                </button>
                                <button
                                    onClick={() => setExpanded(false)}
                                    className="md:hidden text-xs text-gray-700 hover:text-gray-400 uppercase font-bold transition-colors"
                                >
                                    Collapse
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </AnimatePresence>
    );
};
