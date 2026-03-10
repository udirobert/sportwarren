"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Activity, Shield, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSquadDetails } from '@/hooks/squad/useSquad';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { trpc } from '@/lib/trpc-client';

type ReputationTier = 'bronze' | 'silver' | 'gold' | 'platinum';

// ── Engine types ────────────────────────────────────────────────────────────
interface EngineContext {
    ball: { x: number; y: number; vx: number; vy: number; ownerId: string | null };
    teammates: PlayerPuck[];
    opponents: PlayerPuck[];
    ownGoal: { x: number; y: number };
    oppGoal: { x: number; y: number };
    time: number;
    tempo: number;
}

interface MatchEvent {
    tick: number;
    minute: number;
    type: 'goal' | 'tackle' | 'pass' | 'shot' | 'dao' | 'incident';
    text: string;
    team?: 'home' | 'away';
}

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
    intent?: { x: number; y: number };
}

interface MatchCommentary {
    id: string;
    time: string;
    text: string;
    type: 'action' | 'goal' | 'incident' | 'dao';
}

// ── Role-dispatch tick functions ─────────────────────────────────────────────
function tickGoalkeeper(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const goalX = p.team === 'home' ? 5 : 95;
    return { targetX: goalX, targetY: 30 + (ctx.ball.y / 100) * 40 };
}

function tickDefender(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const ballInOwnHalf = (p.team === 'home' && ctx.ball.x < 50) || (p.team === 'away' && ctx.ball.x > 50);
    const distToBall = Math.sqrt((p.x - ctx.ball.x) ** 2 + (p.y - ctx.ball.y) ** 2);
    if (ballInOwnHalf && distToBall < 35) {
        return {
            targetX: ctx.ball.x + (p.team === 'home' ? -3 : 3),
            targetY: ctx.ball.y,
        };
    }
    return {
        targetX: (p as any).homePos.x,
        targetY: (p as any).homePos.y + (ctx.ball.y - 50) * 0.25,
    };
}

function tickMidfielder(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const distToBall = Math.sqrt((p.x - ctx.ball.x) ** 2 + (p.y - ctx.ball.y) ** 2);
    const allMids = [...ctx.teammates, p].filter(t => ['CM', 'DM', 'AM'].includes(t.role));
    const isClosest = !allMids.some(other =>
        other.id !== p.id &&
        Math.sqrt((other.x - ctx.ball.x) ** 2 + (other.y - ctx.ball.y) ** 2) < distToBall
    );
    if (isClosest && distToBall < 40) {
        return { targetX: ctx.ball.x, targetY: ctx.ball.y };
    }
    return {
        targetX: (p as any).homePos.x + (ctx.ball.x - 50) * 0.3,
        targetY: (p as any).homePos.y + Math.sin(ctx.time * 0.05 + (p as any).homePos.x) * 10,
    };
}

function tickAttacker(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const ballInOwnHalf = (p.team === 'home' && ctx.ball.x < 50) || (p.team === 'away' && ctx.ball.x > 50);
    if (ballInOwnHalf) {
        return {
            targetX: (p as any).homePos.x - (p.team === 'home' ? 10 : -10),
            targetY: (p as any).homePos.y,
        };
    }
    const runPhase = Math.sin(ctx.time * 0.04 + (p as any).homePos.y * 0.1);
    return {
        targetX: p.team === 'home' ? 70 + runPhase * 15 : 30 - runPhase * 15,
        targetY: (p as any).homePos.y + runPhase * 20,
    };
}

function tickPlayer(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    switch (p.role) {
        case 'GK': return tickGoalkeeper(p, ctx);
        case 'CB': case 'LB': case 'RB': case 'DEF': return tickDefender(p, ctx);
        case 'CM': case 'DM': case 'AM': case 'MID': return tickMidfielder(p, ctx);
        case 'ST': case 'LW': case 'RW': case 'ATT': return tickAttacker(p, ctx);
        default: return { targetX: (p as any).homePos.x, targetY: (p as any).homePos.y };
    }
}

// Circle-circle collision push-apart (modifies array in place)
function resolveCollisions(ps: any[]): void {
    const MIN_DIST = 3.5;
    for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
            const dx = ps[j].x - ps[i].x;
            const dy = ps[j].y - ps[i].y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
            if (dist < MIN_DIST) {
                const overlap = (MIN_DIST - dist) * 0.5;
                ps[i].x -= (dx / dist) * overlap;
                ps[i].y -= (dy / dist) * overlap;
                ps[j].x += (dx / dist) * overlap;
                ps[j].y += (dy / dist) * overlap;
            }
        }
    }
}

interface LiveMatch {
    id: string;
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
    status: 'live' | 'finishing' | 'ht';
}

// Build formation positions for any player count (3–15), with optional keeper
// Returns array of [x%, y%, role] for home team (left→right); away mirrors x
function buildFormation(n: number, hasKeeper: boolean): Array<[number, number, string]> {
    const positions: Array<[number, number, string]> = [];
    let outfield = n;
    if (hasKeeper && n >= 4) {
        positions.push([8, 50, 'GK']);
        outfield = n - 1;
    }
    // Distribute outfield into lines: defenders, midfielders, attackers
    const lines = outfield <= 4 ? 2 : 3;
    const perLine = Math.ceil(outfield / lines);
    const lineXs = lines === 2 ? [30, 60] : [22, 42, 62];
    const roles = lines === 2
        ? ['DEF', 'ATT']
        : ['DEF', 'MID', 'ATT'];
    let placed = 0;
    for (let l = 0; l < lines && placed < outfield; l++) {
        const inLine = Math.min(perLine, outfield - placed);
        for (let i = 0; i < inLine; i++) {
            const ySpacing = 100 / (inLine + 1);
            positions.push([lineXs[l], ySpacing * (i + 1), roles[l]]);
            placed++;
        }
    }
    return positions;
}

export const MatchEnginePreview: React.FC<{ squadId?: string; playersPerSide?: number; hasKeeper?: boolean }> = ({ squadId, playersPerSide = 11, hasKeeper = true }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [ball, setBall] = useState({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null as string | null });
    const [players, setPlayers] = useState<any[]>([]);
    const [commentary, setCommentary] = useState<MatchCommentary[]>([]);
    const [time, setTime] = useState(0);
    const [score, setScore] = useState({ home: 0, away: 0 });
    const [activeMatch, setActiveMatch] = useState<string>('m1');
    const [daoAlert, setDaoAlert] = useState<string | null>(null);
    const [tempo, setTempo] = useState(1);
    const [showIntent, setShowIntent] = useState(true);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [latestEvent, setLatestEvent] = useState<string>('');
    const [eventLog, setEventLog] = useState<MatchEvent[]>([]);
    const ownerCarryTicks = useRef(0);

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

    // Keyboard navigation for match engine controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    setIsPlaying(prev => !prev);
                    break;
                case 'ArrowLeft':
                    setTempo(prev => Math.max(0.5, prev - 0.5));
                    break;
                case 'ArrowRight':
                    setTempo(prev => Math.min(4, prev + 0.5));
                    break;
                case 'r':
                case 'R':
                    reset();
                    break;
                case 'i':
                case 'I':
                    setShowIntent(prev => !prev);
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Initialize players with real data or high-fidelity fallback
    useEffect(() => {
        // Auto-start for guests to show life immediately - only run ONCE on mount
      if (isGuest && !isPlaying && time === 0 && players.length === 0) {
            const timer = setTimeout(() => setIsPlaying(true), 2500);
            return () => clearTimeout(timer);
        }
    }, [isGuest]); // Remove isPlaying and time from deps - this should only run on mount

    // Fetch real team members
    const { members, loading: membersLoading } = useSquadDetails(squadId);

    const matches: LiveMatch[] = [
        { id: 'm1', home: env.rivals.home.split(' ')[0], away: env.rivals.away.split(' ')[0], homeScore: score.home, awayScore: score.away, status: 'live' },
        { id: 'm2', home: 'LNS', away: 'BASE', homeScore: 1, awayScore: 0, status: 'ht' },
        { id: 'm3', home: 'ALG', away: 'AVAL', homeScore: 2, awayScore: 2, status: 'live' },
    ];

    const submitMatchMutation = trpc.match.submit.useMutation({
        onSuccess: () => {
            addCommentary("MATCH FINALIZED & POSTED TO BLOCKCHAIN (DEMO)", "incident");
            setIsFinalizing(false);
        }
    });

    const finalizeMatch = useCallback(async () => {
        if (!squadId || isGuest || isFinalizing) return;

        setIsFinalizing(true);
        addCommentary("FINALIZING MATCH DATA...", "incident");

        // Find a random opponent squad for the demo
        // In real app, this would be the actual opponent squad ID
        const awaySquadId = "rival-squad-hackney";

        submitMatchMutation.mutate({
            homeSquadId: squadId,
            awaySquadId: awaySquadId,
            homeScore: score.home,
            awayScore: score.away,
            matchDate: new Date()
        });
    }, [squadId, isGuest, score, env, isFinalizing, submitMatchMutation]);

    // Initialize players with Physics-enabled agents (runs once after members load)
    const playersInitialised = useRef(false);
    useEffect(() => {
        // Guard: only initialise once to prevent the match from "restarting"
        // every time a dependency reference changes.
        if (playersInitialised.current) return;
        if (membersLoading) return;

        // Moved to end of effect

        const createPlayer = (id: string, name: string, x: number, y: number, team: 'home' | 'away', role: string, stats: any): any => ({
            id, name, x, y, vx: 0, vy: 0, team, role, stats,
            homePos: { x, y },
            reputationTier: stats.level > 15 ? 'platinum' : stats.level > 8 ? 'gold' : 'silver',
            history: []
        });

        // Dynamic formation based on playersPerSide + hasKeeper props
        const homeFormation = buildFormation(playersPerSide, hasKeeper);
        const awayFormation: Array<[number, number, string]> = homeFormation.map(([x, y, role]) => [100 - x, y, role]);
        const allNames = ['GK', 'Tunde', 'Kofi', 'Diallo', 'Eze', 'Yusuf', 'Marcus', 'Jamie', 'Kwame', 'Alex', 'Seun', 'Bayo', 'Chidi', 'Emeka', 'Femi', 'Gbenga'];
        const homeNames = allNames.slice(0, playersPerSide);
        const awayNames = ['GK', 'Rival', 'Stone', 'Park', 'Cruz', 'Osei', 'Nkosi', 'Levi', 'Dani', 'Ramos', 'Finn', 'Musa', 'Sven', 'Ito', 'Bale', 'Zara'].slice(0, playersPerSide);
        const home433 = homeFormation;
        const away433 = awayFormation;

        if (members && members.length > 0) {
            const homePlayers = home433.map(([x, y, role], i) => {
                const m = members[i];
                const level = m?.stats?.level || 8;
                const baseStat = 60 + (level * 1.5);
                return createPlayer(
                    m?.id || `h${i}`, m ? m.name.split(' ')[0] : homeNames[i],
                    x, y, 'home', role,
                    { level, pace: Math.min(99, baseStat + (role === 'ST' || role.endsWith('W') ? 8 : 0)), agility: Math.min(99, baseStat + 2), strength: Math.min(99, baseStat - 5), passing: Math.min(99, baseStat + (role === 'CM' ? 8 : 0)) }
                );
            });
            const awayPlayers = away433.map(([x, y, role], i) =>
                createPlayer(`a${i}`, awayNames[i], x, y, 'away', role,
                    { level: 10 + Math.floor(Math.random() * 8), pace: 65 + Math.floor(Math.random() * 20), agility: 60 + Math.floor(Math.random() * 20), strength: 65 + Math.floor(Math.random() * 20), passing: 65 + Math.floor(Math.random() * 20) })
            );
            setPlayers([...homePlayers, ...awayPlayers]);
        } else {
            const homePlayers = home433.map(([x, y, role], i) =>
                createPlayer(`h${i}`, homeNames[i], x, y, 'home', role,
                    { level: 10 + Math.floor(Math.random() * 12), pace: 68 + Math.floor(Math.random() * 24), agility: 65 + Math.floor(Math.random() * 22), strength: 60 + Math.floor(Math.random() * 25), passing: 68 + Math.floor(Math.random() * 22) })
            );
            const awayPlayers2 = away433.map(([x, y, role], i) =>
                createPlayer(`a${i}`, awayNames[i], x, y, 'away', role,
                    { level: 10 + Math.floor(Math.random() * 8), pace: 65 + Math.floor(Math.random() * 20), agility: 60 + Math.floor(Math.random() * 20), strength: 65 + Math.floor(Math.random() * 20), passing: 65 + Math.floor(Math.random() * 20) })
            );
            setPlayers([...homePlayers, ...awayPlayers2]);
        }
        // Mark as initialized ONLY after players have been created
        playersInitialised.current = true;
    }, [members, membersLoading, playersPerSide, hasKeeper]);

    const addEvent = useCallback((text: string, evtType: MatchEvent['type'], team?: 'home' | 'away') => {
        const minute = Math.floor(time / 20);
        const timeStr = `${minute}:00`;
        const evt: MatchEvent = { tick: time, minute, type: evtType, text, team };
        setEventLog(prev => [evt, ...prev].slice(0, 50));
        const commentaryType: MatchCommentary['type'] = evtType === 'goal' ? 'goal' : evtType === 'dao' ? 'dao' : evtType === 'incident' ? 'incident' : 'action';
        setCommentary(prev => [{ id: `${time}-${Math.random().toString(36).slice(2)}`, time: timeStr, text, type: commentaryType }, ...prev].slice(0, 5));
        setLatestEvent(text);
    }, [time]);

    // Keep addCommentary as a thin alias so existing call-sites still work
    const addCommentary = useCallback((text: string, type: MatchCommentary['type'] = 'action') => {
        addEvent(text, type === 'goal' ? 'goal' : type === 'dao' ? 'dao' : type === 'incident' ? 'incident' : 'shot');
    }, [addEvent]);

    const triggerDaoCommand = useCallback(() => {
        const commands = ["ALL OUT ATTACK!", "TEMPO INCREASE!", "HIGH PRESS!", "DAE ACTION: RECOVER BALL!"];
        const cmd = commands[Math.floor(Math.random() * commands.length)];
        setDaoAlert(cmd);
        addCommentary(`DAO INSTRUCTION: ${cmd}`, 'dao');
        if (cmd.includes("TEMPO")) setTempo(1.5);
        setTimeout(() => setDaoAlert(null), 3000);
    }, [time]);

    const tempoOptions = useMemo(() => [0.75, 1, 1.25, 1.5, 2], []);

    const movePlayers = useCallback(() => {
        let currentOwnerId = ball.ownerId;
        const friction = 0.98;
        const drag = 0.92;

        // 1. Ball physics
        let nextBallX = ball.x + ball.vx;
        let nextBallY = ball.y + ball.vy;
        let nextBallVx = ball.vx * friction;
        let nextBallVy = ball.vy * friction;
        let shotFired = false;

        if (nextBallX < 2) { nextBallVx = Math.abs(nextBallVx) * 0.5; nextBallX = 2; }
        if (nextBallX > 98) { nextBallVx = -Math.abs(nextBallVx) * 0.5; nextBallX = 98; }
        if (nextBallY < 2) { nextBallVy = Math.abs(nextBallVy) * 0.5; nextBallY = 2; }
        if (nextBallY > 98) { nextBallVy = -Math.abs(nextBallVy) * 0.5; nextBallY = 98; }

        // Goal detection
        const inGoalMouth = nextBallY > 38 && nextBallY < 62;
        if (!currentOwnerId && nextBallX <= 2 && inGoalMouth) {
            addEvent('⚽ GOAL! Away team scores!', 'goal', 'away');
            setScore(s => ({ ...s, away: s.away + 1 }));
            nextBallX = 50; nextBallY = 50; nextBallVx = 0.8; nextBallVy = 0;
            currentOwnerId = null; ownerCarryTicks.current = 0;
        } else if (!currentOwnerId && nextBallX >= 98 && inGoalMouth) {
            addEvent('⚽ GOAL! Home team scores!', 'goal', 'home');
            setScore(s => ({ ...s, home: s.home + 1 }));
            nextBallX = 50; nextBallY = 50; nextBallVx = -0.8; nextBallVy = 0;
            currentOwnerId = null; ownerCarryTicks.current = 0;
        }

        // 2. Build EngineContext for role-dispatch
        const homePlayers = players.filter(p => p.team === 'home');
        const awayPlayers = players.filter(p => p.team === 'away');

        // 3. Update player steering via role-dispatch
        const updatedPlayers: any[] = players.map(p => {
            const isOwner = p.id === currentOwnerId;
            const teammates = p.team === 'home' ? homePlayers : awayPlayers;
            const opponents = p.team === 'home' ? awayPlayers : homePlayers;
            const ctx: EngineContext = {
                ball,
                teammates: teammates.filter(t => t.id !== p.id),
                opponents,
                ownGoal: { x: p.team === 'home' ? 0 : 100, y: 50 },
                oppGoal: { x: p.team === 'home' ? 100 : 0, y: 50 },
                time,
                tempo,
            };

            let targetX: number;
            let targetY: number;

            if (isOwner) {
                // Ball carrier: drive toward goal with jink
                targetX = p.team === 'home' ? 92 : 8;
                targetY = 50 + Math.sin(time * 0.08 + p.homePos.y) * 18;
                const nearDefender = opponents.find(d => Math.sqrt((d.x - p.x) ** 2 + (d.y - p.y) ** 2) < 12);
                if (nearDefender) targetY = p.y > 50 ? p.y - 20 : p.y + 20;
            } else {
                const t = tickPlayer(p, ctx);
                targetX = t.targetX;
                targetY = t.targetY;
            }

            const intent = { x: targetX, y: targetY };

            const dx = targetX - p.x;
            const dy = targetY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const reputationBonus = p.stats.level / 20;
            const maxSpeed = (p.stats.pace / 100) * (isOwner ? 0.35 : 0.6) * tempo * (1 + reputationBonus * 0.2);
            const dvx = dist > 0 ? (dx / dist) * maxSpeed : 0;
            const dvy = dist > 0 ? (dy / dist) * maxSpeed : 0;
            const agilityBase = p.stats.agility / 1000;
            const ax = (dvx - p.vx) * agilityBase * (1 + reputationBonus * 0.1);
            const ay = (dvy - p.vy) * agilityBase * (1 + reputationBonus * 0.1);

            const nextPx = p.x + p.vx;
            const nextPy = p.y + p.vy;
            const nextPvx = (p.vx + ax) * drag;
            const nextPvy = (p.vy + ay) * drag;

            // Ball possession (proximity)
            const distToBall = Math.sqrt((p.x - ball.x) ** 2 + (p.y - ball.y) ** 2);
            if (!isOwner && distToBall < 1.5) {
                if (!currentOwnerId) {
                    currentOwnerId = p.id;
                    addEvent(`${p.name} recovers the ball.`, 'tackle', p.team);
                } else {
                    const owner = players.find(pl => pl.id === currentOwnerId);
                    if (owner && owner.team !== p.team) {
                        const tackleProb = (p.stats.strength + p.stats.agility) / 200;
                        if (Math.random() < tackleProb * 0.4) {
                            currentOwnerId = p.id;
                            addEvent(`${p.name} wins a crucial tackle!`, 'tackle', p.team);
                        }
                    }
                }
            }

            // Scored decision table: pass / shoot / dribble / hold
            if (isOwner && !shotFired) {
                const inShootingRange = (p.team === 'home' && p.x > 75 && Math.abs(p.y - 50) < 25)
                    || (p.team === 'away' && p.x < 25 && Math.abs(p.y - 50) < 25);
                const distToGoal = p.team === 'home' ? 100 - p.x : p.x;
                const nearOpponent = opponents.find(d => Math.sqrt((d.x - p.x) ** 2 + (d.y - p.y) ** 2) < 10);

                // Offside check: attacker is beyond last defender when ball is played
                const isAttackerRole = ['ST', 'LW', 'RW', 'ATT'].includes(p.role);
                const lastDefenderX = opponents
                    .filter(d => ['CB', 'LB', 'RB', 'DEF'].includes(d.role))
                    .reduce((acc, d) => {
                        const defX = p.team === 'home' ? d.x : 100 - d.x;
                        return Math.max(acc, defX);
                    }, 0);
                const attackerAdvX = p.team === 'home' ? p.x : 100 - p.x;
                const isOffside = isAttackerRole && attackerAdvX > lastDefenderX + 2 && attackerAdvX > 50;

                // Weighted decision scores based on player stats
                const shootScore = inShootingRange && !isOffside
                    ? ((p.stats as any).shooting || 70) / 100 * (1 - distToGoal / 50) * (nearOpponent ? 0.6 : 1.0)
                    : 0;
                const passScore = nearOpponent
                    ? (p.stats.passing / 100) * 0.8
                    : (p.stats.passing / 100) * 0.3;
                const dribbleScore = nearOpponent
                    ? (p.stats.agility / 100) * 0.5
                    : 0.1;
                const holdScore = 0.15;

                const total = shootScore + passScore + dribbleScore + holdScore;
                const roll = Math.random() * total;

                if (roll < shootScore && Math.random() < 0.06) {
                    if (isOffside) {
                        addEvent(`🚩 Offside! ${p.name} caught in advanced position.`, 'incident', p.team);
                    } else {
                        const gx = p.team === 'home' ? 99 : 1;
                        const gy = 50 + (Math.random() - 0.5) * 20;
                        const sdx = gx - p.x; const sdy = gy - p.y;
                        const sd = Math.sqrt(sdx * sdx + sdy * sdy);
                        const power = 3.5 + Math.random() * 1.5;
                        nextBallVx = (sdx / sd) * power;
                        nextBallVy = (sdy / sd) * power;
                        currentOwnerId = null; shotFired = true;
                        addEvent(`${p.name} shoots!`, 'shot', p.team);
                    }
                } else if (roll < shootScore + passScore) {
                    // Trigger pass early (handled below in passing block)
                    ownerCarryTicks.current = 999;
                } else if (roll < shootScore + passScore + dribbleScore) {
                    addEvent(`${p.name} takes on the defender!`, 'pass', p.team);
                }
                // else: hold — do nothing
            }

            // Passing
            if (isOwner && !shotFired) {
                if (ownerCarryTicks.current < 999) ownerCarryTicks.current += 1;
                const carryLimit = 18 + Math.floor(Math.random() * 12);
                if (ownerCarryTicks.current > carryLimit) {
                    const tms = players.filter(t => t.team === p.team && t.id !== p.id && t.role !== 'GK');
                    const fwd = tms.filter(t => p.team === 'home' ? t.x > p.x - 5 : t.x < p.x + 5);
                    const targets = fwd.length > 0 ? fwd : tms;
                    if (targets.length > 0) {
                        const target = targets[Math.floor(Math.random() * targets.length)];
                        const pdx = target.x - p.x; const pdy = target.y - p.y;
                        const pd = Math.sqrt(pdx * pdx + pdy * pdy);
                        const passSpeed = 2.2 + (p.stats.passing || 70) / 50;
                        nextBallVx = (pdx / pd) * passSpeed;
                        nextBallVy = (pdy / pd) * passSpeed;
                        currentOwnerId = null; ownerCarryTicks.current = 0;
                        addEvent(`${p.name} plays it to ${target.name}.`, 'pass', p.team);
                    }
                }
            }

            const newHistory = (p.reputationTier === 'platinum' && !lowPowerMode)
                ? [{ x: p.x, y: p.y }, ...p.history].slice(0, 5)
                : [];

            return { ...p, x: nextPx, y: nextPy, vx: nextPvx, vy: nextPvy, history: newHistory, intent };
        });

        // 4. Circle-circle collision resolution
        resolveCollisions(updatedPlayers);

        // 5. Sync ball to owner
        if (currentOwnerId && !shotFired) {
            const owner = updatedPlayers.find(p => p.id === currentOwnerId);
            if (owner) {
                nextBallX = owner.x + owner.vx * 1.5;
                nextBallY = owner.y + owner.vy * 1.5;
                nextBallVx = owner.vx;
                nextBallVy = owner.vy;
            }
        }

        setPlayers(updatedPlayers);
        setBall({ x: nextBallX, y: nextBallY, vx: nextBallVx, vy: nextBallVy, ownerId: currentOwnerId });
        setTime(prev => prev + 1);

        if (time % 150 === 0 && Math.random() > 0.7) triggerDaoCommand();
    }, [ball, players, time, tempo, triggerDaoCommand, addEvent, lowPowerMode]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(movePlayers, 80);
        }
        return () => clearInterval(interval);
    }, [isPlaying, movePlayers]);

    const hotPlayerIds = useMemo(() => {
        const ids = new Set<string>();
        if (!players.length) return ids;
        if (ball.ownerId) ids.add(ball.ownerId);
        const ranked = players
            .map((p) => ({ id: p.id, dist: Math.hypot(p.x - ball.x, p.y - ball.y) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 2);
        ranked.forEach((p) => ids.add(p.id));
        return ids;
    }, [players, ball]);

    const reset = () => {
        setIsPlaying(false);
        setBall({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null });
        setTime(0);
        setScore({ home: 0, away: 0 });
        setTempo(1);
        setCommentary([{ id: 'init-0', time: '0:00', text: 'Match Day Live: Hackney Marshes pitch is ready.', type: 'incident' }]);
        playersInitialised.current = false;
    };

    return (
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            {/* Live Ticker Switcher */}
            <div className="bg-black/50 border-b border-white/5 p-2 flex items-center space-x-4 overflow-x-auto scrollbar-none">
                {matches.map(m => (
                    <button
                        key={m.id}
                        onClick={() => setActiveMatch(m.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${activeMatch === m.id ? 'bg-blue-600 text-white font-bold' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}
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
                            <span className="text-xs font-mono font-bold text-gray-300">TEMPO {tempo}x</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-1 bg-gray-800/70 border border-white/5 rounded-lg p-1">
                            {tempoOptions.map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => setTempo(speed)}
                                    className={`px-2 py-1.5 text-xs font-bold rounded-md ${tempo === speed ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'}`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowIntent((prev) => !prev)}
                            className={`hidden md:flex items-center px-2 py-1.5 text-xs font-bold rounded-lg border ${showIntent ? 'border-blue-500 text-blue-200' : 'border-white/20 text-gray-200'} bg-gray-900/80`}
                        >
                            Intent {showIntent ? 'ON' : 'OFF'}
                        </button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 md:p-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl md:rounded-lg text-white">
                            {isPlaying ? <Pause className="w-4 h-4 md:w-3 md:h-3" /> : <Play className="w-4 h-4 md:w-3 md:h-3" />}
                        </button>
                        <button
                            onClick={() => !isPlaying && movePlayers()}
                            className="p-3 md:p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl md:rounded-lg text-white"
                            title="Step"
                        >
                            <Activity className="w-4 h-4 md:w-3 md:h-3" />
                        </button>
                        <button onClick={reset} className="p-3 md:p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl md:rounded-lg text-white" title="Reset (R)">
                            <RotateCcw className="w-4 h-4 md:w-3 md:h-3" />
                        </button>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 hidden md:block">
                        <span className="text-gray-600">Space: Play/Pause</span>
                        <span className="mx-2">|</span>
                        <span className="text-gray-600">←→: Tempo</span>
                        <span className="mx-2">|</span>
                        <span className="text-gray-600">R: Reset</span>
                        <span className="mx-2">|</span>
                        <span className="text-gray-600">I: Intent</span>
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
                            <div className="text-xs font-black text-white uppercase tracking-tight">
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
                                        <div className="text-xs font-black text-blue-200 uppercase tracking-widest">Incoming DAO Command</div>
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

                    {/* Intent Vectors */}
                    {showIntent && !lowPowerMode && (
                        <svg className="absolute inset-0 z-5 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {players
                                .filter((p) => hotPlayerIds.has(p.id) && p.intent)
                                .map((p) => {
                                    const dx = Math.abs((p.intent?.x || 0) - p.x);
                                    const dy = Math.abs((p.intent?.y || 0) - p.y);
                                    const distance = Math.hypot(dx, dy);
                                    if (distance < 3) return null;
                                    return (
                                        <line
                                            key={`intent-${p.id}`}
                                            x1={p.x}
                                            y1={p.y}
                                            x2={p.intent?.x}
                                            y2={p.intent?.y}
                                            stroke={p.team === 'home' ? '#60a5fa' : '#f87171'}
                                            strokeWidth="0.5"
                                            strokeDasharray="2 2"
                                            opacity="0.6"
                                        />
                                    );
                                })}
                        </svg>
                    )}

                    {/* Ball Focus Ring */}
                    <div
                        className="absolute w-8 h-8 rounded-full border border-white/20 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
                        style={{ left: `${ball.x}%`, top: `${ball.y}%` }}
                    />

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
                                    {hotPlayerIds.has(p.id) && (
                                        <div className="absolute inset-0 rounded-full border border-white/40 animate-pulse" />
                                    )}
                                    {ball.ownerId === p.id && (
                                        <div className="absolute -inset-1 rounded-full border border-yellow-300/70" />
                                    )}
                                    {/* Reputation Glow */}
                                    {p.reputationTier === 'platinum' && (
                                        <div className="absolute inset-0 rounded-full bg-blue-400 blur-[8px] opacity-40 animate-pulse" />
                                    )}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                        <span className="text-xs font-black text-white bg-black/70 px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg">{p.name}</span>
                                        {p.reputationTier === 'platinum' && <Trophy className="w-2 h-2 text-yellow-400 drop-shadow-md" />}
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

                {/* Live commentary ticker — always visible below pitch */}
                <div className="mt-2 bg-black/80 border border-white/10 rounded-lg px-3 py-1.5 overflow-hidden h-7 flex items-center">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={latestEvent}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className={`text-[11px] font-mono truncate ${
                                latestEvent.includes('GOAL') ? 'text-yellow-300 font-bold' :
                                latestEvent.includes('DAO') ? 'text-blue-300 font-bold' :
                                latestEvent.includes('tackle') || latestEvent.includes('shoots') ? 'text-orange-200' :
                                'text-white'
                            }`}
                        >
                            {latestEvent || 'Match Day Live — kick off!'}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Commentary Log & Reality Feed - Responsive Grid */}
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="col-span-2 p-3 bg-black/70 h-28 overflow-hidden rounded-xl border border-white/10 order-1">
                        <div className="space-y-1.5">
                            {commentary.map((c) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`text-xs font-mono flex space-x-2 ${c.type === 'goal' ? 'text-yellow-300 font-bold' :
                                        c.type === 'dao' ? 'text-blue-300 font-bold' :
                                            c.type === 'incident' ? 'text-red-300' : 'text-gray-200'
                                        }`}
                                >
                                    <span className="text-gray-300 flex-shrink-0">[{c.time}]</span>
                                    <span className="leading-tight">{c.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Reality Feed - Pure Phygital USP */}
                    <div className="bg-green-900/80 p-3 rounded-xl border border-green-400/60 flex flex-col justify-between order-2 md:order-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1.5">
                                <Activity className="w-3.5 h-3.5 text-green-200" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Reality Feed</span>
                            </div>
                            <span className="text-xs text-green-100 font-mono font-semibold">CRE Verified</span>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                                <span className="text-green-100 font-medium">Venue</span>
                                <span className="text-white font-bold">{env.venue}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-green-100 font-medium">Conditions</span>
                                <span className="text-white font-bold">{env.temp} • {env.weather}</span>
                            </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-green-400/50">
                            <div className="text-xs font-black text-green-100 uppercase leading-none mb-1">Impact</div>
                            <div className="text-xs text-white italic leading-tight">Pitch friction decreased. Agility penalty active.</div>
                        </div>
                    </div>

                    {/* Phygital Mission Banner */}
                    <div className="bg-yellow-900/80 p-3 rounded-xl border border-yellow-400/60 flex flex-col justify-between order-3 md:order-3">
                        <div className="flex items-center space-x-1.5 mb-1">
                            <Zap className="w-3.5 h-3.5 text-yellow-200" />
                            <span className="text-xs font-black text-white uppercase tracking-widest italic">Local Mission</span>
                        </div>
                        <div>
                            <div className="text-xs font-black text-white leading-tight mb-1">{env.localMission.title}</div>
                            <div className="text-xs text-yellow-50 leading-tight">Visit <span className="text-white font-bold">{env.localMission.landmark}</span> to activate your bounty.</div>
                        </div>
                        <div className="mt-2 bg-yellow-400/40 rounded-lg py-1 px-2 border border-yellow-400/60">
                            <div className="text-xs font-bold text-white text-center uppercase tracking-tight">{env.localMission.bonus}</div>
                        </div>
                    </div>

                    <div className="bg-blue-900/80 p-3 rounded-xl border border-blue-400/60 flex flex-col justify-center order-4 md:order-4">
                        <div className="flex items-center space-x-2 mb-1.5">
                            <Shield className="w-3.5 h-3.5 text-blue-200" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Active DAO Policy</span>
                        </div>
                        <p className="text-xs text-blue-50 italic leading-tight">
                            &ldquo;High-intensity pressing authorized. XP rewards increased for ball recovery.&rdquo;
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
