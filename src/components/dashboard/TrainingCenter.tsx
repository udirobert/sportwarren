"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Zap, TrendingUp, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { trpc } from '@/lib/trpc-client';

export const TrainingCenter: React.FC<{ userId: string }> = ({ userId }) => {
    const { data: training, refetch } = trpc.player.getTrainingData.useQuery({ userId });

    const syncMutation = trpc.player.syncActivity.useMutation({
        onSuccess: () => refetch()
    });

    const handleQuickSync = (type: 'run' | 'hiit' | 'gym') => {
        syncMutation.mutate({
            userId,
            type,
            duration: 30,
            intensity: 'medium',
            source: 'mock_strava'
        });
    };

    if (!training) return null;

    return (
        <Card className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold text-gray-900">Training Center</h2>
                </div>
                <div className="flex items-center space-x-1 bg-orange-100 px-2 py-0.5 rounded-full">
                    <span className="text-[10px] font-black text-orange-700 uppercase">{training.sharpness}% Sharpness</span>
                </div>
            </div>

            {/* Progress */}
            <div className="mb-6 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                    <span>Weekly Goal</span>
                    <span>{training.weeklyProgress} / {training.weeklyTarget} mins</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (training.weeklyProgress / training.weeklyTarget) * 100)}%` }}
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
                    />
                </div>
            </div>

            {/* Quick Sync Actions */}
            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => handleQuickSync('run')}
                    disabled={syncMutation.isPending}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-200 group"
                >
                    <TrendingUp className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Sync Run</span>
                </button>
                <button
                    onClick={() => handleQuickSync('hiit')}
                    disabled={syncMutation.isPending}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-200 group"
                >
                    <Zap className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Sync HIIT</span>
                </button>
                <button
                    onClick={() => handleQuickSync('gym')}
                    disabled={syncMutation.isPending}
                    className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-200 group"
                >
                    <Users className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Sync Gym</span>
                </button>
            </div>

            {syncMutation.isPending && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                </div>
            )}
        </Card>
    );
};
