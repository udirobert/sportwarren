import type { AttributeKey } from "@/server/services/personalization/twin-types";
import {
  Shield, Swords, Target, TrendingUp, Zap, Star,
} from "lucide-react";
import React from "react";

export interface AttributeDisplayMeta {
  label: string;
  Icon: React.FC<{ className?: string }>;
}

export const ATTRIBUTE_DISPLAY: Record<AttributeKey, AttributeDisplayMeta> = {
  pace:      { label: "Pace",      Icon: Zap },
  shooting:  { label: "Shooting",  Icon: Target },
  passing:   { label: "Passing",   Icon: TrendingUp },
  dribbling: { label: "Dribbling", Icon: Star },
  defending: { label: "Defending", Icon: Shield },
  physical:  { label: "Physical",  Icon: Swords },
};

/**
 * Canonical bar-fill Tailwind class per attribute. Shared by the landing
 * `PlayerCardPreview` (provisional hero card) and the authed
 * `PlayerIdentityCard` (profile surface) so the two visualizations
 * never drift in tone. The `-500` variants are the more permanent brand
 * palette owned by the identity card.
 */
export const ATTRIBUTE_BAR_TONES: Record<AttributeKey, string> = {
  pace:      "bg-emerald-500",
  shooting:  "bg-red-500",
  passing:   "bg-sky-500",
  dribbling: "bg-amber-500",
  defending: "bg-violet-500",
  physical:  "bg-orange-500",
};

