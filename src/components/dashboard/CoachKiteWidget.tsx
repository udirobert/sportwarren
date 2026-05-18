"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Smartphone, ExternalLink, Zap } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { trpc } from '@/lib/trpc-client';
const WHATSAPP_NUMBER = '+12015345384';
const TELEGRAM_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'sportwarrenbot';

interface CoachKiteWidgetProps {
  squadId?: string;
}

export const CoachKiteWidget: React.FC<CoachKiteWidgetProps> = ({ squadId }) => {
  const { isVerified } = useWallet();
  const { data: profile } = trpc.player.getCurrentProfile.useQuery(undefined, {
    enabled: isVerified,
    retry: false,
    staleTime: 30_000,
  });

  if (!profile || !squadId) return null;

  const hasMatches = (profile.totalMatches ?? 0) > 0;
  if (!hasMatches) return null;

  const telegramLink = `https://t.me/${TELEGRAM_BOT}?start=coach`;
  const waLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=scout%20opponent`;

  return (
    <Card className="bg-gradient-to-br from-indigo-950 to-slate-900 border-none text-white shadow-xl overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400/20 to-purple-400/20 border border-indigo-400/20 flex items-center justify-center text-lg">
            🪁
          </div>
          <div>
            <h3 className="text-lg font-bold">Coach Kite</h3>
            <p className="text-xs text-indigo-200/70 font-medium">AI Tactical Advisor</p>
          </div>
        </div>

        <p className="text-sm text-indigo-100/80 mb-5 leading-relaxed">
          Ask me about formations, scout opponents, or get match analysis. I am available on both Telegram and WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs h-10 gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat in Telegram
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Button>
          </a>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="secondary"
              className="w-full bg-white/10 hover:bg-white/15 text-white border-white/10 font-bold text-xs h-10 gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Text on WhatsApp
              <ExternalLink className="w-3 h-3 opacity-60" />
            </Button>
          </a>
        </div>
      </div>
    </Card>
  );
};
