import React from 'react';
import { FORMATIONS } from '@/lib/formations';
import type { Formation } from '@/types';
import { useImageUploader } from '@/hooks/pitch/useImageUploader';

interface PlayerEditorProps {
  formation: Formation;
  selectedSlotIndex: number;
  names: string[];
  avatars: (string | null)[];
  onNameChange: (index: number, name: string) => void;
  onAvatarChange: (index: number, dataUrl: string) => void;
  onClear: (index: number) => void;
  onClose: () => void;
}

export const PlayerEditor: React.FC<PlayerEditorProps> = ({
  formation,
  selectedSlotIndex,
  names,
  avatars,
  onNameChange,
  onAvatarChange,
  onClear,
  onClose,
}) => {
  const { handleFileInput } = useImageUploader(128);

  return (
    <div className="mt-3 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-300">Edit Player</span>
        <button onClick={onClose} className="text-xs text-white/50 hover:text-white">Close</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
            {avatars[selectedSlotIndex] ? (
              <img src={avatars[selectedSlotIndex] as string} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-green-400">
                {FORMATIONS[formation]?.[selectedSlotIndex]?.role.slice(0, 2) || 'ST'}
              </span>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleFileInput(e, (dataUrl) => onAvatarChange(selectedSlotIndex, dataUrl))}
            />
          </div>
          <input
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            value={names[selectedSlotIndex] || ''}
            onChange={(e) => onNameChange(selectedSlotIndex, e.target.value)}
            placeholder="Name"
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-white/50">Position</span>
          <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">
            {FORMATIONS[formation][selectedSlotIndex]?.role || '?'}
          </span>
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => onClear(selectedSlotIndex)} className="text-xs text-white/40 hover:text-red-400">
          Clear Player
        </button>
      </div>
    </div>
  );
};
