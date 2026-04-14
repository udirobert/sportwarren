// ═══════════════════════════════════════════════════════════════════════════════
// MATCH ENGINE — Pure simulation functions
// Extracted from MatchEnginePreview.tsx for testability and reuse.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Types ─────────────────────────────────────────────────────────────────────

export type ReputationTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type BallState = 'controlled' | 'loose' | 'pass_flight' | 'shot_flight';

export interface RoleProfile {
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

export interface PlayerPuck {
    id: string;
    name: string;
    avatar?: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    team: 'home' | 'away';
    role: string;
    stats: { level: number; pace: number; agility: number; strength: number; passing: number; shooting?: number };
    reputationTier: ReputationTier;
    homePos: { x: number; y: number };
    history: Array<{ x: number; y: number }>;
    intent?: { x: number; y: number };
    cooldownUntil?: number;
}

export interface EngineContext {
    ball: { x: number; y: number; vx: number; vy: number; ownerId: string | null };
    teammates: PlayerPuck[];
    opponents: PlayerPuck[];
    ownGoal: { x: number; y: number };
    oppGoal: { x: number; y: number };
    time: number;
    tempo: number;
}

export interface MatchEvent {
    tick: number;
    minute: number;
    type: 'goal' | 'tackle' | 'pass' | 'shot' | 'dao' | 'incident';
    text: string;
    team?: 'home' | 'away';
}

export interface MatchCommentary {
    id: string;
    time: string;
    text: string;
    type: 'action' | 'goal' | 'incident' | 'dao';
}

export interface SupportOptions {
    short: { player: PlayerPuck | null; distance: number };
    wide: { player: PlayerPuck | null; distance: number };
    advanced: { player: PlayerPuck | null; distance: number };
}

export interface LiveMatch {
    id: string;
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
    status: 'live' | 'finishing' | 'ht';
}

export interface PassResult {
    nextBallVx: number;
    nextBallVy: number;
    targetName: string;
    targetId: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

export const ROLE_PROFILES: Record<string, RoleProfile> = {
    CB: {
        narrowness: 0.85, lineHeight: 0.15, stepOutThreshold: 15,
        maxDrift: 8, chaseAggression: 0.3, supportWidth: 0.2,
    },
    FB: {
        narrowness: 0.4, lineHeight: 0.25, stepOutThreshold: 20,
        maxDrift: 15, chaseAggression: 0.5, supportWidth: 0.8,
        overlapThreshold: 0.7,
    },
    DM: {
        narrowness: 0.7, lineHeight: 0.45, stepOutThreshold: 12,
        maxDrift: 10, chaseAggression: 0.4, supportWidth: 0.5,
        screenPosition: true,
    },
    CM: {
        narrowness: 0.5, lineHeight: 0.5, stepOutThreshold: 18,
        maxDrift: 20, chaseAggression: 0.55, supportWidth: 0.6,
        arriveLate: true,
    },
    AM: {
        narrowness: 0.4, lineHeight: 0.7, stepOutThreshold: 22,
        maxDrift: 25, chaseAggression: 0.6, supportWidth: 0.7,
        arriveLate: true,
    },
    LW: {
        narrowness: 0.1, lineHeight: 0.75, stepOutThreshold: 30,
        maxDrift: 30, chaseAggression: 0.65, supportWidth: 0.9,
        holdTouchline: true, touchlineThreshold: 65,
    },
    RW: {
        narrowness: 0.1, lineHeight: 0.75, stepOutThreshold: 30,
        maxDrift: 30, chaseAggression: 0.65, supportWidth: 0.9,
        holdTouchline: true, touchlineThreshold: 65,
    },
    ST: {
        narrowness: 0.6, lineHeight: 0.85, stepOutThreshold: 10,
        maxDrift: 12, chaseAggression: 0.35, supportWidth: 0.3,
        pinLastLine: true, checkShortThreshold: 20,
    },
    GK: {
        narrowness: 1.0, lineHeight: 0.05, stepOutThreshold: 8,
        maxDrift: 5, chaseAggression: 0.0, supportWidth: 0.0,
    },
    DEF: { narrowness: 0.7, lineHeight: 0.2, stepOutThreshold: 15, maxDrift: 10, chaseAggression: 0.4, supportWidth: 0.3 },
    MID: { narrowness: 0.5, lineHeight: 0.5, stepOutThreshold: 18, maxDrift: 18, chaseAggression: 0.5, supportWidth: 0.5 },
    ATT: { narrowness: 0.3, lineHeight: 0.8, stepOutThreshold: 25, maxDrift: 25, chaseAggression: 0.6, supportWidth: 0.7 },
};

export const SIM_PARAMS = {
    looseBallRecoveryRadius: 2.2,
    looseBallRecoveryCooldown: 3,
    liveTackleRadius: 1.4,
    tackleCooldownMin: 5,
    tackleCooldownMax: 8,
    maxChasingDefenders: 1,
    maxChasingMidfielders: 1,
    chaseDistanceThreshold: 25,
    minPlayerDistance: 3.5,
    friction: 0.98,
    drag: 0.92,
    flightSpeedThreshold: 0.8,
    // GK saves
    gkSaveRadius: 8,           // Max distance from shot trajectory for GK to save
    gkSaveChance: 0.45,        // Base save probability
    // Match timing (ticks — 1 tick ≈ 80ms, ~12.5 ticks/sec)
    halftimeTick: 900,         // ≈ 45 minutes
    fulltimeTick: 1800,        // ≈ 90 minutes
};

export const PASS_WEIGHTS = {
    safeRecycle: 0.40,
    progressiveForward: 0.40,
    wideSwitch: 0.20,
    centralCrowdingPenalty: 12,
    distancePenalty: 0.15,
    pressurePenalty: 8,
    laneFitBonus: {
        ST: 8, LW: 6, RW: 6, AM: 5,
        CM: 4, DM: 3, MID: 3,
        CB: 2, FB: 2, LB: 2, RB: 2,
        GK: 0,
    },
};

export const COMMENTARY_PARAMS = {
    maxEvents: 6,
    repeatPlayerCooldown: 10,
    repeatEventTypes: ['recovers the ball', 'takes on the defender', 'wins the tackle', 'picks up the loose pass'],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function distanceBetween(ax: number, ay: number, bx: number, by: number): number {
    return Math.hypot(ax - bx, ay - by);
}

// ── Formation builder ─────────────────────────────────────────────────────────

export function buildFormation(n: number, hasKeeper: boolean): Array<[number, number, string]> {
    const positions: Array<[number, number, string]> = [];
    let outfield = n;
    if (hasKeeper && n >= 4) {
        positions.push([8, 50, 'GK']);
        outfield = n - 1;
    }
    const lines = outfield <= 4 ? 2 : 3;
    const perLine = Math.ceil(outfield / lines);
    const lineXs = lines === 2 ? [30, 60] : [22, 42, 62];
    const roles = lines === 2 ? ['DEF', 'ATT'] : ['DEF', 'MID', 'ATT'];
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

// ── Role-dispatch tick functions ───────────────────────────────────────────────

export function getRoleProfile(role: string): RoleProfile {
    const cleanRole = role.replace(/^(LB|RB)$/, 'FB');
    return ROLE_PROFILES[cleanRole] || ROLE_PROFILES.DEF;
}

export function tickGoalkeeper(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const goalX = p.team === 'home' ? 5 : 95;
    return { targetX: goalX, targetY: 30 + (ctx.ball.y / 100) * 40 };
}

export function tickDefender(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const profile = getRoleProfile(p.role);
    const isFB = ['FB', 'LB', 'RB'].includes(p.role);
    const isCB = p.role === 'CB';

    const ballInOwnHalf = (p.team === 'home' && ctx.ball.x < 50) || (p.team === 'away' && ctx.ball.x > 50);
    const distToBall = Math.sqrt((p.x - ctx.ball.x) ** 2 + (p.y - ctx.ball.y) ** 2);
    const ballInZone = distToBall < profile.stepOutThreshold;

    if (ballInOwnHalf && ballInZone) {
        return {
            targetX: ctx.ball.x + (p.team === 'home' ? -3 : 3),
            targetY: ctx.ball.y,
        };
    }

    const baseY = p.homePos.y;
    const narrowFactor = isCB ? profile.narrowness : isFB ? 1 - profile.narrowness : 0.5;
    const targetY = baseY + (ctx.ball.y - 50) * narrowFactor * 0.3;
    const defensiveLineX = 50 - (profile.lineHeight * 100);

    return {
        targetX: Math.max(p.homePos.x - profile.maxDrift,
                         Math.min(p.homePos.x + profile.maxDrift,
                                 p.team === 'home' ? defensiveLineX : 100 - defensiveLineX)),
        targetY,
    };
}

export function tickMidfielder(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const profile = getRoleProfile(p.role);
    const distToBall = Math.sqrt((p.x - ctx.ball.x) ** 2 + (p.y - ctx.ball.y) ** 2);

    const allMids = [...ctx.teammates, p].filter(t => ['CM', 'DM', 'AM', 'MID'].includes(t.role));
    const isClosestMid = !allMids.some(other =>
        other.id !== p.id &&
        Math.sqrt((other.x - ctx.ball.x) ** 2 + (other.y - ctx.ball.y) ** 2) < distToBall
    );

    if (isClosestMid && distToBall < profile.stepOutThreshold && distToBall < SIM_PARAMS.chaseDistanceThreshold) {
        return { targetX: ctx.ball.x, targetY: ctx.ball.y };
    }

    if (p.role === 'DM' || p.role === 'MID') {
        return {
            targetX: p.homePos.x + (ctx.ball.x - 50) * 0.2,
            targetY: 50 + (ctx.ball.y - 50) * (1 - profile.narrowness) * 0.3,
        };
    }

    const arrivalBonus = profile.arriveLate ? Math.sin(ctx.time * 0.03) * 8 : 0;
    return {
        targetX: p.homePos.x + (ctx.ball.x - 50) * 0.3,
        targetY: p.homePos.y + Math.sin(ctx.time * 0.05 + p.homePos.x) * 10 + arrivalBonus,
    };
}

export function tickAttacker(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    const profile = getRoleProfile(p.role);
    const isWinger = ['LW', 'RW'].includes(p.role);
    const isST = p.role === 'ST';

    const ballInOwnHalf = (p.team === 'home' && ctx.ball.x < 50) || (p.team === 'away' && ctx.ball.x > 50);

    if (isST) {
        if (ballInOwnHalf) {
            return {
                targetX: p.homePos.x - (p.team === 'home' ? 8 : -8),
                targetY: p.homePos.y,
            };
        }
        const distToNearestTeammate = Math.min(...ctx.teammates.map(t =>
            Math.sqrt((t.x - p.x) ** 2 + (t.y - p.y) ** 2)
        ));
        const shouldCheckShort = distToNearestTeammate > (profile.checkShortThreshold ?? 20);
        return {
            targetX: p.team === 'home' ? 85 + Math.sin(ctx.time * 0.04) * 5 : 15 - Math.sin(ctx.time * 0.04) * 5,
            targetY: shouldCheckShort ? p.homePos.y - 10 : p.homePos.y,
        };
    }

    if (isWinger) {
        if (ballInOwnHalf) {
            return {
                targetX: p.homePos.x - (p.team === 'home' ? 10 : -10),
                targetY: p.homePos.y,
            };
        }
        const inFinalThird = (p.team === 'home' && ctx.ball.x > (profile.touchlineThreshold ?? 65)) ||
                            (p.team === 'away' && ctx.ball.x < 100 - (profile.touchlineThreshold ?? 65));
        const runPhase = Math.sin(ctx.time * 0.04 + p.homePos.y * 0.1);
        return {
            targetX: p.team === 'home'
                ? (inFinalThird ? 70 + runPhase * 15 : 55 + runPhase * 5)
                : (inFinalThird ? 30 - runPhase * 15 : 45 - runPhase * 5),
            targetY: inFinalThird
                ? p.homePos.y + runPhase * 20
                : p.homePos.y,
        };
    }

    if (ballInOwnHalf) {
        return {
            targetX: p.homePos.x - (p.team === 'home' ? 10 : -10),
            targetY: p.homePos.y,
        };
    }
    const runPhase = Math.sin(ctx.time * 0.04 + p.homePos.y * 0.1);
    return {
        targetX: p.team === 'home' ? 70 + runPhase * 15 : 30 - runPhase * 15,
        targetY: p.homePos.y + runPhase * 20,
    };
}

export function tickPlayer(p: PlayerPuck, ctx: EngineContext): { targetX: number; targetY: number } {
    switch (p.role) {
        case 'GK': return tickGoalkeeper(p, ctx);
        case 'CB': case 'LB': case 'RB': case 'DEF': return tickDefender(p, ctx);
        case 'CM': case 'DM': case 'AM': case 'MID': return tickMidfielder(p, ctx);
        case 'ST': case 'LW': case 'RW': case 'ATT': return tickAttacker(p, ctx);
        default: return { targetX: p.homePos.x, targetY: p.homePos.y };
    }
}

// ── Collision resolution ──────────────────────────────────────────────────────

export function resolveCollisions(ps: PlayerPuck[]): void {
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

// ── Support options ───────────────────────────────────────────────────────────

export function computeSupportOptions(carrier: PlayerPuck, teammates: PlayerPuck[]): SupportOptions {
    const options: SupportOptions = {
        short: { player: null, distance: Infinity },
        wide: { player: null, distance: Infinity },
        advanced: { player: null, distance: Infinity },
    };

    const attackDirection = carrier.team === 'home' ? 1 : -1;

    for (const teammate of teammates) {
        if (teammate.id === carrier.id || teammate.role === 'GK') continue;
        const dist = distanceBetween(carrier.x, carrier.y, teammate.x, teammate.y);
        const relativeX = (teammate.x - carrier.x) * attackDirection;

        if (relativeX <= 5 && dist < options.short.distance) {
            options.short = { player: teammate, distance: dist };
        }
        if ((teammate.y < 20 || teammate.y > 80) && dist < options.wide.distance) {
            options.wide = { player: teammate, distance: dist };
        }
        if (relativeX > 10 && dist < options.advanced.distance) {
            options.advanced = { player: teammate, distance: dist };
        }
    }

    return options;
}

// ── Ball state ────────────────────────────────────────────────────────────────

export function determineBallState(
    ownerId: string | null,
    vx: number,
    vy: number,
    isPass: boolean
): BallState {
    if (ownerId) return 'controlled';
    const speed = Math.hypot(vx, vy);
    if (speed > SIM_PARAMS.flightSpeedThreshold) return isPass ? 'pass_flight' : 'shot_flight';
    return 'loose';
}

// ── Pass selection ────────────────────────────────────────────────────────────

export function selectPassTarget(
    owner: PlayerPuck,
    teammates: PlayerPuck[],
    opponents: PlayerPuck[],
    support?: SupportOptions
): PlayerPuck | null {
    const targets = teammates.filter((t) => t.id !== owner.id && t.role !== 'GK');
    if (targets.length === 0) return null;

    const passTypeRoll = Math.random();
    let preferredDirection: 'back' | 'side' | 'forward' | 'wide' = 'forward';

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
            const dist = distanceBetween(owner.x, owner.y, target.x, target.y);
            const spacing = Math.min(24, dist);

            const pressure = opponents.filter((opp) =>
                distanceBetween(opp.x, opp.y, target.x, target.y) < 12
            ).length;

            const laneFit = PASS_WEIGHTS.laneFitBonus[target.role as keyof typeof PASS_WEIGHTS.laneFitBonus] || 3;

            const isCentralZone = target.y > 30 && target.y < 70 && target.x > 30 && target.x < 70;
            const centralCrowding = isCentralZone ? PASS_WEIGHTS.centralCrowdingPenalty : 0;

            let directionBonus = 0;
            if (preferredDirection === 'back' && forwardProgress < -5) directionBonus = 15;
            else if (preferredDirection === 'forward' && forwardProgress > 5) directionBonus = 12;
            else if (preferredDirection === 'wide' && (target.y < 25 || target.y > 75)) directionBonus = 15;

            const distancePenalty = dist * PASS_WEIGHTS.distancePenalty;

            const supportBonus =
                (support?.short?.player?.id === target.id ? 6 : 0) +
                (support?.wide?.player?.id === target.id ? 5 : 0) +
                (support?.advanced?.player?.id === target.id ? 7 : 0);

            const score =
                forwardProgress * 1.6 +
                spacing * 0.5 +
                laneFit +
                directionBonus +
                supportBonus +
                pressure * PASS_WEIGHTS.pressurePenalty -
                centralCrowding -
                distancePenalty +
                Math.random() * 4;

            return {
                target,
                score,
                isWide: target.y < 25 || target.y > 75,
            };
        })
        .sort((left, right) => {
            const leftScore = left.score + (left.isWide ? 2 : 0);
            const rightScore = right.score + (right.isWide ? 2 : 0);
            return rightScore - leftScore;
        })[0]?.target ?? null;
}

// ── Pass execution (DRY helper) ───────────────────────────────────────────────

export function executePass(
    passer: PlayerPuck,
    target: PlayerPuck,
    passingStat: number
): { vx: number; vy: number } {
    const pdx = target.x - passer.x;
    const pdy = target.y - passer.y;
    const pd = Math.sqrt(pdx * pdx + pdy * pdy) || 0.01;
    const passSpeed = 2.2 + (passingStat || 70) / 50;
    return {
        vx: (pdx / pd) * passSpeed,
        vy: (pdy / pd) * passSpeed,
    };
}

// ── GK save check ─────────────────────────────────────────────────────────────

export function tryGkSave(
    ballVx: number,
    ballVy: number,
    ballX: number,
    ballY: number,
    gk: PlayerPuck,
    targetGoalX: number
): boolean {
    // Project ball trajectory to goal line
    if (Math.abs(ballVx) < 0.01) return false;
    const ticksToGoal = (targetGoalX - ballX) / ballVx;
    if (ticksToGoal <= 0 || ticksToGoal > 30) return false;
    const projectedY = ballY + ballVy * ticksToGoal;

    // GK must be within save radius of projected impact point
    const gkDist = distanceBetween(gk.x, gk.y, targetGoalX, projectedY);
    if (gkDist > SIM_PARAMS.gkSaveRadius) return false;

    // Save probability based on GK distance (closer = more likely)
    const saveChance = SIM_PARAMS.gkSaveChance * (1 - gkDist / SIM_PARAMS.gkSaveRadius);
    return Math.random() < saveChance;
}
