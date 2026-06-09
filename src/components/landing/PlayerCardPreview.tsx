"use client";

import React, { useMemo, useState } from "react";
import {
  Sparkles, ArrowRight, CheckCircle2, Lock, Camera,
} from "lucide-react";
import { ATTRIBUTE_KEYS } from "@/server/services/personalization/twin-types";
import type { PlayerPosition } from "@/types";
import { trackCoreGrowthEvent, trackFeatureUsed, trackEvent } from "@/lib/analytics";
import { storePendingPersona } from "@/lib/claims/persona";
import { ATTRIBUTE_DISPLAY, ATTRIBUTE_BAR_TONES } from "@/lib/attributes/display";
import { PROVISIONAL_ATTRIBUTES, VERIFIED_DELTAS } from "@/lib/attributes/provisional";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";

const POSITION_LABELS: Record<PlayerPosition, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  WG: "Winger",
  ST: "Striker",
};

const POSITIONS: PlayerPosition[] = ["GK", "DF", "MF", "WG", "ST"];

function clamp(n: number): number {
  return Math.max(1, Math.min(99, Math.round(n)));
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SW";
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

interface PlayerCardPreviewProps {
  /** Trigger the auth/conversion flow (opens sign-in / sign-up). */
  onSave?: () => void;
  /** When true, the viewer already has an account (changes the CTA copy/intent). */
  authed?: boolean;
  /** Called when the visitor changes their name on the card. */
  onNameChange?: (name: string) => void;
  /** Called when the visitor changes their position on the card. */
  onPositionChange?: (position: PlayerPosition) => void;
  /**
   * Current formation selected on the playground (e.g. "4-4-2"). Read on save
   * so the persona context carries formation through to onboarding, letting
   * Path D (playground → save card → personalize) prefill the formation step.
   */
  currentFormation?: string | null;
}

/**
 * The persona-first hero artifact: a provisional player card the visitor builds in
 * seconds. The "provisional → verified" reveal dramatizes how squad-verified matches
 * turn an estimate into a real, trusted profile. Saving the card is the conversion
 * moment — it triggers account creation.
 */
export const PlayerCardPreview: React.FC<PlayerCardPreviewProps> = ({ onSave, authed = false, onNameChange, onPositionChange, currentFormation }) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState<PlayerPosition>("MF");
  const [verified, setVerified] = useState(false);
  const avatar = useAvatarUpload();

  const handleNameChange = (value: string) => {
    setName(value);
    onNameChange?.(value);
    if (value.trim().length > 0 && name.trim().length === 0) {
      trackEvent('card_name_entered', { position });
    }
  };

  const handlePositionChange = (value: PlayerPosition) => {
    setPosition(value);
    onPositionChange?.(value);
    trackEvent('card_position_selected', { position: value });
  };

  const displayName = name.trim() || "Your name";

  const attributes = useMemo(() => {
    const base = PROVISIONAL_ATTRIBUTES[position];
    const delta = VERIFIED_DELTAS[position];
    return ATTRIBUTE_KEYS.map((key) => {
      const provisional = base[key];
      const value = verified ? clamp(provisional + (delta[key] ?? 0)) : provisional;
      return { key, provisional, value, delta: delta[key] ?? 0 };
    });
  }, [position, verified]);

  const overall = useMemo(
    () => clamp(attributes.reduce((sum, a) => sum + a.value, 0) / attributes.length),
    [attributes],
  );

  const handleSave = () => {
    storePendingPersona({
      displayName,
      position,
      formation: currentFormation ?? undefined,
      savedAt: Date.now(),
      avatarBase64: avatar.base64 ?? undefined,
      avatarMimeType: avatar.mimeType ?? undefined,
    });
    trackFeatureUsed("player_card_save_clicked", { position, named: name.trim().length > 0, formation: currentFormation ?? null, hasAvatar: !!avatar.base64 });
    trackCoreGrowthEvent("player_card_save_intent", { position, authed, formation: currentFormation ?? null });
    onSave?.();
  };

  return (
    <div className="mx-auto mb-8 w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl shadow-emerald-500/5">
        <div className="relative p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="relative">
              {avatar.previewUrl ? (
                <img
                  src={avatar.previewUrl}
                  alt="Your avatar"
                  className="h-16 w-16 shrink-0 rounded-xl border border-emerald-400/40 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15 text-xl font-black text-emerald-200 shadow-lg">
                  {initialsFor(displayName)}
                </div>
              )}
              <button
                type="button"
                onClick={avatar.onClick}
                className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-emerald-500 text-white shadow-lg transition hover:scale-110 hover:bg-emerald-400"
                title="Upload photo"
              >
                <Camera className="h-3 w-3" />
              </button>
              <input
                ref={avatar.fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={avatar.onChange}
                className="hidden"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Your player card
              </p>
              <h4 className="mt-0.5 truncate text-lg font-black text-white">{displayName}</h4>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                  {position}
                </span>
                <span className="text-[10px] text-slate-400">{POSITION_LABELS[position]}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black tabular-nums text-white transition-all duration-500">{overall}</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Overall</div>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-3 flex items-center gap-2">
            {verified ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> Verified by squad
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-200">
                <Lock className="h-3 w-3" /> Provisional
              </span>
            )}
          </div>

          {/* Attributes */}
          <div className="mt-3 space-y-2">
            {attributes.map((attr) => {
              const meta = ATTRIBUTE_DISPLAY[attr.key];
              const Icon = meta.Icon;
              return (
                <div key={attr.key} className="flex items-center gap-2.5">
                  <div className="flex w-24 items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    <Icon className="h-3 w-3" />
                    {meta.label}
                  </div>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${ATTRIBUTE_BAR_TONES[attr.key]} transition-all duration-700 ease-out ${verified ? "" : "opacity-60"}`}
                      style={{ width: `${attr.value}%` }}
                    />
                  </div>
                  <div className="flex w-10 items-center justify-end gap-1 text-xs font-black tabular-nums text-white">
                    {verified && attr.delta !== 0 && (
                      <span className={`text-[9px] font-bold ${attr.delta > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {attr.delta > 0 ? `+${attr.delta}` : attr.delta}
                      </span>
                    )}
                    <span className="transition-all duration-500">{attr.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] leading-5 text-slate-400">
            {verified
              ? "Squad-verified matches and teammate ratings turned your estimate into a real, trusted profile."
              : "These are estimates. Your squad verifies real matches and the stats become real."}
          </p>
        </div>

        {/* Controls */}
        <div className="border-t border-white/10 bg-slate-950/50 p-4 space-y-3">
          <input
            type="text"
            placeholder="Your name"
            maxLength={28}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm font-medium text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="grid grid-cols-5 gap-1">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => handlePositionChange(pos)}
                className={`rounded-md py-1.5 text-[11px] font-bold transition-all ${
                  position === pos
                    ? "bg-emerald-500/25 text-emerald-200 shadow-sm"
                    : "bg-white/[0.06] text-slate-400 hover:text-emerald-200"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              className="group inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition hover:scale-[1.02] hover:shadow-green-500/50"
            >
              <Sparkles className="h-4 w-4" />
              {authed ? "Open my profile" : "Save my player card"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setVerified((v) => !v);
                trackFeatureUsed("player_card_reveal_toggled", { position, toVerified: !verified });
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2.5 text-xs font-bold text-gray-200 transition hover:bg-white/[0.1]"
            >
              {verified ? "Show provisional" : "See how stats become real"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
