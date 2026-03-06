"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerPuck {
    id: string;
    name: string;
    x: number;
    y: number;
    team: 'home' | 'away';
    role: string;
    stats: { pace: number; agility: number; strength: number; passing: number };
}

interface MatchCommentary {
    time: string;
    text: string;
    type: 'action' | 'goal' | 'incident';
}

export const MatchEnginePreview: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [ball, setBall] = useState({ x: 50, y: 50, ownerId: null as string | null });
    const [players, setPlayers] = useState<PlayerPuck[]>([]);
    const [commentary, setCommentary] = useState<MatchCommentary[]>([]);
    const [time, setTime] = useState(0);
    const [score, setScore] = useState({ home: 0, away: 0 });

    // Initialize players
    useEffect(() => {
        const initPlayers: PlayerPuck[] = [
            // Home Team (Blue)
            { id: 'h1', name: 'Marcus', x: 45, y: 50, team: 'home', role: 'ST', stats: { pace: 85, agility: 80, strength: 70, passing: 75 } },
            { id: 'h2', name: 'Jamie', x: 30, y: 40, team: 'home', role: 'CM', stats: { pace: 70, agility: 75, strength: 65, passing: 82 } },
            { id: 'h3', name: 'Alex', x: 30, y: 60, team: 'home', role: 'CM', stats: { pace: 72, agility: 78, strength: 68, passing: 80 } },
            // Away Team (Red)
            { id: 'a1', name: 'Rival 1', x: 55, y: 50, team: 'away', role: 'CB', stats: { pace: 65, agility: 60, strength: 85, passing: 60 } },
            { id: 'a2', name: 'Rival 2', x: 70, y: 40, team: 'away', role: 'CB', stats: { pace: 68, agility: 62, strength: 82, passing: 65 } },
        ];
        setPlayers(initPlayers);
    }, []);

    const addCommentary = (text: string, type: MatchCommentary['type'] = 'action') => {
        const timeStr = `${Math.floor(time / 10)}:00`;
        setCommentary(prev => [{ time: timeStr, text, type }, ...prev].slice(0, 5));
    };

    const movePlayers = useCallback(() => {
        let currentBallOwnerId = ball.ownerId;
        let newBallPos = { ...ball };

        // Move players
        const updatedPlayers = players.map(p => {
            const isOwner = p.id === currentBallOwnerId;

            // Target: ball or far goal
            const targetX = isOwner ? (p.team === 'home' ? 95 : 5) : ball.x;
            const targetY = isOwner ? 50 : ball.y;

            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 1 && !isOwner) {
                // Tackle attempt or pick up ball
                if (!currentBallOwnerId) {
                    currentBallOwnerId = p.id;
                    if (time % 10 === 0) {
                        addCommentary(`${p.name} picks up the ball in midfield.`);
                    }
                } else if (p.id !== currentBallOwnerId) {
                    const owner = players.find(pl => pl.id === currentBallOwnerId);
                    if (owner && p.stats.strength > owner.stats.strength + Math.random() * 20) {
                        currentBallOwnerId = p.id;
                        addCommentary(`${p.name} produces a brilliant challenge to win possession!`, 'action');
                    }
                }
            }

            const speed = (p.stats.pace / 100) * (isOwner ? 0.3 : 0.5);
            const vx = dist > 0 ? (dx / dist) * speed : 0;
            const vy = dist > 0 ? (dy / dist) * speed : 0;

            const newX = p.x + vx + (Math.random() - 0.5) * 0.2;
            const newY = p.y + vy + (Math.random() - 0.5) * 0.2;

            if (isOwner) {
                newBallPos = { x: newX, y: newY, ownerId: p.id };
                // Check for shot
                if (p.team === 'home' && newX > 85) {
                    if (Math.random() > 0.7) {
                        addCommentary(`GOAL! ${p.name} clinical finish into the bottom corner!`, 'goal');
                        setScore(s => ({ ...s, home: s.home + 1 }));
                        setIsPlaying(false);
                        currentBallOwnerId = null;
                        newBallPos = { x: 50, y: 50, ownerId: null };
                    } else {
                        addCommentary(`${p.name} takes a shot! Saved by the keeper.`, 'action');
                        newBallPos = { x: 90, y: 50, ownerId: null };
                        currentBallOwnerId = null;
                    }
                } else if (p.team === 'away' && newX < 15) {
                    // Simulating away team threat
                    if (Math.random() > 0.8) {
                        addCommentary(`GOAL! Rival squad find the net on the counter.`, 'goal');
                        setScore(s => ({ ...s, away: s.away + 1 }));
                        setIsPlaying(false);
                        currentBallOwnerId = null;
                        newBallPos = { x: 50, y: 50, ownerId: null };
                    }
                }
            }

            return { ...p, x: newX, y: newY };
        });

        setPlayers(updatedPlayers);
        setBall(newBallPos);
        setTime(prev => prev + 1);
    }, [ball, players, time]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(movePlayers, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying, movePlayers]);

    const reset = () => {
        setIsPlaying(false);
        setBall({ x: 50, y: 50, ownerId: null });
        setTime(0);
        setScore({ home: 0, away: 0 });
        setCommentary([{ time: '0:00', text: 'Match reset. Teams returning to positions.', type: 'incident' }]);
        setPlayers(prev => prev.map(p => ({
            ...p,
            x: p.team === 'home' ? 45 : 55,
            y: p.y
        })));
    };

    return (
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Match Engine <span className="text-gray-500 font-mono text-[10px]">v0.4-ALPHA</span></h2>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-gray-400">{Math.floor(time / 10)}:{(time % 10)}0</span>
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                    >
                        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    </button>
                    <button
                        onClick={reset}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" />
                    </button>
                </div>
            </div>

            <div className="relative aspect-[16/9] bg-gradient-to-b from-green-900/40 to-green-900/60 rounded-xl border border-white/5 overflow-hidden">
                {/* Score Overlay */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full border border-white/10 z-30 flex items-center space-x-3 font-mono">
                    <span className="text-blue-400 font-bold">HOU {score.home}</span>
                    <span className="text-gray-500">-</span>
                    <span className="text-red-400 font-bold">{score.away} RIV</span>
                </div>

                {/* Pitch markings */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-1/2 w-px h-full bg-white" />
                    <div className="absolute top-1/2 left-1/2 w-20 h-20 border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Players */}
                <AnimatePresence>
                    {players.map(p => (
                        <motion.div
                            key={p.id}
                            initial={false}
                            animate={{ left: `${p.x}%`, top: `${p.y}%` }}
                            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                        >
                            <div className={`w-3 h-3 rounded-full border-2 ${p.team === 'home' ? 'bg-blue-500 border-blue-300' : 'bg-red-500 border-red-300'} shadow-lg shadow-black/50 transition-colors`} />
                            {isPlaying && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[6px] font-black text-white/70 whitespace-nowrap uppercase tracking-tighter bg-black/20 px-1 rounded">
                                    {p.name}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Ball */}
                <motion.div
                    animate={{ left: `${ball.x}%`, top: `${ball.y}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 10 }}
                    className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-lg z-20 -translate-x-1/2 -translate-y-1/2"
                >
                    <div className="absolute inset-0 bg-white blur-[1px] opacity-80" />
                </motion.div>

                {/* Bottom Banner */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/40 backdrop-blur-sm border-t border-white/5">
                    <div className="flex items-center justify-between text-[8px] font-mono text-gray-400">
                        <span className="flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span>LIVE SIMULATION • REPUTATION-DRIVEN AI</span>
                        </span>
                        <span className="italic">CALCULATING PHYSICS...</span>
                    </div>
                </div>
            </div>

            {/* Commentary Box - CM Style */}
            <div className="p-3 bg-black/40 h-24 overflow-hidden border-t border-white/5">
                <div className="space-y-1">
                    {commentary.length === 0 ? (
                        <div className="text-[10px] text-gray-500 italic font-mono uppercase tracking-widest text-center mt-6">Awaiting kick-off...</div>
                    ) : (
                        commentary.map((c, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`text-[10px] font-mono flex space-x-2 ${c.type === 'goal' ? 'text-yellow-400 font-bold' :
                                        c.type === 'incident' ? 'text-red-400' : 'text-gray-300'
                                    }`}
                            >
                                <span className="text-gray-600 flex-shrink-0">[{c.time}]</span>
                                <span className="leading-tight">{c.text}</span>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </Card>
    );
};
