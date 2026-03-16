"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
    Bell,
    ChevronRight,
    Brain,
    Target,
    Shield,
    Zap,
    MessageSquare,
    Users,
    Trophy,
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc-client';
import { CoachKiteInsight } from './CoachKiteInsight';

interface StaffMessage {
    id: string;
    sender: 'Coach Kite' | 'The Scout' | 'The Agent' | 'The Referee';
    role: 'fitness' | 'tactical' | 'social' | 'regulatory';
    message: string;
    timestamp: Date;
    actionLabel?: string;
    onAction?: () => void;
    actionHref?: string;
    type: 'insight' | 'alert' | 'social' | 'reputation';
    priorityLevel: number; // 1-5
}

interface StaffFeedProps {
    userId: string;
    onOpenStaffRoom?: () => void;
}

export const StaffFeed: React.FC<StaffFeedProps> = ({ userId, onOpenStaffRoom }) => {
    const [activeTab, setActiveTab] = useState<'all' | 'priority'>('all');
    const [messages, setMessages] = useState<StaffMessage[]>([]);

    // Mock staff messages mixed with real data
    useEffect(() => {
        const mockMessages: StaffMessage[] = [
            {
                id: 'scout-1',
                sender: 'The Scout',
                role: 'social',
                message: 'Red Lions FC just claimed Pitch 4. Their captain is bragging on Lens. Want to challenge?',
                timestamp: new Date(),
                actionLabel: 'View Rival',
                actionHref: '/community',
                type: 'social',
                priorityLevel: 3
            },
            {
                id: 'agent-1',
                sender: 'The Agent',
                role: 'social',
                message: 'Your Hackney Marshes highlight has 12 new collect-actions on Lens. Reputation surging!',
                timestamp: new Date(),
                actionLabel: 'Check Socials',
                actionHref: '/community',
                type: 'reputation',
                priorityLevel: 4
            },
            {
                id: 'referee-1',
                sender: 'The Referee',
                role: 'regulatory',
                message: 'Match against Northside FC verification complete. Results finalized on Algorand.',
                timestamp: new Date(),
                actionLabel: 'View Match',
                actionHref: '/match?mode=history',
                type: 'alert',
                priorityLevel: 5
            },
            {
                id: 'dao-1',
                sender: 'The Referee', // Using Referee as the regulatory voice for now, or could add 'The Board'
                role: 'tactical',
                message: 'New DAO Directive: Squad complexity limits increased. You can now deploy more advanced tactics in the match engine.',
                timestamp: new Date(),
                actionLabel: 'Update Tactics',
                actionHref: '/squad?tab=tactics',
                type: 'insight',
                priorityLevel: 4
            }
        ];
        setMessages(mockMessages);
    }, []);

    return (
        <div className="space-y-4">
            {/* Backroom Staff Header - CM Style */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center space-x-2">
                    <div className="bg-gray-900 p-1.5 rounded-lg border border-white/10">
                        <Bell className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Backroom Staff</h2>
                        <p className="text-[10px] font-mono text-gray-400">4 Unread Reports from the Office</p>
                    </div>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        Inbox
                    </button>
                    <button
                        onClick={() => setActiveTab('priority')}
                        className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'priority' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                    >
                        Urgent
                    </button>
                </div>
            </div>

            {/* Main Insight (Coach Kite) - High Priority Enhancement */}
            <CoachKiteInsight userId={userId} />

            {/* Secondary Staff Feed */}
            <div className="grid gap-3">
                <AnimatePresence>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card className="p-3 border-l-2 border-gray-200">
                                <div className="flex items-start space-x-3">
                                    <div className={`mt-1 p-2 rounded-lg ${getIconBg(msg.role)}`}>
                                        {getIcon(msg.role)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black uppercase tracking-tight text-gray-400">{msg.sender}</span>
                                            <span className="text-xs font-mono text-gray-400">Just Now</span>
                                        </div>
                                        <p className="text-xs text-gray-700 font-medium leading-relaxed mt-1">
                                            {msg.message}
                                        </p>
                                        {msg.actionLabel && msg.actionHref && (
                                            <Link
                                                href={msg.actionHref}
                                                className="mt-2 inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 uppercase hover:text-blue-700 group"
                                            >
                                                <span>{msg.actionLabel}</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        )}
                                        {msg.actionLabel && !msg.actionHref && msg.onAction && (
                                            <button
                                                type="button"
                                                onClick={msg.onAction}
                                                className="mt-2 inline-flex items-center space-x-1 text-[10px] font-bold text-blue-600 uppercase hover:text-blue-700 group"
                                            >
                                                <span>{msg.actionLabel}</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer / Shortcut */}
            <div className="pt-2 flex justify-center">
                {onOpenStaffRoom ? (
                    <button
                        type="button"
                        onClick={onOpenStaffRoom}
                        className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 flex items-center space-x-1 transition-colors"
                    >
                        <span>Go to Staff Room</span>
                        <ChevronRight className="w-3 h-3" />
                    </button>
                ) : (
                    <Link
                        href="/dashboard"
                        className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 flex items-center space-x-1 transition-colors"
                    >
                        <span>Go to Staff Room</span>
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                )}
            </div>
        </div>
    );
};

const getIcon = (role: string) => {
    switch (role) {
        case 'fitness': return <Zap className="w-3 h-3 text-yellow-600" />;
        case 'tactical': return <Target className="w-3 h-3 text-purple-600" />;
        case 'social': return <Users className="w-3 h-3 text-blue-600" />;
        case 'regulatory': return <Shield className="w-3 h-3 text-orange-600" />;
        default: return <Sparkles className="w-3 h-3 text-blue-600" />;
    }
};

const getIconBg = (role: string) => {
    switch (role) {
        case 'fitness': return 'bg-yellow-100';
        case 'tactical': return 'bg-purple-100';
        case 'social': return 'bg-blue-100';
        case 'regulatory': return 'bg-orange-100';
        default: return 'bg-gray-100';
    }
};
