import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCreateSquad } from '@/hooks/squad/useSquad';
import { FORMATIONS } from '@/lib/formations';
import type { Formation } from '@/types';

interface SquadCreationModalProps {
  formation: Formation;
  names: string[];
  avatars: (string | null)[];
  onClose: () => void;
}

export const SquadCreationModal: React.FC<SquadCreationModalProps> = ({
  formation,
  names,
  avatars,
  onClose,
}) => {
  const [squadName, setSquadName] = useState('');
  const [squadCreated, setSquadCreated] = useState<string | null>(null);
  const [squadError, setSquadError] = useState<string | null>(null);
  const { createSquad: createSquadMutation, isCreating: isCreatingSquad } = useCreateSquad();

  const handleCreate = async () => {
    if (!squadName.trim()) { setSquadError('Please enter a squad name'); return; }
    setSquadError(null);
    try {
      const shortName = squadName.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 5).toUpperCase()
        || squadName.trim().slice(0, 5).toUpperCase();
      const squad = await createSquadMutation({ name: squadName.trim(), shortName, homeGround: 'street' });
      setSquadCreated(squad.id);
      const members = names.filter(n => n).map((name, i) => ({
        name,
        avatar: avatars[i],
        position: FORMATIONS[formation]?.[i]?.role || 'ST',
      }));
      localStorage.setItem(`sw_pending_squad_members_${squad.id}`, JSON.stringify(members));
    } catch (e) {
      setSquadError(e instanceof Error ? e.message : 'Failed to create squad. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-5">
        {!squadCreated ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-bold uppercase tracking-widest text-white">Create Squad from Pitch</div>
              <button className="text-gray-400 hover:text-white" onClick={onClose}>Close</button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Name your squad to turn these players into a real team. Each player will get an invite link.
            </p>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 mb-4"
              value={squadName}
              onChange={(e) => { setSquadName(e.target.value); setSquadError(null); }}
              placeholder="Squad name (e.g., Sunday FC)"
            />
            {squadError && <p className="text-xs text-red-400 mb-3">{squadError}</p>}
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              disabled={isCreatingSquad || !squadName.trim()}
              onClick={handleCreate}
            >
              {isCreatingSquad ? 'Creating...' : 'Create Squad'}
            </Button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-bold uppercase tracking-widest text-emerald-400">Squad Created!</div>
              <button className="text-gray-400 hover:text-white" onClick={onClose}>Close</button>
            </div>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg mb-4">
              <p className="text-xs text-emerald-200 mb-2">Share these invite links with your squad:</p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {names.filter(n => n).map((name, i) => {
                  const avatar = avatars[i];
                  return (
                    <div key={i} className="flex items-center justify-between bg-white/5 px-3 py-2 rounded text-xs">
                      <div className="flex items-center gap-2">
                        {avatar ? (
                          <img src={avatar as string} alt={name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center border border-emerald-500/20">
                            <span className="text-[10px] font-bold text-emerald-300">{name[0]}</span>
                          </div>
                        )}
                        <span className="text-white">{name}</span>
                      </div>
                      <button
                        className="text-emerald-400 hover:text-emerald-300"
                        onClick={async () => {
                          const url = `${window.location.origin}/join/${squadCreated}?player=${encodeURIComponent(name)}`;
                          await navigator.clipboard.writeText(url);
                          alert(`Invite link for ${name} copied!`);
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500"
              onClick={() => { window.location.href = `/dashboard/squads/${squadCreated}`; }}
            >
              Go to Squad Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
