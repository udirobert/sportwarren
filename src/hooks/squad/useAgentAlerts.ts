"use client";

import { useMemo } from 'react';

// Shared ChatMessage type — mirrors StaffRoom's local type
export interface AgentAlert {
    staffId: string;
    sender: string;
    text: string;
}

interface SquadMember {
    id: string;
    name: string;
    role: 'captain' | 'vice_captain' | 'player';
    stats?: { matches: number; goals: number; level: number };
}

interface Treasury {
    balance: number;
    transactions?: unknown[];
}

interface Tactics {
    formation?: string;
}

interface UseAgentAlertsInput {
    members: SquadMember[];
    treasury: Treasury | null | undefined;
    tactics: Tactics | null | undefined;
    dataReady: boolean;
}

// Rule-based thresholds
const CONTRACT_EXPIRY_MATCH_THRESHOLD = 40; // >= this many matches → contract nearing end
const LOW_BUDGET_THRESHOLD = 1500;
const HIGH_INJURY_RISK_MATCHES = 35;
const HIGH_MORALE_LEVEL = 7;
const LOW_MORALE_LEVEL = 3;

function calcWeeksRemaining(matches: number, totalWeeks = 48): number {
    return Math.max(0, totalWeeks - matches);
}

/**
 * useAgentAlerts
 *
 * Pure rule-based hook. Reads live squad state and returns a list of
 * proactive alert messages keyed by staffId. StaffRoom injects these
 * into the relevant chat history on first load — no LLM required.
 *
 * Rules:
 *  Agent    — contract expiry warnings, low budget alert
 *  Scout    — no prospects flagged if squad is full (>= 8 members)
 *  Coach    — morale alert based on avg level
 *  Physio   — high match-load injury risk per player
 *  Comms    — low budget blocks sponsorship requirements
 */
export function useAgentAlerts({ members, treasury, tactics, dataReady }: UseAgentAlertsInput): AgentAlert[] {
    return useMemo(() => {
        if (!dataReady || !members.length) return [];

        const alerts: AgentAlert[] = [];
        const balance = treasury?.balance ?? 0;
        const avgLevel = members.length
            ? Math.round(members.reduce((acc, m) => acc + (m.stats?.level ?? 0), 0) / members.length)
            : 0;

        // ── Agent: contract expiry warnings ──────────────────────────────
        const expiringPlayers = members.filter(m => {
            const matches = m.stats?.matches ?? 0;
            return calcWeeksRemaining(matches) <= 8;
        });

        if (expiringPlayers.length > 0) {
            const urgency = expiringPlayers.some(p => calcWeeksRemaining(p.stats?.matches ?? 0) <= 4)
                ? '🔴 URGENT'
                : '🟡 SOON';
            alerts.push({
                staffId: 'agent-1',
                sender: 'The Agent',
                text: `Boss, heads up — ${urgency}.\n\n${expiringPlayers.map(p => {
                    const weeks = calcWeeksRemaining(p.stats?.matches ?? 0);
                    return `• ${p.name.split(' ')[0]} — ${weeks} weeks remaining`;
                }).join('\n')}\n\nI'd recommend we open negotiations before rival clubs start circling. Want me to pull their dossiers?`,
            });
        }

        // ── Agent: low transfer budget ────────────────────────────────────
        if (balance < LOW_BUDGET_THRESHOLD) {
            alerts.push({
                staffId: 'agent-1',
                sender: 'The Agent',
                text: `One more thing, Boss — our transfer budget is looking thin at ${balance.toLocaleString()} credits. I'd hold off on any new signings until we secure a sponsorship deal or match prize. Want me to flag the best free-agent options within budget?`,
            });
        }

        // ── Scout: squad depth alert ──────────────────────────────────────
        if (members.length < 8) {
            const needed = 8 - members.length;
            alerts.push({
                staffId: 'scout-1',
                sender: 'The Scout',
                text: `Boss, I've been watching the numbers. We're ${needed} player${needed > 1 ? 's' : ''} short of a full rotation squad. I've got ${needed + 1} scouting leads lined up from the wider network — want me to break down the positions we should prioritise first?`,
            });
        }

        // ── Coach: morale alert ───────────────────────────────────────────
        if (avgLevel <= LOW_MORALE_LEVEL) {
            alerts.push({
                staffId: 'coach-1',
                sender: 'Coach Kite',
                text: `Boss — morale indicators are flashing red. Squad average level is ${avgLevel}, which tells me confidence is low. I'd recommend a focused training session before the next fixture. Want me to put a plan together?`,
            });
        } else if (avgLevel >= HIGH_MORALE_LEVEL) {
            alerts.push({
                staffId: 'coach-1',
                sender: 'Coach Kite',
                text: `Good news from the training ground, Boss. Squad morale is high — average level ${avgLevel}. The lads are sharp. This is the right moment to push an aggressive formation. Want me to run through the tactical options?`,
            });
        }

        // ── Physio: high match-load injury risk ───────────────────────────
        const highRiskPlayers = members.filter(m => (m.stats?.matches ?? 0) >= HIGH_INJURY_RISK_MATCHES);
        if (highRiskPlayers.length > 0) {
            alerts.push({
                staffId: 'physio-1',
                sender: 'The Physio',
                text: `Boss, I'm flagging a load management concern.\n\n${highRiskPlayers.map(p => `• ${p.name.split(' ')[0]} — ${p.stats?.matches ?? 0} matches played`).join('\n')}\n\nThese players are in the high-risk zone for soft-tissue injuries. I'd recommend rotating them for the next fixture. Want me to update the availability list?`,
            });
        }

        // ── Comms: sponsorship window ─────────────────────────────────────
        if (balance < 3000) {
            alerts.push({
                staffId: 'comms-1',
                sender: 'Commercial Lead',
                text: `Boss, I've been tracking the commercial side. With our current budget at ${balance.toLocaleString()} credits, a sponsor push or community update would materially improve our room to move. Want me to outline the fastest route to new revenue?`,
            });
        }

        return alerts;
    }, [dataReady, members, treasury, tactics]);
}
