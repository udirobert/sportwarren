"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Activity, Shield, Trophy, Zap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSquadDetails } from '@/hooks/squad/useSquad';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';

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
    const [ball, setBall] = useState({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null as string | null });
    const [players, setPlayers] = useState<any[]>([]);
    const [commentary, setCommentary] = useState<MatchCommentary[]>([]);
    const [time, setTime] = useState(0);
    const [score, setScore] = useState({ home: 0, away: 0 });
    const [activeMatch, setActiveMatch] = useState<string>('m1');
    const [daoAlert, setDaoAlert] = useState<string | null>(null);
    const [tempo, setTempo] = useState(1);

    const { address, isGuest } = useWallet();
    const env = useEnvironment();

    // Performance adaptation
    const [fps, setFps] = useState(60);
    const [lowPowerMode, setLowPowerMode] = useState(false);

    useEffect(() => {
        let lastTime = performance.now();
        let frames = 0;
        const checkFps = () => {
            const now = performance.now();
            frames++;
            if (now > lastTime + 1000) {
                const currentFps = Math.round((frames * 1000) / (now - lastTime));
                setFps(currentFps);
                if (currentFps < 30) setLowPowerMode(true);
                lastTime = now;
                frames = 0;
            }
            requestAnimationFrame(checkFps);
        };
        const id = requestAnimationFrame(checkFps);
        return () => cancelAnimationFrame(id);
    }, []);

    // Listen for Tour Steps to drive dynamics
    useEffect(() => {
        const handleTourStep = (e: any) => {
            const stepId = e.detail?.id;
            if (stepId === 'match-engine') {
                setIsPlaying(true);
            } else if (stepId === 'welcome' || stepId === 'phygital-consensus') {
                setIsPlaying(false);
            }
        };
        window.addEventListener('sw-tour-step', handleTourStep);
        return () => window.removeEventListener('sw-tour-step', handleTourStep);
    }, []);

    // Initialize players with real data or high-fidelity fallback
    useEffect(() => {
        // Auto-start for guests to show life immediately
        if (isGuest && !isPlaying && time === 0) {
            const timer = setTimeout(() => setIsPlaying(true), 2500);
            return () => clearTimeout(timer);
        }
    }, [isGuest, isPlaying, time]);

    // Fetch real team members
    const { members, loading: membersLoading } = useSquadDetails(squadId);

    const matches: LiveMatch[] = [
        { id: 'm1', home: env.rivals.home.split(' ')[0], away: env.rivals.away.split(' ')[0], homeScore: score.home, awayScore: score.away, status: 'live' },
        { id: 'm2', home: 'LNS', away: 'BASE', homeScore: 1, awayScore: 0, status: 'ht' },
        { id: 'm3', home: 'ALG', away: 'AVAL', homeScore: 2, awayScore: 2, status: 'live' },
    ];

    // Initialize players with Physics-enabled agents
    useEffect(() => {
        const createPlayer = (id: string, name: string, x: number, y: number, team: 'home' | 'away', role: string, stats: any): any => ({
            id, name, x, y, vx: 0, vy: 0, team, role, stats,
            homePos: { x, y },
            reputationTier: stats.level > 15 ? 'platinum' : stats.level > 8 ? 'gold' : 'silver',
            history: []
        });

        if (!membersLoading && members && members.length > 0) {
            const homePlayers = members.slice(0, 3).map((m, i) => createPlayer(
                m.id, m.name.split(' ')[0],
                i === 0 ? 45 : 30, i === 0 ? 50 : (i === 1 ? 35 : 65),
                'home', m.role, { level: m.stats?.level || 5, pace: 75, agility: 80, strength: 70 }
            ));
            const awayPlayers = [
                createPlayer('a1', env.rivals.away.split(' ')[0], 55, 50, 'away', 'CB', { level: 13, pace: 65, agility: 60, strength: 85 }),
                createPlayer('a2', env.rivals.away.split(' ')[1] || 'Rival', 70, 40, 'away', 'CB', { level: 11, pace: 68, agility: 62, strength: 82 }),
            ];
            setPlayers([...homePlayers, ...awayPlayers]);
        } else if (!membersLoading) {
            const fallbackPlayers = [
                createPlayer('h1', 'Marcus', 40, 50, 'home', 'ST', { level: 20, pace: 92, agility: 88, strength: 75 }),
                createPlayer('h2', 'Jamie', 25, 35, 'home', 'CM', { level: 12, pace: 75, agility: 80, strength: 65 }),
                createPlayer('h3', 'Alex', 25, 65, 'home', 'CM', { level: 10, pace: 72, agility: 78, strength: 68 }),
                createPlayer('a1', env.rivals.away.split(' ')[0], 60, 50, 'away', 'CB', { level: 15, pace: 65, agility: 60, strength: 85 }),
                createPlayer('a2', env.rivals.away.split(' ')[1] || 'Rival', 75, 40, 'away', 'CB', { level: 12, pace: 68, agility: 62, strength: 82 }),
            ];
            setPlayers(fallbackPlayers);
        }
    }, [members, membersLoading]);

    const addCommentary = (text: string, type: MatchCommentary['type'] = 'action') => {
        const timeStr = `${Math.floor(time / 20)}:00`; // Slower time for more detail
        setCommentary(prev => [{ time: timeStr, text, type }, ...prev].slice(0, 5));
    };

    const triggerDaoCommand = useCallback(() => {
        const commands = ["ALL OUT ATTACK!", "TEMPO INCREASE!", "HIGH PRESS!", "DAE ACTION: RECOVER BALL!"];
        const cmd = commands[Math.floor(Math.random() * commands.length)];
        setDaoAlert(cmd);
        addCommentary(`DAO INSTRUCTION: ${cmd}`, 'dao');
        if (cmd.includes("TEMPO")) setTempo(1.5);
        setTimeout(() => setDaoAlert(null), 3000);
    }, [time]);

    const movePlayers = useCallback(() => {
        let currentOwnerId = ball.ownerId;
        const friction = 0.98;
        const drag = 0.92; // Player air resistance

        // 1. Update Ball Physics
        let nextBallX = ball.x + ball.vx;
        let nextBallY = ball.y + ball.vy;
        let nextBallVx = ball.vx * friction;
        let nextBallVy = ball.vy * friction;

        // Ball boundary bounce
        if (nextBallX < 2 || nextBallX > 98) nextBallVx *= -0.5;
        if (nextBallY < 2 || nextBallY > 98) nextBallVy *= -0.5;

        // 2. Update Player Steering
        const updatedPlayers = players.map(p => {
            const isOwner = p.id === currentOwnerId;
            let targetX = p.homePos.x;
            let targetY = p.homePos.y;

            // Simple Goal-Based AI
            if (isOwner) {
                // Attacker: Run toward opponent goal
                targetX = p.team === 'home' ? 95 : 5;
                targetY = 50;
                // Add some zig-zag if defender close
                const defender = players.find(d => d.team !== p.team && Math.abs(d.x - p.x) < 10);
                if (defender) targetY = p.y > 50 ? 30 : 70;
            } else {
                // Chasers: Seek the ball if it's in their half/zone
                const distToBall = Math.sqrt((p.x - ball.x) ** 2 + (p.y - ball.y) ** 2);
                const isClosest = !players.some(other => other.team === p.team && other.id !== p.id &&
                    Math.sqrt((other.x - ball.x) ** 2 + (other.y - ball.y) ** 2) < distToBall);

                if (isClosest || distToBall < 30) {
                    targetX = ball.x;
                    targetY = ball.y;
                }
            }

            // Steering Logic
            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Desired velocity - Scaled by real reputation
            const reputationBonus = (p.stats.level / 20); // 0.1 to 1.0 boost
            const maxSpeed = (p.stats.pace / 100) * (isOwner ? 0.35 : 0.6) * tempo * (1 + (reputationBonus * 0.2));
            let dvx = dist > 0 ? (dx / dist) * maxSpeed : 0;
            let dvy = dist > 0 ? (dy / dist) * maxSpeed : 0;

            // Steering force (accel) - Agility link
            const agilityBase = p.stats.agility / 1000;
            const ax = (dvx - p.vx) * agilityBase * (1 + (reputationBonus * 0.1));
            const ay = (dvy - p.vy) * agilityBase * (1 + (reputationBonus * 0.1));

            const nextPx = p.x + p.vx;
            const nextPy = p.y + p.vy;
            const nextPvx = (p.vx + ax) * drag;
            const nextPvy = (p.vy + ay) * drag;

            // Collision with ball (Possession Change)
            if (!isOwner && dist < 1.5) {
                if (!currentOwnerId) {
                    currentOwnerId = p.id;
                    addCommentary(`${p.name} recovers the ball.`, 'action');
                } else {
                    const owner = players.find(pl => pl.id === currentOwnerId);
                    if (owner && owner.team !== p.team) {
                        const tackleProb = (p.stats.strength + p.stats.agility) / 200;
                        if (Math.random() < tackleProb * 0.4) {
                            currentOwnerId = p.id;
                            addCommentary(`${p.name} wins a crucial tackle!`, 'action');
                        }
                    }
                }
            }

            // Scoring Logic
            if (isOwner && ((p.team === 'home' && p.x > 94) || (p.team === 'away' && p.x < 6))) {
                if (Math.abs(p.y - 50) < 10 && Math.random() < 0.15) {
                    const scoringTeam = p.team === 'home' ? 'home' : 'away';
                    addCommentary(`GOAL! ${p.name} finds the net!`, 'goal');
                    setScore(s => ({ ...s, [scoringTeam]: s[scoringTeam] + 1 }));
                    setIsPlaying(false);
                    setTimeout(reset, 2000);
                }
            }

            const newHistory = (p.reputationTier === 'platinum' && !lowPowerMode)
                ? [{ x: p.x, y: p.y }, ...p.history].slice(0, 5)
                : [];

            return { ...p, x: nextPx, y: nextPy, vx: nextPvx, vy: nextPvy, history: newHistory };
        });

        // Sync ball to owner
        if (currentOwnerId) {
            const owner = updatedPlayers.find(p => p.id === currentOwnerId);
            if (owner) {
                nextBallX = owner.x + (owner.vx * 1.5);
                nextBallY = owner.y + (owner.vy * 1.5);
                nextBallVx = owner.vx;
                nextBallVy = owner.vy;
            }
        }

        setPlayers(updatedPlayers);
        setBall({ x: nextBallX, y: nextBallY, vx: nextBallVx, vy: nextBallVy, ownerId: currentOwnerId });
        setTime(prev => prev + 1);

        if (time % 150 === 0 && Math.random() > 0.7) triggerDaoCommand();
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
        setBall({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null });
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
                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 md:p-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl md:rounded-lg text-white">
                            {isPlaying ? <Pause className="w-4 h-4 md:w-3 md:h-3" /> : <Play className="w-4 h-4 md:w-3 md:h-3" />}
                        </button>
                        <button onClick={reset} className="p-3 md:p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl md:rounded-lg text-white">
                            <RotateCcw className="w-4 h-4 md:w-3 md:h-3" />
                        </button>
                    </div>
                </div>

                <div className={`relative aspect-[16/9] rounded-xl border border-white/5 overflow-hidden transition-colors duration-1000 ${env.isNight ? 'bg-gradient-to-b from-gray-950 to-green-950' : 'bg-gradient-to-b from-green-900/40 to-green-900/60'}`}>
                    {/* Night Match Floodlight Effect */}
                    {env.isNight && (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent_70%)] pointer-events-none z-30" />
                    )}
                    {/* Phygital Proximity Overlay */}
                    <div className="absolute bottom-4 left-4 z-40">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center space-x-2">
                            <div className="relative">
                                <Activity className="w-3 h-3 text-green-500" />
                                <div className="absolute inset-0 bg-green-500 blur-sm opacity-50 animate-pulse" />
                            </div>
                            <div className="text-[9px] font-black text-white uppercase tracking-tighter">
                                Proximity: <span className="text-green-400">{env.proximity}</span>
                            </div>
                        </div>
                    </div>
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
                            {p.history.map((h: { x: number, y: number }, i: number) => (
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

                {/* Commentary Box & Reality Feed - Responsive Grid */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="col-span-2 p-3 bg-black/40 h-32 md:h-28 overflow-hidden rounded-xl border border-white/5 order-1">
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

                    {/* Reality Feed - Pure Phygital USP */}
                    <div className="bg-green-600/5 p-3 rounded-xl border border-green-500/10 flex flex-col justify-between order-2 md:order-2">
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-1.5">
                                <Activity className="w-3 h-3 text-green-400" />
                                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Reality Feed</span>
                            </div>
                            <span className="text-[8px] text-gray-500 font-mono italic">CRE Verified</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-gray-400">Venue</span>
                                <span className="text-white font-bold">{env.venue}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-gray-400">Conditions</span>
                                <span className="text-white font-bold">{env.temp} • {env.weather}</span>
                            </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-500/10">
                            <div className="text-[8px] font-black text-green-400 uppercase leading-none mb-1">Impact</div>
                            <div className="text-[10px] text-gray-300 italic leading-tight">Pitch friction decreased. Agility penalty active.</div>
                        </div>
                    </div>

                    {/* Phygital Mission Banner */}
                    <div className="bg-yellow-600/10 p-3 rounded-xl border border-yellow-500/20 flex flex-col justify-between order-3 md:order-3">
                        <div className="flex items-center space-x-1.5 mb-1">
                            <Zap className="w-3 h-3 text-yellow-500" />
                            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest italic">Local Mission</span>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-white leading-tight mb-1">{env.localMission.title}</div>
                            <div className="text-[9px] text-yellow-200/60 leading-tight">Visit <span className="text-yellow-400 font-bold">{env.localMission.landmark}</span> to activate your bounty.</div>
                        </div>
                        <div className="mt-2 bg-yellow-500/20 rounded-lg py-1 px-2 border border-yellow-500/30">
                            <div className="text-[9px] font-bold text-yellow-400 text-center uppercase tracking-tighter">{env.localMission.bonus}</div>
                        </div>
                    </div>

                    <div className="bg-blue-600/10 p-3 rounded-xl border border-blue-500/20 flex flex-col justify-center order-4 md:order-4">
                        <div className="flex items-center space-x-2 mb-1">
                            <Shield className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active DAO Policy</span>
                        </div>
                        <p className="text-[10px] text-blue-100 italic leading-tight">
                            "High-intensity pressing authorized. XP rewards increased for ball recovery."
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
