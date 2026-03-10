"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Search, ExternalLink } from 'lucide-react';
import { Triangle } from 'lucide-react';

interface ScoutingReportProps {
    isLoading?: boolean;
}

export const ScoutingReport: React.FC<ScoutingReportProps> = ({ isLoading }) => {
    if (isLoading) {
        return (
            <Card className="bg-gradient-to-br from-gray-900 to-blue-900 text-white animate-pulse">
                <div className="h-4 w-32 bg-gray-700 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-20 bg-gray-800 rounded"></div>
                    <div className="h-8 bg-gray-800 rounded"></div>
                </div>
            </Card>
        );
    }

    const rival = {
        name: 'Northside FC',
        threat: 'Marcus Johnson',
        position: 'ST',
        stats: { pace: 88, finishing: 84, physicality: 80 },
        form: '🔥 Burning',
        lensHandle: 'marcus.lens',
    };

    return (
        <Card className="bg-gradient-to-br from-gray-900 to-blue-900 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Search className="w-24 h-24" />
            </div>

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-500/20 p-1.5 rounded-lg border border-blue-500/30">
                        <Search className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-blue-400">Scouting Report</h2>
                        <p className="text-xs text-gray-400">Match Day Rivals Spotlight</p>
                    </div>
                </div>
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded-full">
                    <span className="text-xs font-black text-blue-400 uppercase">Priority 1</span>
                </div>
            </div>

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                    <div className="text-xl font-black tracking-tight">{rival.threat}</div>
                    <div className="flex items-center space-x-2 text-blue-300">
                        <span className="text-xs font-bold uppercase">{rival.position} • {rival.name}</span>
                        <div className="w-1 h-1 bg-blue-300 rounded-full" />
                        <span className="text-xs font-mono">{rival.form}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs font-bold text-blue-400 uppercase">Handle</div>
                    <div className="text-xs font-mono font-bold flex items-center justify-end space-x-1">
                        <span>@{rival.lensHandle}</span>
                        <ExternalLink className="w-2 h-2" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 relative z-10">
                {Object.entries(rival.stats).map(([key, val]) => (
                    <div key={key} className="bg-black/30 rounded-lg p-2 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black uppercase text-gray-400">{key}</span>
                            <Triangle className="w-1.5 h-1.5 fill-green-500 text-green-500" />
                        </div>
                        <div className="text-lg font-black">{val}</div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                Mark for Opposition Instructions
            </button>
        </Card>
    );
};
