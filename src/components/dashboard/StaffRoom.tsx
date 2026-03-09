"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Users,
    MessageSquare,
    X,
    Coffee,
    Briefcase,
    TrendingUp,
    FileText,
    ChevronRight,
    Search,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { trpc } from '@/lib/trpc-client';
import { useSquadDetails } from '@/hooks/squad/useSquad';
import { ContractNegotiationModal } from './ContractNegotiationModal';

// Simulated contract data per squad player
const PLAYER_CONTRACTS: Record<string, { wage: number; weeksRemaining: number; totalWeeks: number; reputationTier: string; marketValuation: number; position: string }> = {
    'Marcus': { wage: 500, weeksRemaining: 6, totalWeeks: 48, reputationTier: 'Gold', marketValuation: 7200, position: 'ST' },
    'Jamie': { wage: 350, weeksRemaining: 18, totalWeeks: 48, reputationTier: 'Silver', marketValuation: 3800, position: 'MF' },
    'Sarah': { wage: 300, weeksRemaining: 3, totalWeeks: 48, reputationTier: 'Bronze', marketValuation: 1900, position: 'DF' },
    'Alex': { wage: 420, weeksRemaining: 24, totalWeeks: 48, reputationTier: 'Silver', marketValuation: 4500, position: 'GK' },
    'Noah': { wage: 280, weeksRemaining: 10, totalWeeks: 48, reputationTier: 'Bronze', marketValuation: 1500, position: 'ST' },
};

// Scouting prospects data
const SCOUTING_PROSPECTS: Record<string, { age: number; position: string; pace: number; technical: number; potential: string; location: string; trialCost: number }> = {
    'Hackney Academy Report': { age: 17, position: 'MF', pace: 91, technical: 78, potential: '⭐⭐⭐⭐', location: 'Hackney Marshes Pitch 4', trialCost: 200 },
    'Search for Midfielders': { age: 19, position: 'MF', pace: 84, technical: 85, potential: '⭐⭐⭐', location: 'Stratford Community League', trialCost: 150 },
};

// Tactical formations data
const TACTICAL_SETUPS: Record<string, { formation: string; winRate: number; weaknesses: string; recommendation: string }> = {
    '4-4-2': { formation: '4-4-2', winRate: 62, weaknesses: 'Vulnerable to high press in midfield', recommendation: 'Solid base. Consider shifting to 4-3-3 for more attacking output.' },
    '4-3-3': { formation: '4-3-3', winRate: 71, weaknesses: 'Exposed on counter-attacks', recommendation: 'High risk, high reward. Best used against defensive sides.' },
    '3-5-2': { formation: '3-5-2', winRate: 58, weaknesses: 'Wide areas can be exploited', recommendation: 'Good for possession-heavy games. Needs disciplined wing-backs.' },
};

// Fitness / injury data
const SQUAD_FITNESS: Record<string, { status: string; recoveryDays: number; riskLevel: string; recommendation: string }> = {
    'Marcus': { status: '🟢 Fit', recoveryDays: 0, riskLevel: 'Low', recommendation: 'Cleared for full training and match selection.' },
    'Jamie': { status: '🟡 Monitoring', recoveryDays: 3, riskLevel: 'Medium', recommendation: 'Light training only. Reassess before Tuesday.' },
    'Sarah': { status: '🔴 Injured', recoveryDays: 10, riskLevel: 'High', recommendation: 'Rest and physio sessions. Do not select for next two fixtures.' },
};

// Sponsorship deals data
const SPONSORSHIP_DEALS: Record<string, { brand: string; value: number; duration: string; requirement: string; lensBoost: number }> = {
    'Sponsorship Opportunity': { brand: 'Hackney Brew Co.', value: 5000, duration: '8 weeks', requirement: 'Min. 500 Lens followers', lensBoost: 15 },
    'Brand Reputation': { brand: 'Phygital Sports Kit', value: 3200, duration: '12 weeks', requirement: 'Top 10 Hackney ranking', lensBoost: 10 },
};

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
        biography: 'Specializes in reputation-based valuations. Always looking for the next Hackney superstar.'
    },
    {
        id: 'scout-1',
        name: 'The Scout',
        role: 'Talent Identification',
        avatar: '🔭',
        mood: 'busy',
        biography: 'Spends 18 hours a day at Hackney Marshes monitoring baseline agility and spatial awareness.'
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
        { enabled: !!squadId }
    );
    const { data: tactics, isLoading: tacticsLoading } = trpc.squad.getTactics.useQuery(
        { squadId: squadId || '' },
        { enabled: !!squadId }
    );
    const { members, loading: membersLoading } = useSquadDetails(squadId);

    const dataLoading = squadId && (treasuryLoading || tacticsLoading || membersLoading);
    const dataError = squadId && treasuryError;

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

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isTyping]);

    const handleSendMessage = (text: string) => {
        setChatHistory(prev => [...prev, { sender: 'You', text }]);
        setIsTyping(true);

        // Functional Response Logic
        setTimeout(() => {
            let response = "";

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
                response = null as unknown as string;
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
                response = null as unknown as string;
            } else if (text.includes("Renegotiate") && text.includes("Contract")) {
                const playerName = text.replace("Renegotiate ", "").replace("'s Contract", "");
                setNegotiatingPlayer(playerName);
                const contract = PLAYER_CONTRACTS[playerName];
                if (contract) {
                    setNegotiatingWage(contract.wage);
                    const urgency = contract.weeksRemaining <= 6 ? '🔴 URGENT' : contract.weeksRemaining <= 12 ? '🟡 SOON' : '🟢 STABLE';
                    const recommendation = contract.weeksRemaining <= 6
                        ? `I strongly recommend we act now — we risk losing him on a free if we wait.`
                        : contract.weeksRemaining <= 12
                        ? `We have a window, but rival clubs are circling. Better to move soon.`
                        : `No immediate pressure, but locking him in now avoids future inflation.`;
                    setTimeout(() => {
                        setChatHistory(prev => [...prev, {
                            sender: selectedStaff?.name || 'The Agent',
                            text: `Right, let me pull up ${playerName}'s file.\n\n📋 Current Wage: ${contract.wage.toLocaleString()} credits/wk\n⏳ Contract Status: ${urgency} — ${contract.weeksRemaining} weeks remaining of ${contract.totalWeeks}\n📊 Position: ${contract.position}\n🏅 Reputation Tier: ${contract.reputationTier}\n💰 Market Valuation: ${contract.marketValuation.toLocaleString()} credits\n\n${recommendation}\n\nShall I open the negotiation table, Boss?`,
                            actions: [
                                { label: '✅ Open Negotiations', onClick: () => setIsNegotiationOpen(true) },
                                { label: '❌ Leave it for now', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Agent', text: `Understood, Boss. I'll keep monitoring the situation. Come back to me when you're ready.` }]) }
                            ]
                        }]);
                        setIsTyping(false);
                    }, 1500);
                    response = null as unknown as string;
                } else {
                    response = `I'll pull up the contract details for ${playerName} now, Boss.`;
                    setTimeout(() => setIsNegotiationOpen(true), 1500);
                }
            } else if (text === "Squad Morale Check") {
                const avgLevel = members?.length ? Math.round(members.reduce((acc, m) => acc + (m.stats?.level || 0), 0) / members.length) : 5;
                const moraleStatus = avgLevel >= 7 ? '🟢 HIGH' : avgLevel >= 4 ? '🟡 STEADY' : '🔴 LOW';
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Coach Kite',
                        text: `Right, let me pull the morale data.\n\n🧠 Squad Avg Level: ${avgLevel}\n📊 Morale Status: ${moraleStatus}\n💬 Dressing Room Vibe: ${avgLevel >= 7 ? 'Buzzing — the last win has them fired up.' : avgLevel >= 4 ? 'Steady. No major issues but they need a spark.' : 'Fragile. A poor result could cause real problems.'}\n\n${avgLevel < 4 ? 'I recommend a light session and a team talk before the next fixture.' : 'No immediate action needed, but keep an eye on rotation fatigue.'}\n\nWant me to schedule a morale-boosting training session, Boss?`,
                        actions: [
                            { label: '✅ Schedule Session', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Done. I've blocked out Thursday morning for a light tactical session with a team bonding element. The lads will appreciate it.` }]) },
                            { label: '❌ Leave it for now', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Understood. I'll keep monitoring. Come back to me if the numbers dip further.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null as unknown as string;
            } else if (text === "Tactical Briefing") {
                const formation = tactics?.formation || '4-4-2';
                const setup = TACTICAL_SETUPS[formation] || TACTICAL_SETUPS['4-4-2'];
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Coach Kite',
                        text: `Here's the current tactical picture, Boss.\n\n🗂️ Formation: ${setup.formation}\n📈 Win Rate: ${setup.winRate}% vs Hackney-tier sides\n⚠️ Weakness: ${setup.weaknesses}\n\n💡 My Read: ${setup.recommendation}\n\nShall I apply the recommended formation change for the next fixture?`,
                        actions: [
                            { label: '✅ Apply Formation', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Formation locked in. I've updated the match engine parameters. The squad will be briefed at tomorrow's session.` }]) },
                            { label: '❌ Keep Current Setup', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Noted. We'll stick with ${setup.formation} for now. I'll revisit after the next match.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null as unknown as string;
            } else if (text === "Training Optimization") {
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Coach Kite',
                        text: `I've run the load analysis across the squad.\n\n🏋️ High Load Players: Marcus, Jamie (need rotation)\n🟢 Fresh & Ready: Alex, Noah\n📉 Underperforming in Training: Sarah (fatigue indicators)\n\nRecommendation: Reduce intensity for the top two and push the fresher players in the next session. This should peak performance for matchday.\n\nShall I restructure this week's training plan accordingly?`,
                        actions: [
                            { label: '✅ Restructure Plan', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Training plan updated. Marcus and Jamie are on light duties Wednesday. Alex and Noah will lead the high-intensity drills. Expect a 10–15% performance uplift by Saturday.` }]) },
                            { label: '❌ Keep Current Plan', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Coach Kite', text: `Understood. I'll flag it again if fatigue levels worsen before the weekend.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null as unknown as string;
            } else if (text === "Hackney Academy Report" || text === "Search for Midfielders") {
                const prospect = SCOUTING_PROSPECTS[text];
                if (prospect) {
                    setTimeout(() => {
                        setChatHistory(prev => [...prev, {
                            sender: selectedStaff?.name || 'The Scout',
                            text: `I've been watching this one closely, Boss. Here's the full dossier.\n\n👤 Age: ${prospect.age}\n📍 Location: ${prospect.location}\n🏃 Position: ${prospect.position}\n⚡ Pace: ${prospect.pace} | 🎯 Technical: ${prospect.technical}\n🌟 Potential: ${prospect.potential}\n💰 Trial Cost: ${prospect.trialCost.toLocaleString()} credits\n\n${prospect.potential.length >= 4 ? 'This one is special. I wouldn\'t wait — other clubs are sniffing around.' : 'Solid prospect. Worth a look before committing.'}\n\nShall I arrange a trial, Boss?`,
                            actions: [
                                { label: '✅ Arrange Trial', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `Trial booked. ${prospect.location}, this weekend. I'll have a full performance report on your desk by Monday. Cost: ${prospect.trialCost.toLocaleString()} credits deducted from scouting budget.` }]) },
                                { label: '❌ Pass on This One', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `Understood. I'll keep him on the watchlist and revisit in a few weeks if the situation changes.` }]) }
                            ]
                        }]);
                        setIsTyping(false);
                    }, 1500);
                    response = null as unknown as string;
                } else {
                    response = `I'm compiling the latest scouting data now, Boss. Give me a moment.`;
                }
            } else if (text === "Rival Team Analysis") {
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Scout',
                        text: `I've been tracking Northside FC all week. Here's what we're up against.\n\n🏟️ Opponent: Northside FC\n⚠️ Key Threat: Marcus Johnson (ST) — 88 pace, 84 finishing\n📊 Their Form: 🔥 4W 1D last 5\n🔍 Weakness: Slow to recover defensively after set pieces\n\nMy recommendation: Press high early, exploit their right-back who's been caught out of position. Target set pieces in the final third.\n\nShall I prepare a full opposition briefing document for the squad?`,
                        actions: [
                            { label: '✅ Prepare Briefing', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `Briefing document prepared. I've flagged Marcus Johnson as Priority 1 threat and outlined three set-piece routines to exploit their defensive shape. Coach Kite has been copied in.` }]) },
                            { label: '❌ Not Needed', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Scout', text: `No problem. The intel is here if you change your mind before matchday.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null as unknown as string;
            } else if (text === "Fitness Status Report") {
                const injuredPlayers = Object.entries(SQUAD_FITNESS).filter(([, v]) => v.riskLevel !== 'Low');
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Physio',
                        text: `I've run the full biometric sweep, Boss. Here's the picture.\n\n${Object.entries(SQUAD_FITNESS).map(([name, data]) => `${data.status} ${name} — ${data.riskLevel} risk${data.recoveryDays > 0 ? ` (${data.recoveryDays} days recovery)` : ''}`).join('\n')}\n\n${injuredPlayers.length > 0 ? `⚠️ ${injuredPlayers.length} player(s) need attention before the next fixture.` : '✅ Squad is in excellent shape.'}\n\nShall I update the match selection availability list accordingly?`,
                        actions: [
                            { label: '✅ Update Availability', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Availability list updated. Sarah is flagged as unavailable for the next two fixtures. Jamie is listed as a game-time decision. All others are cleared.` }]) },
                            { label: '❌ I\'ll Handle It', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Understood. The data is here whenever you need it. I'll flag anything urgent immediately.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null as unknown as string;
            } else if (text === "Recovery Logistics") {
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Physio',
                        text: `Post-match recovery analysis is in, Boss.\n\n💤 Sleep Quality (avg): 7.2 / 10\n🧊 Ice Bath Compliance: 80%\n🏃 Active Recovery Sessions Completed: 3 / 4\n⚡ Lactic Acid Levels: Elevated in midfield (Jamie flagged)\n\nOverall the squad is recovering well, but Jamie needs an extra 48 hours before full training. I'd recommend we push his return to Thursday.\n\nShall I adjust his training schedule?`,
                        actions: [
                            { label: '✅ Adjust Schedule', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Done. Jamie is on rest and light mobility work until Thursday. I'll clear him for full training if the biometrics look good by Wednesday evening.` }]) },
                            { label: '❌ Keep Him On Schedule', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Noted. I'll monitor closely and pull him if the numbers worsen. Your call, Boss.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null as unknown as string;
            } else if (text === "Injury Prevention") {
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'The Physio',
                        text: `I've run the predictive injury model across the squad.\n\n🔴 High Risk: Sarah — overloaded hamstring, recommend immediate load reduction\n🟡 Watch List: Marcus — minor knee inflammation, monitor daily\n🟢 Low Risk: Rest of squad\n\nIf we don't act on Sarah now, I'm projecting a 70% chance of a 3-week injury within the next two fixtures.\n\nShall I put her on a prevention protocol immediately?`,
                        actions: [
                            { label: '✅ Start Protocol', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Prevention protocol activated for Sarah. She's on reduced load, daily physio, and biometric monitoring. I'll reassess in 5 days. This should bring her risk level down to manageable.` }]) },
                            { label: '❌ Not Yet', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'The Physio', text: `Understood. I'll keep the flags live and escalate if the risk score increases. Don't leave it too long, Boss.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null as unknown as string;
            } else if (text === "Sponsorship Opportunity" || text === "Brand Reputation") {
                const deal = SPONSORSHIP_DEALS[text];
                if (deal) {
                    setTimeout(() => {
                        setChatHistory(prev => [...prev, {
                            sender: selectedStaff?.name || 'Commercial Lead',
                            text: `I've got a live deal on the table, Boss. Here are the details.\n\n🏷️ Brand: ${deal.brand}\n💰 Deal Value: ${deal.value.toLocaleString()} credits\n📅 Duration: ${deal.duration}\n✅ Requirement: ${deal.requirement}\n📣 Lens Boost: +${deal.lensBoost}% engagement on activation\n\nThis is a solid fit for our current Phygital positioning. I'd recommend we move quickly — they're talking to two other Hackney clubs.\n\nShall I open formal negotiations with ${deal.brand}?`,
                            actions: [
                                { label: '✅ Open Negotiations', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Excellent. I've sent the opening terms to ${deal.brand}. Expect a response within 48 hours. I'll keep you posted on every move.` }]) },
                                { label: '❌ Pass on This Deal', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Understood. I'll keep the pipeline warm and bring you something better when it comes in.` }]) }
                            ]
                        }]);
                        setIsTyping(false);
                    }, 1500);
                    response = null as unknown as string;
                } else {
                    response = `Let me pull the latest commercial opportunities together for you, Boss.`;
                }
            } else if (text === "Social Engagement Stats") {
                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: selectedStaff?.name || 'Commercial Lead',
                        text: `Here's the Lens engagement breakdown for this week, Boss.\n\n📊 Followers: 1,240 (+18% WoW)\n❤️ Avg Post Engagement: 8.4%\n🔥 Top Post: Match highlight vs Eastside — 340 reactions\n🌍 Reach: 4,200 unique Lens profiles\n\nWe're outperforming 90% of Hackney clubs on Lens right now. The phantom-fan conversion rate is up too — 12 new real-world merch orders this week.\n\nWant me to boost the top post with a Lens promotion to push it further?`,
                        actions: [
                            { label: '✅ Boost Post', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Boost activated. I've allocated 50 credits from the marketing budget. Projected reach increase: +2,000 profiles over 48 hours. I'll report back on the results.` }]) },
                            { label: '❌ Leave Organic', onClick: () => setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Commercial Lead', text: `Fair enough. Organic reach is strong enough for now. I'll flag the next high-performing post for a potential boost.` }]) }
                        ]
                    }]);
                    setIsTyping(false);
                }, 1500);
                response = null as unknown as string;
            } else {
                response = getStaffResponse(selectedStaff?.id || '', text);
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
            <Card className="w-full max-w-6xl h-[85vh] bg-gray-900 border-gray-800 overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Sidebar: Staff Selection */}
                <div className="w-full md:w-72 bg-black/40 border-r border-white/5 flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center space-x-2 text-blue-400 mb-1">
                            <Coffee className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Staff Room</span>
                        </div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Office</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {STAFF_MEMBERS.map(member => (
                            <button
                                key={member.id}
                                onClick={() => setSelectedStaff(member)}
                                className={`w-full p-4 rounded-xl flex items-center space-x-4 transition-all ${selectedStaff?.id === member.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-gray-200 hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-2xl">{member.avatar}</div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="text-sm font-black uppercase truncate">{member.name}</div>
                                    <div className={`text-[9px] uppercase font-bold ${selectedStaff?.id === member.id ? 'text-blue-100' : 'text-gray-300'}`}>
                                        {member.role}
                                    </div>
                                </div>
                                {member.mood === 'busy' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 bg-black/20 text-[9px] text-gray-400 font-mono flex items-center justify-between">
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
                                <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{selectedStaff?.role}</p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center space-x-4">
                            <div className="text-right">
                                <div className="text-[9px] font-bold text-gray-300">NEGOTIATION POWER</div>
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
                                <div className="flex items-center space-x-2 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    <span>Loading squad data...</span>
                                </div>
                            </div>
                        )}
                        {dataError && (
                            <div className="mx-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-widest">
                                ⚠️ Could not load live squad data. Showing cached values.
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
                        <div className="flex flex-wrap gap-2 mb-4">
                            {getQuickActions(selectedStaff?.id || '').map((action, i) => (
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
                    </div>
                </div>

                {/* Right Sidebar: Contextual Info */}
                <div className="hidden lg:block w-72 bg-black/40 border-l border-white/5 p-6">
                    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Dossier</h4>
                    <p className="text-xs text-gray-200 leading-relaxed italic mb-6">
                        "{selectedStaff?.biography}"
                    </p>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-300 uppercase">Current Strategy</span>
                            <span className="text-[10px] font-bold text-blue-400">EXPANSION</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-300 uppercase">Season Progress</span>
                            <span className="text-[10px] font-bold text-white font-mono">24 / 48 Matches</span>
                        </div>
                    </div>

                    <div className="mt-8 bg-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                        <h5 className="text-[10px] font-black text-white uppercase mb-1">Market Insight</h5>
                        <p className="text-[9px] text-blue-100 leading-tight">
                            Lens reputation scores are inflating. Now is the time to secure long-term contracts for "Gold" tier prospects before valuations skyrocket.
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

function getStaffResponse(staffId: string, query: string): string {
    const responses: Record<string, string[]> = {
        'agent-1': [
            "I've been looking at the numbers. Based on the recent Hackney derby, your squad's valuation is up 12% on the secondary market.",
            "Marcus has attracted interest from the Northside Elite. We might need to adjust his reputation-clause if we want to keep him.",
            "The market is moving fast. If we don't finalize the draft picks soon, we'll lose the early-bird discount on the smart contracts."
        ],
        'scout-1': [
            "Pitch 4 was lively today. I saw a kid with 95 pace and verified Algorand credentials. We should bring him in for a trial.",
            "Our data suggests a gap in the midfield. My spatial analysis shows players are over-committing in the transition phase.",
            "I've updated the Scouting Report with rival data. Watch out for Northside's new striker; he's got clinical finishing stats."
        ],
        'coach-1': [
            "The Match Engine is calculating our offensive probability as high, but our defensive recovery is lacking. I suggest a 4-3-3 setup.",
            "I've noticed the squad's morale is dipping after the last loss. Maybe a light training session tomorrow?",
            "Tactical directive: We need to utilize the wings more. The Lens reputation of our wide players should be exploited."
        ],
        'physio-1': [
            "Recovery periods are shortening thanks to the new sleep-tracking integration. The squad is ready for the double-header.",
            "I'm seeing high lactic acid levels in our mid-field. We should rotation them for the Tuesday night match.",
            "Biometric verification complete. All participating players are physically cleared for the upcoming turf-war."
        ],
        'comms-1': [
            "Our social reach is up 40% after the last highlight post. The phantom-fans are starting to buy real-world merch.",
            "I've negotiated a bounty with the local sports shop. Anyone who checks in there gets a 10% XP boost.",
            "Brand alignment is perfect. We're the most 'Phygital' club in the London circuit right now."
        ]
    };

    const options = responses[staffId] || ["I'll get back to you on that, Boss."];
    return options[Math.floor(Math.random() * options.length)];
}

function getQuickActions(staffId: string): string[] {
    switch (staffId) {
        case 'agent-1': return ["Renegotiate Marcus' Contract", "Renegotiate Jamie's Contract", "Renegotiate Sarah's Contract", "Balance Sheet Review", "Transfer Budget Inquiry"];
        case 'scout-1': return ["Hackney Academy Report", "Rival Team Analysis", "Search for Midfielders"];
        case 'coach-1': return ["Tactical Briefing", "Squad Morale Check", "Training Optimization"];
        case 'physio-1': return ["Fitness Status Report", "Recovery Logistics", "Injury Prevention"];
        case 'comms-1': return ["Sponsorship Opportunity", "Social Engagement Stats", "Brand Reputation"];
        default: return ["Status Report", "Next Match Preparation"];
    }
}
