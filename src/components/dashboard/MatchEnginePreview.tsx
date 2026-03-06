"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Activity, Shield, Trophy, Zap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSquadDetails } from '@/hooks/squad/useSquad';

type ReputationTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface PlayerPuck {
    id: string;
    name: string;
    x: number;
    y: number;
    team: 'home' | 'away';
    role: string;
    stats: { pace: number; agility: number; strength: number; passing: number };
    reputationTier: ReputationTier;
    history: Array<{ x: number, y: number }>;
}

interface MatchCommentary {
    time: string;
    text: string;
    type: 'action' | 'goal' | 'incident' | 'dao';
}

interface LiveMatch {
    id: string;
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
    status: 'live' | 'finishing' | 'ht';
}

export const MatchEnginePreview: React.FC<{ squadId?: string }> = ({ squadId }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [ball, setBall] = useState({ x: 50, y: 50, ownerId: null as string | null });
    const [players, setPlayers] = useState<PlayerPuck[]>([]);
    const [commentary, setCommentary] = useState<MatchCommentary[]>([]);
    const [time, setTime] = useState(0);
    const [score, setScore] = useState({ home: 0, away: 0 });
    const [activeMatch, setActiveMatch] = useState<string>('m1');
    const [daoAlert, setDaoAlert] = useState<string | null>(null);
    const [tempo, setTempo] = useState(1); // 1 = normal, 1.5 = fast (DAO triggered)

    // Fetch real team members
    const { members, loading: membersLoading } = useSquadDetails(squadId);

    const matches: LiveMatch[] = [
        { id: 'm1', home: 'HOU', away: 'RIV', homeScore: score.home, awayScore: score.away, status: 'live' },
        { id: 'm2', home: 'LNS', away: 'BASE', homeScore: 1, awayScore: 0, status: 'ht' },
        { id: 'm3', home: 'ALG', away: 'AVAL', homeScore: 2, awayScore: 2, status: 'live' },
    ];

    // Initialize players with real data or high-fidelity fallback
    useEffect(() => {
        if (!membersLoading && members && members.length > 0) {
            // Map real members to pucks (max 3 for the preview engine complexity)
            const homePlayers: PlayerPuck[] = members.slice(0, 3).map((m, i) => ({
                id: m.id,
                name: m.name.split(' ')[0],
                x: i === 0 ? 45 : 30,
                y: i === 0 ? 50 : (i === 1 ? 40 : 60),
                team: 'home',
                role: m.role.toUpperCase(),
                stats: {
                    pace: m.stats?.level ? Math.min(99, 60 + m.stats.level * 2) : 75,
                    agility: 80,
                    strength: 70,
                    passing: 80
                },
                reputationTier: (m.stats?.level ?? 0) > 15 ? 'platinum' : (m.stats?.level ?? 0) > 8 ? 'gold' : 'silver',
                history: []
            }));

            const awayPlayers: PlayerPuck[] = [
                { id: 'a1', name: 'Rival 1', x: 55, y: 50, team: 'away', role: 'CB', stats: { pace: 65, agility: 60, strength: 85, passing: 60 }, reputationTier: 'gold', history: [] },
                { id: 'a2', name: 'Rival 2', x: 70, y: 40, team: 'away', role: 'CB', stats: { pace: 68, agility: 62, strength: 82, passing: 65 }, reputationTier: 'silver', history: [] },
            ];

            setPlayers([...homePlayers, ...awayPlayers]);
        } else if (!membersLoading) {
            // Traditional fallback data
            const fallbackPlayers: PlayerPuck[] = [
                { id: 'h1', name: 'Marcus', x: 45, y: 50, team: 'home', role: 'ST', stats: { pace: 92, agility: 88, strength: 75, passing: 80 }, reputationTier: 'platinum', history: [] },
                { id: 'h2', name: 'Jamie', x: 30, y: 40, team: 'home', role: 'CM', stats: { pace: 70, agility: 75, strength: 65, passing: 82 }, reputationTier: 'gold', history: [] },
                { id: 'h3', name: 'Alex', x: 30, y: 60, team: 'home', role: 'CM', stats: { pace: 72, agility: 78, strength: 68, passing: 80 }, reputationTier: 'silver', history: [] },
                { id: 'a1', name: 'Rival 1', x: 55, y: 50, team: 'away', role: 'CB', stats: { pace: 65, agility: 60, strength: 85, passing: 60 }, reputationTier: 'gold', history: [] },
                { id: 'a2', name: 'Rival 2', x: 70, y: 40, team: 'away', role: 'CB', stats: { pace: 68, agility: 62, strength: 82, passing: 65 }, reputationTier: 'silver', history: [] },
            ];
            setPlayers(fallbackPlayers);
        }
    }, [members, membersLoading]);

    const addCommentary = (text: string, type: MatchCommentary['type'] = 'action') => {
        const timeStr = `${Math.floor(time / 10)}:00`;
        setCommentary(prev => [{ time: timeStr, text, type }, ...prev].slice(0, 5));
    };

    const triggerDaoCommand = useCallback(() => {
        const commands = ["ALL OUT ATTACK!", "TEMPO INCREASE!", "HIGH PRESS!", "DAE ACTION: RECOVER BALL!"];
        const cmd = commands[Math.floor(Math.random() * commands.length)];
        setDaoAlert(cmd);
        addCommentary(`DAO INSTRUCTION: ${cmd}`, 'dao');
        if (cmd.includes("TEMPO")) setTempo(1.5);
        setTimeout(() => setDaoAlert(null), 3000);
    }, []);

    const movePlayers = useCallback(() => {
        let currentBallOwnerId = ball.ownerId;
        let newBallPos = { ...ball };

        // Randomly trigger DAO instruction
        if (time > 0 && time % 100 === 0 && Math.random() > 0.5) {
            triggerDaoCommand();
        }

        const updatedPlayers = players.map(p => {
            const isOwner = p.id === currentBallOwnerId;
            const targetX = isOwner ? (p.team === 'home' ? 95 : 5) : ball.x;
            const targetY = isOwner ? 50 : ball.y;

            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 1.5 && !isOwner) {
                if (!currentBallOwnerId) {
                    currentBallOwnerId = p.id;
                    addCommentary(`${p.name} gathers possession.`, 'action');
                } else if (p.id !== currentBallOwnerId) {
                    const owner = players.find(pl => pl.id === currentBallOwnerId);
                    if (owner && (p.stats.strength + (p.reputationTier === 'platinum' ? 10 : 0)) > owner.stats.strength + Math.random() * 25) {
                        currentBallOwnerId = p.id;
                        addCommentary(`${p.name} dispossesses ${owner.name}! Reputation gap visible.`, 'action');
                    }
                }
            }

            const baseSpeed = (p.stats.pace / 100) * (isOwner ? 0.3 : 0.6);
            const speed = baseSpeed * tempo;
            const vx = dist > 0 ? (dx / dist) * speed : 0;
            const vy = dist > 0 ? (dy / dist) * speed : 0;

            const newX = p.x + vx + (Math.random() - 0.5) * 0.3;
            const newY = p.y + vy + (Math.random() - 0.5) * 0.3;

            // Update trail history for high reputation players
            const newHistory = p.reputationTier === 'platinum'
                ? [{ x: p.x, y: p.y }, ...p.history].slice(0, 3)
                : [];

            if (isOwner) {
                newBallPos = { x: newX, y: newY, ownerId: p.id };
                if (p.team === 'home' && newX > 88) {
                    if (Math.random() > (0.6 - (p.stats.agility / 200))) {
                        addCommentary(`GOAL! ${p.name} scores for Hackney Marshes!`, 'goal');
                        setScore(s => ({ ...s, home: s.home + 1 }));
                        setIsPlaying(false);
                        currentBallOwnerId = null;
                        newBallPos = { x: 50, y: 50, ownerId: null };
                        setTempo(1);
                    } else {
                        addCommentary(`${p.name} fires wide! High pressure situation.`, 'action');
                        newBallPos = { x: 92, y: 50, ownerId: null };
                        currentBallOwnerId = null;
                    }
                }
            }

            return { ...p, x: newX, y: newY, history: newHistory };
        });

        setPlayers(updatedPlayers);
        setBall(newBallPos);
        setTime(prev => prev + 1);
    }, [ball, players, time, tempo, triggerDaoCommand]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(movePlayers, 80);
        }
        return () => clearInterval(interval);
    }, [isPlaying, movePlayers]);

    const reset = () => {
        setIsPlaying(false);
        setBall({ x: 50, y: 50, ownerId: null });
        setTime(0);
        setScore({ home: 0, away: 0 });
        setTempo(1);
        setCommentary([{ time: '0:00', text: 'Match Day Live: Hackney Marshes pitch is ready.', type: 'incident' }]);
    };

    return (
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            {/* Live Ticker Switcher */}
            <div className="bg-black/50 border-b border-white/5 p-2 flex items-center space-x-4 overflow-x-auto scrollbar-none">
                {matches.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setActiveMatch(m.id)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] whitespace-nowrap transition-all ${activeMatch === m.id ? 'bg-blue-600 text-white font-bold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        <span className={m.status === 'live' ? 'w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse' : 'w-1.5 h-1.5 bg-gray-500 rounded-full'} />
                        <span>{m.home} {m.homeScore} - {m.awayScore} {m.away}</span>
                    </button>
                ))}
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Engine <span className="text-blue-500">v0.5</span></h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="bg-gray-800 rounded px-2 py-1 flex items-center space-x-2">
                            <Zap className={`w-3 h-3 ${tempo > 1 ? 'text-yellow-400' : 'text-gray-500'}`} />
                            <span className="text-[10px] font-mono font-bold text-gray-300">TEMPO {tempo}x</span>
                        </div>
                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <button onClick={reset} className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white">
                            <RotateCcw className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                <div className="relative aspect-[16/9] bg-gradient-to-b from-green-900/40 to-green-900/60 rounded-xl border border-white/5 overflow-hidden">
                    {/* DAO Overlay */}
                    <AnimatePresence>
                        {daoAlert && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                            >
                                <div className="bg-blue-600/90 backdrop-blur-md px-6 py-3 rounded-xl border border-blue-400 shadow-2xl flex items-center space-x-3">
                                    <Shield className="w-6 h-6 text-white animate-bounce" />
                                    <div>
                                        <div className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Incoming DAO Command</div>
                                        <div className="text-xl font-black text-white italic">{daoAlert}</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Score Overlay */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-4">
                        <div className="bg-black/80 px-4 py-1.5 rounded-lg border border-white/10 flex items-center space-x-4 font-mono shadow-2xl">
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 bg-blue-600 rounded-sm" />
                                <span className="text-white font-black text-lg">{score.home}</span>
                            </div>
                            <div className="w-px h-6 bg-white/20" />
                            <div className="flex items-center space-x-2">
                                <span className="text-white font-black text-lg">{score.away}</span>
                                <div className="w-4 h-4 bg-red-600 rounded-sm" />
                            </div>
                        </div>
                    </div>

                    {/* Pitch markings */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute top-0 left-1/2 w-px h-full bg-white" />
                        <div className="absolute top-1/2 left-1/2 w-32 h-32 border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute top-1/2 left-0 w-24 h-48 border border-white -translate-y-1/2" />
                        <div className="absolute top-1/2 right-0 w-24 h-48 border border-white -translate-y-1/2" />
                    </div>

                    {/* Players & Trails */}
                    {players.map(p => (
                        <React.Fragment key={p.id}>
                            {/* Trails for Legendary players */}
                            {p.history.map((h, i) => (
                                <div
                                    key={`trail-${p.id}-${i}`}
                                    className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-${(3 - i) * 20}`}
                                    style={{ left: `${h.x}%`, top: `${h.y}%`, backgroundColor: p.team === 'home' ? '#3b82f6' : '#ef4444' }}
                                />
                            ))}
                            <motion.div
                                animate={{ left: `${p.x}%`, top: `${p.y}%` }}
                                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                            >
                                <div className={`relative w-4 h-4 rounded-full border-2 ${p.team === 'home' ? 'bg-blue-500 border-blue-300' : 'bg-red-500 border-red-300'} shadow-lg group`}>
                                    {/* Reputation Glow */}
                                    {p.reputationTier === 'platinum' && (
                                        <div className="absolute inset-0 rounded-full bg-blue-400 blur-[8px] opacity-40 animate-pulse" />
                                    )}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                        <span className="text-[8px] font-black text-white/80 bg-black/40 px-1 rounded whitespace-nowrap">{p.name}</span>
                                        {p.reputationTier === 'platinum' && <Trophy className="w-2 h-2 text-yellow-400" />}
                                    </div>
                                </div>
                            </motion.div>
                        </React.Fragment>
                    ))}

                    {/* Ball */}
                    <motion.div
                        animate={{ left: `${ball.x}%`, top: `${ball.y}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 10 }}
                        className="absolute w-2 h-2 bg-white rounded-full shadow-2xl z-20 -translate-x-1/2 -translate-y-1/2 border border-black/20"
                    >
                        <div className="absolute inset-0 bg-white blur-[1px]" />
                    </motion.div>
                </div>

                {/* Commentary Box - Augmented with DAO events */}
                <div className="mt-4 grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 p-3 bg-black/40 h-28 overflow-hidden rounded-xl border border-white/5">
                        <div className="space-y-1.5">
                            {commentary.map((c, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`text-[10px] font-mono flex space-x-2 ${c.type === 'goal' ? 'text-yellow-400 font-bold' :
                                        c.type === 'dao' ? 'text-blue-400 font-bold' :
                                            c.type === 'incident' ? 'text-red-400' : 'text-gray-400'
                                        }`}
                                >
                                    <span className="text-gray-600 flex-shrink-0">[{c.time}]</span>
                                    <span className="leading-tight">{c.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20 flex flex-col justify-center">
                        <div className="flex items-center space-x-2 mb-1">
                            <Shield className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active DAO Policy</span>
                        </div>
                        <p className="text-[10px] text-blue-100 italic leading-tight">
                            "High-intensity pressing authorized for this quarter. XP rewards increased for successful tackles."
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
