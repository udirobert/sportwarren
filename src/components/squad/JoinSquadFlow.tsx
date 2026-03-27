"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, X, Loader2, ArrowRight } from 'lucide-react';
import { useSquads } from '@/hooks/squad/useSquad';
import { trpc } from '@/lib/trpc-client';

interface JoinSquadFlowProps {
    onJoined: (squadId: string) => void;
    onCancel?: () => void;
}

export const JoinSquadFlow: React.FC<JoinSquadFlowProps> = ({ onJoined, onCancel }) => {
    const [search, setSearch] = useState('');
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const { squads, loading } = useSquads(search || undefined);
    const joinMutation = trpc.squad.join.useMutation();

    const handleJoin = useCallback(async (squadId: string) => {
        setJoiningId(squadId);
        setError('');
        try {
            await joinMutation.mutateAsync({ squadId });
            onJoined(squadId);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to join squad. Try again.');
            setJoiningId(null);
        }
    }, [onJoined, joinMutation]);

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="mb-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Find your team</div>
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">Join a Squad</h1>
                    </div>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Cancel"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setError(''); }}
                        placeholder="Search squads by name..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-lg font-bold placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {error && <p className="text-red-400 text-xs font-bold mb-4">{error}</p>}

                {/* Results */}
                <div className="space-y-3">
                    {loading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                        </div>
                    )}

                    {!loading && search && squads.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-sm">No squads found matching &ldquo;{search}&rdquo;</p>
                            <p className="text-gray-500 text-xs mt-1">Try a different name or create your own.</p>
                        </div>
                    )}

                    {!loading && !search && (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-sm">Start typing to search for squads</p>
                            <p className="text-gray-500 text-xs mt-1">Or browse recent squads below.</p>
                        </div>
                    )}

                    {!loading && squads.map(squad => (
                        <button
                            key={squad.id}
                            onClick={() => handleJoin(squad.id)}
                            disabled={joiningId !== null}
                            className="w-full p-5 rounded-2xl border text-left transition-all bg-white/5 border-white/10 hover:border-blue-500 hover:bg-blue-600/10 disabled:opacity-50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-sm">
                                        {squad.shortName?.slice(0, 2) || squad.name.slice(0, 2)}
                                    </div>
                                    <div>
                                        <div className="text-white font-black uppercase tracking-wide text-sm">{squad.name}</div>
                                        <div className="flex items-center space-x-2 text-gray-400 text-xs mt-0.5">
                                            <Users className="w-3 h-3" />
                                            <span>{squad.memberCount} {squad.memberCount === 1 ? 'member' : 'members'}</span>
                                        </div>
                                    </div>
                                </div>
                                {joiningId === squad.id ? (
                                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                ) : (
                                    <ArrowRight className="w-4 h-4 text-gray-500" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-gray-500 text-xs">
                        Can&apos;t find your squad?{' '}
                        {onCancel && (
                            <button onClick={onCancel} className="text-blue-400 hover:text-blue-300 underline">
                                Create one instead
                            </button>
                        )}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
