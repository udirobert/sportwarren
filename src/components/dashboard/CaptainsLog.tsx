"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { trpc } from '@/lib/trpc-client';
import { TrendingUp, MessageSquare, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';

interface CaptainsLogProps {
    squadId?: string;
}

export const CaptainsLog: React.FC<CaptainsLogProps> = ({ squadId }) => {
    const { isVerified } = useWallet();
    const { data, isLoading, error } = trpc.match.getCaptainsLog.useQuery(
        { squadId: squadId! },
        { enabled: !!squadId && isVerified }
    );

    if (!squadId) return null;
    if (!isVerified) {
        return (
            <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-none text-white shadow-xl overflow-hidden relative">
                <div className="p-4 text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-200">Verification Required</p>
                    <p className="text-sm text-indigo-100/80 mt-2">Verify your wallet to unlock the Captain&apos;s Log.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 border-none text-white shadow-xl overflow-hidden relative group">
            {/* Decorative background vectors */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 p-2">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30 backdrop-blur-sm shadow-inner">
                        <TrendingUp className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Captain's Log</h2>
                        <p className="text-xs text-indigo-200/80 font-medium tracking-wide uppercase">Tactical AI Summary</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-3">
                        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                        <p className="text-sm font-medium text-indigo-300 animate-pulse">Coach Kite is analyzing recent form...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                        <p className="text-red-300 text-sm font-medium">Failed to establish tac-link.</p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-start space-x-3 bg-black/20 p-4 rounded-xl border border-white/5 shadow-inner">
                            <MessageSquare className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
                            <p className="text-sm font-medium text-indigo-50/90 leading-relaxed italic">
                                "{data?.summary}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-widest text-indigo-300/70">
                            <span>{data?.matchesFound} Matches Interpreted</span>
                            <span className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span>
                                Coach Kite Online
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>
        </Card>
    );
};
