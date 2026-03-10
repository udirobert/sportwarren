"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, Heart, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface SquadDynamicsProps {
    squadId: string;
}

export const SquadDynamics: React.FC<SquadDynamicsProps> = ({ squadId }) => {
    // Mock data for now
    const stats = {
        avgSharpness: 78,
        avgMorale: 85,
        avgPace: 72,
        trend: 'up' as 'up' | 'down' | 'stable',
        teamMaturity: 'Developing',
        keyPlayers: [
            { name: 'Marcus', status: 'Peaking', form: 9.2 },
            { name: 'Jamie', status: 'Fatigued', form: 6.5 },
        ]
    };

    return (
        <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-bold text-gray-900">Squad Dynamics</h2>
                </div>
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-100 rounded-full">
                    <span className="text-[10px] font-black text-green-700 uppercase">{stats.teamMaturity}</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                        <Zap className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Sharpness</span>
                    </div>
                    <div className="text-xl font-black text-gray-900">{stats.avgSharpness}%</div>
                    <div className="w-full bg-gray-100 h-1 rounded-full mt-1">
                        <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${stats.avgSharpness}%` }} />
                    </div>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                        <Heart className="w-3 h-3 text-red-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Morale</span>
                    </div>
                    <div className="text-xl font-black text-gray-900">{stats.avgMorale}%</div>
                    <div className="w-full bg-gray-100 h-1 rounded-full mt-1">
                        <div className="bg-red-500 h-1 rounded-full" style={{ width: `${stats.avgMorale}%` }} />
                    </div>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-blue-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Trend</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-3">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Team Report</span>
                {stats.keyPlayers.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 font-medium">{p.name}</span>
                        <div className="flex items-center space-x-3">
                            <span className={`text-xs uppercase font-bold ${p.status === 'Fatigued' ? 'text-red-500' : 'text-green-600'}`}>
                                {p.status}
                            </span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold">
                                {p.form}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
