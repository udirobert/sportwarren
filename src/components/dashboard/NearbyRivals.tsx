"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { MapPin } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';

export const NearbyRivals: React.FC = () => {
    const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => setCoords({ lat: 53.4808, lon: -2.2426 }) // Manchester default
        );
    }, []);

    const { data: squads, isLoading } = trpc.squad.getNearbySquads.useQuery(
        { latitude: coords?.lat || 53.4808, longitude: coords?.lon || -2.2426 },
        { enabled: !!coords, staleTime: 1000 * 60 * 5 }
    );

    const challengeMutation = trpc.squad.createChallenge.useMutation({
        onSuccess: () => {
            alert('Challenge sent successfully!');
        },
        onError: (err) => {
            alert(`Failed to send challenge: ${err.message}`);
        }
    });

    const handleChallenge = (squadId: string) => {
        challengeMutation.mutate({
            toSquadId: squadId,
            proposedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
            message: 'Fancy a match at Hackney Marshes?'
        });
    };

    if (isLoading || !squads) return (
        <Card className="animate-pulse">
            <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded"></div>)}
            </div>
        </Card>
    );

    return (
        <Card>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    <h2 className="text-lg font-bold text-gray-900">Nearby Rivals</h2>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hackney Marshes</span>
            </div>
            <div className="space-y-3">
                {squads.map(squad => (
                    <div key={squad.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-xs">
                                {squad.shortName}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-900">{squad.name}</div>
                                <div className="text-[10px] text-gray-500">{squad.location} • {squad.memberCount} players</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-black text-red-600">{squad.distance}km</div>
                            <button
                                onClick={() => handleChallenge(squad.id)}
                                disabled={challengeMutation.isPending}
                                className="text-[10px] font-bold text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                            >
                                {challengeMutation.isPending ? 'Sending...' : 'Challenge'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
