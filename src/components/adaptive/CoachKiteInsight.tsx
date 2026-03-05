"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Sparkles, Brain, TrendingUp, Info } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';

interface CoachKiteInsightProps {
  userId: string;
}

export const CoachKiteInsight: React.FC<CoachKiteInsightProps> = ({ userId }) => {
  const { data, isLoading, error } = trpc.player.getAiInsights.useQuery(
    { userId },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 30, // 30 minutes
    }
  );

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
    <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 mb-2">
          <div className={`w-8 h-8 ${getBgColor()} rounded-full flex items-center justify-center`}>
            {getIcon()}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{data.agentName || "Coach Kite"}</h2>
        </div>
        {data.confidence && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            {Math.round(data.confidence * 100)}% Confidence
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 mt-2 italic font-medium leading-relaxed">
        &quot;{data.insight}&quot;
      </p>
    </Card>
  );
};
