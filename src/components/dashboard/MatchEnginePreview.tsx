"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Play, Pause, RotateCcw, Activity, Shield, Trophy, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useSquadDetails } from '@/hooks/squad/useSquad';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';

// ═══════════════════════════════════════════════════════════════════════════════
// EXPLICIT TUNING PARAMETERS - Make iteration faster and cleaner
// ═══════════════════════════════════════════════════════════════════════════════

/** Role profile interface with all optional properties for type safety */
interface RoleProfile {
    narrowness: number;
    lineHeight: number;
    stepOutThreshold: number;
    maxDrift: number;
    chaseAggression: number;
    supportWidth: number;
    overlapThreshold?: number;
    screenPosition?: boolean;
    arriveLate?: boolean;
    holdTouchline?: boolean;
    touchlineThreshold?: number;
    pinLastLine?: boolean;
    checkShortThreshold?: number;
}

/** Role-specific movement profiles - biggest realism win */
const ROLE_PROFILES: Record<string, RoleProfile> = {
    // DEFENDERS - Stay narrow, low line, only step out if ball enters zone
    CB: {
        narrowness: 0.85,      // Hold narrow (1.0 = very narrow)
        lineHeight: 0.15,       // Low defensive line
        stepOutThreshold: 15,   // Only step out if ball within this distance
        maxDrift: 8,           // Max horizontal drift from home
        chaseAggression: 0.3,  // Low - only nearest chases
        supportWidth: 0.2,     // Minimal width
    },
    FB: {
        narrowness: 0.4,       // Hold width
        lineHeight: 0.25,
        stepOutThreshold: 20,
        maxDrift: 15,
        chaseAggression: 0.5,  // Moderate - overlap when possession secure
        supportWidth: 0.8,     // Good width support
        overlapThreshold: 0.7, // Only overlap if team has secure possession
    },
    // MIDFIELDERS - Central screen, rarely chase wide
    DM: {
        narrowness: 0.7,
        lineHeight: 0.45,
        stepOutThreshold: 12,
        maxDrift: 10,
        chaseAggression: 0.4,
        supportWidth: 0.5,
        screenPosition: true,   // Central screening behavior
    },
    CM: {
        narrowness: 0.5,
        lineHeight: 0.5,
        stepOutThreshold: 18,
        maxDrift: 20,
        chaseAggression: 0.55,
        supportWidth: 0.6,
        arriveLate: true,      // Arrive late into box
    },
    AM: {
        narrowness: 0.4,
        lineHeight: 0.7,
        stepOutThreshold: 22,
        maxDrift: 25,
        chaseAggression: 0.6,
        supportWidth: 0.7,
        arriveLate: true,
    },
    // ATTACKERS - Hold touchline until final third
    LW: {
        narrowness: 0.1,
        lineHeight: 0.75,
        stepOutThreshold: 30,
        maxDrift: 30,
        chaseAggression: 0.65,
        supportWidth: 0.9,
        holdTouchline: true,    // Stay wide until final third
        touchlineThreshold: 65,
    },
    RW: {
        narrowness: 0.1,
        lineHeight: 0.75,
        stepOutThreshold: 30,
        maxDrift: 30,
        chaseAggression: 0.65,
        supportWidth: 0.9,
        holdTouchline: true,
        touchlineThreshold: 65,
    },
    ST: {
        narrowness: 0.6,
        lineHeight: 0.85,
        stepOutThreshold: 10,
        maxDrift: 12,
        chaseAggression: 0.35,
        supportWidth: 0.3,
        pinLastLine: true,     // Pin last line
        checkShortThreshold: 20, // Only check short when isolated
    },
    GK: {
        narrowness: 1.0,
        lineHeight: 0.05,
        stepOutThreshold: 8,
        maxDrift: 5,
        chaseAggression: 0.0,
        supportWidth: 0.0,
    },
    DEF: { narrowness: 0.7, lineHeight: 0.2, stepOutThreshold: 15, maxDrift: 10, chaseAggression: 0.4, supportWidth: 0.3 },
    MID: { narrowness: 0.5, lineHeight: 0.5, stepOutThreshold: 18, maxDrift: 18, chaseAggression: 0.5, supportWidth: 0.5 },
    ATT: { narrowness: 0.3, lineHeight: 0.8, stepOutThreshold: 25, maxDrift: 25, chaseAggression: 0.6, supportWidth: 0.7 },
};

/** Simulation parameters - tackle radius, recovery, cooldowns */
const SIM_PARAMS = {
    // Ball recovery
    looseBallRecoveryRadius: 2.2,     // Range: 2.0-2.4
    looseBallRecoveryCooldown: 3,      // Ticks before same player can recover again

    // Tackle mechanics
    liveTackleRadius: 1.4,              // Range: 1.2-1.6 - stops swarm behavior
    tackleCooldownMin: 5,              // Range: 4-8 ticks after winning ball
    tackleCooldownMax: 8,

    // Aggressive chase limits - CRITICAL: only 1 nearest defender + 1 nearest midfielder
    maxChasingDefenders: 1,
    maxChasingMidfielders: 1,
    chaseDistanceThreshold: 25,         // Don't chase if ball too far

    // Player collision
    minPlayerDistance: 3.5,

    // Ball physics
    friction: 0.98,
    drag: 0.92,
};

/** Pass distribution weights - fixes central-stickiness */
const PASS_WEIGHTS = {
    safeRecycle: 0.40,      // 40% - maintain possession
    progressiveForward: 0.40, // 40% - advance play
    wideSwitch: 0.20,      // 20% - switch play to wings

    // Penalties
    centralCrowdingPenalty: 12,  // Penalize passes into crowded central zones
    distancePenalty: 0.15,     // Per 10 units of distance
    pressurePenalty: 8,        // Per opponent within recovery radius
    laneFitBonus: {            // Bonus for passes fitting role lane
        ST: 8, LW: 6, RW: 6, AM: 5,
        CM: 4, DM: 3, MID: 3,
        CB: 2, FB: 2, LB: 2, RB: 2,
        GK: 0,
    },
};

type BallState = 'controlled' | 'loose' | 'pass_flight' | 'shot_flight';

/** Commentary rate limiting */
const COMMENTARY_PARAMS = {
    maxEvents: 6,                  // Visible events in log
    repeatPlayerCooldown: 10,      // Ticks before same player can trigger same event type
    repeatEventTypes: ['recovers the ball', 'takes on the defender', 'wins the tackle'],
};

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
    vx: number;
    vy: number;
    team: 'home' | 'away';
    role: string;
    stats: { level: number; pace: number; agility: number; strength: number; passing: number; shooting?: number };
    reputationTier: ReputationTier;
    homePos: { x: number; y: number };
    history: Array<{ x: number, y: number }>;
    intent?: { x: number; y: number };
    cooldownUntil?: number;
}

interface MatchCommentary {
    id: string;
    time: string;
    text: string;
    type: 'action' | 'goal' | 'incident' | 'dao';
}

// ── Role-dispatch tick functions ─────────────────────────────────────────────
function getRoleProfile(role: string): RoleProfile {
    const cleanRole = role.replace(/^(LB|RB)$/, 'FB');
    return ROLE_PROFILES[cleanRole] || ROLE_PROFILES.DEF;
}

function tickGoalkeeper(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const goalX = p.team === 'home' ? 5 : 95;
    return { targetX: goalX, targetY: 30 + (ctx.ball.y / 100) * 40 };
}

/** Updated defender tick using ROLE_PROFILES - stay narrow, low line */
function tickDefender(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const profile = getRoleProfile(p.role);
    const isFB = ['FB', 'LB', 'RB'].includes(p.role);
    const isCB = p.role === 'CB';

    const ballInOwnHalf = (p.team === 'home' && ctx.ball.x < 50) || (p.team === 'away' && ctx.ball.x > 50);
    const distToBall = Math.sqrt((p.x - ctx.ball.x) ** 2 + (p.y - ctx.ball.y) ** 2);
    const ballInZone = distToBall < profile.stepOutThreshold;

    // Only step out if ball enters zone - use profile threshold
    if (ballInOwnHalf && ballInZone) {
        return {
            targetX: ctx.ball.x + (p.team === 'home' ? -3 : 3),
            targetY: ctx.ball.y,
        };
    }

    // Hold defensive shape - stay narrow (CB) or hold width (FB)
    const baseY = (p as any).homePos.y;
    const narrowFactor = isCB ? profile.narrowness : isFB ? 1 - profile.narrowness : 0.5;
    const targetY = baseY + (ctx.ball.y - 50) * narrowFactor * 0.3;

    // Low line - use lineHeight from profile
    const defensiveLineX = 50 - (profile.lineHeight * 100);

    return {
        targetX: Math.max((p as any).homePos.x - profile.maxDrift, 
                         Math.min((p as any).homePos.x + profile.maxDrift, 
                                 p.team === 'home' ? defensiveLineX : 100 - defensiveLineX)),
        targetY,
    };
}

/** Updated midfielder tick using ROLE_PROFILES - central screen, limited chase */
function tickMidfielder(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const profile = getRoleProfile(p.role);
    const distToBall = Math.sqrt((p.x - ctx.ball.x) ** 2 + (p.y - ctx.ball.y) ** 2);

    // Find nearest midfielder of same team to determine who should chase
    const allMids = [...ctx.teammates, p].filter(t => ['CM', 'DM', 'AM', 'MID'].includes(t.role));
    const isClosestMid = !allMids.some(other =>
        other.id !== p.id &&
        Math.sqrt((other.x - ctx.ball.x) ** 2 + (other.y - ctx.ball.y) ** 2) < distToBall
    );

    // Only chase if closest mid and within reasonable distance
    if (isClosestMid && distToBall < profile.stepOutThreshold && distToBall < SIM_PARAMS.chaseDistanceThreshold) {
        return { targetX: ctx.ball.x, targetY: ctx.ball.y };
    }

    // DM: central screen, rarely chase wide
    if (p.role === 'DM' || p.role === 'MID') {
        const screenY = 50; // Stay central
        return {
            targetX: (p as any).homePos.x + (ctx.ball.x - 50) * 0.2,
            targetY: screenY + (ctx.ball.y - 50) * (1 - profile.narrowness) * 0.3,
        };
    }

    // CM/AM: support carrier, arrive late
    const arrivalBonus = profile.arriveLate ? Math.sin(ctx.time * 0.03) * 8 : 0;
    return {
        targetX: (p as any).homePos.x + (ctx.ball.x - 50) * 0.3,
        targetY: (p as any).homePos.y + Math.sin(ctx.time * 0.05 + (p as any).homePos.x) * 10 + arrivalBonus,
    };
}

/** Updated attacker tick using ROLE_PROFILES - hold touchline until final third */
function tickAttacker(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const profile = getRoleProfile(p.role);
    const isWinger = ['LW', 'RW'].includes(p.role);
    const isST = p.role === 'ST';

    const ballInOwnHalf = (p.team === 'home' && ctx.ball.x < 50) || (p.team === 'away' && ctx.ball.x > 50);

    // ST: pin last line, check short only when isolated
    if (isST) {
        if (ballInOwnHalf) {
            return {
                targetX: (p as any).homePos.x - (p.team === 'home' ? 8 : -8),
                targetY: (p as any).homePos.y,
            };
        }
        // In attack - stay high, only drop if isolated
        const distToNearestTeammate = Math.min(...ctx.teammates.map(t => 
            Math.sqrt((t.x - p.x) ** 2 + (t.y - p.y) ** 2)
        ));
        const shouldCheckShort = distToNearestTeammate > (profile.checkShortThreshold ?? 20);
        return {
            targetX: p.team === 'home' ? 85 + Math.sin(ctx.time * 0.04) * 5 : 15 - Math.sin(ctx.time * 0.04) * 5,
            targetY: shouldCheckShort ? (p as any).homePos.y - 10 : (p as any).homePos.y,
        };
    }

    // LW/RW: hold touchline until final third
    if (isWinger) {
        if (ballInOwnHalf) {
            return {
                targetX: (p as any).homePos.x - (p.team === 'home' ? 10 : -10),
                targetY: (p as any).homePos.y,
            };
        }
        const inFinalThird = (p.team === 'home' && ctx.ball.x > (profile.touchlineThreshold ?? 65)) ||
                            (p.team === 'away' && ctx.ball.x < 100 - (profile.touchlineThreshold ?? 65));
        
        // Hold touchline until final third
        const runPhase = Math.sin(ctx.time * 0.04 + (p as any).homePos.y * 0.1);
        return {
            targetX: p.team === 'home' 
                ? (inFinalThird ? 70 + runPhase * 15 : 55 + runPhase * 5)
                : (inFinalThird ? 30 - runPhase * 15 : 45 - runPhase * 5),
            targetY: inFinalThird 
                ? (p as any).homePos.y + runPhase * 20 
                : (p as any).homePos.y, // Stay wide
        };
    }

    // Default attacker behavior
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
    const MIN_DIST = SIM_PARAMS.minPlayerDistance;
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

function distanceBetween(ax: number, ay: number, bx: number, by: number) {
    return Math.hypot(ax - bx, ay - by);
}

/** Compute off-ball support options for ball carrier - maintains outlets */
function computeSupportOptions(carrier: PlayerPuck, teammates: PlayerPuck[], opponents: PlayerPuck[]) {
    const options = {
        short: { player: null as PlayerPuck | null, distance: Infinity },
        wide: { player: null as PlayerPuck | null, distance: Infinity },
        advanced: { player: null as PlayerPuck | null, distance: Infinity },
    };
    
    const carrierTeam = carrier.team;
    const attackDirection = carrierTeam === 'home' ? 1 : -1;
    
    for (const teammate of teammates) {
        if (teammate.id === carrier.id || teammate.role === 'GK') continue;
        
        const dist = distanceBetween(carrier.x, carrier.y, teammate.x, teammate.y);
        
        // Short outlet: closer, backwards or sideways
        const relativeX = (teammate.x - carrier.x) * attackDirection;
        if (relativeX <= 5 && dist < options.short.distance) {
            options.short = { player: teammate, distance: dist };
        }
        
        // Wide outlet: near touchlines (y < 20 or y > 80)
        if ((teammate.y < 20 || teammate.y > 80) && dist < options.wide.distance) {
            options.wide = { player: teammate, distance: dist };
        }
        
        // Advanced outlet: ahead of carrier in attack direction
        if (relativeX > 10 && dist < options.advanced.distance) {
            options.advanced = { player: teammate, distance: dist };
        }
    }
    
    return options;
}

/** Determine ball state based on physics and events */
function determineBallState(
    ball: { vx: number; vy: number; ownerId: string | null },
    wasInFlight: boolean,
    lastOwnerId: string | null
): BallState {
    const speed = Math.hypot(ball.vx, ball.vy);
    
    // If ball has owner, it's controlled
    if (ball.ownerId) {
        return 'controlled';
    }
    
    // If ball is moving fast, it's in flight
    if (speed > 0.8) {
        return wasInFlight ? 'pass_flight' : 'shot_flight';
    }
    
    // Otherwise it's loose
    return 'loose';
}

/** Updated pass selection using PASS_WEIGHTS - fixes central-stickiness */
function selectPassTarget(owner: PlayerPuck, teammates: PlayerPuck[], opponents: PlayerPuck[]) {
    const targets = teammates.filter((teammate) => teammate.id !== owner.id && teammate.role !== 'GK');
    if (targets.length === 0) {
        return null;
    }

    const passTypeRoll = Math.random();
    let preferredDirection: 'back' | 'side' | 'forward' | 'wide' = 'forward';
    
    // Determine pass type distribution from PASS_WEIGHTS
    if (passTypeRoll < PASS_WEIGHTS.safeRecycle) {
        preferredDirection = 'back';
    } else if (passTypeRoll < PASS_WEIGHTS.safeRecycle + PASS_WEIGHTS.progressiveForward) {
        preferredDirection = 'forward';
    } else {
        preferredDirection = 'wide';
    }

    return targets
        .map((target) => {
            const forwardProgress = owner.team === 'home' ? target.x - owner.x : owner.x - target.x;
            const distance = distanceBetween(owner.x, owner.y, target.x, target.y);
            const spacing = Math.min(24, distance);
            
            // Pressure around receiver - use PASS_WEIGHTS penalty
            const pressure = opponents.filter((opponent) => 
                distanceBetween(opponent.x, opponent.y, target.x, target.y) < 12
            ).length;

            // Lane fit bonus from PASS_WEIGHTS
            const laneFit = PASS_WEIGHTS.laneFitBonus[target.role as keyof typeof PASS_WEIGHTS.laneFitBonus] || 3;

            // Central crowding penalty - penalize passes into crowded central zones
            const isCentralZone = target.y > 30 && target.y < 70 && target.x > 30 && target.x < 70;
            const centralCrowding = isCentralZone ? PASS_WEIGHTS.centralCrowdingPenalty : 0;

            // Direction bonus based on preferred pass type
            let directionBonus = 0;
            if (preferredDirection === 'back' && forwardProgress < -5) directionBonus = 15;
            else if (preferredDirection === 'forward' && forwardProgress > 5) directionBonus = 12;
            else if (preferredDirection === 'wide' && (target.y < 25 || target.y > 75)) directionBonus = 15;

            // Distance penalty from PASS_WEIGHTS
            const distancePenalty = distance * PASS_WEIGHTS.distancePenalty;

            // Calculate final score with all weights
            const score = 
                forwardProgress * 1.6 +          // Forward progress
                spacing * 0.5 +                   // Spacing
                laneFit +                          // Lane fit bonus
                directionBonus -                  // Direction preference
                pressure * PASS_WEIGHTS.pressurePenalty -  // Opponent pressure
                centralCrowding -                 // Central crowding penalty
                distancePenalty +                  // Distance penalty
                Math.random() * 4;                 // Random factor

            return {
                target,
                score,
                forwardProgress,
                isWide: target.y < 25 || target.y > 75,
            };
        })
        // Sort by score but bias toward wingers and fullbacks when available
        .sort((left, right) => {
            const leftScore = left.score + (left.isWide ? 2 : 0);
            const rightScore = right.score + (right.isWide ? 2 : 0);
            return rightScore - leftScore;
        })[0]?.target ?? null;
}

export const MatchEnginePreview: React.FC<{ squadId?: string; playersPerSide?: number; hasKeeper?: boolean }> = ({ squadId, playersPerSide = 11, hasKeeper = true }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [ball, setBall] = useState({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null as string | null });
    const [ballState, setBallState] = useState<BallState>('controlled');
    const [players, setPlayers] = useState<any[]>([]);
    const [commentary, setCommentary] = useState<MatchCommentary[]>([]);
    const [time, setTime] = useState(0);
    const [score, setScore] = useState({ home: 0, away: 0 });
    const [activeMatch, setActiveMatch] = useState<string>('m1');
    const [daoAlert, setDaoAlert] = useState<string | null>(null);
    const [tempo, setTempo] = useState(1);
    const [showIntent, setShowIntent] = useState(true);
    const [latestEvent, setLatestEvent] = useState<string>('');
    const ownerCarryTicks = useRef(0);
    const passFlightRef = useRef<{ startX: number; startY: number; endX: number; endY: number; startTime: number } | null>(null);
    
    // Track last event per player for rate limiting
    const lastPlayerEvent = useRef<Map<string, { type: string; tick: number }>>(new Map());
    
    // Off-ball support options - maintain short outlet, wide outlet, advanced outlet for carrier
    const supportOptionsRef = useRef<{
        short: { player: PlayerPuck | null; distance: number };
        wide: { player: PlayerPuck | null; distance: number };
        advanced: { player: PlayerPuck | null; distance: number };
    }>({ short: { player: null, distance: Infinity }, wide: { player: null, distance: Infinity }, advanced: { player: null, distance: Infinity } });

    const { isGuest } = useWallet();
    const env = useEnvironment();
    const playersInitialised = useRef(false);

    const reset = useCallback(() => {
        setIsPlaying(false);
        setBall({ x: 50, y: 50, vx: 0, vy: 0, ownerId: null });
        setTime(0);
        setScore({ home: 0, away: 0 });
        setTempo(1);
        setCommentary([{ id: 'init-0', time: '0:00', text: `Preview canvas ready for ${env.venue}.`, type: 'incident' }]);
        playersInitialised.current = false;
    }, [env.venue]);

    // Performance adaptation
    const [lowPowerMode, setLowPowerMode] = useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const media = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        let lastTime = performance.now();
        let frames = 0;
        const checkFps = () => {
            const now = performance.now();
            frames++;
            if (now > lastTime + 1000) {
                const currentFps = Math.round((frames * 1000) / (now - lastTime));
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
    }, [reset]);

    // Initialize players with real data or high-fidelity fallback
    useEffect(() => {
        // Auto-start for guests to show life immediately - only run ONCE on mount
      if (isGuest && !prefersReducedMotion && !lowPowerMode && !isPlaying && time === 0 && players.length === 0) {
            const timer = setTimeout(() => setIsPlaying(true), 2500);
            return () => clearTimeout(timer);
        }
    }, [isGuest, prefersReducedMotion, lowPowerMode, isPlaying, players.length, time]); // Run once for guests, skip reduced motion / low power

    // Fetch real team members
    const { members, loading: membersLoading } = useSquadDetails(squadId);

    const matches: LiveMatch[] = [
        { id: 'm1', home: env.rivals.home.split(' ')[0], away: env.rivals.away.split(' ')[0], homeScore: score.home, awayScore: score.away, status: 'live' },
        { id: 'm2', home: 'PREV', away: 'FLOW', homeScore: 1, awayScore: 0, status: 'ht' },
        { id: 'm3', home: 'TACT', away: 'OPS', homeScore: 2, awayScore: 2, status: 'live' },
    ];

    // Initialize players with Physics-enabled agents (runs once after members load)
    useEffect(() => {
        // Guard: only initialise once to prevent the match from "restarting"
        // every time a dependency reference changes.
        if (playersInitialised.current) return;
        if (membersLoading) return;

        // Moved to end of effect

        const createPlayer = (id: string, name: string, x: number, y: number, team: 'home' | 'away', role: string, stats: any): PlayerPuck => ({
            id, name, x, y, vx: 0, vy: 0, team, role, stats,
            homePos: { x, y },
            reputationTier: stats.level > 15 ? 'platinum' : stats.level > 8 ? 'gold' : 'silver',
            history: [],
            cooldownUntil: 0,
        });

        // Dynamic formation based on playersPerSide + hasKeeper props
        const homeFormation = buildFormation(playersPerSide, hasKeeper);
        const awayFormation: Array<[number, number, string]> = homeFormation.map(([x, y, role]) => [100 - x, y, role]);
        const allNames = ['GK', 'Tunde', 'Kofi', 'Diallo', 'Eze', 'Yusuf', 'Marcus', 'Jamie', 'Kwame', 'Alex', 'Seun', 'Bayo', 'Chidi', 'Emeka', 'Femi', 'Gbenga'];
        const homeNames = allNames.slice(0, playersPerSide);
        const awayNames = ['GK', 'Rival', 'Stone', 'Park', 'Cruz', 'Osei', 'Nkosi', 'Levi', 'Dani', 'Ramos', 'Finn', 'Musa', 'Sven', 'Ito', 'Bale', 'Zara'].slice(0, playersPerSide);
        const home433 = homeFormation;
        const away433 = awayFormation;

        let seededPlayers: PlayerPuck[] = [];

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
            seededPlayers = [...homePlayers, ...awayPlayers];
        } else {
            const homePlayers = home433.map(([x, y, role], i) =>
                createPlayer(`h${i}`, homeNames[i], x, y, 'home', role,
                    { level: 10 + Math.floor(Math.random() * 12), pace: 68 + Math.floor(Math.random() * 24), agility: 65 + Math.floor(Math.random() * 22), strength: 60 + Math.floor(Math.random() * 25), passing: 68 + Math.floor(Math.random() * 22) })
            );
            const awayPlayers2 = away433.map(([x, y, role], i) =>
                createPlayer(`a${i}`, awayNames[i], x, y, 'away', role,
                    { level: 10 + Math.floor(Math.random() * 8), pace: 65 + Math.floor(Math.random() * 20), agility: 60 + Math.floor(Math.random() * 20), strength: 65 + Math.floor(Math.random() * 20), passing: 65 + Math.floor(Math.random() * 20) })
            );
            seededPlayers = [...homePlayers, ...awayPlayers2];
        }

        const kickoffCandidates = seededPlayers.filter((player) => player.role !== 'GK');
        const kickoffStarter = kickoffCandidates[Math.floor(Math.random() * kickoffCandidates.length)] ?? seededPlayers[0];

        setPlayers(seededPlayers);
        if (kickoffStarter) {
            setBall({ x: kickoffStarter.x, y: kickoffStarter.y, vx: 0, vy: 0, ownerId: kickoffStarter.id });
            setCommentary([{ id: 'init-0', time: '0:00', text: `${kickoffStarter.name} takes the kickoff.`, type: 'action' }]);
            setLatestEvent(`${kickoffStarter.name} takes the kickoff.`);
        }
        // Mark as initialized ONLY after players have been created
        playersInitialised.current = true;
    }, [members, membersLoading, playersPerSide, hasKeeper]);

    /** Add event with rate limiting - prevents repeat events from same player */
    const addEvent = useCallback((text: string, evtType: MatchEvent['type'], _team?: 'home' | 'away') => {
        // Extract player name from text for rate limiting
        const playerNameMatch = text.match(/^([A-Z][a-z]+)/);
        const playerName = playerNameMatch?.[1];
        
        // Check if this is a repeat event type that should be rate limited
        if (playerName && COMMENTARY_PARAMS.repeatEventTypes.some(type => text.toLowerCase().includes(type))) {
            const lastEvent = lastPlayerEvent.current.get(playerName);
            if (lastEvent && (time - lastEvent.tick) < COMMENTARY_PARAMS.repeatPlayerCooldown) {
                // Skip this event - rate limited
                return;
            }
            // Record this event
            lastPlayerEvent.current.set(playerName, { type: evtType, tick: time });
        }

        const minute = Math.floor(time / 20);
        const timeStr = `${minute}:00`;
        const commentaryType: MatchCommentary['type'] = evtType === 'goal' ? 'goal' : evtType === 'dao' ? 'dao' : evtType === 'incident' ? 'incident' : 'action';
        // Keep commentary in chronological order and trim to the visible window.
        setCommentary(prev => [...prev, { id: `${time}-${Math.random().toString(36).slice(2)}`, time: timeStr, text, type: commentaryType }].slice(-COMMENTARY_PARAMS.maxEvents));
        setLatestEvent(text);
    }, [time]);

    // Keep addCommentary as a thin alias so existing call-sites still work
    const addCommentary = useCallback((text: string, type: MatchCommentary['type'] = 'action') => {
        addEvent(text, type === 'goal' ? 'goal' : type === 'dao' ? 'dao' : type === 'incident' ? 'incident' : 'shot');
    }, [addEvent]);

    const triggerDaoCommand = useCallback(() => {
        const commands = ["All out attack", "Increase the tempo", "High press trigger", "Recover the second ball"];
        const cmd = commands[Math.floor(Math.random() * commands.length)];
        setDaoAlert(cmd);
        addCommentary(`Sample instruction: ${cmd}.`, 'dao');
        if (cmd.toLowerCase().includes("tempo")) setTempo(1.5);
        setTimeout(() => setDaoAlert(null), 3000);
    }, [addCommentary]);

    const tempoOptions = useMemo(() => [0.75, 1, 1.25, 1.5, 2], []);

    const movePlayers = useCallback(() => {
        let currentOwnerId = ball.ownerId;
        const friction = SIM_PARAMS.friction;
        const drag = SIM_PARAMS.drag;

        let nextBallX = ball.x + ball.vx;
        let nextBallY = ball.y + ball.vy;
        let nextBallVx = ball.vx * friction;
        let nextBallVy = ball.vy * friction;
        let shotFired = false;

        if (nextBallX < 2) { nextBallVx = Math.abs(nextBallVx) * 0.5; nextBallX = 2; }
        if (nextBallX > 98) { nextBallVx = -Math.abs(nextBallVx) * 0.5; nextBallX = 98; }
        if (nextBallY < 2) { nextBallVy = Math.abs(nextBallVy) * 0.5; nextBallY = 2; }
        if (nextBallY > 98) { nextBallVy = -Math.abs(nextBallVy) * 0.5; nextBallY = 98; }

        const inGoalMouth = nextBallY > 38 && nextBallY < 62;
        if (!currentOwnerId && nextBallX <= 2 && inGoalMouth) {
            addEvent('⚽ GOAL! Away team scores!', 'goal', 'away');
            setScore((previous) => ({ ...previous, away: previous.away + 1 }));
            nextBallX = 50; nextBallY = 50; nextBallVx = 0.8; nextBallVy = 0;
            ownerCarryTicks.current = 0;
        } else if (!currentOwnerId && nextBallX >= 98 && inGoalMouth) {
            addEvent('⚽ GOAL! Home team scores!', 'goal', 'home');
            setScore((previous) => ({ ...previous, home: previous.home + 1 }));
            nextBallX = 50; nextBallY = 50; nextBallVx = -0.8; nextBallVy = 0;
            ownerCarryTicks.current = 0;
        }

        const homePlayers = players.filter((player) => player.team === 'home');
        const awayPlayers = players.filter((player) => player.team === 'away');

        const updatedPlayers: PlayerPuck[] = players.map((player) => {
            const isOwner = player.id === currentOwnerId;
            const teammates = player.team === 'home' ? homePlayers : awayPlayers;
            const opponents = player.team === 'home' ? awayPlayers : homePlayers;
            const ctx: EngineContext = {
                ball,
                teammates: teammates.filter((teammate) => teammate.id !== player.id),
                opponents,
                ownGoal: { x: player.team === 'home' ? 0 : 100, y: 50 },
                oppGoal: { x: player.team === 'home' ? 100 : 0, y: 50 },
                time,
                tempo,
            };

            let targetX: number;
            let targetY: number;

            if (isOwner) {
                targetX = player.team === 'home' ? 92 : 8;
                targetY = 50 + Math.sin(time * 0.08 + player.homePos.y) * 18;
                const nearDefender = opponents.find((opponent) => distanceBetween(opponent.x, opponent.y, player.x, player.y) < 10);
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
            const maxSpeed = (player.stats.pace / 100) * (isOwner ? 0.32 : 0.52) * tempo * (1 + reputationBonus * 0.2);
            const dvx = dist > 0 ? (dx / dist) * maxSpeed : 0;
            const dvy = dist > 0 ? (dy / dist) * maxSpeed : 0;
            const agilityBase = player.stats.agility / 1000;
            const ax = (dvx - player.vx) * agilityBase * (1 + reputationBonus * 0.1);
            const ay = (dvy - player.vy) * agilityBase * (1 + reputationBonus * 0.1);

            const nextPx = Math.max(2, Math.min(98, player.x + player.vx));
            const nextPy = Math.max(2, Math.min(98, player.y + player.vy));
            const nextPvx = (player.vx + ax) * drag;
            const nextPvy = (player.vy + ay) * drag;

            if (isOwner && !shotFired) {
                const inShootingRange = (player.team === 'home' && player.x > 75 && Math.abs(player.y - 50) < 25)
                    || (player.team === 'away' && player.x < 25 && Math.abs(player.y - 50) < 25);
                const distToGoal = player.team === 'home' ? 100 - player.x : player.x;
                const nearOpponent = opponents.find((opponent) => distanceBetween(opponent.x, opponent.y, player.x, player.y) < 10);

                const isAttackerRole = ['ST', 'LW', 'RW', 'ATT'].includes(player.role);
                const lastDefenderX = opponents
                    .filter((opponent) => ['CB', 'LB', 'RB', 'DEF'].includes(opponent.role))
                    .reduce((acc, opponent) => {
                        const defenderX = player.team === 'home' ? opponent.x : 100 - opponent.x;
                        return Math.max(acc, defenderX);
                    }, 0);
                const attackerAdvX = player.team === 'home' ? player.x : 100 - player.x;
                const isOffside = isAttackerRole && attackerAdvX > lastDefenderX + 2 && attackerAdvX > 50;

                const shootScore = inShootingRange && !isOffside
                    ? ((player.stats as any).shooting || 70) / 100 * (1 - distToGoal / 50) * (nearOpponent ? 0.6 : 1.0)
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
                        addEvent(`${player.name} shoots!`, 'shot', player.team);
                    }
                } else if (roll < shootScore + passScore) {
                    ownerCarryTicks.current = 999;
                } else if (roll < shootScore + passScore + dribbleScore && ownerCarryTicks.current > 10) {
                    addEvent(`${player.name} drives at the defender.`, 'pass', player.team);
                }
            }

            if (isOwner && !shotFired) {
                if (ownerCarryTicks.current < 999) ownerCarryTicks.current += 1;
                const carryLimit = 18 + Math.floor(Math.random() * 12);
                if (ownerCarryTicks.current > carryLimit) {
                    const teammatePool = players.filter((candidate) => candidate.team === player.team && candidate.id !== player.id && candidate.role !== 'GK');
                    const target = selectPassTarget(player, teammatePool, opponents);
                    if (target) {
                        const pdx = target.x - player.x;
                        const pdy = target.y - player.y;
                        const pd = Math.sqrt(pdx * pdx + pdy * pdy);
                        const passSpeed = 2.2 + (player.stats.passing || 70) / 50;
                        nextBallVx = (pdx / pd) * passSpeed;
                        nextBallVy = (pdy / pd) * passSpeed;
                        currentOwnerId = null;
                        ownerCarryTicks.current = 0;
                        addEvent(`${player.name} finds ${target.name} with the pass.`, 'pass', player.team);
                    }
                }
            }

            const newHistory = (player.reputationTier === 'platinum' && !lowPowerMode)
                ? [{ x: player.x, y: player.y }, ...player.history].slice(0, 5)
                : [];

            return {
                ...player,
                x: nextPx,
                y: nextPy,
                vx: nextPvx,
                vy: nextPvy,
                history: newHistory,
                intent,
            };
        });

        resolveCollisions(updatedPlayers);

        const activeOwner = currentOwnerId
            ? updatedPlayers.find((player) => player.id === currentOwnerId) ?? null
            : null;

        if (!activeOwner) {
            // Loose ball recovery - use SIM_PARAMS
            const recoveryCandidate = [...updatedPlayers]
                .filter((player) => (player.cooldownUntil ?? 0) <= time)
                .map((player) => ({
                    player,
                    distance: distanceBetween(player.x, player.y, nextBallX, nextBallY),
                }))
                .filter(({ distance }) => distance < SIM_PARAMS.looseBallRecoveryRadius)
                .sort((left, right) => left.distance - right.distance)[0];

            if (recoveryCandidate) {
                currentOwnerId = recoveryCandidate.player.id;
                ownerCarryTicks.current = 0;
                // Apply tackle cooldown after winning ball (4-8 ticks from SIM_PARAMS)
                const cooldownTicks = SIM_PARAMS.tackleCooldownMin + 
                    Math.floor(Math.random() * (SIM_PARAMS.tackleCooldownMax - SIM_PARAMS.tackleCooldownMin));
                recoveryCandidate.player.cooldownUntil = time + cooldownTicks;
                addEvent(`${recoveryCandidate.player.name} gathers the loose ball.`, 'tackle', recoveryCandidate.player.team);
            }
        } else {
            // Live tackle - use SIM_PARAMS.liveTackleRadius
            // CRITICAL: Only allow tackle if defender is:
            // 1. On the opposing team
            // 2. The nearest pressure player (stop swarm behavior)
            
            const opponents = updatedPlayers.filter(p => p.team !== activeOwner.team && (p.cooldownUntil ?? 0) <= time);
            
            // Find nearest defender and nearest midfielder separately
            const defenderRoles = ['CB', 'LB', 'RB', 'DEF', 'FB'];
            const midRoles = ['CM', 'DM', 'AM', 'MID'];
            
            let nearestDefender: typeof opponents[0] | null = null;
            let nearestMidfielder: typeof opponents[0] | null = null;
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

            // Only the nearest defender + nearest midfielder can attempt tackle
            const eligibleChasers: typeof opponents = [];
            if (nearestDefender && nearestDefenderDist < SIM_PARAMS.chaseDistanceThreshold) {
                eligibleChasers.push(nearestDefender);
            }
            if (nearestMidfielder && nearestMidDist < SIM_PARAMS.chaseDistanceThreshold) {
                eligibleChasers.push(nearestMidfielder);
            }

            // Find the nearest among eligible chasers
            const pressure = eligibleChasers
                .map((player) => ({
                    player,
                    distance: distanceBetween(player.x, player.y, activeOwner.x, activeOwner.y),
                }))
                .sort((left, right) => left.distance - right.distance)[0];

            // Use live tackle radius from SIM_PARAMS
            if (pressure && pressure.distance < SIM_PARAMS.liveTackleRadius) {
                const tackleProb = ((pressure.player.stats.strength + pressure.player.stats.agility) / 200) * 0.18;
                if (Math.random() < tackleProb) {
                    currentOwnerId = pressure.player.id;
                    ownerCarryTicks.current = 0;
                    // Apply tackle cooldown after winning ball
                    const cooldownTicks = SIM_PARAMS.tackleCooldownMin + 
                        Math.floor(Math.random() * (SIM_PARAMS.tackleCooldownMax - SIM_PARAMS.tackleCooldownMin));
                    pressure.player.cooldownUntil = time + cooldownTicks;
                    addEvent(`${pressure.player.name} wins the tackle and turns play over.`, 'tackle', pressure.player.team);
                }
            }
        }

        // Apply cooldown to ball owner after interaction
        const cooledPlayers = updatedPlayers.map((player) => (
            player.id === currentOwnerId
                ? { ...player, cooldownUntil: Math.max(player.cooldownUntil ?? 0, time + SIM_PARAMS.looseBallRecoveryCooldown) }
                : player
        ));

        if (currentOwnerId && !shotFired) {
            const owner = cooledPlayers.find((player) => player.id === currentOwnerId);
            if (owner) {
                nextBallX = owner.x + owner.vx * 1.5;
                nextBallY = owner.y + owner.vy * 1.5;
                nextBallVx = owner.vx;
                nextBallVy = owner.vy;
            }
        }

        // Update ball state based on current conditions
        const speed = Math.hypot(nextBallVx, nextBallVy);
        let nextBallState: BallState = 'controlled';
        
        if (!currentOwnerId) {
            if (speed > 0.8) {
                // Ball in flight - prevent instant ownership until reception
                nextBallState = passFlightRef.current ? 'pass_flight' : 'shot_flight';
                if (!passFlightRef.current) {
                    passFlightRef.current = {
                        startX: ball.x, startY: ball.y,
                        endX: nextBallX, endY: nextBallY,
                        startTime: time
                    };
                }
            } else {
                // Ball is loose
                nextBallState = 'loose';
                passFlightRef.current = null;
            }
        } else {
            nextBallState = 'controlled';
            passFlightRef.current = null;
        }
        
        // Update support options if there's a ball carrier
        if (currentOwnerId) {
            const carrier = cooledPlayers.find((p) => p.id === currentOwnerId);
            if (carrier) {
                const teammates = carrier.team === 'home' ? homePlayers : awayPlayers;
                const opponents = carrier.team === 'home' ? awayPlayers : homePlayers;
                supportOptionsRef.current = computeSupportOptions(carrier, teammates, opponents);
            }
        }
        
        setBall({ x: nextBallX, y: nextBallY, vx: nextBallVx, vy: nextBallVy, ownerId: currentOwnerId });
        setBallState(nextBallState);
        setTime((previous) => previous + 1);

        if (time > 0 && time % 150 === 0 && Math.random() > 0.7) triggerDaoCommand();
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

    return (
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            {/* Preview fixture switcher */}
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
                        <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Preview Engine <span className="text-blue-500">v0.5</span></h2>
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
                                        <div className="text-xs font-black text-blue-200 uppercase tracking-widest">Illustrative squad instruction</div>
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
                            {latestEvent || 'Preview Match Canvas — kick off!'}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Commentary log and preview context */}
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="col-span-2 p-3 bg-black/70 h-28 overflow-hidden rounded-xl border border-white/10 order-1">
                        <div className="space-y-1.5">
                            {commentary.slice().reverse().map((c) => (
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

                    {/* Preview context */}
                    <div className="bg-green-900/80 p-3 rounded-xl border border-green-400/60 flex flex-col justify-between order-2 md:order-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-1.5">
                                <Activity className="w-3.5 h-3.5 text-green-200" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Preview Context</span>
                            </div>
                            <span className="text-xs text-green-100 font-mono font-semibold">Illustrative</span>
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
                            <div className="text-xs font-black text-green-100 uppercase leading-none mb-1">How to read it</div>
                            <div className="text-xs text-white italic leading-tight">Real submissions can add venue and verification context here when those signals are actually available.</div>
                        </div>
                    </div>

                    {/* Sample next win */}
                    <div className="bg-yellow-900/80 p-3 rounded-xl border border-yellow-400/60 flex flex-col justify-between order-3 md:order-3">
                        <div className="flex items-center space-x-1.5 mb-1">
                            <Zap className="w-3.5 h-3.5 text-yellow-200" />
                            <span className="text-xs font-black text-white uppercase tracking-widest italic">Sample Next Win</span>
                        </div>
                        <div>
                            <div className="text-xs font-black text-white leading-tight mb-1">{env.localMission.title}</div>
                            <div className="text-xs text-yellow-50 leading-tight">A real season starts when you move from preview to a verified result at <span className="text-white font-bold">{env.localMission.landmark}</span>.</div>
                        </div>
                        <div className="mt-2 bg-yellow-400/40 rounded-lg py-1 px-2 border border-yellow-400/60">
                            <div className="text-xs font-bold text-white text-center uppercase tracking-tight">{env.localMission.bonus}</div>
                        </div>
                    </div>

                    <div className="bg-blue-900/80 p-3 rounded-xl border border-blue-400/60 flex flex-col justify-center order-4 md:order-4">
                        <div className="flex items-center space-x-2 mb-1.5">
                            <Shield className="w-3.5 h-3.5 text-blue-200" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Sample Governance Note</span>
                        </div>
                        <p className="text-xs text-blue-50 italic leading-tight">
                            &ldquo;Protected actions, treasury rules, and squad policy appear here once a real squad is running live.&rdquo;
                        </p>
                    </div>
                </div>
            </div>
        </Card>
    );
};
