"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, Target, Shield, Zap, MapPin, 
  ChevronDown, ChevronUp, Save, RotateCcw 
} from 'lucide-react';
import type { Tactics, Formation, PlayStyle, TeamInstructions, Player } from '@/types';

interface TacticsBoardProps {
  players: Player[];
  initialTactics?: Tactics;
  onSave?: (tactics: Tactics) => void;
  readOnly?: boolean;
}

// Formation definitions with positions
const FORMATIONS: Record<Formation, Array<{ x: number; y: number; role: string }>> = {
  '4-4-2': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 20, y: 45, role: 'LM' }, { x: 40, y: 45, role: 'CM' }, { x: 60, y: 45, role: 'CM' }, { x: 80, y: 45, role: 'RM' },
    { x: 40, y: 20, role: 'ST' }, { x: 60, y: 20, role: 'ST' },
  ],
  '4-3-3': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 35, y: 50, role: 'CM' }, { x: 50, y: 45, role: 'CM' }, { x: 65, y: 50, role: 'CM' },
    { x: 25, y: 25, role: 'LW' }, { x: 50, y: 20, role: 'ST' }, { x: 75, y: 25, role: 'RW' },
  ],
  '4-2-3-1': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 40, y: 55, role: 'CDM' }, { x: 60, y: 55, role: 'CDM' },
    { x: 25, y: 35, role: 'CAM' }, { x: 50, y: 30, role: 'CAM' }, { x: 75, y: 35, role: 'CAM' },
    { x: 50, y: 15, role: 'ST' },
  ],
  '3-5-2': [
    { x: 50, y: 90, role: 'GK' },
    { x: 30, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 70, y: 70, role: 'CB' },
    { x: 15, y: 50, role: 'LWB' }, { x: 35, y: 50, role: 'CM' }, { x: 50, y: 45, role: 'CM' }, { x: 65, y: 50, role: 'CM' }, { x: 85, y: 50, role: 'RWB' },
    { x: 40, y: 20, role: 'ST' }, { x: 60, y: 20, role: 'ST' },
  ],
  '5-3-2': [
    { x: 50, y: 90, role: 'GK' },
    { x: 15, y: 70, role: 'LWB' }, { x: 32, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 68, y: 70, role: 'CB' }, { x: 85, y: 70, role: 'RWB' },
    { x: 35, y: 45, role: 'CM' }, { x: 50, y: 40, role: 'CM' }, { x: 65, y: 45, role: 'CM' },
    { x: 40, y: 20, role: 'ST' }, { x: 60, y: 20, role: 'ST' },
  ],
  '4-5-1': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 20, y: 50, role: 'LM' }, { x: 35, y: 45, role: 'CM' }, { x: 50, y: 40, role: 'CM' }, { x: 65, y: 45, role: 'CM' }, { x: 80, y: 50, role: 'RM' },
    { x: 50, y: 20, role: 'ST' },
  ],
  '4-1-4-1': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 50, y: 55, role: 'CDM' },
    { x: 20, y: 40, role: 'LM' }, { x: 40, y: 40, role: 'CM' }, { x: 60, y: 40, role: 'CM' }, { x: 80, y: 40, role: 'RM' },
    { x: 50, y: 20, role: 'ST' },
  ],
  '3-4-3': [
    { x: 50, y: 90, role: 'GK' },
    { x: 30, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 70, y: 70, role: 'CB' },
    { x: 20, y: 50, role: 'LM' }, { x: 40, y: 50, role: 'CM' }, { x: 60, y: 50, role: 'CM' }, { x: 80, y: 50, role: 'RM' },
    { x: 25, y: 25, role: 'LW' }, { x: 50, y: 20, role: 'ST' }, { x: 75, y: 25, role: 'RW' },
  ],
  '4-3-1-2': [
    { x: 50, y: 90, role: 'GK' },
    { x: 20, y: 70, role: 'LB' }, { x: 40, y: 70, role: 'CB' }, { x: 60, y: 70, role: 'CB' }, { x: 80, y: 70, role: 'RB' },
    { x: 35, y: 50, role: 'CM' }, { x: 50, y: 50, role: 'CM' }, { x: 65, y: 50, role: 'CM' },
    { x: 50, y: 35, role: 'CAM' },
    { x: 40, y: 20, role: 'ST' }, { x: 60, y: 20, role: 'ST' },
  ],
  '5-4-1': [
    { x: 50, y: 90, role: 'GK' },
    { x: 15, y: 70, role: 'LWB' }, { x: 32, y: 70, role: 'CB' }, { x: 50, y: 70, role: 'CB' }, { x: 68, y: 70, role: 'CB' }, { x: 85, y: 70, role: 'RWB' },
    { x: 25, y: 45, role: 'LM' }, { x: 42, y: 45, role: 'CM' }, { x: 58, y: 45, role: 'CM' }, { x: 75, y: 45, role: 'RM' },
    { x: 50, y: 20, role: 'ST' },
  ],
};

const PLAY_STYLES: PlayStyle[] = ['balanced', 'possession', 'direct', 'counter', 'high_press', 'low_block'];

const PLAY_STYLE_LABELS: Record<PlayStyle, { name: string; description: string; icon: string }> = {
  balanced: { name: 'Balanced', description: 'Mix of attack and defense', icon: '⚖️' },
  possession: { name: 'Possession', description: 'Keep the ball, build slowly', icon: '🎯' },
  direct: { name: 'Direct', description: 'Quick transitions, long balls', icon: '🚀' },
  counter: { name: 'Counter Attack', description: 'Defend deep, attack fast', icon: '⚡' },
  high_press: { name: 'High Press', description: 'Press high, win ball early', icon: '🔥' },
  low_block: { name: 'Low Block', description: 'Defend deep, compact shape', icon: '🛡️' },
};

export const TacticsBoard: React.FC<TacticsBoardProps> = ({
  players,
  initialTactics,
  onSave,
  readOnly = false,
}) => {
  const [tactics, setTactics] = useState<Tactics>(initialTactics || {
    formation: '4-3-3',
    style: 'balanced',
    instructions: {
      width: 'normal',
      tempo: 'normal',
      passing: 'mixed',
      pressing: 'medium',
      defensiveLine: 'normal',
    },
    setPieces: {
      corners: 'near_post',
      freeKicks: 'cross',
      penalties: players[0]?.id || '',
    },
  });

  const [selectedFormation, setSelectedFormation] = useState<Formation>(tactics.formation);
  const [hasChanges, setHasChanges] = useState(false);

  const formationPositions = FORMATIONS[selectedFormation];

  const handleFormationChange = (formation: Formation) => {
    setSelectedFormation(formation);
    setTactics(prev => ({ ...prev, formation }));
    setHasChanges(true);
  };

  const handleStyleChange = (style: PlayStyle) => {
    setTactics(prev => ({ ...prev, style }));
    setHasChanges(true);
  };

  const handleInstructionChange = (key: keyof TeamInstructions, value: string) => {
    setTactics(prev => ({
      ...prev,
      instructions: { ...prev.instructions, [key]: value },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave?.(tactics);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (initialTactics) {
      setTactics(initialTactics);
      setSelectedFormation(initialTactics.formation);
    }
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Formation Display */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-green-600" />
            Formation
          </h3>
          {!readOnly && (
            <select
              value={selectedFormation}
              onChange={(e) => handleFormationChange(e.target.value as Formation)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {Object.keys(FORMATIONS).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          )}
        </div>

        {/* Pitch Visualization */}
        <div className="relative bg-gradient-to-b from-green-600 to-green-700 rounded-xl overflow-hidden" style={{ paddingBottom: '65%' }}>
          {/* Pitch markings */}
          <div className="absolute inset-0">
            {/* Center circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/50 rounded-full" />
            
            {/* Center line */}
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/30 transform -translate-x-1/2" />
            
            {/* Penalty areas */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-24 border-2 border-white/30 border-t-0" />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-24 border-2 border-white/30 border-b-0" />
          </div>

          {/* Player positions */}
          {formationPositions.map((pos, idx) => (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-500">
                <span className="text-xs font-bold text-green-700">{pos.role}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-3">
          {formationPositions.length - 1} outfield players + 1 goalkeeper
        </p>
      </Card>

      {/* Play Style */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Play Style
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PLAY_STYLES.map((style) => {
            const { name, description, icon } = PLAY_STYLE_LABELS[style];
            const isSelected = tactics.style === style;
            return (
              <button
                key={style}
                onClick={() => !readOnly && handleStyleChange(style)}
                disabled={readOnly}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{icon}</div>
                <div className="font-medium text-gray-900">{name}</div>
                <div className="text-xs text-gray-500">{description}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Team Instructions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          Team Instructions
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: 'width', label: 'Width', options: ['narrow', 'normal', 'wide'] },
            { key: 'tempo', label: 'Tempo', options: ['slow', 'normal', 'fast'] },
            { key: 'passing', label: 'Passing', options: ['short', 'mixed', 'long'] },
            { key: 'pressing', label: 'Pressing', options: ['low', 'medium', 'high'] },
            { key: 'defensiveLine', label: 'Defensive Line', options: ['deep', 'normal', 'high'] },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
              <div className="flex space-x-1">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => !readOnly && handleInstructionChange(key as keyof TeamInstructions, opt)}
                    disabled={readOnly}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize transition-all ${
                      tactics.instructions[key as keyof TeamInstructions] === opt
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Action Buttons */}
      {!readOnly && hasChanges && (
        <div className="flex space-x-3">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Tactics
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      )}
    </div>
  );
};
