"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgentAlerts } from '@/hooks/squad/useAgentAlerts';
import { useSquadDetails } from '@/hooks/squad/useSquad';
import { trpc } from '@/lib/trpc-client';

interface FeedEvent {
    id: string;
    staffId: string;
    staffEmoji: string;
    sender: string;
    text: string;
    timestamp: number;
    read: boolean;
    category: 'contract' | 'fitness' | 'scouting' | 'tactical' | 'commercial' | 'system';
}

const STAFF_META: Record<string, { emoji: string; name: string; category: FeedEvent['category'] }> = {
    'agent-1':  { emoji: '🎩', name: 'The Agent',        category: 'contract'   },
    'scout-1':  { emoji: '🔭', name: 'The Scout',        category: 'scouting'   },
    'coach-1':  { emoji: '🪁', name: 'Coach Kite',       category: 'tactical'   },
    'physio-1': { emoji: '🏥', name: 'The Physio',       category: 'fitness'    },
    'comms-1':  { emoji: '📈', name: 'Commercial Lead',  category: 'commercial' },
};

const CATEGORY_COLOURS: Record<FeedEvent['category'], string> = {
    contract:   'border-blue-500/30 bg-blue-500/5',
    fitness:    'border-green-500/30 bg-green-500/5',
    scouting:   'border-purple-500/30 bg-purple-500/5',
    tactical:   'border-orange-500/30 bg-orange-500/5',
    commercial: 'border-yellow-500/30 bg-yellow-500/5',
    system:     'border-gray-500/30 bg-gray-500/5',
};

const CATEGORY_DOT: Record<FeedEvent['category'], string> = {
    contract:   'bg-blue-400',
    fitness:    'bg-green-400',
    scouting:   'bg-purple-400',
    tactical:   'bg-orange-400',
    commercial: 'bg-yellow-400',
    system:     'bg-gray-400',
};

interface EventFeedProps {
    squadId?: string;
}

export const EventFeed: React.FC<EventFeedProps> = ({ squadId }) => {
    const [events, setEvents] = useState<FeedEvent[]>([]);
    const [filter, setFilter] = useState<FeedEvent['category'] | 'all'>('all');
    const injectedRef = useRef<Set<string>>(new Set());

    const { members, loading: membersLoading } = useSquadDetails(squadId);
    const { data: treasury, isLoading: treasuryLoading } = trpc.squad.getTreasury.useQuery(
        { squadId: squadId || '' },
        { enabled: !!squadId }
    );
    const { data: tactics, isLoading: tacticsLoading } = trpc.squad.getTactics.useQuery(
        { squadId: squadId || '' },
        { enabled: !!squadId }
    );

    const dataReady = !membersLoading && !treasuryLoading && !tacticsLoading && !!squadId;

    const alertMembers = members.map(m => ({
        id: m.id, name: m.name, role: m.role, stats: m.stats,
    }));
    const alertTreasury = treasury ? { balance: treasury.balance, transactions: treasury.transactions } : null;
    const tacticsAny = tactics as Record<string, unknown> | null | undefined;
    const alertTactics = tacticsAny
        ? { formation: typeof tacticsAny.formation === 'string' ? tacticsAny.formation : undefined }
        : null;

    const agentAlerts = useAgentAlerts({ members: alertMembers, treasury: alertTreasury, tactics: alertTactics, dataReady });

    // Inject agent alerts as feed events (once each)
    useEffect(() => {
        if (!agentAlerts.length) return;
        const newEvents: FeedEvent[] = [];
        for (const alert of agentAlerts) {
            const key = `alert:${alert.staffId}:${alert.text.slice(0, 40)}`;
            if (injectedRef.current.has(key)) continue;
            injectedRef.current.add(key);
            const meta = STAFF_META[alert.staffId] ?? { emoji: '📋', name: alert.sender, category: 'system' as const };
            newEvents.push({
                id: key,
                staffId: alert.staffId,
                staffEmoji: meta.emoji,
                sender: meta.name,
                text: alert.text,
                timestamp: Date.now(),
                read: false,
                category: meta.category,
            });
        }
        if (newEvents.length) setEvents(prev => [...newEvents, ...prev]);
    }, [agentAlerts]);

    const markAllRead = () => setEvents(prev => prev.map(e => ({ ...e, read: true })));
    const markRead = (id: string) => setEvents(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));

    const filtered = filter === 'all' ? events : events.filter(e => e.category === filter);
    const unreadCount = events.filter(e => !e.read).length;

    const FILTERS: Array<{ key: FeedEvent['category'] | 'all'; label: string }> = [
        { key: 'all',        label: 'All' },
        { key: 'contract',   label: '🎩 Agent' },
        { key: 'scouting',   label: '🔭 Scout' },
        { key: 'tactical',   label: '🪁 Coach' },
        { key: 'fitness',    label: '🏥 Physio' },
        { key: 'commercial', label: '📈 Comms' },
    ];

    return (
        <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                        📋 Backroom Feed
                    </span>
                    {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[9px] font-black">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-1.5 px-5 py-3 overflow-x-auto scrollbar-none border-b border-white/5">
                {FILTERS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                            filter === f.key
                                ? 'bg-white/15 text-white'
                                : 'bg-white/5 text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Events */}
            <div className="divide-y divide-white/5 max-h-80 overflow-y-auto scrollbar-none">
                <AnimatePresence initial={false}>
                    {filtered.length === 0 ? (
                        <div className="px-5 py-8 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">
                            {dataReady ? 'No alerts — squad is in good shape.' : 'Loading squad data...'}
                        </div>
                    ) : (
                        filtered.map(event => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                onClick={() => markRead(event.id)}
                                className={`flex gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-white/5 border-l-2 ${
                                    event.read ? 'border-transparent opacity-60' : CATEGORY_COLOURS[event.category].split(' ')[0]
                                }`}
                            >
                                <div className="flex-shrink-0 mt-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${event.read ? 'bg-gray-700' : CATEGORY_DOT[event.category]}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                                            {event.staffEmoji} {event.sender}
                                        </span>
                                        <span className="text-[8px] text-gray-600">
                                            {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                                        {event.text}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
