"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, TrendingUp, ShieldCheck, Briefcase, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ContractNegotiationModalProps {
    playerName: string;
    currentWage: number;
    isOpen: boolean;
    onClose: () => void;
    onFinalize: (newWage: number) => void;
}

export const ContractNegotiationModal: React.FC<ContractNegotiationModalProps> = ({
    playerName,
    currentWage,
    isOpen,
    onClose,
    onFinalize
}) => {
    const [offer, setOffer] = useState(currentWage);
    const [perks, setPerks] = useState<string[]>([]);
    const [negotiationStatus, setNegotiationStatus] = useState<'idle' | 'negotiating' | 'success'>('idle');

    const handleNegotiate = () => {
        setNegotiationStatus('negotiating');
        setTimeout(() => {
            setNegotiationStatus('success');
        }, 2000);
    };

    const togglePerk = (perk: string) => {
        setPerks(prev =>
            prev.includes(perk) ? prev.filter(p => p !== perk) : [...prev, perk]
        );
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="w-full max-w-xl bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600/20 p-2 rounded-xl">
                                <Briefcase className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Contract Renewal</h2>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Negotiating for {playerName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8">
                        {negotiationStatus === 'idle' && (
                            <div className="space-y-8">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Proposed Weekly Wage</label>
                                            <div className="text-3xl font-black text-white tracking-tighter italic">
                                                {offer.toLocaleString()} <span className="text-blue-500 text-sm">CREDITS</span>
                                            </div>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-blue-500/20" />
                                    </div>
                                    <input
                                        type="range"
                                        min={currentWage * 0.8}
                                        max={currentWage * 2}
                                        step={50}
                                        value={offer}
                                        onChange={(e) => setOffer(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between text-[9px] font-bold text-gray-600 mt-2 uppercase">
                                        <span>Current: {currentWage.toLocaleString()}</span>
                                        <span>Max Budget: {(currentWage * 2).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Performance Incentives</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'goal', label: 'Goal Bonus', icon: Zap },
                                            { id: 'clean', label: 'Clean Sheet', icon: ShieldCheck },
                                            { id: 'loyalty', label: 'Loyalty Bonus', icon: Sparkles },
                                            { id: 'promotion', label: 'Promotion Clause', icon: TrendingUp }
                                        ].map(perk => (
                                            <button
                                                key={perk.id}
                                                onClick={() => togglePerk(perk.id)}
                                                className={`p-4 rounded-xl border flex items-center space-x-3 transition-all ${perks.includes(perk.id)
                                                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/5'
                                                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10'
                                                    }`}
                                            >
                                                <perk.icon className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase">{perk.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleNegotiate}
                                    className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest"
                                >
                                    Push Contract to Agent
                                </Button>
                            </div>
                        )}

                        {negotiationStatus === 'negotiating' && (
                            <div className="py-12 text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6"
                                />
                                <h3 className="text-xl font-black text-white italic uppercase">The Agent is reviewing...</h3>
                                <p className="text-gray-500 text-sm mt-2">Checking Lens reputation thresholds and treasury liquidity</p>
                            </div>
                        )}

                        {negotiationStatus === 'success' && (
                            <div className="py-12 text-center">
                                <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Contract Signed!</h3>
                                <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
                                    {playerName} has committed to the project. The new wage of {offer.toLocaleString()} has been locked on-chain.
                                </p>
                                <Button
                                    onClick={() => onFinalize(offer)}
                                    className="mt-8 px-10 bg-white text-black hover:bg-gray-100 font-black uppercase tracking-widest"
                                >
                                    Finalize Transaction
                                </Button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
