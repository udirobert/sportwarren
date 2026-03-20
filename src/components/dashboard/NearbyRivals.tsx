"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Radar, ShieldAlert } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { useJourneyState } from '@/hooks/useJourneyState';
import { useToast } from '@/contexts/ToastContext';

type GeoState = 'locating' | 'ready' | 'blocked' | 'unsupported';

export const NearbyRivals: React.FC = () => {
  const { hasAccount, isGuest, squadCount } = useJourneyState();
  const { addToast } = useToast();
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoState, setGeoState] = useState<GeoState>('locating');

  useEffect(() => {
    if (!hasAccount || isGuest || typeof navigator === 'undefined') {
      return;
    }

    if (!navigator.geolocation) {
      setGeoState('unsupported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setGeoState('ready');
      },
      () => setGeoState('blocked'),
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000 * 60 * 5,
      }
    );
  }, [hasAccount, isGuest]);

  const { data: squads, isLoading } = trpc.squad.getNearbySquads.useQuery(
    { latitude: coords?.lat || 0, longitude: coords?.lon || 0 },
    { enabled: geoState === 'ready' && !!coords, staleTime: 1000 * 60 * 5 }
  );

  const challengeMutation = trpc.squad.createChallenge.useMutation({
    onSuccess: () => {
      addToast({
        tone: 'success',
        title: 'Challenge Sent',
        message: 'The match request is in the other squad’s queue.',
      });
    },
    onError: (error) => {
      addToast({
        tone: 'error',
        title: 'Challenge Failed',
        message: error.message,
      });
    },
  });

  const handleChallenge = (squadId: string) => {
    challengeMutation.mutate({
      toSquadId: squadId,
      proposedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      message: 'Open to a verified fixture next week?',
    });
  };

  if (!hasAccount || isGuest) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <Radar className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nearby Rivals</h2>
            <p className="mt-1 text-sm text-gray-600">
              Rival discovery becomes useful once you are running a real season with a squad that can issue challenges.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (squadCount === 0) {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <Radar className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nearby Rivals</h2>
            <p className="mt-1 text-sm text-gray-600">
              Create a squad first. Rival discovery only matters once there is a real team that can send or receive challenges.
            </p>
            <div className="mt-4">
              <Link href="/squad">
                <Button size="sm">Open Squad Setup</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (geoState === 'blocked' || geoState === 'unsupported') {
    return (
      <Card className="border-dashed">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-100 p-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nearby Rivals</h2>
            <p className="mt-1 text-sm text-gray-600">
              We need a real location to rank nearby squads. Enable location access or log a match with verified coordinates to build a local rival map.
            </p>
            <div className="mt-4">
              <Link href="/match?mode=capture">
                <Button size="sm" variant="outline">Log a Located Match</Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (geoState === 'locating' || (isLoading && !squads)) {
    return (
      <Card className="animate-pulse">
        <div className="h-4 w-32 rounded bg-gray-200 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-14 rounded bg-gray-100" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-gray-900">Nearby Rivals</h2>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live radius</span>
      </div>

      {!squads || squads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center">
          <p className="text-sm font-semibold text-gray-900">No nearby squads with recent location data yet</p>
          <p className="mt-1 text-sm text-gray-600">
            This list only surfaces squads with real match-location signals. Check back after more verified fixtures are logged nearby.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {squads.map((squad) => (
            <div
              key={squad.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 p-3 transition-colors hover:border-gray-200 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-xs">
                  {squad.shortName}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{squad.name}</div>
                  <div className="text-[10px] text-gray-500">
                    {squad.location} • {squad.memberCount} players
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-red-600">{squad.distance}km</div>
                <button
                  onClick={() => handleChallenge(squad.id)}
                  disabled={challengeMutation.isPending}
                  className="text-[10px] font-bold text-blue-600 hover:underline disabled:opacity-50"
                >
                  {challengeMutation.isPending ? 'Sending...' : 'Challenge'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
