"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Sparkles, Brain, TrendingUp, Info, MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';

interface CoachKiteInsightProps {
  userId: string;
}

export const CoachKiteInsight: React.FC<CoachKiteInsightProps> = ({ userId }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'coach', text: string }>>([]);

  const { data, isLoading, error } = trpc.player.getAiInsights.useQuery(
    { userId },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30, // 30 minutes
    }
  );

  const chatMutation = trpc.player.chatWithCoach.useMutation({
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { role: 'coach', text: data.reply }]);
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatMutation.isPending) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);

    chatMutation.mutate({
      userId,
      message: userMsg,
      context: data?.insight
    });
  };

  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-blue-500 animate-pulse">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
        <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
      </Card>
    );
  }

  if (error || !data) {
    return null; // Don't show if there's an error
  }

  const getIcon = () => {
    switch (data.type) {
      case 'performance': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'tactical': return <Brain className="w-5 h-5 text-purple-600" />;
      case 'onboarding': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Sparkles className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (data.type) {
      case 'performance': return 'bg-green-100';
      case 'tactical': return 'bg-purple-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent relative overflow-hidden">
      {/* Insight View */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-8 h-8 ${getBgColor()} rounded-full flex items-center justify-center`}>
            {getIcon()}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{data.agentName || "Coach Kite"}</h2>
        </div>
        {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold uppercase transition-all"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Reply</span>
          </button>
        )}
      </div>
      
      {!isChatOpen ? (
        <>
          <p className="text-sm text-gray-700 mt-2 italic font-medium leading-relaxed">
            &quot;{data.insight}&quot;
          </p>
          {data.confidence && (
            <div className="mt-2 flex justify-end">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {Math.round(data.confidence * 100)}% Confidence
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            <div className="bg-white/50 rounded-lg p-2 text-xs text-gray-600 border border-blue-100 italic">
              Coach Kite: &quot;{data.insight}&quot;
            </div>
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-2 rounded-lg text-xs max-w-[90%] ${
                  msg.role === 'user' 
                    ? 'ml-auto bg-blue-600 text-white font-medium' 
                    : 'bg-white text-gray-800 border border-blue-100'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span className="text-[10px] font-medium italic">Coach is thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input 
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask Coach anything..."
              className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button 
              type="submit"
              disabled={!chatMessage.trim() || chatMutation.isPending}
              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
            </button>
            <button 
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </Card>
  );
};
