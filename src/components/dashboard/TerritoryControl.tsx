"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc-client';

export const TerritoryControl: React.FC<{ squadId: string }> = ({ squadId }) => {
    const { data: territory, isLoading } = trpc.squad.getTerritory.useQuery(
        { squadId },
        { staleTime: 1000 * 60 * 10 }
    );

    if (isLoading || !territory) return <div className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>;

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h2 className="text-lg font-bold text-gray-900">Territory Control</h2>
                </div>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Level 4 District</span>
            </div>
            <div className="space-y-4">
                {territory.length === 0 && (
                    <p className="text-xs text-gray-500 italic">No pitches claimed yet. Win a verified match to start controlling territory!</p>
                )}
                {territory.map(pitch => (
                    <div key={pitch.id} className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-bold text-gray-800">{pitch.name}</span>
                            <span className={`text-[10px] font-black uppercase ${pitch.isControlling ? 'text-green-600' : 'text-gray-400'}`}>
                                {pitch.isControlling ? 'Home Turf' : 'Contested'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pitch.dominance}%` }}
                                className={`h-full ${pitch.isControlling ? 'bg-green-500' : 'bg-blue-500'}`}
                            />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-tighter">
                            <span>{pitch.squadWins} Wins</span>
                            <span>{pitch.dominance}% Dominance</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
