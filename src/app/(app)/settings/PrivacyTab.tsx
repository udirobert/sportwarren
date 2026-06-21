'use client';

/**
 * Privacy tab — single home for the privacy gradient controls.
 *
 *   - Player-level: discoverable + handle (the /player/{handle} surface)
 *   - Captain-level (when applicable): per-squad visibility toggle
 *     (private / group_only / public)
 *
 * Lives at `(app)/settings?tab=privacy`. Extracted from settings/page.tsx
 * deliberately — settings is already a god file (880+ lines) and we
 * don't want to bloat it further.
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eye, EyeOff, Globe, Lock, Users } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { useToast } from '@/contexts/ToastContext';

type Visibility = 'private' | 'group_only' | 'public';

interface CaptainSquad {
  id: string;
  name: string;
  visibility: Visibility;
}

export function PrivacyTab({
  initialDiscoverable,
  initialHandle,
  captainSquads,
  onUpdated,
}: {
  initialDiscoverable: boolean;
  initialHandle: string | null;
  captainSquads: CaptainSquad[];
  onUpdated?: () => void;
}) {
  const toast = useToast();
  const [discoverable, setDiscoverable] = useState(initialDiscoverable);
  const [handle, setHandle] = useState(initialHandle ?? '');
  const [savingPlayer, setSavingPlayer] = useState(false);

  const updatePrivacy = trpc.player.updatePrivacy.useMutation();
  const setSquadVisibility = trpc.squad.setVisibility.useMutation();

  const onSavePlayer = async () => {
    setSavingPlayer(true);
    try {
      await updatePrivacy.mutateAsync({
        discoverable,
        handle: handle.trim().length > 0 ? handle.trim().toLowerCase() : null,
      });
      toast.addToast({ tone: 'success', message: 'Privacy settings saved.' });
      onUpdated?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      toast.addToast({ tone: 'error', message });
    } finally {
      setSavingPlayer(false);
    }
  };

  const onSquadVisibilityChange = async (squadId: string, visibility: Visibility) => {
    try {
      await setSquadVisibility.mutateAsync({ squadId, visibility });
      toast.addToast({ tone: 'success', message: `Squad set to ${visibility.replace('_', ' ')}.` });
      onUpdated?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update';
      toast.addToast({ tone: 'error', message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Player-level discoverability */}
      <Card>
        <div className="p-1">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-mustard/15 flex items-center justify-center flex-shrink-0">
              <Eye className="w-4 h-4 text-mustard-700" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Your card
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Whether your individual card is visible at <code>/player/&lt;handle&gt;</code>.
                Independent of any squad's visibility — your card is yours.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={discoverable}
              onChange={(e) => setDiscoverable(e.target.checked)}
              className="mt-1 w-4 h-4"
            />
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Discoverable
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Lets your public card page resolve. Future: also surfaces you
                to scouts on the (not-yet-built) talent pool.
              </div>
            </div>
          </label>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Handle (URL slug)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">/player/</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="your-handle"
                maxLength={30}
                className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Lowercase, numbers, dashes. 3–30 chars. Globally unique.
            </div>
          </div>

          <Button
            onClick={onSavePlayer}
            disabled={savingPlayer || (handle.length > 0 && handle.length < 3)}
          >
            {savingPlayer ? 'Saving…' : 'Save player privacy'}
          </Button>
        </div>
      </Card>

      {/* Squad-level visibility (only shown if user captains any squad) */}
      {captainSquads.length > 0 && (
        <Card>
          <div className="p-1">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-navy/15 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-navy-700" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Your squads
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Squads you captain. Toggle visibility per squad. Default is
                  private — preservation is intimate; you opt up.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {captainSquads.map((squad) => (
                <div
                  key={squad.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {squad.name}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-gray-500">
                      {squad.visibility.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <VisibilityRadio
                      label="Private"
                      icon={Lock}
                      description="Members only"
                      isActive={squad.visibility === 'private'}
                      onClick={() => onSquadVisibilityChange(squad.id, 'private')}
                    />
                    <VisibilityRadio
                      label="Group-only"
                      icon={EyeOff}
                      description="Roster public, cards hidden"
                      isActive={squad.visibility === 'group_only'}
                      onClick={() => onSquadVisibilityChange(squad.id, 'group_only')}
                    />
                    <VisibilityRadio
                      label="Public"
                      icon={Globe}
                      description="Roster + cards public"
                      isActive={squad.visibility === 'public'}
                      onClick={() => onSquadVisibilityChange(squad.id, 'public')}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Explainer */}
      <Card>
        <div className="p-1 text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p className="font-semibold text-gray-900 dark:text-white">The privacy gradient</p>
          <p>
            <strong>Squad visibility</strong> controls who can see your group's
            page. <strong>Discoverable</strong> controls who can see YOUR card.
            They're decoupled on purpose — a kid in São Paulo can join a
            private kickabout but still publish their own card.
          </p>
          <p>
            Scouts (when that ships) only see the intersection: squads with{' '}
            <em>public</em> visibility AND players with <em>discoverable=on</em>.
          </p>
        </div>
      </Card>
    </div>
  );
}

function VisibilityRadio({
  label,
  icon: Icon,
  description,
  isActive,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 border rounded text-left transition-colors ${
        isActive
          ? 'border-mustard bg-mustard/10 text-gray-900 dark:text-white'
          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
      }`}
    >
      <Icon className={`w-4 h-4 mb-2 ${isActive ? 'text-mustard-700' : 'text-gray-500'}`} />
      <div className="text-xs font-semibold uppercase tracking-wider">{label}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </button>
  );
}
