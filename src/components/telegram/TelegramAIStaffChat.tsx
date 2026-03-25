'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Bot, Loader2, ChevronLeft } from 'lucide-react';
import type { MiniAppContext } from './TelegramMiniAppShell';

interface StaffMember {
  id: string;
  name: string;
  emoji: string;
  role: string;
  description: string;
}

const STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'scout',
    name: 'The Scout',
    emoji: '🔭',
    role: 'Talent Identification',
    description: "What's the opponent's weakness?",
  },
  {
    id: 'coach',
    name: 'Coach Kite',
    emoji: '🪁',
    role: 'Tactical Director',
    description: 'Should we play counter vs City?',
  },
  {
    id: 'physio',
    name: 'The Physio',
    emoji: '🏥',
    role: 'Health & Recovery',
    description: 'Who needs rest this week?',
  },
  {
    id: 'analyst',
    name: 'The Analyst',
    emoji: '📊',
    role: 'Performance Data',
    description: 'Show my shooting stats trend',
  },
  {
    id: 'commercial',
    name: 'Commercial Lead',
    emoji: '📈',
    role: 'Treasury & Sponsorships',
    description: 'Can we afford a 5 TON match fee?',
  },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'staff';
  staffName?: string;
  staffEmoji?: string;
  text: string;
  timestamp: number;
}

interface TelegramAIStaffChatProps {
  context: MiniAppContext;
  onRefresh: () => void;
}

function isNonEmptyString(value: string | false): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function TelegramAIStaffChat({ context }: TelegramAIStaffChatProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Inject welcome message when staff is selected
  const handleSelectStaff = useCallback((staff: StaffMember) => {
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
    setSelectedStaff(staff);
    setMessages([
      {
        id: `welcome-${staff.id}`,
        sender: 'staff',
        staffName: staff.name,
        staffEmoji: staff.emoji,
        text: `Welcome to the backroom, Boss. I'm ${staff.name}, your ${staff.role}. How can I help you today?`,
        timestamp: Date.now(),
      },
    ]);
    // Focus input after a tick
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = useCallback(async () => {
    // Need current values for the API call
    const currentInput = inputText.trim();
    if (!currentInput || !selectedStaff || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: currentInput,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSending(true);

    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    window.Telegram?.WebApp?.MainButton?.showProgress();

    try {
      const response = await fetch('/api/telegram/mini-app/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          staffId: selectedStaff.id,
          message: userMessage.text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const staffReply: ChatMessage = {
        id: `staff-${Date.now()}`,
        sender: 'staff',
        staffName: data.staffName,
        staffEmoji: data.staffEmoji,
        text: data.reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, staffReply]);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'staff',
        staffName: selectedStaff.name,
        staffEmoji: selectedStaff.emoji,
        text: "Sorry Boss, I'm having trouble connecting right now. Try again in a moment.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setSending(false);
      window.Telegram?.WebApp?.MainButton?.hideProgress();
    }
  }, [inputText, selectedStaff, sending, token]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  // Telegram Native Buttons Integration
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    // Back Button: Only show when a staff member is selected (to return to staff selection)
    const handleBack = () => {
      setSelectedStaff(null);
      webApp.HapticFeedback.impactOccurred('light');
    };

    if (selectedStaff) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(handleBack);
    } else {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(handleBack);
    }

    // Main Button: Show when there is text to send
    if (selectedStaff && inputText.trim() && !sending) {
      webApp.MainButton.setText('SEND MESSAGE');
      webApp.MainButton.onClick(handleSend);
      webApp.MainButton.show();
    } else {
      webApp.MainButton.hide();
      webApp.MainButton.offClick(handleSend);
    }

    return () => {
      webApp.BackButton.offClick(handleBack);
      webApp.MainButton.offClick(handleSend);
    };
  }, [selectedStaff, inputText, sending, handleSend]);

  // Staff selector view
  if (!selectedStaff) {
    return (
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10">
            <Bot className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI Staff Room</h2>
            <p className="text-[10px] text-slate-400">
              Chat with your backroom staff for insights
            </p>
          </div>
        </div>

        {/* Squad context card */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-2">
            Active Squad Context
          </p>
          <div className="flex items-center gap-3">
            <span className="text-lg">⚽</span>
            <div>
              <p className="text-xs font-semibold text-white">
                {context.squad.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {context.squad.memberCount} members • {context.treasury.balance}{' '}
                {context.treasury.currency}
              </p>
            </div>
          </div>
        </div>

        {/* Staff cards */}
        <div className="space-y-2">
          {STAFF_MEMBERS.map((staff) => (
            <button
              key={staff.id}
              onClick={() => handleSelectStaff(staff)}
              className="group w-full rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-left transition-all active:scale-[0.98] hover:bg-white/[0.06] hover:border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl transition group-hover:bg-white/10">
                  {staff.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-white">{staff.name}</p>
                    <span className="text-[10px] text-slate-500">
                      {staff.role}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400 italic truncate">
                    "{staff.description}"
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="flex flex-col h-[calc(100dvh-7.5rem)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <button
          onClick={() => {
            window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
            setSelectedStaff(null);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-400/10 text-lg">
          {selectedStaff.emoji}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">{selectedStaff.name}</p>
          <p className="text-[10px] text-purple-400">{selectedStaff.role}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-slate-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-500/20 text-white border border-emerald-500/20'
                  : 'bg-white/5 text-slate-200 border border-white/5'
              }`}
            >
              {msg.sender === 'staff' && msg.staffEmoji && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs">{msg.staffEmoji}</span>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    {msg.staffName}
                  </span>
                </div>
              )}
              <p className="whitespace-pre-line">{msg.text}</p>
              <p className="mt-1.5 text-[9px] text-slate-500 text-right">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs">{selectedStaff.emoji}</span>
                <div className="flex items-center gap-1">
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestion chips */}
      {messages.length <= 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none">
          {[
            selectedStaff.description,
            selectedStaff.id === 'coach' && 'What formation should we use?',
            selectedStaff.id === 'physio' && 'Squad fitness report',
            selectedStaff.id === 'commercial' && 'Treasury status',
            selectedStaff.id === 'scout' && 'Scouting priorities',
            selectedStaff.id === 'analyst' && 'Player performance overview',
          ]
            .filter(isNonEmptyString)
            .slice(0, 3)
            .map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInputText(suggestion);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-95"
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/5 bg-[#09111f]/80 px-4 py-3 backdrop-blur-lg pb-20">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${selectedStaff.name}...`}
            disabled={sending}
            maxLength={500}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition focus:border-purple-400/50 focus:bg-white/[0.07] disabled:opacity-50"
          />
          {/* Fallback button for desktop or non-native view */}
          {!window.Telegram?.WebApp && (
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-white transition hover:bg-purple-400 active:scale-95 disabled:bg-white/5 disabled:text-slate-600"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TelegramAIStaffChat;
