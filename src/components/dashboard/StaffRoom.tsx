"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    X,
    Coffee,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { trpc } from '@/lib/trpc-client';
import { useSquadDetails } from '@/hooks/squad/useSquad';
import { useAgentAlerts } from '@/hooks/squad/useAgentAlerts';
import { useAgentContext } from '@/context/AgentContext';
import { useYellowSession } from '@/hooks/useYellowSession';
import { useWallet } from '@/contexts/WalletContext';
import { ContractNegotiationModal } from './ContractNegotiationModal';
import { StaffAdvisor } from './StaffAdvisor';

// Derive reputation tier from reputation score
function reputationTierLabel(score: number): string {
    if (score >= 800) return 'Platinum';
    if (score >= 500) return 'Gold';
    if (score >= 250) return 'Silver';
    return 'Bronze';
}

// Derive market valuation from level and reputation score
function calcMarketValuation(level: number, score: number): number {
    return Math.round((level * 200 + score * 3) / 50) * 50;
}

type ChatMessage = { sender: string; text: string; actions?: { label: string; onClick: () => void }[]; id?: string };

interface StaffMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    mood: 'focused' | 'happy' | 'stressed' | 'busy';
    biography: string;
}

const STAFF_MEMBERS: StaffMember[] = [
    {
        id: 'agent-1',
        name: 'The Agent',
        role: 'Contract Negotiator',
        avatar: '🎩',
        mood: 'focused',
        biography: 'Specializes in reputation-based valuations. Always looking for the next player who can change a season.'
    },
    {
        id: 'scout-1',
        name: 'The Scout',
        role: 'Talent Identification',
        avatar: '🔭',
        mood: 'busy',
        biography: 'Tracks emerging prospects, squad gaps, and match load to spot the next useful addition.'
    },
    {
        id: 'coach-1',
        name: 'Coach Kite',
        role: 'Tactical Director',
        avatar: '🪁',
        mood: 'happy',
        biography: 'AI-driven tactical analyst. Thinks in nodes and probability matrices.'
    },
    {
        id: 'physio-1',
        name: 'The Physio',
        role: 'Health & Recovery',
        avatar: '🏥',
        mood: 'focused',
        biography: 'Specializes in biometric recovery and injury prevention. Monitors real-world activity levels via the Phygital link.'
    },
    {
        id: 'comms-1',
        name: 'Commercial Lead',
        role: 'Sponsorships & PR',
        avatar: '📈',
        mood: 'happy',
        biography: 'Maximizes Lens-based reputation for brand deals. Thinks every tackle is a marketing opportunity.'
    }
];

interface StaffRoomProps {
    squadId?: string;
    onClose: () => void;
}

export const StaffRoom: React.FC<StaffRoomProps> = ({ squadId, onClose }) => {
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(STAFF_MEMBERS[0]);
    const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
    const [usedActions, setUsedActions] = useState<Set<string>>(new Set());
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isNegotiationOpen, setIsNegotiationOpen] = useState(false);
    const [negotiatingPlayer, setNegotiatingPlayer] = useState<string>('');
    const [negotiatingWage, setNegotiatingWage] = useState<number>(500);
    const [inputText, setInputText] = useState<string>('');
    const { isVerified } = useWallet();

    const agentChat = trpc.agent.chat.useMutation();
    const logDecision = trpc.memory.logDecision.useMutation();
    const { data: decisionData } = trpc.memory.getDecisions.useQuery(
        { staffId: selectedStaff?.id ?? 'agent-1', limit: 5 },
        { enabled: !!selectedStaff }
    );
    const recentDecisions = decisionData?.decisions ?? [];

    const chatHistory = selectedStaff ? (chatHistories[selectedStaff.id] || []) : [];
    const setChatHistory = (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
        if (!selectedStaff) return;
        const staffId = selectedStaff.id;
        setChatHistories(prev => {
            const current = prev[staffId] || [];
            const next = typeof updater === 'function' ? updater(current) : updater;
            return { ...prev, [staffId]: next };
        });
    };

    // Fetch real-time data for functional responses
    const { data: treasury, isLoading: treasuryLoading, isError: treasuryError } = trpc.squad.getTreasury.useQuery(
        { squadId: squadId || '' },
        { enabled: !!squadId && isVerified }
    );
    const { data: tactics, isLoading: tacticsLoading } = trpc.squad.getTactics.useQuery(
        { squadId: squadId || '' },
        { enabled: !!squadId && isVerified }
    );
    const { members, loading: membersLoading } = useSquadDetails(squadId);

    const dataLoading = squadId && (treasuryLoading || tacticsLoading || membersLoading);
    const dataError = squadId && treasuryError;
    const dataReady = !dataLoading && !!squadId;
    const hasLiveMembers = members.length > 0;
    const hasLiveTreasury = Boolean(treasury);
    const activeFormation = typeof (tactics as { formation?: unknown } | null | undefined)?.formation === 'string'
        ? (tactics as { formation: string }).formation
        : null;
    const averageLevel = hasLiveMembers
        ? Math.round(members.reduce((acc, member) => acc + (member.stats?.level ?? 0), 0) / members.length)
        : 0;
    const membersByMatchLoad = [...members].sort((left, right) => (right.stats?.matches ?? 0) - (left.stats?.matches ?? 0));
    const highLoadMembers = membersByMatchLoad.filter((member) => (member.stats?.matches ?? 0) >= 16);
    const freshMembers = [...membersByMatchLoad].reverse().slice(0, Math.min(2, members.length));
    const developmentMembers = [...members].sort((left, right) => (left.stats?.level ?? 0) - (right.stats?.level ?? 0)).slice(0, Math.min(2, members.length));
    const contractCandidates = membersByMatchLoad.slice(0, Math.min(3, members.length));
    const squadDepthTarget = 8;
    const rotationGap = Math.max(0, squadDepthTarget - members.length);
    const positionCounts = members.reduce<Record<string, number>>((counts, member) => {
        if (member.position) {
            counts[member.position] = (counts[member.position] ?? 0) + 1;
        }
        return counts;
    }, {});
    const missingPositions = ['GK', 'DF', 'MF', 'ST', 'WG'].filter((position) => !positionCounts[position]);

    const alertMembers: Array<{ id: string; name: string; role: 'captain' | 'vice_captain' | 'player'; stats?: { matches: number; goals: number; level: number } }> = members.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        stats: member.stats,
    }));
    const alertTreasury: { balance: number; transactions?: unknown[] } | null = treasury
        ? { balance: treasury.balance, transactions: treasury.transactions }
        : null;
    const tacticsAny = tactics as Record<string, unknown> | null | undefined;
    const alertTactics: { formation?: string } | null = tacticsAny
        ? { formation: typeof tacticsAny.formation === 'string' ? tacticsAny.formation : undefined }
        : null;

    const { state: agentCtx, dispatch: agentDispatch } = useAgentContext();
    const yellowSession = useYellowSession(squadId);
    const lensPost = trpc.lens.postUpdate.useMutation();

    const agentAlerts = useAgentAlerts({
        members: alertMembers,
        treasury: alertTreasury,
        tactics: alertTactics,
        dataReady,
    });

    useEffect(() => {
        if (selectedStaff) {
            setChatHistories(prev => {
                if (prev[selectedStaff.id]) return prev;
                return {
                    ...prev,
                    [selectedStaff.id]: [{ sender: selectedStaff.name, text: `Welcome to the backroom, Boss. How can I help you today?` }]
                };
            });
            setUsedActions(new Set());
        }
    }, [selectedStaff?.id]);

    // Inject proactive agent alerts once per staff member after data loads
    const alertsInjectedRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        if (!agentAlerts.length) return;
        setChatHistories(prev => {
            const next = { ...prev };
            for (const alert of agentAlerts) {
                const key = `${alert.staffId}:${alert.text.slice(0, 40)}`;
                if (alertsInjectedRef.current.has(key)) continue;
                alertsInjectedRef.current.add(key);
                const existing = next[alert.staffId] || [
                    { sender: STAFF_MEMBERS.find(s => s.id === alert.staffId)?.name ?? alert.sender, text: 'Welcome to the backroom, Boss. How can I help you today?' }
                ];
                next[alert.staffId] = [...existing, { sender: alert.sender, text: alert.text }];
            }
            return next;
        });
    }, [agentAlerts]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isTyping]);

    // Cross-staff reactive messages — inject once when context flags change
    const crossStaffInjectedRef = useRef<Set<string>>(new Set());
    useEffect(() => {
        const { flaggedProspect, flaggedInjury, closedDeal, activeFormation } = agentCtx;
        setChatHistories(prev => {
            const next = { ...prev };
            const inject = (staffId: string, sender: string, text: string, key: string) => {
                if (crossStaffInjectedRef.current.has(key)) return;
                crossStaffInjectedRef.current.add(key);
                const existing = next[staffId] || [
                    { sender: STAFF_MEMBERS.find(s => s.id === staffId)?.name ?? sender, text: 'Welcome to the backroom, Boss. How can I help you today?' }
                ];
                next[staffId] = [...existing, { sender, text }];
            };
            if (flaggedProspect) {
                const key = `prospect:${flaggedProspect.name}:${flaggedProspect.flaggedAt}`;
                inject('agent-1', 'The Agent',
                    `📋 Boss, The Scout just flagged ${flaggedProspect.name} (${flaggedProspect.position}, age ${flaggedProspect.age}) for a trial. If the report comes back positive, we should have contract terms ready. Based on their potential (${flaggedProspect.potential}), I'd estimate an opening offer around ${(flaggedProspect.trialCost * 3).toLocaleString()} credits/wk. Want me to draft a pre-contract framework now?`,
                    key);
            }
            if (flaggedInjury) {
                const key = `injury:${flaggedInjury.playerName}:${flaggedInjury.flaggedAt}`;
                inject('coach-1', 'Coach Kite',
                    `⚠️ The Physio has flagged ${flaggedInjury.playerName} as ${flaggedInjury.riskLevel} risk (${flaggedInjury.recoveryDays} days recovery). I've adjusted the training plan to cover their position. We may need to shift formation — want me to run the numbers on a contingency setup?`,
                    key);
            }
            if (closedDeal) {
                const key = `deal:${closedDeal.brand}:${closedDeal.flaggedAt}`;
                inject('agent-1', 'The Agent',
                    `💰 Commercial Lead just opened negotiations with ${closedDeal.brand} (${closedDeal.value.toLocaleString()} credits, ${closedDeal.duration}). That would boost our transfer budget significantly. I can start identifying targets in that range — shall I put together a shortlist?`,
                    key);
            }
            if (activeFormation) {
                const key = `formation:${activeFormation.formation}:${activeFormation.flaggedAt}`;
                inject('physio-1', 'The Physio',
                    `🏃 Coach Kite has switched to ${activeFormation.formation} (${activeFormation.winRate}% win rate). I'll adjust the conditioning programme to match the physical demands of that shape. High-press formations increase injury risk — I'll keep a close eye on the squad load.`,
                    key);
            }
            return next;
        });
    }, [agentCtx]);

    const handleSendMessage = (text: string) => {
        setChatHistory(prev => [...prev, { sender: 'You', text }]);
        setIsTyping(true);

        // Functional Response Logic
        setTimeout(() => {
            let response: string | null = null;

            if (text === "Transfer Budget Inquiry") {
                const balance = treasury?.balance || 0;
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Agent',
                        text: `Let me check the books, Boss.\n\n💰 Current Transfer Budget: ${balance.toLocaleString()} credits\n📊 Budget Health: ${balance >= 5000 ? '🟢 Strong — room to move in the market.' : balance >= 2000 ? '🟡 Moderate — be selective.' : '🔴 Tight — prioritise contract renewals over new signings.'}\n\n${balance >= 5000 ? 'We\'re in a good position to make a move if the right player comes up.' : 'I\'d recommend holding off on any big signings until we secure a sponsorship deal or match prize.'}\n\nWant me to identify the best value targets within our current budget?`,
                        actions: [
                            { label: '✅ Show Value Targets', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Agent', text: `Based on our budget, I'm flagging three targets: a Silver-tier midfielder at 1,800 credits, a Bronze striker at 900 credits, and a free agent goalkeeper. I'll have full dossiers ready within the hour.` }]) },
                            { label: '❌ Not Right Now', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Agent', text: `Understood. The budget is there when you need it. Come back to me when you're ready to move.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Balance Sheet Review") {
                const txCount = treasury?.transactions?.length || 0;
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Agent',
                        text: `Here's the full financial picture, Boss.\n\n📋 Recent Transactions: ${txCount}\n💸 Biggest Outgoing: Squad wages (weekly drain)\n💰 Biggest Incoming: Last match prize money\n📈 Net Position: ${txCount > 5 ? 'Active — lots of movement this cycle.' : 'Quiet — relatively stable.'}\n\n${txCount > 10 ? '⚠️ High transaction volume. Worth reviewing for any anomalies.' : '✅ Books look clean. No red flags.'}\n\nShall I flag any transactions that look out of the ordinary?`,
                        actions: [
                            { label: '✅ Flag Anomalies', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Agent', text: `I've run the audit. No major anomalies detected. One duplicate entry on a training fee — I'll get that corrected. Everything else checks out.` }]) },
                            { label: '❌ Looks Fine', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Agent', text: `Noted. I'll keep the books tidy and flag anything unusual as it comes in.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text.includes("Renegotiate") && text.includes("Contract")) {
                const playerName = text.replace("Renegotiate ", "").replace("'s Contract", "");
                setNegotiatingPlayer(playerName);
                // Find live member data — fall back to sensible defaults if not yet loaded
                const liveMember = members?.find(m => m.name.split(' ')[0] === playerName);
                const liveLevel = liveMember?.stats?.level ?? 5;
                const liveMatches = liveMember?.stats?.matches ?? 0;
                // Derive contract fields from live data where possible
                const wage = Math.max(200, liveLevel * 80 + liveMatches * 2);
                const weeksRemaining = liveMember ? Math.max(2, 48 - liveMatches) : 12;
                const totalWeeks = 48;
                const reputationTier = reputationTierLabel(liveLevel * 50);
                const marketValuation = calcMarketValuation(liveLevel, liveLevel * 50);
                const position = liveMember?.role === 'captain' ? 'CAP' : 'Player';
                setNegotiatingWage(wage);
                const urgency = weeksRemaining <= 6 ? '🔴 URGENT' : weeksRemaining <= 12 ? '🟡 SOON' : '🟢 STABLE';
                const recommendation = weeksRemaining <= 6
                    ? `I strongly recommend we act now — we risk losing them on a free if we wait.`
                    : weeksRemaining <= 12
                    ? `We have a window, but rival clubs are circling. Better to move soon.`
                    : `No immediate pressure, but locking them in now avoids future inflation.`;
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Agent',
                        text: `Right, let me pull up ${playerName}'s file.\n\n📋 Current Wage: ${wage.toLocaleString()} credits/wk\n⏳ Contract Status: ${urgency} — ${weeksRemaining} weeks remaining of ${totalWeeks}\n📊 Role: ${position}\n🏅 Reputation Tier: ${reputationTier}\n💰 Market Valuation: ${marketValuation.toLocaleString()} credits\n🎯 Matches Played: ${liveMatches}\n\n${recommendation}\n\nShall I open the negotiation table, Boss?`,
                        actions: [
                            { label: '✅ Open Negotiations', onClick: () => setIsNegotiationOpen(true) },
                            { label: '❌ Leave it for now', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Agent', text: `Understood, Boss. I'll keep monitoring the situation. Come back to me when you're ready.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Squad Morale Check") {
                const moraleStatus = averageLevel >= 7 ? '🟢 HIGH' : averageLevel >= 4 ? '🟡 STEADY' : '🔴 LOW';
                const memberSummary = hasLiveMembers
                    ? members.slice(0, 4).map(m => `• ${m.name} — Lvl ${m.stats?.level ?? 1} (${m.stats?.matches ?? 0} matches)`).join('\n')
                    : '• No live squad data available yet';
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Coach Kite',
                        text: hasLiveMembers
                            ? `Right, let me pull the morale data.\n\n🧠 Squad Avg Level: ${averageLevel}\n📊 Morale Status: ${moraleStatus}\n\n${memberSummary}\n\n💬 Dressing Room Vibe: ${averageLevel >= 7 ? 'The group looks confident and ready for a sharper tactical push.' : averageLevel >= 4 ? 'Steady. They can improve quickly if we keep the next session focused.' : 'Fragile. The next session needs to rebuild confidence before the next fixture.'}\n\n${highLoadMembers.length > 0 ? `⚠️ Rotation watch: ${highLoadMembers.slice(0, 2).map(member => member.name).join(', ')} are carrying the heaviest load.` : 'No immediate rotation pressure showing in the live squad data.'}\n\nWant me to schedule a morale-boosting training session, Boss?`
                            : `I can't score morale properly until the live squad record is loaded. Once members, matches, and levels are available, I'll give you a proper dressing-room read.`,
                        actions: [
                            { label: '✅ Schedule Session', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Done. I've blocked out Thursday morning for a light tactical session with a team bonding element. The lads will appreciate it.` }]) },
                            { label: '❌ Leave it for now', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Understood. I'll keep monitoring. Come back to me if the numbers dip further.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Tactical Briefing") {
                const recommendedFormation = members.length >= 7 ? '4-3-3' : '4-4-2';
                const formation = activeFormation || recommendedFormation;
                const tacticalRisk = highLoadMembers.length >= 2 ? 'High-press shapes will stretch your current high-load players.' : 'The current load profile can support a more aggressive press.';
                const tacticalRead = rotationGap > 0
                    ? `We're still ${rotationGap} player${rotationGap > 1 ? 's' : ''} short of full rotation depth, so stability matters more than complexity right now.`
                    : 'Depth is good enough to support a more assertive structure next match.';
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Coach Kite',
                        text: `Here's the current tactical picture, Boss.\n\n🗂️ Active Shape: ${formation}\n👥 Available Core: ${members.length} live squad members\n⚠️ Load Note: ${tacticalRisk}\n\n💡 My Read: ${activeFormation ? `You've already saved ${formation}, so the job now is tuning roles and rotation.` : `No saved formation is on record, so I'd start with ${formation} as the first stable base.`}\n\n${tacticalRead}\n\nShall I apply ${formation} as the working setup for the next fixture?`,
                        actions: [
                            { label: '✅ Apply Formation', onClick: () => { agentDispatch({ type: 'SET_FORMATION', payload: { formation, winRate: 64 } }); setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Formation locked in. I've set ${formation} as the working shape and adjusted the prep notes for the next session.` }]); } },
                            { label: '❌ Keep Current Setup', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Noted. We'll keep the current setup and revisit once more live match data lands.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Training Optimization") {
                const highLoadNames = highLoadMembers.length > 0 ? highLoadMembers.slice(0, 2).map(member => member.name).join(', ') : 'none flagged';
                const freshNames = freshMembers.length > 0 ? freshMembers.map(member => member.name).join(', ') : 'no clear freshness edge yet';
                const developmentNames = developmentMembers.length > 0 ? developmentMembers.map(member => member.name).join(', ') : 'no developing group identified yet';
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Coach Kite',
                        text: hasLiveMembers
                            ? `I've run the load analysis across the squad.\n\n🏋️ High Load Players: ${highLoadNames}\n🟢 Fresh & Ready: ${freshNames}\n📉 Development Focus: ${developmentNames}\n\nRecommendation: ${highLoadMembers.length > 0 ? 'Reduce intensity for the highest-load group and shift the next high-intensity block to the fresher players.' : 'The load profile is stable. Use the next session to sharpen combinations and build confidence.'}\n\nShall I restructure this week's training plan accordingly?`
                            : `I need live member and training data before I can optimise the weekly load properly. Once the squad record is available, I'll split the group into high-load, fresh, and development cohorts.`,
                        actions: [
                            { label: '✅ Restructure Plan', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: hasLiveMembers ? `Training plan updated. ${highLoadMembers.length > 0 ? `${highLoadMembers.slice(0, 2).map(member => member.name).join(' and ')} are on managed load` : 'The whole squad stays on normal load'}, while ${freshMembers.length > 0 ? freshMembers.map(member => member.name).join(' and ') : 'the freshest group'} carry the sharpness work.` : `Understood. I'll wait for the live squad record, then rebuild the weekly plan from actual load data.` }]) },
                            { label: '❌ Keep Current Plan', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Understood. I'll flag it again if fatigue levels worsen before the weekend.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Squad Coverage Review") {
                const coverageLine = missingPositions.length > 0
                    ? `Priority gaps: ${missingPositions.join(', ')}`
                    : 'Core positions are covered in the current squad record.';
                const contractLine = contractCandidates.length > 0
                    ? contractCandidates.map(member => `• ${member.name} — ${member.stats?.matches ?? 0} matches, Lvl ${member.stats?.level ?? 1}`).join('\n')
                    : '• No members loaded yet';
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Scout',
                        text: hasLiveMembers
                            ? `I've run the squad coverage review, Boss.\n\n👥 Live Squad Size: ${members.length}\n📉 Rotation Gap: ${rotationGap}\n🎯 ${coverageLine}\n\n${contractLine}\n\nRecommendation: ${missingPositions.length > 0 ? `Start by scouting ${missingPositions[0]} depth before you make luxury moves.` : 'Focus on upgrading quality, not just adding bodies.'}\n\nWant me to queue a scouting brief?`
                            : `I need the live squad record before I can map coverage properly. Once members and positions are loaded, I'll show you the real gaps and priorities.`,
                        actions: [
                            { label: '✅ Queue Scouting Brief', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: hasLiveMembers ? `Scouting brief queued. I'll prioritise ${missingPositions[0] || 'quality upgrades'} and bring back the cleanest options first.` : `Understood. I'll wait for live squad data, then generate the scouting brief from actual gaps.` }]) },
                            { label: '❌ Hold Position', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `Understood. I'll keep the watchlist warm and wait for a clearer need.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Scouting Priority Report") {
                const budgetTier = (treasury?.balance ?? 0) >= 5000 ? 'strong' : (treasury?.balance ?? 0) >= 2000 ? 'selective' : 'tight';
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Scout',
                        text: `Here's the scouting priority report, Boss.\n\n💰 Budget posture: ${budgetTier}\n👥 Rotation gap: ${rotationGap}\n🎯 Position priority: ${missingPositions.length > 0 ? missingPositions.join(', ') : 'best-player-available'}\n\n${budgetTier === 'tight' ? 'Recommendation: lean on draft signals and low-cost opportunities first.' : budgetTier === 'selective' ? 'Recommendation: one targeted move beats three speculative ones.' : 'Recommendation: you have room to move, so target the position that most improves your first XI.'}\n\nWant me to open the prospect board with that priority order?`,
                        actions: [
                            { label: '✅ Open Prospect Board', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `Prospect board prioritised. First lane is ${missingPositions[0] || 'quality upgrades'}, then depth coverage, then opportunistic value.` }]) },
                            { label: '❌ Wait for More Data', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `Fair enough. I'll hold until another result or squad change gives us a sharper signal.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Opponent Prep Checklist") {
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Scout',
                        text: `I don't have a live opponent dossier loaded yet, Boss, so here's the prep checklist built from our own squad state.\n\n1. Confirm the next opponent in Match Center.\n2. Lock the working shape: ${activeFormation || 'no saved formation yet'}.\n3. Review high-load players: ${highLoadMembers.length > 0 ? highLoadMembers.slice(0, 2).map(member => member.name).join(', ') : 'none flagged'}.\n4. Bring one evidence plan into the fixture: scoreline, GPS, and captain confirmation.\n\nOnce the opponent is locked and the match record exists, I can give you a proper opposition brief.`,
                        actions: [
                            { label: '✅ Prepare Checklist', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `Checklist prepared. Once you lock the opponent in Match Center, I'll tighten this into a real briefing.` }]) },
                            { label: '❌ Not Needed', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `No problem. We'll wait until the fixture is properly on the board.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Fitness Status Report") {
                const fitnessLines = members?.length
                    ? members.map(m => {
                        const lvl = m.stats?.level ?? 1;
                        const matches = m.stats?.matches ?? 0;
                        const risk = matches > 30 ? '🔴 High' : matches > 15 ? '🟡 Medium' : '🟢 Low';
                        const recovery = matches > 30 ? ' (rest recommended)' : '';
                        return `${risk} ${m.name} — Lvl ${lvl}${recovery}`;
                    })
                    : ['No live fitness data loaded yet'];
                const atRisk = members?.length
                    ? members.filter(m => (m.stats?.matches ?? 0) > 15).length
                    : 0;
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Physio',
                        text: hasLiveMembers
                            ? `I've run the full biometric sweep, Boss. Here's the picture.\n\n${fitnessLines.join('\n')}\n\n${atRisk > 0 ? `⚠️ ${atRisk} player(s) need attention before the next fixture.` : '✅ Squad is in excellent shape.'}\n\nShall I update the match selection availability list accordingly?`
                            : `I can't produce a real fitness report until the live squad record is loaded. Once match load and members are in, I'll flag who's fit, who's being monitored, and who needs rotation.`,
                        actions: [
                            { label: '✅ Update Availability', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: hasLiveMembers ? `Availability list updated. ${highLoadMembers.length > 0 ? `${highLoadMembers.slice(0, 2).map(member => member.name).join(' and ')} are marked for load monitoring.` : 'Everyone is cleared from the current live record.'}` : `Understood. I'll update availability once the live squad data lands.` }]) },
                            { label: '❌ I\'ll Handle It', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Understood. The data is here whenever you need it. I'll flag anything urgent immediately.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Recovery Logistics") {
                const averageMatches = hasLiveMembers
                    ? Math.round(members.reduce((total, member) => total + (member.stats?.matches ?? 0), 0) / members.length)
                    : 0;
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Physio',
                        text: hasLiveMembers
                            ? `Post-match recovery analysis is in, Boss.\n\n📊 Average match load: ${averageMatches}\n⚠️ Managed recovery needed: ${highLoadMembers.length > 0 ? highLoadMembers.slice(0, 2).map(member => member.name).join(', ') : 'no one flagged'}\n🟢 Lowest load group: ${freshMembers.length > 0 ? freshMembers.map(member => member.name).join(', ') : 'none separated yet'}\n\nOverall the squad is ${highLoadMembers.length > 0 ? 'recovering, but we need to manage the top-load group carefully.' : 'recovering cleanly from the current schedule.'}\n\nShall I adjust the recovery schedule?`
                            : `I can't map recovery properly without the live squad and match-load data. Once that's loaded, I'll identify who needs managed recovery and who can push on.`,
                        actions: [
                            { label: '✅ Adjust Schedule', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: hasLiveMembers ? `Done. ${highLoadMembers.length > 0 ? `${highLoadMembers.slice(0, 2).map(member => member.name).join(' and ')} are on reduced load for the next block.` : 'The recovery schedule is now balanced against the current squad data.'}` : `Understood. I'll wait for live data, then rebuild the recovery schedule.` }]) },
                            { label: '❌ Keep Current Schedule', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Noted. I'll monitor closely and escalate if the live risk profile worsens.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Injury Prevention") {
                const highestRiskMember = highLoadMembers[0] || membersByMatchLoad[0];
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Physio',
                        text: hasLiveMembers
                            ? `I've run the predictive injury model across the squad.\n\n🔴 Highest Risk: ${highestRiskMember ? `${highestRiskMember.name} — ${highestRiskMember.stats?.matches ?? 0} matches logged` : 'No single player flagged'}\n🟡 Watch List: ${highLoadMembers.length > 1 ? highLoadMembers.slice(1, 3).map(member => member.name).join(', ') : 'No wider watch list from live data'}\n🟢 Low Risk: ${members.length - Math.min(highLoadMembers.length, members.length)} player(s)\n\nIf we act now, we can keep soft-tissue risk from compounding into the next fixture.\n\nShall I start a prevention protocol?`
                            : `I need live load data before I can run a real injury-prevention model. Once the squad record is synced, I'll identify the highest-risk players properly.`,
                        actions: [
                            { label: '✅ Start Protocol', onClick: () => { if (highestRiskMember) { agentDispatch({ type: 'SET_INJURY', payload: { playerName: highestRiskMember.name, riskLevel: 'High', recoveryDays: 7 } }); } setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: hasLiveMembers && highestRiskMember ? `Prevention protocol activated for ${highestRiskMember.name}. They're on reduced load, targeted physio, and daily monitoring until the risk score drops.` : `Understood. I'll hold the protocol plan until the live data is available.` }]); } },
                            { label: '❌ Not Yet', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Understood. I'll keep the flags live and escalate if the risk score increases. Don't leave it too long, Boss.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Commercial Readiness") {
                const budgetBalance = treasury?.balance ?? 0;
                const revenueFocus = budgetBalance < 1500
                    ? 'Revenue is urgent. The squad needs new inflow before the next aggressive move.'
                    : budgetBalance < 4000
                        ? 'Revenue is useful. One sponsor or community push would materially improve flexibility.'
                        : 'Revenue is healthy enough that you can be selective and protect brand quality.';
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Commercial Lead',
                        text: `Here's the commercial readiness read, Boss.\n\n💰 Treasury balance: ${budgetBalance.toLocaleString()} credits\n👥 Active squad: ${members.length} members\n🔐 Payment rail: ${yellowSession.status === 'authenticated' ? 'ready for live settlement' : 'not fully authenticated yet'}\n\n${revenueFocus}\n\nWant me to draft a sponsor brief around the current squad story?`,
                        actions: [
                            { label: '✅ Draft Sponsor Brief', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Sponsor brief drafted. I centred it on squad growth, verified results, and the next visible milestone.` }]) },
                            { label: '❌ Not Yet', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Understood. I'll wait until the squad story or treasury position changes.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Growth Priorities") {
                const priority = rotationGap > 0
                    ? `close the ${rotationGap}-player rotation gap`
                    : (treasury?.balance ?? 0) < 3000
                        ? 'strengthen treasury and commercial headroom'
                        : 'turn verified results into public momentum';
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Commercial Lead',
                        text: `I've ranked the next growth priorities, Boss.\n\n1. ${priority}\n2. Keep verification flowing so progress is visible.\n3. Package the next milestone into a squad update once it lands.\n\nThat sequence gives us the clearest path from early traction into retention and referral.\n\nWant me to lock those priorities in?`,
                        actions: [
                            { label: '✅ Lock Priorities', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Priorities locked. I'll align the next commercial and community prompts around ${priority}.` }]) },
                            { label: '❌ Leave Flexible', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Understood. We'll stay opportunistic and reassess after the next squad action.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else if (text === "Community Update Plan") {
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Commercial Lead',
                        text: `Here's the community update plan, Boss.\n\n🎯 Lead with: ${members.length > 0 ? `${members.length}-member squad progress` : 'the next verified match result'}\n📣 Follow with: ${missingPositions.length > 0 ? `the search for ${missingPositions.join(', ')} depth` : 'the next tactical or treasury milestone'}\n🔁 CTA: invite rivals or teammates to verify and join the loop\n\nThis keeps the story grounded in real progression instead of filler metrics.\n\nWant me to queue the draft post?`,
                        actions: [
                            { label: '✅ Queue Draft Post', onClick: () => { agentDispatch({ type: 'QUEUE_ONCHAIN_ACTION', payload: { id: `lens-${Date.now()}`, type: 'lens_post', description: 'Publish the next squad progress update', postText: `Squad update: ${members.length > 0 ? `${members.length} active members and the next focus is ${missingPositions[0] || 'verified results'}.` : 'The next verified result will define the squad story.'} #SportWarren` } }); setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Draft queued. Review the post and sign it when you're ready to publish the next real milestone.` }]); } },
                            { label: '❌ Hold the Update', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Understood. We'll wait until the next milestone gives us a stronger story to publish.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null;
            } else {
                // Free-text: call LLM with squad context
                const avgLevel = members?.length
                    ? Math.round(members.reduce((acc, m) => acc + (m.stats?.level || 0), 0) / members.length)
                    : undefined;
                agentChat.mutate(
                    {
                        staffId: selectedStaff?.id || 'agent-1',
                        message: text,
                        recentDecisions,
                        squadContext: {
                            balance: treasury?.balance,
                            memberCount: members?.length,
                            avgLevel,
                            formation: tactics?.formation ?? undefined,
                            members: members?.slice(0, 8).map(m => ({
                                name: m.name,
                                level: m.stats?.level,
                                matches: m.stats?.matches,
                                role: m.role,
                            })),
                        },
                    },
                    {
                        onSuccess: (data) => {
                            setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Staff', text: data.reply }]);
                            setIsTyping(false);
                        },
                        onError: () => {
                            setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Staff', text: `Sorry Boss, I'm having trouble connecting right now. Try again in a moment.` }]);
                            setIsTyping(false);
                        },
                    }
                );
                response = null;
            }

            if (response !== null) {
                setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Staff', text: response }]);
                setIsTyping(false);
            }
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
        >
            <Card className="w-full max-w-6xl h-[90vh] md:h-[85vh] bg-gray-900 border-gray-800 overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Sidebar: Staff Selection */}
                <div className="w-full md:w-72 bg-black/40 border-r border-white/5 flex flex-col shrink-0 max-h-48 md:max-h-full overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center space-x-2 text-blue-400 mb-1">
                            <Coffee className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">The Staff Room</span>
                        </div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Office</h2>
                    </div>
                    <div className="flex md:flex-col flex-row overflow-x-auto md:overflow-y-auto p-4 gap-2 md:space-y-2">
                        {STAFF_MEMBERS.map(member => (
                            <button
                                key={member.id}
                                onClick={() => setSelectedStaff(member)}
                                className={`shrink-0 md:w-full p-3 md:p-4 rounded-xl flex items-center space-x-3 md:space-x-4 transition-all ${selectedStaff?.id === member.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-gray-200 hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-2xl">{member.avatar}</div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="text-sm font-black uppercase truncate">{member.name}</div>
                                    <div className={`text-xs uppercase font-bold ${selectedStaff?.id === member.id ? 'text-blue-100' : 'text-gray-300'}`}>
                                        {member.role}
                                    </div>
                                </div>
                                {member.mood === 'busy' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 bg-black/20 text-xs text-gray-400 font-mono flex items-center justify-between">
                        <span>SECURITY LEVEL: 4 (MANAGER)</span>
                        <ShieldCheck className="w-3 h-3" />
                    </div>
                </div>

                {/* Center: Conversation Space */}
                <div className="flex-1 flex flex-col relative bg-gradient-to-br from-gray-900 to-black">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-3xl">{selectedStaff?.avatar}</div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase italic">{selectedStaff?.name}</h3>
                                <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">{selectedStaff?.role}</p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-xs font-bold text-gray-300">NEGOTIATION POWER</div>
                                <div className="w-24 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-blue-500 w-3/4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                        {dataLoading && (
                            <div className="flex items-center justify-center py-4">
                                <div className="flex items-center space-x-2 section-title text-gray-500">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    <span>Loading squad data...</span>
                                </div>
                            </div>
                        )}
                        {dataError && (
                            <div className="mx-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                ⚠️ Could not load part of the live squad record. Only confirmed data and planning guidance are available right now.
                            </div>
                        )}
                        {chatHistory.map((chat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${chat.sender === 'You' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${chat.sender === 'You'
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10'
                                    : 'bg-white/5 text-gray-200 border border-white/10'
                                    }`}>
                                    {chat.text}
                                </div>
                                {chat.actions && chat.actions.length > 0 && (
                                    <div className="flex gap-2 mt-2 flex-wrap">
                                        {chat.actions.map((action, ai) => {
                                            const actionKey = `${i}-${ai}`;
                                            const consumed = usedActions.has(actionKey);
                                            return (
                                                <button
                                                    key={ai}
                                                    onClick={() => {
                                        if (consumed) return;
                                        setUsedActions(prev => new Set(prev).add(actionKey));
                                        const isConfirm = action.label.startsWith('✅');
                                        const isDecline = action.label.startsWith('❌');
                                        if ((isConfirm || isDecline) && selectedStaff) {
                                            logDecision.mutate({
                                                staffId: selectedStaff.id,
                                                action: action.label.replace(/^[✅❌]\s*/, ''),
                                                decision: isConfirm ? 'confirmed' : 'declined',
                                                context: chatHistory[i]?.text?.slice(0, 80),
                                                timestamp: new Date().toISOString(),
                                            });
                                        }
                                        action.onClick();
                                                    }}
                                                    disabled={consumed}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        consumed
                                                            ? 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                                                            : 'bg-white/10 border-white/10 text-gray-200 hover:bg-white/20 hover:text-white'
                                                    }`}
                                                >
                                                    {action.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        <div ref={chatEndRef} />
                        {agentCtx.pendingOnChainAction && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-start"
                            >
                                <div className="max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed border border-yellow-500/30 bg-yellow-500/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="section-title text-yellow-400">⛓️ On-chain Action Pending</span>
                                    </div>
                                    <p className="text-gray-200 text-xs mb-1">{agentCtx.pendingOnChainAction.description}</p>
                                    {agentCtx.pendingOnChainAction.amount && (
                                        <p className="text-yellow-300 text-[10px] font-bold">
                                            💰 {agentCtx.pendingOnChainAction.amount.toLocaleString()} {agentCtx.pendingOnChainAction.assetSymbol || 'USDC'}
                                        </p>
                                    )}
                                    {agentCtx.pendingOnChainAction.postText && (
                                        <p className="text-gray-400 text-[10px] italic mt-1">&ldquo;{agentCtx.pendingOnChainAction.postText}&rdquo;</p>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={async () => {
                                                const action = agentCtx.pendingOnChainAction!;
                                                if (action.type === 'yellow_payment') {
                                                    // Initiate Yellow state channel session
                                                    if (yellowSession.status === 'authenticated') {
                                                        setChatHistory(prev => [...prev, { sender: '⛓️ Yellow Network', text: `✅ Payment of ${action.amount?.toLocaleString()} ${action.assetSymbol || 'USDC'} authorised via Yellow state channel. Transaction queued.` }]);
                                                    } else {
                                                        setChatHistory(prev => [...prev, { sender: '⛓️ Yellow Network', text: `⚠️ Yellow session not active (status: ${yellowSession.status}). Connect an eligible EVM wallet to authorise payments through Yellow Network.` }]);
                                                    }
                                                } else if (action.type === 'lens_post') {
                                                    try {
                                                        const result = await lensPost.mutateAsync({
                                                            text: action.postText || action.description,
                                                            tags: ['SportWarren', 'Phygital'],
                                                        });
                                                        setChatHistory(prev => [...prev, {
                                                            sender: '📡 Lens Protocol',
                                                            text: result.success
                                                                ? '✅ Lens post submitted.'
                                                                : `⚠️ ${result.message}`,
                                                        }]);
                                                    } catch (error) {
                                                        setChatHistory(prev => [...prev, {
                                                            sender: '📡 Lens Protocol',
                                                            text: '⚠️ Lens publishing is unavailable right now.',
                                                        }]);
                                                    }
                                                }
                                                agentDispatch({ type: 'CLEAR_ONCHAIN_ACTION' });
                                            }}
                                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 transition-all"
                                        >
                                            ✅ Sign &amp; Execute
                                        </button>
                                        <button
                                            onClick={() => agentDispatch({ type: 'CLEAR_ONCHAIN_ACTION' })}
                                            className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border bg-white/5 border-white/10 text-gray-400 hover:text-gray-200 transition-all"
                                        >
                                            ❌ Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 p-4 rounded-2xl flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions & Input */}
                    <div className="p-6 border-t border-white/5 bg-black/20">
                        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1">
                            {getQuickActions(selectedStaff?.id || '', {
                                contractCandidates: contractCandidates.map(member => member.name.split(' ')[0]),
                            }).map((action, i) => (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendMessage(action)}
                                    className="bg-white/5 border-white/10 text-gray-200 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
                                >
                                    {action}
                                </Button>
                            ))}
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const trimmed = inputText.trim();
                                if (!trimmed || isTyping) return;
                                setInputText('');
                                handleSendMessage(trimmed);
                            }}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Ask your staff anything..."
                                disabled={isTyping}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isTyping}
                                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Sidebar: Proactive AI Alerts */}
                <div className="hidden lg:block w-80 bg-black/40 border-l border-white/5 p-6 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="section-title text-gray-300">Staff Intel</h4>
                        <div className="flex items-center space-x-1">
                            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[8px] font-bold text-green-500 uppercase">Live Analysis</span>
                        </div>
                    </div>
                    
                    <StaffAdvisor squadId={squadId || ''} />

                    <div className="mt-8 bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                        <h5 className="section-title text-white mb-1">Economic Outlook</h5>
                        <p className="text-[9px] text-blue-100 leading-tight">
                            {hasLiveTreasury
                                ? rotationGap > 0
                                    ? `Depth is still ${rotationGap} player${rotationGap > 1 ? 's' : ''} short of a full rotation squad. Protect the treasury for priority positions first.`
                                    : (treasury?.balance ?? 0) < 3000
                                        ? 'Treasury is tight. One verified result or sponsor move would materially improve squad flexibility.'
                                        : 'Treasury is healthy enough to be selective. Use the next move on quality, not just volume.'
                                : 'Live finance signals appear here once treasury data is available.'}
                        </p>
                    </div>
                </div>
            </Card>

            <ContractNegotiationModal
                playerName={negotiatingPlayer}
                currentWage={negotiatingWage}
                isOpen={isNegotiationOpen}
                onClose={() => setIsNegotiationOpen(false)}
                onFinalize={(newWage) => {
                    setIsNegotiationOpen(false);
                    setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Staff', text: `Excellent. ${negotiatingPlayer} is signed for ${newWage} credits per week. The paperwork is finalized.` }]);
                }}
            />
        </motion.div>
    );
};


function getQuickActions(staffId: string, options: { contractCandidates: string[] }): string[] {
    const contractActions = options.contractCandidates.map((name) => `Renegotiate ${name}'s Contract`);
    switch (staffId) {
        case 'agent-1': return [...contractActions, "Balance Sheet Review", "Transfer Budget Inquiry"];
        case 'scout-1': return ["Squad Coverage Review", "Scouting Priority Report", "Opponent Prep Checklist"];
        case 'coach-1': return ["Tactical Briefing", "Squad Morale Check", "Training Optimization"];
        case 'physio-1': return ["Fitness Status Report", "Recovery Logistics", "Injury Prevention"];
        case 'comms-1': return ["Commercial Readiness", "Growth Priorities", "Community Update Plan"];
        default: return ["Status Report", "Next Match Preparation"];
    }
}
