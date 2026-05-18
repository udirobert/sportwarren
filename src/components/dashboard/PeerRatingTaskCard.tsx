'use client';

import { Star, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { trpc } from '@/lib/trpc-client';

export function PeerRatingTaskCard() {
  const { data, isLoading } = trpc.peerRating.getPendingCount.useQuery();

  if (isLoading || !data || data.count === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-indigo-900/80 to-purple-950/80 border-indigo-500/30 p-5 shadow-lg shadow-indigo-500/10">
      <div className="flex items-start gap-4">
        <div className="bg-indigo-500/20 p-3 rounded-xl shrink-0">
          <Star className="w-6 h-6 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white">Teammate Scouting</h3>
            <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {data.count} pending
            </span>
          </div>
          <p className="text-xs text-indigo-200/70 mb-3">
            {data.count === 1
              ? 'You have 1 match ready for peer ratings. Your feedback helps teammates level up.'
              : `You have ${data.count} matches ready for peer ratings. Rate your teammates before the window closes.`}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-indigo-300/60 mb-3">
            <Clock className="w-3 h-3" />
            <span>Rating windows close 24h after match verification</span>
          </div>
          <Link href={`/match/${data.count === 1 ? '?pending=true' : '?pending=true'}`}>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-8 px-4">
              Rate Teammates <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
