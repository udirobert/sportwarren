'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Users, CheckCircle, XCircle, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { Avatar } from '@/components/ui/Avatar';

interface MatchCoordinationWidgetProps {
  squadId: string;
}

export const MatchCoordinationWidget: React.FC<MatchCoordinationWidgetProps> = ({ squadId }) => {
  const utils = trpc.useUtils();
  const { data: upcomingMatchData, isLoading } = trpc.match.getUpcoming.useQuery({ squadId });
  const upcomingMatch = upcomingMatchData as any;
  const { data: rsvps } = trpc.match.getRsvps.useQuery(
    { matchId: upcomingMatch?.id || '' },
    { enabled: !!upcomingMatch?.id }
  );

  const rsvpMutation = trpc.match.rsvp.useMutation({
    onSuccess: () => {
      utils.match.getUpcoming.invalidate();
      utils.match.getRsvps.invalidate();
    }
  });

  const paymentMutation = trpc.match.setPaymentStatus.useMutation({
    onSuccess: () => {
      utils.match.getRsvps.invalidate();
    }
  });

  if (isLoading) return <div className="h-48 animate-pulse bg-gray-100 rounded-xl" />;
  
  if (!upcomingMatch) {
    return (
      <Card className="relative overflow-hidden border-dashed border-gray-300 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-black text-gray-600 uppercase tracking-wider">No matches scheduled</h3>
        <p className="text-xs text-gray-400 mt-1 mb-4">Get the squad together for a game!</p>
        <Button variant="outline" className="text-xs h-8 font-bold border-gray-200">
          Schedule Match
        </Button>
      </Card>
    );
  }

  const myRsvp = upcomingMatch.rsvps?.[0];
  const isHome = upcomingMatch.homeSquadId === squadId;
  const opponent = isHome ? upcomingMatch.awaySquad : upcomingMatch.homeSquad;
  
  const availableCount = rsvps?.filter(r => r.status === 'available').length || 0;
  const paidCount = rsvps?.filter(r => r.isPaid).length || 0;

  const handleRsvp = (status: 'available' | 'unavailable' | 'maybe') => {
    rsvpMutation.mutate({ matchId: upcomingMatch.id, status });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }).format(date);
  };

  return (
    <Card className="relative overflow-hidden border-blue-500/30 bg-gradient-to-br from-white to-blue-50/50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Upcoming Match</div>
            <div className="text-sm font-black text-gray-900 truncate">vs {opponent.name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
            {formatDate(new Date(upcomingMatch.matchDate))}
          </div>
          <div className="text-[10px] font-bold text-gray-500 flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            {formatTime(new Date(upcomingMatch.matchDate))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/60 rounded-xl p-3 border border-white flex flex-col items-center justify-center">
          <div className="text-2xl font-black text-blue-600">{availableCount}</div>
          <div className="text-[10px] font-black uppercase text-gray-400">Available</div>
        </div>
        <div className="bg-white/60 rounded-xl p-3 border border-white flex flex-col items-center justify-center">
          <div className="text-2xl font-black text-emerald-600">{paidCount}</div>
          <div className="text-[10px] font-black uppercase text-gray-400">Paid</div>
        </div>
      </div>

      <div className="space-y-3">
        {!myRsvp || myRsvp.status === 'pending' ? (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleRsvp('available')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-9 font-bold"
            >
              I'm In
            </Button>
            <Button 
              onClick={() => handleRsvp('unavailable')}
              variant="outline"
              className="flex-1 text-xs h-9 font-bold border-gray-200"
            >
              Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/80 border border-blue-100">
            <div className="flex items-center gap-2">
              {myRsvp.status === 'available' ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-xs font-bold text-gray-700">
                You're {myRsvp.status}
              </span>
            </div>
            <button 
              onClick={() => handleRsvp('maybe')}
              className="text-[10px] font-black uppercase text-blue-600 hover:underline"
            >
              Change
            </button>
          </div>
        )}

        {myRsvp?.status === 'available' && !myRsvp.isPaid && (
          <Button 
            onClick={() => paymentMutation.mutate({ matchId: upcomingMatch.id, isPaid: true, amountPaid: 500 })}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-bold flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
          >
            <CreditCard className="w-4 h-4" />
            Pay Subs (£5)
          </Button>
        )}
        
        {myRsvp?.isPaid && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
            <CheckCircle className="w-4 h-4" />
            Paid & Confirmed
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-black uppercase text-gray-400">The Squad</div>
          <button className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-0.5">
            Full List <ChevronRight className="w-2.5 h-2.5" />
          </button>
        </div>
        <div className="flex -space-x-2 overflow-hidden">
          {rsvps?.filter(r => r.status === 'available').slice(0, 6).map((rsvp) => (
            <Avatar 
              key={rsvp.user.id}
              src={rsvp.user.avatar}
              name={rsvp.user.name || 'Player'}
              size="sm"
              className={`ring-2 ring-white ${rsvp.isPaid ? 'ring-emerald-500/50' : ''}`}
            />
          ))}
          {availableCount > 6 && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 ring-2 ring-white text-[10px] font-black text-gray-500">
              +{availableCount - 6}
            </div>
          )}
          {availableCount === 0 && (
            <div className="text-[10px] font-bold text-gray-400 italic">No one in yet...</div>
          )}
        </div>
      </div>
    </Card>
  );
};
