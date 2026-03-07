'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    X,
    Sparkles,
    ChevronRight,
    Send,
    Bot,
    Coffee,
    Zap,
    HelpCircle
} from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Button } from '@/components/ui/Button';

interface Message {
    id: string;
    role: 'agent' | 'user';
    content: string;
    timestamp: Date;
    agentType?: 'concierge' | 'scout' | 'coach';
}

export const AgenticConcierge: React.FC = () => {
    const { isGuest, address } = useWallet();
    const { city } = useEnvironment();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const guestWelcome = `Welcome to the ${city} Chapter! I'm Marcus, your Academy Director. Since you're in Guest Mode, I've initialized a live simulation at your local ground. Ask me anything!`;
    const memberWelcome = "Welcome back, Manager. The squad is looking sharp today. How can I assist with your tactical preparations?";

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([
                {
                    id: '1',
                    role: 'agent',
                    content: isGuest ? guestWelcome : memberWelcome,
                    timestamp: new Date(),
                    agentType: 'concierge'
                }
            ]);
        }
    }, [isGuest]);

    // Listen for Tour Steps
    useEffect(() => {
        const handleTourStep = (e: any) => {
            if (e.detail?.id === 'staff-room') {
                setIsOpen(true);
                setIsTyping(true);
                setTimeout(() => {
                    setIsTyping(false);
                    setMessages(prev => [...prev.slice(0, 2), {
                        id: 'tour-msg',
                        role: 'agent',
                        content: "I've just finished analyzing the match engine data. Hackney Hammers are playing a high-line—we should exploit their right flank once you connect your identity.",
                        timestamp: new Date(),
                        agentType: 'concierge'
                    }]);
                }, 1000);
            }
        };
        window.addEventListener('sw-tour-step', handleTourStep);
        return () => window.removeEventListener('sw-tour-step', handleTourStep);
    }, []);

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

        // Simulate AI Thinking
        setTimeout(() => {
            let response = "";
            const lower = inputValue.toLowerCase();

            if (lower.includes("how") && lower.includes("work")) {
                response = "We use Chainlink CRE to verify your real-world GPS and weather. If you play a match at Hackney Marshes, we bridge that data to Algorand/Avalanche to mint your XP.";
            } else if (lower.includes("guest")) {
                response = "Guest mode is a sandbox. Your progress is local. To 'Secure your Legacy', you'll need to connect a wallet—this is where the true RPG journey begins.";
            } else if (lower.includes("token") || lower.includes("money")) {
                response = "The economic engine is driven by reputation. High reputation squads attract better on-chain sponsorships and larger match prizes.";
            } else {
                response = "That's a strategic priority. I'll flag that for our Scout. By the way, have you checked the 'Tactical' feed lately? We're seeing high spatial pressure from the Northside rivals.";
            }

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: response,
                timestamp: new Date(),
                agentType: 'concierge'
            }]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[250] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[350px] bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[500px]"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Agentic Concierge</div>
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
                                    placeholder="Ask anything..."
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
                                <button
                                    className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left hover:text-blue-400 transition-colors truncate"
                                    onClick={() => setInputValue("How does CRE work?")}
                                >
                                    • How does CRE work?
                                </button>
                                <button
                                    className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-left hover:text-blue-400 transition-colors truncate"
                                    onClick={() => setInputValue("What is Guest Mode?")}
                                >
                                    • What is Guest Mode?
                                </button>
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
