"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trophy, Zap, ChevronRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCreateSquad } from '@/hooks/squad/useSquad';

interface CreateSquadFlowProps {
    onCreated: (squadId: string) => void;
    onCancel?: () => void;
}

const SQUAD_ARCHETYPES = [
    { id: 'street', emoji: '🏙️', label: 'Street Kings', description: 'Fast, physical, built for hard weekly matches.' },
    { id: 'technical', emoji: '🎯', label: 'Technical XI', description: 'Possession-based. Outthink the opposition.' },
    { id: 'community', emoji: '🤝', label: 'Community Club', description: 'Reputation-first. Grow your Lens following.' },
];

export const CreateSquadFlow: React.FC<CreateSquadFlowProps> = ({ onCreated, onCancel }) => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [squadName, setSquadName] = useState('');
    const [archetype, setArchetype] = useState('');
    const [error, setError] = useState('');
    const { createSquad, isCreating } = useCreateSquad();

    const handleCreate = async () => {
        if (!squadName.trim()) { setError('Give your squad a name, Boss.'); return; }
        if (!archetype) { setError('Pick a squad identity first.'); return; }
        setError('');
        try {
            const shortName = squadName
                .trim()
                .split(/\s+/)
                .map(part => part[0] || '')
                .join('')
                .slice(0, 5)
                .toUpperCase() || squadName.trim().slice(0, 5).toUpperCase();

            const result = await createSquad({
                name: squadName.trim(),
                shortName,
                homeGround: archetype,
            });
            onCreated(result.id);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Progress */}
                <div className="flex items-center space-x-2 mb-10">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-500' : 'bg-white/10'}`} />
                    ))}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="ml-4 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Cancel squad creation"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="mb-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Step 1 of 3</div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Name Your Squad</h1>
                            <p className="text-gray-400 text-sm mb-8">This is how your club will be known across the league.</p>
                            <input
                                type="text"
                                value={squadName}
                                onChange={e => { setSquadName(e.target.value); setError(''); }}
                                placeholder="e.g. Marshside Wolves FC"
                                maxLength={40}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg font-bold placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            {error && <p className="text-red-400 text-xs font-bold mt-2">{error}</p>}
                            <Button
                                onClick={() => { if (!squadName.trim()) { setError('Give your squad a name, Boss.'); return; } setError(''); setStep(2); }}
                                className="w-full mt-6 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest flex items-center justify-center space-x-2"
                            >
                                <span>Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="mb-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Step 2 of 3</div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Pick Your Identity</h1>
                            <p className="text-gray-400 text-sm mb-8">Your squad archetype shapes your starting reputation and tactical style.</p>
                            <div className="space-y-3">
                                {SQUAD_ARCHETYPES.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => { setArchetype(a.id); setError(''); }}
                                        className={`w-full p-5 rounded-2xl border text-left transition-all ${archetype === a.id ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-3xl">{a.emoji}</span>
                                            <div>
                                                <div className="text-white font-black uppercase tracking-wide text-sm">{a.label}</div>
                                                <div className="text-gray-400 text-xs mt-0.5">{a.description}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {error && <p className="text-red-400 text-xs font-bold mt-2">{error}</p>}
                            <div className="flex space-x-3 mt-6">
                                <Button onClick={() => setStep(1)} variant="outline" className="flex-1 py-5 border-white/10 text-gray-300 font-black uppercase tracking-widest">Back</Button>
                                <Button
                                    onClick={() => { if (!archetype) { setError('Pick a squad identity first.'); return; } setError(''); setStep(3); }}
                                    className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest flex items-center justify-center space-x-2"
                                >
                                    <span>Next</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <div className="mb-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Step 3 of 3</div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">Ready to Launch</h1>
                            <p className="text-gray-400 text-sm mb-8">Here's what you're building. Confirm to create your squad on-chain.</p>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 mb-8">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Squad Name</span>
                                    <span className="text-white font-black">{squadName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Identity</span>
                                    <span className="text-white font-black">{SQUAD_ARCHETYPES.find(a => a.id === archetype)?.label}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Starting Budget</span>
                                    <span className="text-blue-400 font-black">5,000 Credits</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lens Reputation</span>
                                    <span className="text-white font-black">0 (Building)</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-8">
                                {[
                                    { icon: Users, label: 'Recruit Players' },
                                    { icon: Trophy, label: 'Enter Leagues' },
                                    { icon: Zap, label: 'Earn Reputation' },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                                        <Icon className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                                        <div className="text-[9px] font-black text-gray-300 uppercase tracking-wide">{label}</div>
                                    </div>
                                ))}
                            </div>

                            {error && <p className="text-red-400 text-xs font-bold mb-4">{error}</p>}

                            <div className="flex space-x-3">
                                <Button onClick={() => setStep(2)} variant="outline" className="flex-1 py-5 border-white/10 text-gray-300 font-black uppercase tracking-widest" disabled={isCreating}>Back</Button>
                                <Button
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="flex-1 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest flex items-center justify-center space-x-2"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Squad</span>}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
