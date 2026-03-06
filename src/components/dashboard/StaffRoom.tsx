"use client";

import React, { useState, useEffect } from 'react';
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
    }
];

interface StaffRoomProps {
    squadId?: string;
    onClose: () => void;
}

export const StaffRoom: React.FC<StaffRoomProps> = ({ squadId, onClose }) => {
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(STAFF_MEMBERS[0]);
    const [chatHistory, setChatHistory] = useState<Array<{ sender: string, text: string }>>([]);
    const [isTyping, setIsTyping] = useState(false);

    // Fetch real-time data for functional responses
    const { data: treasury } = trpc.squad.getTreasury.useQuery(
        { squadId: squadId || '' },
        { enabled: !!squadId }
    );
    const { data: tactics } = trpc.squad.getTactics.useQuery(
        { squadId: squadId || '' },
        { enabled: !!squadId }
    );
    const { members } = useSquadDetails(squadId);

    useEffect(() => {
        if (selectedStaff) {
            setChatHistory([
                { sender: selectedStaff.name, text: `Welcome to the backroom, Boss. How can I help you today?` }
            ]);
        }
    }, [selectedStaff]);

    const handleSendMessage = (text: string) => {
        setChatHistory(prev => [...prev, { sender: 'You', text }]);
        setIsTyping(true);

        // Functional Response Logic
        setTimeout(() => {
            let response = "";

            if (text === "Transfer Budget Inquiry") {
                const balance = treasury?.balance || 0;
                response = `Our current transfer budget is looking at exactly ${balance.toLocaleString()} credits. We should be careful with our next moves.`;
            } else if (text === "Balance Sheet Review") {
                const txCount = treasury?.transactions?.length || 0;
                response = `I've prepared the sheet. We have ${txCount} recent transactions. Salaries are our biggest drain atm, but the last match prize money helped.`;
            } else if (text === "Tactical Briefing") {
                const formation = tactics?.formation || '4-4-2';
                response = `Current setup is ${formation}. I've run the numbers; our win probability against average Hackney sides is currently ${Math.floor(Math.random() * 20) + 60}%.`;
            } else if (text.includes("Renegotiate") && text.includes("Contract")) {
                const playerName = text.split("'")[0].split(" ").pop();
                response = `I've already sent a preliminary feeler to ${playerName}'s camp. They're looking for a 15% bump in the win-bonus, but I think I can talk them down.`;
            } else if (text === "Squad Morale Check") {
                const avgLevel = members?.length ? Math.round(members.reduce((acc, m) => acc + (m.stats?.level || 0), 0) / members.length) : 5;
                response = `Morale is decent. The squad's average experience level of ${avgLevel} is keeping them grounded but hungry.`;
            } else {
                response = getStaffResponse(selectedStaff?.id || '', text);
            }

            setChatHistory(prev => [...prev, { sender: selectedStaff?.name || 'Staff', text: response }]);
            setIsTyping(false);
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
                                    : 'text-gray-400 hover:bg-white/5'
                                    }`}
                            >
                                <div className="text-2xl">{member.avatar}</div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="text-sm font-black uppercase truncate">{member.name}</div>
                                    <div className={`text-[9px] uppercase font-bold ${selectedStaff?.id === member.id ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {member.role}
                                    </div>
                                </div>
                                {member.mood === 'busy' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 bg-black/20 text-[9px] text-gray-600 font-mono flex items-center justify-between">
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
                                <div className="text-[9px] font-bold text-gray-500">NEGOTIATION POWER</div>
                                <div className="w-24 h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-blue-500 w-3/4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
                        {chatHistory.map((chat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${chat.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${chat.sender === 'You'
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10'
                                    : 'bg-white/5 text-gray-200 border border-white/10'
                                    }`}>
                                    {chat.text}
                                </div>
                            </motion.div>
                        ))}
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
                                    className="bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
                                >
                                    {action}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Contextual Info */}
                <div className="hidden lg:block w-72 bg-black/40 border-l border-white/5 p-6">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Dossier</h4>
                    <p className="text-xs text-gray-400 leading-relaxed italic mb-6">
                        "{selectedStaff?.biography}"
                    </p>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 uppercase">Current Strategy</span>
                            <span className="text-[10px] font-bold text-blue-400">EXPANSION</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 uppercase">Season Progress</span>
                            <span className="text-[10px] font-bold text-white font-mono">24 / 48 Matches</span>
                        </div>
                    </div>

                    <div className="mt-8 bg-blue-600/10 p-4 rounded-xl border border-blue-500/20">
                        <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
                        <h5 className="text-[10px] font-black text-white uppercase mb-1">Market Insight</h5>
                        <p className="text-[9px] text-blue-200 leading-tight">
                            Lens reputation scores are inflating. Now is the time to secure long-term contracts for "Gold" tier prospects before valuations skyrocket.
                        </p>
                    </div>
                </div>
            </Card>
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
        ]
    };

    const options = responses[staffId] || ["I'll get back to you on that, Boss."];
    return options[Math.floor(Math.random() * options.length)];
}

function getQuickActions(staffId: string): string[] {
    switch (staffId) {
        case 'agent-1': return ["Renegotiate Marcus' Contract", "Balance Sheet Review", "Transfer Budget Inquiry"];
        case 'scout-1': return ["Hackney Academy Report", "Rival Team Analysis", "Search for Midfielders"];
        case 'coach-1': return ["Tactical Briefing", "Squad Morale Check", "Training Optimization"];
        default: return ["Status Report", "Next Match Preparation"];
    }
}
