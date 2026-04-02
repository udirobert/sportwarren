'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Palette, Shield, Users, User, Camera } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Card } from '@/components/ui/Card';
import { trpc } from '@/lib/trpc-client';
import { useWallet } from '@/contexts/WalletContext';
import { getJourneyContent } from '@/lib/journey/content';
import type { DashboardEntryStateId } from '@/lib/dashboard/entry-state';
import type { PlayerPosition } from '@/types';

const FORMATION_OPTIONS = [
    { id: '4-4-2', label: 'Classic 4-4-2', description: 'Balanced and structured' },
    { id: '4-3-3', label: 'Attacking 4-3-3', description: 'Wide play and high pressure' },
    { id: '5-3-2', label: 'Solid 5-3-2', description: 'Counter-attacking depth' },
    { id: '4-2-3-1', label: 'Modern 4-2-3-1', description: 'Technical and fluid' },
] as const;

const BRAND_COLORS = [
    { name: 'Emerald', hex: '#10b981', bg: 'bg-emerald-500' },
    { name: 'Blue', hex: '#3b82f6', bg: 'bg-blue-500' },
    { name: 'Crimson', hex: '#ef4444', bg: 'bg-red-500' },
    { name: 'Amber', hex: '#f59e0b', bg: 'bg-amber-500' },
    { name: 'Midnight', hex: '#1e293b', bg: 'bg-slate-800' },
    { name: 'Purple', hex: '#a855f7', bg: 'bg-purple-500' },
] as const;

export const QuickPersonalization: React.FC<{ onComplete: () => void; journeyStage?: DashboardEntryStateId }> = ({ onComplete, journeyStage = 'account_ready' }) => {
    const { preferences, savePreferences } = useUserPreferences();
    const { isVerified } = useWallet();
    const [step, setStep] = useState<'identity' | 'formation' | 'brand'>('identity');
    const [playerName, setPlayerName] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [formation, setFormation] = useState<string | null>(preferences.squadBranding?.formation || null);
    const [primaryColor, setPrimaryColor] = useState<string>(preferences.squadBranding?.primaryColor || '#10b981');
    const [nickname, setNickname] = useState<string>(preferences.squadBranding?.nickname || '');
    const [isCompleting, setIsCompleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const updateProfile = trpc.player.updateProfile.useMutation();
    const journeyContent = getJourneyContent(journeyStage);

    // Skip if already personalized
    if (preferences.onboardingCompleted) return null;

    const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return;
        if (file.size > 2 * 1024 * 1024) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleComplete = () => {
        setIsCompleting(true);

        // Save player identity to backend if verified
        if (isVerified && playerName.trim().length >= 2) {
            updateProfile.mutate({
                name: playerName.trim(),
                position: 'MF' as PlayerPosition,
                avatar: avatarPreview || undefined,
            });
        }

        savePreferences({
            onboardingCompleted: true,
            squadBranding: {
                primaryColor,
                secondaryColor: '#ffffff',
                nickname: nickname || 'The Warriors',
                formation: formation || '4-4-2',
            },
            usagePatterns: {
                ...preferences.usagePatterns,
                completedOnboarding: true,
            },
        });

        // Brief delay for visual feedback
        setTimeout(() => {
            onComplete();
        }, 800);
    };

    return (
        <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800 text-white overflow-hidden relative shadow-2xl">
            {/* Visual Header Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                {step === 'identity' ? <User size={120} /> : step === 'formation' ? <Users size={120} /> : <Palette size={120} />}
            </div>

            <div className="p-8">
                <AnimatePresence mode="wait">
                    {step === 'identity' ? (
                        <motion.div
                            key="identity"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <User className="w-3 h-3" />
                                {journeyContent.personalization.eyebrow}
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                                Create Your Player
                            </h2>
                            <p className="text-sm text-gray-400 mb-8 max-w-sm">This is how teammates and opponents will see you on the pitch.</p>

                            {/* Avatar */}
                            <div className="mb-6 flex items-center gap-4">
                                <div
                                    className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/10 border-2 border-white/20 flex items-center justify-center cursor-pointer group shrink-0"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-white/40" />
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm font-bold text-green-400 hover:text-green-300 transition-colors"
                                    >
                                        {avatarPreview ? 'Change photo' : 'Add a photo'}
                                    </button>
                                    <p className="text-xs text-gray-500 mt-1">JPG or PNG, max 2MB</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarFile}
                                    className="hidden"
                                />
                            </div>

                            {/* Name */}
                            <div className="mb-8">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Player Name</label>
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="e.g. Marcus Johnson"
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-green-500 transition-colors"
                                    maxLength={40}
                                />
                            </div>

                            {/* Live preview card */}
                            <div className="bg-white/5 rounded-2xl p-4 mb-8 flex items-center gap-4 border border-white/10">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center overflow-hidden shrink-0">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-white" />
                                    )}
                                </div>
                                <div>
                                    <div className="text-sm font-black uppercase tracking-tight">
                                        {playerName || 'Your Name'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Player Card Preview</div>
                                </div>
                                <div className="ml-auto text-2xl font-black text-green-400">50</div>
                            </div>

                            <button
                                onClick={() => playerName.trim().length >= 2 && setStep('formation')}
                                disabled={playerName.trim().length < 2}
                                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Choose Your Tactics
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={onComplete}
                                className="w-full py-3 text-xs text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest transition-colors mt-4"
                            >
                                Skip & Explore First
                            </button>
                        </motion.div>
                    ) : step === 'formation' ? (
                        <motion.div
                            key="formation"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                {journeyContent.personalization.eyebrow}
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                                Choose Your Tactical DNA
                            </h2>
                            <p className="text-sm text-gray-400 mb-8 max-w-sm">How will your squad dominate the pitch? This sets your default simulation behavior.</p>

                            <div className="grid grid-cols-1 gap-3 mb-8">
                                {FORMATION_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setFormation(option.id)}
                                        className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden group ${
                                            formation === option.id
                                                ? 'bg-green-500/10 border-2 border-green-500 ring-4 ring-green-500/20'
                                                : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className={`text-sm font-black uppercase tracking-wide ${formation === option.id ? 'text-green-400' : 'text-white'}`}>
                                                    {option.label}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                                            </div>
                                            {formation === option.id && (
                                                <div className="bg-green-500 rounded-full p-1">
                                                    <Check className="w-3 h-3 text-black" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => formation && setStep('brand')}
                                disabled={!formation}
                                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                Define Your Identity
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setStep('identity')}
                                className="w-full py-3 text-xs text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest transition-colors mt-4"
                            >
                                Back to Identity
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="brand"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="text-[10px] font-black text-green-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                <Palette className="w-3 h-3" />
                                {journeyContent.personalization.eyebrow}
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
                                Brand Your Squad
                            </h2>
                            <p className="text-sm text-gray-400 mb-8">This identity will be shared with your teammates in their briefing.</p>

                            <div className="mb-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Squad Nickname</label>
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="e.g. The Warriors, North London FC"
                                    className="w-full bg-white/5 border-2 border-white/10 rounded-2xl p-4 text-white font-bold focus:outline-none focus:border-green-500 transition-colors"
                                />
                            </div>

                            <div className="mb-8">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">Squad Colors</label>
                                <div className="flex flex-wrap gap-4">
                                    {BRAND_COLORS.map(color => (
                                        <button
                                            key={color.name}
                                            onClick={() => setPrimaryColor(color.hex)}
                                            className={`w-12 h-12 rounded-full ${color.bg} transition-all relative ${
                                                primaryColor === color.hex 
                                                    ? 'ring-4 ring-white ring-offset-4 ring-offset-black scale-110' 
                                                    : 'hover:scale-105 opacity-60 hover:opacity-100'
                                            }`}
                                        >
                                            {primaryColor === color.hex && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Check className="w-6 h-6 text-white drop-shadow-md" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Kit Preview Mockup */}
                            <div className="bg-white/5 rounded-2xl p-6 mb-8 flex items-center justify-center border border-white/10">
                                <div className="relative">
                                    <Shield size={64} style={{ color: primaryColor }} fill={primaryColor} />
                                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white uppercase mt-1">
                                        SW
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <div className="text-lg font-black uppercase tracking-tight leading-none mb-1">
                                        {nickname || 'Your Squad'}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                        {formation || 'Tactics Selected'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleComplete}
                                disabled={isCompleting || !nickname}
                                className="w-full py-4 bg-green-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-green-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isCompleting ? 'Creating Season...' : 'Launch Your Season'}
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => setStep('formation')}
                                className="w-full py-3 text-xs text-gray-600 hover:text-gray-400 font-bold uppercase tracking-widest transition-colors mt-2"
                            >
                                Back to Tactics
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
};
