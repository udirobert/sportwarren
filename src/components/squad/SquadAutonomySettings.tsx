"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Shield, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc-client";

interface Props {
  squadId: string | undefined;
}

const LEVEL_LABELS: Record<string, string> = {
  observe: "🔍 Observe (read-only)",
  integrate: "🔗 Integrate (scout only)",
  automate: "🤖 Automate (full spend)",
};

const LEVEL_DESCRIPTIONS: Record<string, string> = {
  observe: "Search marketplace, check budget and status. No scouting, hiring, or payments.",
  integrate: "Can scout opponents within budget. Hiring and payments blocked.",
  automate: "Full spending authority within configured budget limits. Suits competitive squads.",
};

const ACTIONS_WITH_LIMITS = ['scout', 'hire', 'pay', 'search', 'status', 'budget'] as const;

export function SquadAutonomySettings({ squadId }: Props) {
  const utils = trpc.useUtils();

  const { data: config, isLoading } = trpc.squad.getAutonomyConfig.useQuery(
    { squadId: squadId || '' },
    { enabled: !!squadId },
  );

  const setLevel = trpc.squad.setAutonomyLevel.useMutation({
    onSuccess: () => utils.squad.getAutonomyConfig.invalidate(),
  });
  const setConfirmation = trpc.squad.setAutonomyConfirmation.useMutation({
    onSuccess: () => utils.squad.getAutonomyConfig.invalidate(),
  });
  const setActionLimit = trpc.squad.setActionMinLevel.useMutation({
    onSuccess: () => utils.squad.getAutonomyConfig.invalidate(),
  });
  const resetConfig = trpc.squad.resetAutonomyConfig.useMutation({
    onSuccess: () => utils.squad.getAutonomyConfig.invalidate(),
  });

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!squadId) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <Shield className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>Join or create a squad to configure autonomy settings.</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6 text-center text-gray-500">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </Card>
    );
  }

  const level = config?.level || 'automate';
  const confirmRequired = config?.requiresConfirmation ?? false;
  const overrides = config?.actionOverrides || {};

  const handleLevelChange = (newLevel: string) => {
    setSelectedLevel(newLevel);
    setLevel.mutate({ squadId, level: newLevel as any });
  };

  const handleConfirmationToggle = () => {
    setConfirmation.mutate({ squadId, required: !confirmRequired });
  };

  const handleActionOverride = (action: string, newLevel: string | null) => {
    setActionLimit.mutate({
      squadId,
      action: action as any,
      level: newLevel as any,
    });
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      return;
    }
    resetConfig.mutate({ squadId });
    setResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Agent Autonomy</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Controls what your squad&apos;s autonomous Kite agent can do without human approval.
          Configured via WhatsApp (<code>autonomy</code> command) or here.
        </p>

        <div className="space-y-4">
          {(['observe', 'integrate', 'automate'] as const).map((lvl) => (
            <label
              key={lvl}
              className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                level === lvl
                  ? 'border-blue-500 bg-blue-50'
                  : selectedLevel === lvl
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="autonomy-level"
                  value={lvl}
                  checked={level === lvl}
                  onChange={() => handleLevelChange(lvl)}
                  className="w-4 h-4 text-blue-600 accent-blue-600"
                />
                <div>
                  <div className="font-semibold text-gray-900">{LEVEL_LABELS[lvl]}</div>
                  <div className="text-sm text-gray-600">{LEVEL_DESCRIPTIONS[lvl]}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Confirmation Toggle */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Require Spend Confirmation</h3>
            <p className="text-sm text-gray-600 mt-1">
              When enabled, the agent asks &ldquo;Reply yes to confirm&rdquo; before every
              paid action (scout, hire, pay).
            </p>
          </div>
          <button
            onClick={handleConfirmationToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              confirmRequired ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                confirmRequired ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Per-action Overrides */}
      <Card className="p-4 md:p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Per-Action Limits</h3>
        <p className="text-sm text-gray-600 mb-4">
          Override the minimum autonomy level for specific actions. Leave as &ldquo;Default&rdquo;
          to use the squad level.
        </p>

        <div className="space-y-3">
          {ACTIONS_WITH_LIMITS.map((action) => {
            const currentOverride = overrides[action];
            return (
              <div key={action} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50">
                <div className="capitalize font-medium text-gray-900 min-w-[80px]">{action}</div>
                <select
                  value={currentOverride || ''}
                  onChange={(e) => handleActionOverride(action, e.target.value || null)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-900"
                >
                  <option value="">Default</option>
                  <option value="observe">Observe</option>
                  <option value="integrate">Integrate</option>
                  <option value="automate">Automate</option>
                </select>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Reset */}
      <Card className="p-4 md:p-6 border-red-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-2">
            {resetConfirm ? (
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            ) : (
              <RotateCcw className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {resetConfirm ? 'Confirm Reset' : 'Reset to Defaults'}
              </h3>
              <p className="text-sm text-gray-600">
                {resetConfirm
                  ? 'This will clear all squad autonomy overrides (level, confirmation, per-action limits).'
                  : 'Clear all autonomy overrides and revert to global environment defaults.'}
              </p>
            </div>
          </div>
          <Button
            variant={resetConfirm ? 'danger' : 'outline'}
            size="sm"
            onClick={handleReset}
            loading={resetConfig.isPending}
          >
            {resetConfirm ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Confirm Reset
              </span>
            ) : (
              'Reset'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
