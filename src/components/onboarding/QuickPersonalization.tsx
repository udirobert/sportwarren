'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Palette, Shield, Users } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { UserPreferences } from '@/types';
import { Card } from '@/components/ui/Card';
import { getJourneyContent } from '@/lib/journey/content';
import type { DashboardEntryStateId } from '@/lib/dashboard/entry-state';
import { FORMATIONS } from '@/lib/formations';
import type { Formation } from '@/types';

const ROLE_OPTIONS = ['Player', 'Team Organizer', 'Coach', 'Fan/Supporter'] as const;
const INTEREST_OPTIONS = [
    'Log results fast',
    'Get opponent confirmations',
    'Build squad momentum',
    'Track my reputation',
    'Scout players and moves',
] as const;

const SQUAD_COLORS = [
    { name: 'Royal Blue', primary: '#1e40af', secondary: '#3b82f6' },
    { name: 'Crimson', primary: '#991b1b', secondary: '#ef4444' },
    { name: 'Forest', primary: '#166534', secondary: '#22c55e' },
    { name: 'Maroon', primary: '#7f1d1d', secondary: '#dc2626' },
    { name: 'Navy', primary: '#1e3a5f', secondary: '#3b82f6' },
    { name: 'Emerald', primary: '#064e3b', secondary: '#10b981' },
    { name: 'Burgundy', primary: '#7f1d1d', secondary: '#a855f7' },
    { name: 'Gold', primary: '#854d0e', secondary: '#eab308' },
] as const;

const FORMATION_OPTIONS: Formation[] = ['4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2'];

export const QuickPersonalization: React.FC<{ onComplete: () => void; journeyStage?: DashboardEntryStateId }> = ({ onComplete, journeyStage = 'account_ready' }) => {
    const { preferences, savePreferences } = useUserPreferences();
    const [step, setStep] = useState<'role' | 'brand' | 'interests'>('role');
    const [role, setRole] = useState<string | null>(null);
    const [squadName, setSquadName] = useState('');
    const [squadColor, setSquadColor] = useState<typeof SQUAD_COLORS[number]>(SQUAD_COLORS[0]);
    const [squadFormation, setSquadFormation] = useState<Formation>('4-4-2');
    const [interests, setInterests] = useState<Set<string>>(new Set());
    const [isCompleting, setIsCompleting] = useState(false);
    const journeyContent = getJourneyContent(journeyStage);

    // Skip if already personalized
    if (preferences.onboardingCompleted) return null;

    const handleSelectInterest = (interest: string) => {
        setInterests(prev => {
            const next = new Set(prev);
            if (next.has(interest)) next.delete(interest);
            else next.add(interest);
            return next;
        });
    };

    const handleComplete = () => {
        setIsCompleting(true);

        const roleMap: Record<string, string> = {
            'Player': 'player',
            'Team Organizer': 'organizer',
            'Coach': 'coach',
            'Fan/Supporter': 'fan',
        };

        const featureMap: Partial<Record<string, Partial<UserPreferences['preferredFeatures']>>> = {
            'Log results fast': {
                statistics: 'advanced',
                notifications: 'moderate',
            },
            'Get opponent confirmations': {
                notifications: 'all',
                social: 'active',
            },
            'Build squad momentum': {
                social: 'active',
                gamification: 'full',
            },
            'Track my reputation': {
                gamification: 'full',
                statistics: 'detailed',
            },
            'Scout players and moves': {
                statistics: 'advanced',
                social: 'moderate',
            },
        };

        const updatedFeatures = { ...preferences.preferredFeatures };
        for (const interest of interests) {
            Object.assign(updatedFeatures, featureMap[interest] || {});
        }

        savePreferences({
            primaryRole: (roleMap[role!] || 'player') as UserPreferences['primaryRole'],
            preferredFeatures: updatedFeatures,
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
                    {step === 'role' ? (
                        <motion.div
                            key="role"
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

                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {ROLE_OPTIONS.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => setRole(option)}
                                        className={`p-3 rounded-xl text-sm font-bold text-left transition-all ${
                                            role === option
                                                ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                                : 'bg-white/5 border-2 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {option}
                                        {role === option && (
                                            <Check className="w-3.5 h-3.5 inline ml-1.5 text-green-400" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => role && setStep('brand')}
                                disabled={!role}
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
                    ) : step === 'brand' ? (
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
                                Brand Your Squad
                            </h2>
                            <p className="text-xs text-gray-500 mb-4">Give your team an identity before you hit the pitch.</p>

                            {/* Squad Name */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    <Users className="w-3 h-3 inline mr-1" />
                                    Squad Name
                                </label>
                                <input
                                    type="text"
                                    value={squadName}
                                    onChange={(e) => setSquadName(e.target.value)}
                                    placeholder="Enter squad name..."
                                    className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                                />
                            </div>

                            {/* Squad Colors */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    <Palette className="w-3 h-3 inline mr-1" />
                                    Colors
                                </label>
                                <div className="grid grid-cols-4 gap-2">
                                    {SQUAD_COLORS.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSquadColor(color)}
                                            className={`p-2 rounded-lg border-2 transition-all ${
                                                squadColor.name === color.name
                                                    ? 'border-green-500 bg-white/10'
                                                    : 'border-white/10 hover:border-white/30'
                                            }`}
                                        >
                                            <div
                                                className="w-full h-6 rounded-md mb-1"
                                                style={{ background: `linear-gradient(135deg, ${color.primary}, ${color.secondary})` }}
                                            />
                                            <span className="text-[10px] text-gray-400">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Formation */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    <Shield className="w-3 h-3 inline mr-1" />
                                    Preferred Formation
                                </label>
                                <div className="grid grid-cols-5 gap-1">
                                    {FORMATION_OPTIONS.map((formation) => (
                                        <button
                                            key={formation}
                                            onClick={() => setSquadFormation(formation)}
                                            className={`p-2 rounded-lg border-2 text-xs font-bold transition-all ${
                                                squadFormation === formation
                                                    ? 'border-green-500 bg-green-500/20 text-green-300'
                                                    : 'border-white/10 text-gray-400 hover:border-white/30'
                                            }`}
                                        >
                                            {formation}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('interests')}
                                className="w-full py-2.5 bg-white text-gray-900 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-400 transition-colors flex items-center justify-center gap-1"
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
                            key="interests"
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

                            <div className="space-y-2 mb-4">
                                {INTEREST_OPTIONS.map(option => (
                                    <button
                                        key={option}
                                        onClick={() => handleSelectInterest(option)}
                                        className={`w-full p-3 rounded-xl text-sm font-bold text-left transition-all flex items-center justify-between ${
                                            interests.has(option)
                                                ? 'bg-green-500/20 border-2 border-green-500 text-green-300'
                                                : 'bg-white/5 border-2 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        {option}
                                        {interests.has(option) && (
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleComplete}
                                disabled={isCompleting}
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
