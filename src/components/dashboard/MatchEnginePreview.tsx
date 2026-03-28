"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Activity, Trophy, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSquadDetails } from '@/hooks/squad/useSquad';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { WaitlistForm } from '@/components/common/WaitlistForm';

import {
    SIM_PARAMS, COMMENTARY_PARAMS,
    distanceBetween, resolveCollisions,
    tickPlayer, selectPassTarget, executePass,
    computeSupportOptions, determineBallState, tryGkSave,
    type PlayerPuck, type BallState, type MatchCommentary,
    type MatchEvent, type SupportOptions,
} from '@/lib/match/matchEngine';

import type { Formation } from '@/types';
import { FORMATIONS } from '@/lib/formations';
import { useUserPreferences } from '@/hooks/useUserPreferences';

type MatchPhase = 'first_half' | 'halftime' | 'second_half' | 'fulltime';

export const MatchEnginePreview: React.FC<{ 
    squadId?: string; 
    awaySquadId?: string; 
    formation?: Formation; 
    playersPerSide?: number; 
    hasKeeper?: boolean;
    homeColor?: string;
}> = ({ squadId, awaySquadId, formation, playersPerSide = 11, hasKeeper = true, homeColor }) => {
    const { preferences } = useUserPreferences();
    const activeHomeColor = homeColor || preferences.squadBranding?.primaryColor || '#10b981';

    // ── React state (rendering only) ──────────────────────────────────────────
    const [isPlaying, setIsPlaying] = useState(false);
    const [matchPhase, setMatchPhase] = useState<MatchPhase>('first_half');
    const [ball, setBall] = useState({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null as string | null });
    const [_ballState, setBallState] = useState<BallState>('controlled');
    const [players, setPlayers] = useState<PlayerPuck[]>([]);
    const [commentary, setCommentary] = useState<MatchCommentary[]>([]);
    const [time, setTime] = useState(0);
    const [score, setScore] = useState({ home: 0, away: 0 });
    const [tempo, setTempo] = useState(1);
    const [showIntent, setShowIntent] = useState(true);
    const [latestEvent, setLatestEvent] = useState<string>('');
    const [_interactions, setInteractions] = useState(0);
    const [showSoftGate, setShowSoftGate] = useState(false);
    const [lowPowerMode, setLowPowerMode] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    // ── Mutable simulation state (refs — stable across renders) ───────────────
    const ballRef = useRef({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null as string | null });
    const playersRef = useRef<PlayerPuck[]>([]);
    const timeRef = useRef(0);
    const tempoRef = useRef(1);
    const matchPhaseRef = useRef<MatchPhase>('first_half');
    const lastRenderedPhaseRef = useRef<MatchPhase>('first_half');
    const scoreRef = useRef({ home: 0, away: 0 });

    const ownerCarryTicks = useRef(0);
    const passFlightRef = useRef<{ startX: number; startY: number; endX: number; endY: number; startTime: number } | null>(null);
    const isPassRef = useRef(false);
    const passTargetRef = useRef<{ passerId: string; passerName: string; targetId: string; targetName: string } | null>(null);
    const lastPlayerEvent = useRef<Map<string, { type: string; tick: number }>>(new Map());
    const supportOptionsRef = useRef<SupportOptions>({
        short: { player: null, distance: Infinity },
        wide: { player: null, distance: Infinity },
        advanced: { player: null, distance: Infinity },
    });

    const playersInitialised = useRef(false);
    const lowPowerModeRef = useRef(false);
    const halftimeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { isGuest, hasAccount } = useWallet();
    const env = useEnvironment();

    // ── Sync refs from React state when tempo/lowPowerMode changes externally ──
    useEffect(() => { tempoRef.current = tempo; }, [tempo]);
    useEffect(() => { lowPowerModeRef.current = lowPowerMode; }, [lowPowerMode]);

    // ── Stable callbacks ──────────────────────────────────────────────────────

    const registerInteraction = useCallback(() => {
        setInteractions((n) => {
            const next = n + 1;
            if (next >= 2) setShowSoftGate(true);
            return next;
        });
    }, []);

    const addEvent = useCallback((text: string, evtType: MatchEvent['type'], _team?: 'home' | 'away') => {
        const tick = timeRef.current;
        const playerNameMatch = text.match(/^([A-Z][a-z]+)/);
        const playerName = playerNameMatch?.[1];

        if (playerName && COMMENTARY_PARAMS.repeatEventTypes.some(type => text.toLowerCase().includes(type))) {
            const lastEvent = lastPlayerEvent.current.get(playerName);
            if (lastEvent && (tick - lastEvent.tick) < COMMENTARY_PARAMS.repeatPlayerCooldown) return;
            lastPlayerEvent.current.set(playerName, { type: evtType, tick });
        }

        const matchSeconds = tick; // 1 tick = 1 match-second; 1800 ticks = 90 min
        const clockMin = Math.floor(matchSeconds / 60);
        const clockSec = matchSeconds % 60;
        const timeStr = `${clockMin}:${clockSec.toString().padStart(2, '0')}`;
        const commentaryType: MatchCommentary['type'] =
            evtType === 'goal' ? 'goal' :
            evtType === 'dao' ? 'dao' :
            evtType === 'incident' ? 'incident' : 'action';

        setCommentary(prev =>
            [...prev, { id: `${tick}-${Math.random().toString(36).slice(2)}`, time: timeStr, text, type: commentaryType }]
                .slice(-COMMENTARY_PARAMS.maxEvents)
        );
        setLatestEvent(text);
    }, []);

    const _addCommentary = useCallback((text: string, type: MatchCommentary['type'] = 'action') => {
        const evtType: MatchEvent['type'] =
            type === 'goal' ? 'goal' :
            type === 'dao' ? 'dao' :
            type === 'incident' ? 'incident' : 'pass';
        addEvent(text, evtType);
    }, [addEvent]);

    const reset = useCallback(() => {
        if (halftimeTimerRef.current) {
            clearTimeout(halftimeTimerRef.current);
            halftimeTimerRef.current = null;
        }
        setIsPlaying(false);
        setMatchPhase('first_half');
        matchPhaseRef.current = 'first_half';
        setBall({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null });
        ballRef.current = { x: 50, y: 50, vx: 0, vy: 0, ownerId: null };
        setTime(0);
        timeRef.current = 0;
        setScore({ home: 0, away: 0 });
        scoreRef.current = { home: 0, away: 0 };
        setTempo(1);
        tempoRef.current = 1;
        setCommentary([{ id: 'init-0', time: '0:00', text: `Preview canvas ready for ${env.venue}.`, type: 'incident' }]);
        setLatestEvent('');
        passTargetRef.current = null;
        ownerCarryTicks.current = 0;
        playersInitialised.current = false;
    }, [env.venue]);

    // ── The main tick — reads/writes refs, calls state setters for rendering ──
    const movePlayers = useCallback(() => {
        const currentBall = ballRef.current;
        const currentPlayers = playersRef.current;
        const tick = timeRef.current;
        const currentTempo = tempoRef.current;

        if (currentPlayers.length === 0) return;

        let currentOwnerId = currentBall.ownerId;
        const friction = SIM_PARAMS.friction;
        const drag = SIM_PARAMS.drag;

        let nextBallX = currentBall.x + currentBall.vx;
        let nextBallY = currentBall.y + currentBall.vy;
        let nextBallVx = currentBall.vx * friction;
        let nextBallVy = currentBall.vy * friction;
        let shotFired = false;

        // Offside check at pass moment — compares target's x to last defender + ball
        const isTargetOffside = (passer: PlayerPuck, target: PlayerPuck, opps: PlayerPuck[]): boolean => {
            const attackDir = passer.team === 'home' ? 1 : -1;
            const targetAdv = attackDir * target.x;
            const ballAdv = attackDir * passer.x;
            // Second-last opponent (last outfield defender)
            const defPositions = opps
                .filter(o => o.role !== 'GK')
                .map(o => attackDir * o.x)
                .sort((a, b) => b - a); // highest "advanced" first
            const lastDefAdv = defPositions[1] ?? 0; // second-last opponent
            // Offside: ahead of both ball and second-last defender
            return targetAdv > lastDefAdv && targetAdv > ballAdv;
        };

        // Helper to execute a pass — wraps velocity calc + state bookkeeping
        const performPass = (passer: PlayerPuck, target: PlayerPuck, opps: PlayerPuck[]) => {
            // Check offside at the moment the ball is played
            if (isTargetOffside(passer, target, opps)) {
                addEvent(`🚩 Offside! ${target.name} flagged in advanced position.`, 'incident', passer.team);
                // Free kick to opponents — ball goes backwards toward their half
                const defDir = passer.team === 'home' ? -1 : 1;
                currentOwnerId = null;
                isPassRef.current = false;
                ownerCarryTicks.current = 0;
                return { vx: defDir * (1.5 + Math.random()), vy: (Math.random() - 0.5) * 2 };
            }
            const pv = executePass(passer, target, passer.stats.passing);
            currentOwnerId = null;
            isPassRef.current = true;
            passTargetRef.current = { passerId: passer.id, passerName: passer.name, targetId: target.id, targetName: target.name };
            ownerCarryTicks.current = 0;
            addEvent(`${passer.name} plays the ball toward ${target.name}.`, 'pass', passer.team);
            return pv;
        };

        // Ball boundary bounce
        if (nextBallX < 2) { nextBallVx = Math.abs(nextBallVx) * 0.5; nextBallX = 2; }
        if (nextBallX > 98) { nextBallVx = -Math.abs(nextBallVx) * 0.5; nextBallX = 98; }
        if (nextBallY < 2) { nextBallVy = Math.abs(nextBallVy) * 0.5; nextBallY = 2; }
        if (nextBallY > 98) { nextBallVy = -Math.abs(nextBallVy) * 0.5; nextBallY = 98; }

        // ── Goal detection with GK saves ──────────────────────────────────────
        const inGoalMouth = nextBallY > 38 && nextBallY < 62;
        if (!currentOwnerId && nextBallX <= 2 && inGoalMouth) {
            const gk = currentPlayers.find(p => p.team === 'home' && p.role === 'GK');
            if (gk && tryGkSave(nextBallVx, nextBallVy, currentBall.x, currentBall.y, gk, 0)) {
                addEvent(`${gk.name} makes the save!`, 'incident', 'home');
                nextBallVx = Math.abs(nextBallVx) * 0.3;
                nextBallVy = (Math.random() - 0.5) * 1.5;
                nextBallX = 5;
            } else {
                addEvent('⚽ GOAL! Away team scores!', 'goal', 'away');
                scoreRef.current = { ...scoreRef.current, away: scoreRef.current.away + 1 };
                setScore(scoreRef.current);
                ownerCarryTicks.current = 0;
                passTargetRef.current = null;
                // Assign kickoff to a random home player
                const homeField = currentPlayers.filter(p => p.team === 'home' && p.role !== 'GK');
                const kicker = homeField[Math.floor(Math.random() * homeField.length)] ?? currentPlayers[0];
                nextBallX = 50; nextBallY = 50;
                nextBallVx = 0.8; nextBallVy = 0;
                currentOwnerId = kicker.id;
            }
        } else if (!currentOwnerId && nextBallX >= 98 && inGoalMouth) {
            const gk = currentPlayers.find(p => p.team === 'away' && p.role === 'GK');
            if (gk && tryGkSave(nextBallVx, nextBallVy, currentBall.x, currentBall.y, gk, 100)) {
                addEvent(`${gk.name} makes the save!`, 'incident', 'away');
                nextBallVx = -Math.abs(nextBallVx) * 0.3;
                nextBallVy = (Math.random() - 0.5) * 1.5;
                nextBallX = 95;
            } else {
                addEvent('⚽ GOAL! Home team scores!', 'goal', 'home');
                scoreRef.current = { ...scoreRef.current, home: scoreRef.current.home + 1 };
                setScore(scoreRef.current);
                ownerCarryTicks.current = 0;
                passTargetRef.current = null;
                const awayField = currentPlayers.filter(p => p.team === 'away' && p.role !== 'GK');
                const kicker = awayField[Math.floor(Math.random() * awayField.length)] ?? currentPlayers[0];
                nextBallX = 50; nextBallY = 50;
                nextBallVx = -0.8; nextBallVy = 0;
                currentOwnerId = kicker.id;
            }
        }

        const homePlayers = currentPlayers.filter(p => p.team === 'home');
        const awayPlayers = currentPlayers.filter(p => p.team === 'away');

        // ── Player movement & decisions ───────────────────────────────────────
        const updatedPlayers: PlayerPuck[] = currentPlayers.map((player) => {
            const isOwner = player.id === currentOwnerId;
            const teammates = player.team === 'home' ? homePlayers : awayPlayers;
            const opponents = player.team === 'home' ? awayPlayers : homePlayers;
            const ctx = {
                ball: currentBall,
                teammates: teammates.filter(t => t.id !== player.id),
                opponents,
                ownGoal: { x: player.team === 'home' ? 0 : 100, y: 50 },
                oppGoal: { x: player.team === 'home' ? 100 : 0, y: 50 },
                time: tick,
                tempo: currentTempo,
            };

            let targetX: number;
            let targetY: number;

            if (isOwner) {
                targetX = player.team === 'home' ? 92 : 8;
                targetY = 50 + Math.sin(tick * 0.08 + player.homePos.y) * 18;
                const nearDefender = opponents.find(opp => distanceBetween(opp.x, opp.y, player.x, player.y) < 10);
                if (nearDefender) {
                    targetY = player.y > 50 ? player.y - 16 : player.y + 16;
                }
            } else {
                const steering = tickPlayer(player, ctx);
                targetX = steering.targetX;
                targetY = steering.targetY;
            }

            const intent = { x: targetX, y: targetY };
            const dx = targetX - player.x;
            const dy = targetY - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const reputationBonus = player.stats.level / 20;
            const maxSpeed = (player.stats.pace / 100) * (isOwner ? 0.32 : 0.52) * currentTempo * (1 + reputationBonus * 0.2);
            const dvx = dist > 0 ? (dx / dist) * maxSpeed : 0;
            const dvy = dist > 0 ? (dy / dist) * maxSpeed : 0;
            const agilityBase = player.stats.agility / 1000;
            const ax = (dvx - player.vx) * agilityBase * (1 + reputationBonus * 0.1);
            const ay = (dvy - player.vy) * agilityBase * (1 + reputationBonus * 0.1);

            const nextPx = Math.max(2, Math.min(98, player.x + player.vx));
            const nextPy = Math.max(2, Math.min(98, player.y + player.vy));
            const nextPvx = (player.vx + ax) * drag;
            const nextPvy = (player.vy + ay) * drag;

            // ── Shot/pass/dribble decisions ────────────────────────────────────
            if (isOwner && !shotFired) {
                const inShootingRange = (player.team === 'home' && player.x > 75 && Math.abs(player.y - 50) < 25)
                    || (player.team === 'away' && player.x < 25 && Math.abs(player.y - 50) < 25);
                const distToGoal = player.team === 'home' ? 100 - player.x : player.x;
                const nearOpponent = opponents.find(opp => distanceBetween(opp.x, opp.y, player.x, player.y) < 10);

                const isAttackerRole = ['ST', 'LW', 'RW', 'ATT'].includes(player.role);
                const lastDefenderX = opponents
                    .filter(opp => ['CB', 'LB', 'RB', 'DEF'].includes(opp.role))
                    .reduce((acc, opp) => {
                        const defX = player.team === 'home' ? opp.x : 100 - opp.x;
                        return Math.max(acc, defX);
                    }, 0);
                const attackerAdvX = player.team === 'home' ? player.x : 100 - player.x;
                const isOffside = isAttackerRole && attackerAdvX > lastDefenderX + 2 && attackerAdvX > 50;

                const shootScore = inShootingRange && !isOffside
                    ? ((player.stats.shooting) || 70) / 100 * (1 - distToGoal / 50) * (nearOpponent ? 0.6 : 1.0)
                    : 0;
                const passScore = nearOpponent
                    ? (player.stats.passing / 100) * 0.8
                    : (player.stats.passing / 100) * 0.3;
                const dribbleScore = nearOpponent
                    ? (player.stats.agility / 100) * 0.5
                    : 0.1;
                const holdScore = 0.15;
                const total = shootScore + passScore + dribbleScore + holdScore;
                const roll = Math.random() * total;

                if (roll < shootScore && ownerCarryTicks.current > 8 && Math.random() < 0.06) {
                    if (isOffside) {
                        addEvent(`🚩 Offside! ${player.name} caught in advanced position.`, 'incident', player.team);
                    } else {
                        const gx = player.team === 'home' ? 99 : 1;
                        const gy = 50 + (Math.random() - 0.5) * 20;
                        const sdx = gx - player.x;
                        const sdy = gy - player.y;
                        const sd = Math.sqrt(sdx * sdx + sdy * sdy);
                        const power = 3.5 + Math.random() * 1.5;
                        nextBallVx = (sdx / sd) * power;
                        nextBallVy = (sdy / sd) * power;
                        currentOwnerId = null;
                        shotFired = true;
                        isPassRef.current = false;
                        addEvent(`${player.name} shoots!`, 'shot', player.team);
                    }
                } else if (roll < shootScore + passScore && ownerCarryTicks.current > 8) {
                    const teammatePool = currentPlayers.filter(c => c.team === player.team && c.id !== player.id && c.role !== 'GK');
                    const target = selectPassTarget(player, teammatePool, opponents, supportOptionsRef.current);
                    if (target) {
                        const pv = performPass(player, target, opponents);
                        nextBallVx = pv.vx;
                        nextBallVy = pv.vy;
                    }
                } else if (roll < shootScore + passScore + dribbleScore && ownerCarryTicks.current > 10 && nearOpponent) {
                    addEvent(`${player.name} takes on the defender.`, 'incident', player.team);
                }
            }

            // ── Carry-limit forced pass ────────────────────────────────────────
            if (isOwner && !shotFired) {
                ownerCarryTicks.current += 1;
                const carryLimit = 18 + Math.floor(Math.random() * 12);
                if (ownerCarryTicks.current > carryLimit) {
                    const teammatePool = currentPlayers.filter(c => c.team === player.team && c.id !== player.id && c.role !== 'GK');
                    const target = selectPassTarget(player, teammatePool, opponents, supportOptionsRef.current);
                    if (target) {
                        const pv = performPass(player, target, opponents);
                        nextBallVx = pv.vx;
                        nextBallVy = pv.vy;
                    }
                }
            }

            const newHistory = (player.reputationTier === 'platinum' && !lowPowerModeRef.current)
                ? [{ x: player.x, y: player.y }, ...player.history].slice(0, 5)
                : [];

            return { ...player, x: nextPx, y: nextPy, vx: nextPvx, vy: nextPvy, history: newHistory, intent };
        });

        resolveCollisions(updatedPlayers);

        // ── Loose ball recovery ───────────────────────────────────────────────
        const activeOwner = currentOwnerId
            ? updatedPlayers.find(p => p.id === currentOwnerId) ?? null
            : null;

        if (!activeOwner) {
            const recoveryCandidate = [...updatedPlayers]
                .filter(p => (p.cooldownUntil ?? 0) <= tick)
                .map(p => ({ player: p, distance: distanceBetween(p.x, p.y, nextBallX, nextBallY) }))
                .filter(({ distance }) => distance < SIM_PARAMS.looseBallRecoveryRadius)
                .sort((a, b) => a.distance - b.distance)[0];

            if (recoveryCandidate) {
                currentOwnerId = recoveryCandidate.player.id;
                ownerCarryTicks.current = 0;
                const cooldownTicks = SIM_PARAMS.tackleCooldownMin +
                    Math.floor(Math.random() * (SIM_PARAMS.tackleCooldownMax - SIM_PARAMS.tackleCooldownMin));
                recoveryCandidate.player.cooldownUntil = tick + cooldownTicks;

                const pending = passTargetRef.current;
                if (pending && recoveryCandidate.player.id === pending.targetId) {
                    addEvent(`${pending.targetName} receives from ${pending.passerName}.`, 'pass', recoveryCandidate.player.team);
                    passTargetRef.current = null;
                } else if (pending && recoveryCandidate.player.team === (currentPlayers.find(p => p.id === pending.passerId)?.team)) {
                    addEvent(`${recoveryCandidate.player.name} picks up the loose pass.`, 'pass', recoveryCandidate.player.team);
                    passTargetRef.current = null;
                } else {
                    if (pending) passTargetRef.current = null;
                    addEvent(`${recoveryCandidate.player.name} recovers the ball.`, 'tackle', recoveryCandidate.player.team);
                }
            }
        } else {
            // ── Live tackle (anti-swarm) ───────────────────────────────────────
            const opponents = updatedPlayers.filter(p => p.team !== activeOwner.team && (p.cooldownUntil ?? 0) <= tick);
            const defenderRoles = ['CB', 'LB', 'RB', 'DEF', 'FB'];
            const midRoles = ['CM', 'DM', 'AM', 'MID'];

            let nearestDefender: PlayerPuck | null = null;
            let nearestMidfielder: PlayerPuck | null = null;
            let nearestDefenderDist = Infinity;
            let nearestMidDist = Infinity;

            for (const opp of opponents) {
                const dist = distanceBetween(opp.x, opp.y, activeOwner.x, activeOwner.y);
                if (defenderRoles.includes(opp.role) && dist < nearestDefenderDist) {
                    nearestDefenderDist = dist;
                    nearestDefender = opp;
                }
                if (midRoles.includes(opp.role) && dist < nearestMidDist) {
                    nearestMidDist = dist;
                    nearestMidfielder = opp;
                }
            }

            const eligibleChasers: PlayerPuck[] = [];
            if (nearestDefender && nearestDefenderDist < SIM_PARAMS.chaseDistanceThreshold) eligibleChasers.push(nearestDefender);
            if (nearestMidfielder && nearestMidDist < SIM_PARAMS.chaseDistanceThreshold) eligibleChasers.push(nearestMidfielder);

            const pressure = eligibleChasers
                .map(p => ({ player: p, distance: distanceBetween(p.x, p.y, activeOwner.x, activeOwner.y) }))
                .sort((a, b) => a.distance - b.distance)[0];

            if (pressure && pressure.distance < SIM_PARAMS.liveTackleRadius) {
                const tackleProb = ((pressure.player.stats.strength + pressure.player.stats.agility) / 200) * 0.18;
                if (Math.random() < tackleProb) {
                    currentOwnerId = pressure.player.id;
                    ownerCarryTicks.current = 0;
                    const cooldownTicks = SIM_PARAMS.tackleCooldownMin +
                        Math.floor(Math.random() * (SIM_PARAMS.tackleCooldownMax - SIM_PARAMS.tackleCooldownMin));
                    pressure.player.cooldownUntil = tick + cooldownTicks;
                    passTargetRef.current = null;
                    addEvent(`${pressure.player.name} wins the tackle and turns play over.`, 'tackle', pressure.player.team);
                }
            }
        }

        // ── Apply cooldown to ball owner ──────────────────────────────────────
        const cooledPlayers = updatedPlayers.map(p => (
            p.id === currentOwnerId
                ? { ...p, cooldownUntil: Math.max(p.cooldownUntil ?? 0, tick + SIM_PARAMS.looseBallRecoveryCooldown) }
                : p
        ));

        if (currentOwnerId && !shotFired) {
            const owner = cooledPlayers.find(p => p.id === currentOwnerId);
            if (owner) {
                nextBallX = owner.x + owner.vx * 1.5;
                nextBallY = owner.y + owner.vy * 1.5;
                nextBallVx = owner.vx;
                nextBallVy = owner.vy;
            }
        }

        // ── Ball state ────────────────────────────────────────────────────────
        const nextBallState = determineBallState(currentOwnerId, nextBallVx, nextBallVy, isPassRef.current);

        if (!currentOwnerId && Math.hypot(nextBallVx, nextBallVy) > SIM_PARAMS.flightSpeedThreshold) {
            if (!passFlightRef.current) {
                passFlightRef.current = {
                    startX: currentBall.x, startY: currentBall.y,
                    endX: nextBallX, endY: nextBallY,
                    startTime: tick,
                };
            }
        } else {
            passFlightRef.current = null;
            isPassRef.current = false;
        }

        // ── Support options (from updated positions — not stale state) ────────
        if (currentOwnerId) {
            const carrier = cooledPlayers.find(p => p.id === currentOwnerId);
            if (carrier) {
                const teammates = carrier.team === 'home'
                    ? cooledPlayers.filter(p => p.team === 'home')
                    : cooledPlayers.filter(p => p.team === 'away');
                supportOptionsRef.current = computeSupportOptions(carrier, teammates);
            }
        }

        // ── Match structure: halftime / fulltime ──────────────────────────────
        const nextTick = tick + 1;
        if (nextTick >= SIM_PARAMS.fulltimeTick && matchPhaseRef.current !== 'fulltime') {
            matchPhaseRef.current = 'fulltime';
            addEvent('🏁 Full time! The match has ended.', 'incident');
            setIsPlaying(false);
        } else if (nextTick >= SIM_PARAMS.halftimeTick && matchPhaseRef.current === 'first_half') {
            matchPhaseRef.current = 'halftime';
            addEvent('⏸ Half time.', 'incident');
            setIsPlaying(false);
            halftimeTimerRef.current = setTimeout(() => {
                if (matchPhaseRef.current === 'halftime') {
                    matchPhaseRef.current = 'second_half';
                    addEvent('▶ Second half kicks off.', 'incident');
                    setIsPlaying(true);
                }
                halftimeTimerRef.current = null;
            }, 4000);
        }

        // ── Update refs ───────────────────────────────────────────────────────
        ballRef.current = { x: nextBallX, y: nextBallY, vx: nextBallVx, vy: nextBallVy, ownerId: currentOwnerId };
        playersRef.current = cooledPlayers;
        timeRef.current = nextTick;

        // ── Sync to React state for rendering ─────────────────────────────────
        setBall(ballRef.current);
        setBallState(nextBallState);
        setPlayers(cooledPlayers);
        setTime(nextTick);
        if (matchPhaseRef.current !== lastRenderedPhaseRef.current) {
            lastRenderedPhaseRef.current = matchPhaseRef.current;
            setMatchPhase(matchPhaseRef.current);
        }
    }, [addEvent]);

    // ── Effects ───────────────────────────────────────────────────────────────

    // Cleanup halftime timer on unmount
    useEffect(() => {
        return () => {
            if (halftimeTimerRef.current) clearTimeout(halftimeTimerRef.current);
        };
    }, []);

    // Reduced-motion preference
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    // FPS monitor
    useEffect(() => {
        let lastTime = performance.now();
        let frames = 0;
        let rafId: number;
        const checkFps = () => {
            const now = performance.now();
            frames++;
            if (now > lastTime + 1000) {
                const currentFps = Math.round((frames * 1000) / (now - lastTime));
                if (currentFps < 30) setLowPowerMode(true);
                lastTime = now;
                frames = 0;
            }
            rafId = requestAnimationFrame(checkFps);
        };
        rafId = requestAnimationFrame(checkFps);
        return () => cancelAnimationFrame(rafId);
    }, []);

    // Tour step listener
    useEffect(() => {
        const handleTourStep = (e: any) => {
            const stepId = e.detail?.id;
            if (stepId === 'match-engine') setIsPlaying(true);
            else if (stepId === 'welcome' || stepId === 'phygital-consensus') setIsPlaying(false);
        };
        window.addEventListener('sw-tour-step', handleTourStep);
        return () => window.removeEventListener('sw-tour-step', handleTourStep);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    if (matchPhaseRef.current !== 'fulltime') setIsPlaying(prev => !prev);
                    break;
                case 'ArrowLeft':
                    setTempo(prev => { const v = Math.max(0.5, prev - 0.5); tempoRef.current = v; return v; });
                    break;
                case 'ArrowRight':
                    setTempo(prev => { const v = Math.min(4, prev + 0.5); tempoRef.current = v; return v; });
                    break;
                case 'r': case 'R': reset(); break;
                case 'i': case 'I': setShowIntent(prev => !prev); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [reset]);

    // Auto-start for guests
    useEffect(() => {
        if (isGuest && !prefersReducedMotion && !lowPowerMode && !isPlaying && time === 0 && players.length === 0) {
            const timer = setTimeout(() => setIsPlaying(true), 2500);
            return () => clearTimeout(timer);
        }
    }, [isGuest, prefersReducedMotion, lowPowerMode, isPlaying, players.length, time]);

    // Fetch real team members
    const { members, loading: membersLoading } = useSquadDetails(squadId);
    const { members: awayMembers, loading: awayMembersLoading } = useSquadDetails(awaySquadId);

    // Reset initialization when formation changes
    useEffect(() => {
        playersInitialised.current = false;
    }, [formation]);

    // Initialize players (runs once after members load)
    useEffect(() => {
        if (playersInitialised.current) return;
        if (membersLoading || awayMembersLoading) return;

        const createPlayer = (id: string, name: string, x: number, y: number, team: 'home' | 'away', role: string, stats: any): PlayerPuck => ({
            id, name, x, y, vx: 0, vy: 0, team, role, stats,
            homePos: { x, y },
            reputationTier: stats.level > 15 ? 'platinum' : stats.level > 8 ? 'gold' : 'silver',
            history: [],
            cooldownUntil: 0,
        });

        // Use saved tactics formation if provided, otherwise default to 4-4-2
        const formationKey = formation || '4-4-2';
        const formationData = FORMATIONS[formationKey] || FORMATIONS['4-4-2'];
        const homeFormation: Array<[number, number, string]> = formationData.map((s) => [s.x, s.y, s.role]);
        const awayFormation = homeFormation.map(([x, y, role]) => [100 - x, y, role]) as Array<[number, number, string]>;
        const allNames = ['GK', 'Tunde', 'Kofi', 'Diallo', 'Eze', 'Yusuf', 'Marcus', 'Jamie', 'Kwame', 'Alex', 'Seun', 'Bayo', 'Chidi', 'Emeka', 'Femi', 'Gbenga'];
        const homeNames = allNames.slice(0, playersPerSide);
        const awayNames = ['GK', 'Rival', 'Stone', 'Park', 'Cruz', 'Osei', 'Nkosi', 'Levi', 'Dani', 'Ramos', 'Finn', 'Musa', 'Sven', 'Ito', 'Bale', 'Zara'].slice(0, playersPerSide);

        let seededPlayers: PlayerPuck[] = [];

        // Home team — real data if available
        const homePlayers = homeFormation.map(([x, y, role], i) => {
            const m = members?.[i];
            const level = m?.stats?.level || 8;
            const baseStat = 60 + (level * 1.5);
            return createPlayer(
                m?.id || `h${i}`, m ? m.name.split(' ')[0] : homeNames[i],
                x, y, 'home', role,
                { level, pace: Math.min(99, baseStat + (role === 'ST' || role.endsWith('W') ? 8 : 0)), agility: Math.min(99, baseStat + 2), strength: Math.min(99, baseStat - 5), passing: Math.min(99, baseStat + (role === 'CM' ? 8 : 0)) }
            );
        });

        // Away team — real data if available, random otherwise
        const awayPlayers = awayFormation.map(([x, y, role], i) => {
            const m = awayMembers?.[i];
            if (m) {
                const level = m.stats?.level || 8;
                const baseStat = 60 + (level * 1.5);
                return createPlayer(
                    m.id, m.name.split(' ')[0],
                    x, y, 'away', role,
                    { level, pace: Math.min(99, baseStat + (role === 'ST' || role.endsWith('W') ? 8 : 0)), agility: Math.min(99, baseStat + 2), strength: Math.min(99, baseStat - 5), passing: Math.min(99, baseStat + (role === 'CM' ? 8 : 0)) }
                );
            }
            return createPlayer(`a${i}`, awayNames[i], x, y, 'away', role,
                { level: 10 + Math.floor(Math.random() * 8), pace: 65 + Math.floor(Math.random() * 20), agility: 60 + Math.floor(Math.random() * 20), strength: 65 + Math.floor(Math.random() * 20), passing: 65 + Math.floor(Math.random() * 20) });
        });

        seededPlayers = [...homePlayers, ...awayPlayers];

        const kickoffCandidates = seededPlayers.filter(p => p.role !== 'GK');
        const kickoffStarter = kickoffCandidates[Math.floor(Math.random() * kickoffCandidates.length)] ?? seededPlayers[0];

        setPlayers(seededPlayers);
        playersRef.current = seededPlayers;
        if (kickoffStarter) {
            const kickoffBall = { x: kickoffStarter.x, y: kickoffStarter.y, vx: 0, vy: 0, ownerId: kickoffStarter.id };
            setBall(kickoffBall);
            ballRef.current = kickoffBall;
            setCommentary([{ id: 'init-0', time: '0:00', text: `${kickoffStarter.name} takes the kickoff.`, type: 'action' }]);
            setLatestEvent(`${kickoffStarter.name} takes the kickoff.`);
        }
        playersInitialised.current = true;
    }, [members, membersLoading, awayMembers, awayMembersLoading, formation, playersPerSide, hasKeeper]);

    // Game loop — interval is stable because movePlayers has no deps
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(movePlayers, 80);
        }
        return () => clearInterval(interval);
    }, [isPlaying, movePlayers]);

    // ── Derived values ────────────────────────────────────────────────────────

    const hotPlayerIds = useMemo(() => {
        const ids = new Set<string>();
        if (!players.length) return ids;
        if (ball.ownerId) ids.add(ball.ownerId);
        const ranked = players
            .map(p => ({ id: p.id, dist: Math.hypot(p.x - ball.x, p.y - ball.y) }))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 2);
        ranked.forEach(p => ids.add(p.id));
        return ids;
    }, [players, ball]);

    const tempoOptions = useMemo(() => [0.75, 1, 1.25, 1.5, 2], []);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Match Visualization</h2>
                        {matchPhase === 'halftime' && <span className="text-xs font-bold text-yellow-400 ml-2">HALF TIME</span>}
                        {matchPhase === 'fulltime' && <span className="text-xs font-bold text-red-400 ml-2">FULL TIME</span>}
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
                                    onClick={() => { setTempo(speed); tempoRef.current = speed; registerInteraction(); }}
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
                        <button
                            onClick={() => { if (matchPhase !== 'fulltime') { setIsPlaying(!isPlaying); registerInteraction(); } }}
                            className="p-3 md:p-1.5 bg-blue-600 hover:bg-blue-700 rounded-xl md:rounded-lg text-white"
                        >
                            {isPlaying ? <Pause className="w-4 h-4 md:w-3 md:h-3" /> : <Play className="w-4 h-4 md:w-3 md:h-3" />}
                        </button>
                        <button
                            onClick={() => { if (!isPlaying) { movePlayers(); registerInteraction(); } }}
                            className="p-3 md:p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl md:rounded-lg text-white"
                            title="Step"
                        >
                            <Activity className="w-4 h-4 md:w-3 md:h-3" />
                        </button>
                        <button onClick={() => { reset(); registerInteraction(); }} className="p-3 md:p-1.5 bg-gray-800 hover:bg-gray-700 rounded-xl md:rounded-lg text-white" title="Reset (R)">
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

                    {/* Soft Gate: inline email capture after interactions for visitors */}
                    {showSoftGate && !hasAccount && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
                            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md px-3 py-2">
                                <div className="hidden sm:block text-xs text-gray-300">Save this setup to your inbox</div>
                                <div className="w-[260px] sm:w-[360px]">
                                    <WaitlistForm variant="inline" source="preview_soft_gate" />
                                </div>
                                <button onClick={() => setShowSoftGate(false)} aria-label="Dismiss" className="p-1 rounded-lg hover:bg-white/10 text-gray-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

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
                                            stroke={p.team === 'home' ? activeHomeColor : '#f87171'}
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
                            {p.history.map((h, i) => (
                                <div
                                    key={`trail-${p.id}-${i}`}
                                    className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-${(3 - i) * 20}`}
                                    style={{ left: `${h.x}%`, top: `${h.y}%`, backgroundColor: p.team === 'home' ? activeHomeColor : '#ef4444' }}
                                />
                            ))}
                            <motion.div
                                animate={{ left: `${p.x}%`, top: `${p.y}%` }}
                                transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                            >
                                <div className={`relative w-4 h-4 rounded-full border-2 ${p.team === 'home' ? 'border-white' : 'bg-red-500 border-red-300'} shadow-lg group`} style={p.team === 'home' ? { backgroundColor: activeHomeColor } : {}}>
                                    {hotPlayerIds.has(p.id) && (
                                        <div className="absolute inset-0 rounded-full border border-white/40 animate-pulse" />
                                    )}
                                    {ball.ownerId === p.id && (
                                        <div className="absolute -inset-1 rounded-full border border-yellow-300/70" />
                                    )}
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

                {/* Live commentary ticker */}
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
                            {latestEvent || 'Preview Match Canvas — kick off!'}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Commentary log */}
                <div className="mt-3">
                    <div className="p-3 bg-black/70 h-28 overflow-hidden rounded-xl border border-white/10">
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
                </div>
            </div>
        </Card>
    );
};
