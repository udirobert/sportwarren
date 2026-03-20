'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    X,
    Send,
    Bot,
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { getJourneyContent } from '@/lib/journey/content';
import type { DashboardEntryStateId } from '@/lib/dashboard/entry-state';

interface Message {
    id: string;
    role: 'agent' | 'user';
    content: string;
    timestamp: Date;
    agentType?: 'concierge' | 'scout' | 'coach';
}

interface AgenticConciergeProps {
    journeyStage?: DashboardEntryStateId;
}

export const AgenticConcierge: React.FC<AgenticConciergeProps> = ({ journeyStage = 'guest_preview' }) => {
    const { address } = useWallet();
    const { city, rivals, venue } = useEnvironment();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const tourStepProcessed = useRef<Set<string>>(new Set());
    const journeyContent = getJourneyContent(journeyStage, {
        city,
        venue,
        rivalName: rivals.away,
    });

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    role: 'agent',
                    content: journeyContent.assistant.welcome,
                    timestamp: new Date(),
                    agentType: 'concierge'
                }
            ]);
        }
    }, [journeyContent.assistant.welcome, messages.length]);

    // Tour step contextual prompts
    const TOUR_STEP_PROMPTS: Record<string, string> = {
        'welcome': `Quickly welcome the user to the SportWarren preview at ${venue}. Mention they're exploring a live football management experience. Keep it brief (2 sentences).`,
        'match-engine': `The user is viewing the Match Engine - the tactical visualization canvas. Briefly explain how it tracks momentum, possession, and key moments. Mention it previews what they'll see after logging real match results.`,
        'match-verification': `The user is looking at Match Verification - the system that confirms results through distributed validation. Explain that each logged result becomes verifiable data that powers squad operations.`,
        'staff-room': journeyContent.assistant.tourPrompt || `Give a quick tactical read on ${rivals.away}, then explain the fastest next step is logging a real result.`,
        'lens-social-step': `The user is viewing the Social layer - Lens-powered identity that connects their on-chain reputation with their manager profile. Explain how verified results build their legacy.`,
        'rpg-stats': `The user is exploring the RPG Stats system. Explain how each result contributes to their manager profile - XP, achievements, and career progression.`,
        'claim-identity': `The user is at the identity claim step. Explain that connecting their wallet creates their manager identity that persists across seasons.`,
    };

    // Listen for Tour Steps
    useEffect(() => {
        const handleTourStep = (e: any) => {
            const stepId = e.detail?.id;
            if (!stepId || tourStepProcessed.current.has(stepId)) return;
            
            // Only process steps that have contextual prompts
            if (!TOUR_STEP_PROMPTS[stepId]) return;
            
            tourStepProcessed.current.add(stepId);
            setIsOpen(true);
            setIsTyping(true);

            const fetchAnalysis = async () => {
                try {
                    const res = await fetch('/api/ai/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: TOUR_STEP_PROMPTS[stepId],
                            city,
                            venue,
                            history: [],
                            userId: address || undefined
                        })
                    });
                    const data = await res.json();
                    setMessages(prev => [...prev, {
                        id: `tour-${Date.now()}`,
                        role: 'agent',
                        content: data.response,
                        timestamp: new Date(),
                        agentType: 'concierge'
                    }]);
                } catch (err) {
                    console.error("Tour analysis failed:", err);
                } finally {
                    setIsTyping(false);
                }
            };

            // Wait 1s for the UI to settle before firing
            setTimeout(fetchAnalysis, 1000);
        };
        window.addEventListener('sw-tour-step', handleTourStep);
        return () => window.removeEventListener('sw-tour-step', handleTourStep);
    }, [address, city, rivals, venue, journeyContent]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const history = messages.map(m => ({
                role: m.role === 'agent' ? 'assistant' : 'user',
                content: m.content
            }));

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: inputValue,
                    city,
                    venue,
                    history,
                    userId: address || undefined
                })
            });

            const data = await res.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: data.response || data.error,
                timestamp: new Date(),
                agentType: 'concierge'
            }]);
        } catch (error) {
            console.error("AI Chat failed:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "My connection to the tactical feed is unstable. Let's stick to the basics for now.",
                timestamp: new Date(),
                agentType: 'concierge'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[250] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[calc(100vw-32px)] max-w-[380px] bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px] max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Your Assistant</div>
                                    <h3 className="text-sm font-black text-white uppercase italic tracking-tight">Marcus</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none"
                        >
                            {messages.map((m) => (
                                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-white/5 text-gray-200 border border-white/10'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-3 rounded-2xl flex space-x-1">
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-black/40 border-t border-white/5">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={journeyContent.assistant.placeholder}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isTyping}
                                    className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {journeyContent.assistant.prompts.map((prompt) => (
                                    <button
                                        key={prompt.label}
                                        className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left hover:text-blue-400 transition-colors truncate"
                                        onClick={() => setInputValue(prompt.message)}
                                    >
                                        • {prompt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-full shadow-2xl transition-all ${isOpen ? 'bg-white text-gray-900' : 'bg-gray-900 text-white border border-white/10'
                    }`}
            >
                {isOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <>
                        <div className="relative">
                            <MessageSquare className="w-5 h-5" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Office Assistant</span>
                    </>
                )}
            </motion.button>
        </div>
    );
};
