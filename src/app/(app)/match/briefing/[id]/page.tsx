'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Zap, Share2, ArrowRight, Target, Cpu, TrendingUp } from 'lucide-react';
import { MatchEnginePreview } from '@/components/dashboard/MatchEnginePreview';
import { Card } from '@/components/ui/Card';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Button } from '@/components/ui/Button';

export default function TeamBriefingPage() {
    const router = useRouter();
    const { preferences } = useUserPreferences();
    const [mounted, setMounted] = useState(false);

    // Get squad branding from preferences (in a real app, this would come from the match/squad ID in params)
    const branding = preferences.squadBranding || {
        nickname: 'The Warriors',
        primaryColor: '#10b981',
        formation: '4-3-3'
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-green-500/30">
            {/* Header / Nav */}
            <div className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-sm font-black uppercase tracking-[0.2em]">SportWarren</div>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-white/10 hover:bg-white/5 gap-2"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Briefing link copied! Send this to your squad.');
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        Share Briefing
                    </Button>
                </div>
            </div>

            <main className="pt-24 pb-20 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: Context & Hype */}
                    <div className="lg:col-span-4 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                <Zap className="w-3 h-3" />
                                Live Tactical Briefing
                            </div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4">
                                {branding.nickname} <br/>
                                <span className="text-gray-500">Tactical DNA</span>
                            </h1>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                                Your captain has locked in the tactical strategy for the next match. 
                                Review the simulation below to understand your role and the team's objective.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="space-y-3"
                        >
                            <Card className="bg-white/5 border-white/10 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-white/5" style={{ color: branding.primaryColor }}>
                                        <Cpu className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selected Tactics</div>
                                        <div className="text-lg font-black uppercase">{branding.formation} (Attacking)</div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-white/5 border-white/10 p-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-white/5 text-blue-400">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expected Edge</div>
                                        <div className="text-lg font-black uppercase">+15% Possession Goal</div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        <div className="pt-4">
                            <Button 
                                className="w-full py-6 rounded-2xl bg-green-500 hover:bg-green-400 text-black font-black uppercase tracking-widest text-xs group"
                                onClick={() => router.push('/dashboard')}
                            >
                                Enter Tactical Command
                                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>

                    {/* Right Column: Interactive Simulation */}
                    <div className="lg:col-span-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="relative group"
                        >
                            {/* Decorative Glow */}
                            <div 
                                className="absolute -inset-4 rounded-[2rem] opacity-20 blur-3xl transition-opacity group-hover:opacity-30"
                                style={{ backgroundColor: branding.primaryColor }}
                            />
                            
                            <div className="relative">
                                <MatchEnginePreview 
                                    homeColor={branding.primaryColor}
                                    playersPerSide={7}
                                />
                                
                                {/* Tactical Overlay Tag */}
                                <div className="absolute top-4 right-4 z-20">
                                    <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: branding.primaryColor }} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Active Simulation</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-gray-900 to-black border border-white/5">
                                <h3 className="text-sm font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-green-400" />
                                    Captain's Note
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed italic">
                                    "We're playing a high line this week. I need the wingers to stay wide and exploit the space. 
                                    Don't forget to rate everyone after the game so we can track our progression!"
                                </p>
                            </div>
                            
                            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-gray-900 to-black border border-white/5 flex flex-col justify-center">
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Squad Readiness</div>
                                <div className="text-3xl font-black uppercase">94%</div>
                                <div className="w-full h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
