"use client";

import React from "react";
import { V3Avatar } from "@/components/moments/cards/V3Avatar";

export type HairStyleOption = "short" | "tall" | "shaved" | "cap";

export interface AvatarDraft {
  kitColor: string;
  accentColor: string;
  skinTone: string;
  hairColor: string;
  hairStyle: HairStyleOption;
  number: string;
}

export const DEFAULT_AVATAR_DRAFT: AvatarDraft = {
  kitColor: "#c91022",
  accentColor: "#1c3a5e",
  skinTone: "#c89e7c",
  hairColor: "#2a1a10",
  hairStyle: "short",
  number: "9",
};

const KIT_COLORS = [
  { label: "Red", hex: "#c91022" },
  { label: "Navy", hex: "#1c3a5e" },
  { label: "Sage", hex: "#4a7549" },
  { label: "Mustard", hex: "#d4a437" },
  { label: "Black", hex: "#0a0a0a" },
];

const SKIN_TONES = [
  { label: "Light", hex: "#f0d4b8" },
  { label: "Medium", hex: "#c89e7c" },
  { label: "Dark", hex: "#8b5a3c" },
];

const HAIR_COLORS = [
  { label: "Dark", hex: "#2a1a10" },
  { label: "Brown", hex: "#5c3a1a" },
  { label: "Blond", hex: "#c89048" },
  { label: "Red", hex: "#a64a20" },
];

const HAIR_STYLES: { label: string; value: HairStyleOption }[] = [
  { label: "Short", value: "short" },
  { label: "Tall", value: "tall" },
  { label: "Shaved", value: "shaved" },
  { label: "Cap", value: "cap" },
];

interface AvatarCustomizerProps {
  value: AvatarDraft;
  onChange: (draft: AvatarDraft) => void;
}

function Swatch({
  color,
  label,
  selected,
  onClick,
}: {
  color: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`w-7 h-7 rounded-full border-2 transition-all shrink-0 ${
        selected
          ? "border-white scale-110 shadow-lg"
          : "border-white/20 hover:border-white/50"
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

export function AvatarCustomizer({ value, onChange }: AvatarCustomizerProps) {
  const update = (partial: Partial<AvatarDraft>) =>
    onChange({ ...value, ...partial });

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 2);
    const num = raw === "" ? "" : String(Math.min(99, Math.max(1, parseInt(raw, 10))));
    update({ number: num });
  };

  return (
    <div className="flex gap-5 items-start">
      {/* Live preview */}
      <div className="shrink-0 rounded-2xl overflow-hidden bg-[#f0e8d6] p-1 border border-white/10">
        <V3Avatar
          kitColor={value.kitColor}
          accentColor={value.accentColor}
          skinTone={value.skinTone}
          hairColor={value.hairColor}
          hairStyle={value.hairStyle}
          number={value.number || "0"}
          top={0}
          left={0}
          size={80}
          ringed={false}
        />
      </div>

      {/* Controls */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Kit */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
            Kit
          </label>
          <div className="flex gap-1.5">
            {KIT_COLORS.map((c) => (
              <Swatch
                key={c.hex}
                color={c.hex}
                label={c.label}
                selected={value.kitColor === c.hex}
                onClick={() => update({ kitColor: c.hex })}
              />
            ))}
          </div>
        </div>

        {/* Skin */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
            Skin
          </label>
          <div className="flex gap-1.5">
            {SKIN_TONES.map((c) => (
              <Swatch
                key={c.hex}
                color={c.hex}
                label={c.label}
                selected={value.skinTone === c.hex}
                onClick={() => update({ skinTone: c.hex })}
              />
            ))}
          </div>
        </div>

        {/* Hair color */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
            Hair
          </label>
          <div className="flex gap-1.5">
            {HAIR_COLORS.map((c) => (
              <Swatch
                key={c.hex}
                color={c.hex}
                label={c.label}
                selected={value.hairColor === c.hex}
                onClick={() => update({ hairColor: c.hex })}
              />
            ))}
          </div>
        </div>

        {/* Hair style + number */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
              Style
            </label>
            <div className="flex gap-1">
              {HAIR_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update({ hairStyle: s.value })}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    value.hairStyle === s.value
                      ? "bg-emerald-500/30 text-emerald-300"
                      : "bg-white/5 text-gray-500 hover:bg-white/10"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-16">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
              No.
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={value.number}
              onChange={handleNumberChange}
              placeholder="9"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-sm font-bold text-white text-center focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
