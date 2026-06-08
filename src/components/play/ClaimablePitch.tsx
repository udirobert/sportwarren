"use client";

import { useState, useCallback, useEffect } from "react";
import { CheckCircle2, Share2, UserPlus, X } from "lucide-react";
import { ROLE_LABELS } from "@/lib/formations";
import {
  encodePendingClaim,
  getPendingClaim,
  storePendingClaim,
  type PendingClaimContext,
} from "@/lib/claims/context";
import type { ShareClaimRecord } from "@/server/services/tactical-plan-share";

interface SlotData {
  role: string;
  x: number;
  y: number;
}

interface ClaimablePitchProps {
  slug: string;
  slots: SlotData[];
  names: string[];
  color: string;
  meIndex: number | null; // pre-selected from ?me= query param
  initialClaims: ShareClaimRecord[];
  formation: string;
  remixSlug: string | null;
}

interface ClaimSheetProps {
  slot: SlotData;
  slotIndex: number;
  plannedName: string;
  color: string;
  formatLabel: string;
  onClaim: (name: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

type StarterAttribute = {
  label: string;
  value: number;
  tone: string;
};

function roleGroup(role: string): "keeper" | "defender" | "midfielder" | "attacker" {
  if (role === "GK") return "keeper";
  if (role.includes("B") || role === "CDM") return "defender";
  if (role.includes("M")) return "midfielder";
  return "attacker";
}

function buildStarterProfile(role: string): { archetype: string; trait: string; attributes: StarterAttribute[] } {
  const group = roleGroup(role);
  if (group === "keeper") {
    return {
      archetype: "Last line",
      trait: "Shot-stopper profile",
      attributes: [
        { label: "Reflexes", value: 72, tone: "bg-sky-400" },
        { label: "Handling", value: 66, tone: "bg-emerald-400" },
        { label: "Kicking", value: 61, tone: "bg-amber-400" },
      ],
    };
  }
  if (group === "defender") {
    return {
      archetype: role === "CDM" ? "Screen" : "Anchor",
      trait: "Stops counters early",
      attributes: [
        { label: "Defending", value: 74, tone: "bg-emerald-400" },
        { label: "Physical", value: 69, tone: "bg-orange-400" },
        { label: "Passing", value: 58, tone: "bg-sky-400" },
      ],
    };
  }
  if (group === "midfielder") {
    return {
      archetype: role === "CAM" ? "Creator" : "Engine",
      trait: "Keeps the shape alive",
      attributes: [
        { label: "Passing", value: 73, tone: "bg-sky-400" },
        { label: "Dribbling", value: 66, tone: "bg-amber-400" },
        { label: "Defending", value: 59, tone: "bg-emerald-400" },
      ],
    };
  }
  return {
    archetype: role.includes("W") ? "Outlet" : "Finisher",
    trait: "Attacks the decisive space",
    attributes: [
      { label: "Pace", value: 72, tone: "bg-emerald-400" },
      { label: "Shooting", value: 71, tone: "bg-rose-400" },
      { label: "Dribbling", value: 65, tone: "bg-amber-400" },
    ],
  };
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "SW";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function StarterPlayerCard({
  name,
  role,
  color,
  formatLabel,
  compact = false,
}: {
  name: string;
  role: string;
  color: string;
  formatLabel: string;
  compact?: boolean;
}) {
  const profile = buildStarterProfile(role);
  const displayName = name.trim() || "Your name";
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-950/20">
      <div className="relative p-4">
        <div
          className="absolute inset-x-0 top-0 h-24 opacity-25"
          style={{ background: `linear-gradient(135deg, ${color}, transparent 70%)` }}
          aria-hidden="true"
        />
        <div className="relative flex items-start gap-3">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/20 text-xl font-black text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            {initialsFor(displayName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
              Starter player card
            </p>
            <h4 className="mt-1 truncate text-xl font-black tracking-normal text-white">{displayName}</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">
                {role}
              </span>
              <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-200">
                {profile.archetype}
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-2">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">Format</p>
            <p className="mt-1 text-xs font-bold text-white">{formatLabel}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-2">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">Role</p>
            <p className="mt-1 truncate text-xs font-bold text-white">{roleLabel}</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-2">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">Status</p>
            <p className="mt-1 text-xs font-bold text-emerald-200">Claiming</p>
          </div>
        </div>

        {!compact && (
          <div className="relative mt-4 space-y-2">
            {profile.attributes.map((attribute) => (
              <div key={attribute.label} className="flex items-center gap-3">
                <div className="w-20 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  {attribute.label}
                </div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full ${attribute.tone}`} style={{ width: `${attribute.value}%` }} />
                </div>
                <div className="w-6 text-right text-xs font-black tabular-nums text-white">{attribute.value}</div>
              </div>
            ))}
            <p className="pt-1 text-xs font-medium leading-5 text-slate-300">
              {profile.trait}. Verified matches, ratings, and squad activity turn this starter card into a real profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClaimSheet({ slot, slotIndex, plannedName, color, formatLabel, onClaim, onClose, loading }: ClaimSheetProps) {
  const [name, setName] = useState("");
  const previewName = name.trim() || plannedName || `Player ${slotIndex + 1}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onClaim(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
          Claim your spot
        </p>
        <h3 className="mt-2 text-xl font-black text-slate-950">
          Become the {ROLE_LABELS[slot.role] ?? slot.role}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Your name creates a starter player card for this setup. Save it later to turn it into your SportWarren profile.
        </p>
        <div className="mt-5">
          <StarterPlayerCard name={previewName} role={slot.role} color={color} formatLabel={formatLabel} />
        </div>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          <input
            type="text"
            autoFocus
            placeholder="Your name"
            maxLength={28}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "Claiming..." : "Claim spot and card"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ConfirmationSheetProps {
  displayName: string;
  role: string;
  color: string;
  formatLabel: string;
  remixUrl: string;
  onClose: () => void;
  slug: string;
  formation: string;
  positionIndex: number;
  remixSlug: string;
  claimToken: string;
}

function buildSavePlayerCardHref(ctx: PendingClaimContext): string {
  return `/?connect=1&claimContext=${encodeURIComponent(encodePendingClaim(ctx))}`;
}

function ConfirmationSheet({ displayName, role, color, formatLabel, remixUrl, onClose, slug, formation, positionIndex, remixSlug, claimToken }: ConfirmationSheetProps) {
  const [copied, setCopied] = useState(false);
  const claimContext: PendingClaimContext = {
    shareSlug: slug,
    positionIndex,
    role,
    displayName,
    formation,
    remixSlug,
    claimToken,
  };

  const handleShare = async () => {
    const text = `I've claimed ${role} in this SportWarren setup. Here's my spot: ${remixUrl}`;
    try {
      if (navigator.share && window.matchMedia("(max-width: 1024px)").matches) {
        await navigator.share({ title: "My SportWarren spot", text, url: remixUrl });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(
    `I've claimed ${role} in this SportWarren setup: ${remixUrl}`,
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
              Spot confirmed
            </p>
            <h3 className="text-lg font-black text-slate-950">{displayName}, you&apos;re in!</h3>
          </div>
        </div>
        <div className="mt-5">
          <StarterPlayerCard name={displayName} role={role} color={color} formatLabel={formatLabel} compact />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Share your personalised link so teammates see you in the shape. Save the card when you want verified stats, avatar upgrades, and squad history to stick.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Copied!" : "Share my spot"}
          </button>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
          >
            Share on WhatsApp
          </a>
          <a
            href={buildSavePlayerCardHref(claimContext)}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:border-emerald-500 hover:text-emerald-700"
          >
            Save player card
          </a>
        </div>
      </div>
    </div>
  );
}

export function ClaimablePitch({
  slug,
  slots,
  names,
  color,
  meIndex,
  initialClaims,
  formation,
  remixSlug,
}: ClaimablePitchProps) {
  const [claims, setClaims] = useState<ShareClaimRecord[]>(initialClaims);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  // Fix 5: once the user dismisses the auto-opened sheet, don't reopen it on polls.
  const [autoOpenDismissed, setAutoOpenDismissed] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    displayName: string;
    role: string;
    remixUrl: string;
    remixSlug: string;
    positionIndex: number;
    claimToken: string;
  } | null>(null);
  // Fix 1 UI: show a "slot taken" message when the API returns 409.
  const [takenBy, setTakenBy] = useState<{ positionIndex: number; name: string } | null>(null);
  const [pendingSaveContext, setPendingSaveContext] = useState<PendingClaimContext | null>(null);
  const formatLabel = `${slots.length}v${slots.length}`;

  useEffect(() => {
    if (meIndex === null || !remixSlug) return;
    const claim = getPendingClaim();
    if (
      claim &&
      claim.shareSlug === slug &&
      claim.positionIndex === meIndex &&
      claim.remixSlug === remixSlug
    ) {
      setPendingSaveContext(claim);
    }
  }, [meIndex, remixSlug, slug]);

  // Auto-open claim sheet if ?me= is in the URL and not already claimed
  useEffect(() => {
    if (meIndex !== null && !autoOpenDismissed) {
      const alreadyClaimed = claims.some((c) => c.positionIndex === meIndex);
      if (!alreadyClaimed) {
        setActiveSlot(meIndex);
      }
    }
  /* Only run on mount (meIndex and autoOpenDismissed intentionally excluded from dep array) */
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  // Poll for new claims every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/tactics/share/${encodeURIComponent(slug)}/claim`);
        if (res.ok) {
          const data = await res.json() as { ok: boolean; claims: ShareClaimRecord[] };
          if (data.ok) setClaims(data.claims);
        }
      } catch {
        // ignore poll failures
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [slug]);

  const handleClaim = useCallback(
    async (positionIndex: number, displayName: string) => {
      setLoadingSlot(positionIndex);
      try {
        const res = await fetch(`/api/tactics/share/${encodeURIComponent(slug)}/claim`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ positionIndex, displayName }),
        });
        const data = await res.json() as {
          ok: boolean;
          claim: ShareClaimRecord;
          remixUrl?: string;
          claimToken?: string | null;
          alreadyClaimed?: boolean;
          claimedBy?: string;
        };

        if (res.status === 409 || data.alreadyClaimed) {
          // Fix 1: slot was taken between render and submit — show the real claimant.
          setClaims((prev) => {
            const updated = prev.filter((c) => c.positionIndex !== positionIndex);
            if (data.claim) updated.push(data.claim);
            return updated;
          });
          setActiveSlot(null);
          setTakenBy({ positionIndex, name: data.claimedBy ?? data.claim?.displayName ?? "someone else" });
          return;
        }

        if (data.ok && data.claim) {
          const newRemixSlug = data.claim?.remixSlug ?? "";
          const claimToken = data.claimToken ?? "";
          const role = slots[positionIndex]?.role ?? "this position";
          const pendingClaim = newRemixSlug && claimToken ? {
            shareSlug: slug,
            positionIndex,
            role,
            displayName,
            formation,
            remixSlug: newRemixSlug,
            claimToken,
          } satisfies PendingClaimContext : null;
          setClaims((prev) => {
            const updated = prev.filter((c) => c.positionIndex !== positionIndex);
            updated.push(data.claim);
            return updated;
          });
          if (pendingClaim) {
            storePendingClaim(pendingClaim);
            setPendingSaveContext(pendingClaim);
          }
          setActiveSlot(null);
          setConfirmation({
            displayName,
            role,
            remixUrl: data.remixUrl ?? `${window.location.origin}/play/${encodeURIComponent(slug)}?me=${positionIndex}`,
            remixSlug: newRemixSlug,
            positionIndex,
            claimToken,
          });
        }
      } finally {
        setLoadingSlot(null);
      }
    },
    [formation, slug, slots],
  );

  const claimMap = new Map(claims.map((c) => [c.positionIndex, c]));

  return (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-white/30 bg-[linear-gradient(180deg,#197047,#116036)]">
        <div className="absolute left-3 top-3 z-10 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-left text-white shadow-lg backdrop-blur-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-emerald-200">Claim to create</p>
          <p className="mt-0.5 text-xs font-black">Your player card</p>
        </div>
        {/* Pitch markings */}
        <div className="absolute inset-4 rounded border border-white/25" />
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
        <div className="absolute left-4 right-4 top-1/2 h-px bg-white/25" />
        <div className="absolute left-1/2 top-4 h-20 w-32 -translate-x-1/2 rounded-b border-x border-b border-white/25" />
        <div className="absolute bottom-4 left-1/2 h-20 w-32 -translate-x-1/2 rounded-t border-x border-t border-white/25" />

        {slots.map((slot, index) => {
          const claim = claimMap.get(index);
          const isClaimed = Boolean(claim);
          const isMe = meIndex === index;
          const displayName = claim?.displayName ?? names[index] ?? (slot.role === "GK" ? "Keeper" : `Player ${index + 1}`);

          return (
            <button
              key={`${slot.role}-${index}`}
              type="button"
              onClick={() => !isClaimed && setActiveSlot(index)}
              disabled={isClaimed}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-transform hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
              style={{ left: `${slot.y}%`, top: `${100 - slot.x}%` }}
              title={isClaimed ? `${displayName} (claimed)` : `Claim ${slot.role}`}
            >
              <div
                className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 text-xs font-black text-white shadow-lg shadow-black/20"
                style={{
                  backgroundColor: isClaimed ? (isMe ? color : "#64748b") : color,
                  borderColor: isClaimed ? (isMe ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)") : "rgba(255,255,255,0.7)",
                  opacity: isClaimed && !isMe ? 0.8 : 1,
                }}
              >
                {isClaimed ? initialsFor(displayName) : slot.role}
                {!isClaimed && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-emerald-700">
                    <UserPlus className="h-2.5 w-2.5" />
                  </span>
                )}
                {isClaimed && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-emerald-600">
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  </span>
                )}
              </div>
              <div className="max-w-20 rounded bg-black/35 px-1.5 py-0.5 text-center text-[10px] font-bold leading-tight text-white">
                {displayName}
              </div>
            </button>
          );
        })}
      </div>

      {/* Claim status bar */}
      <div className="mt-2 flex items-center justify-between px-1">
        <p className="text-xs font-medium text-white/70">
          {claims.length}/{slots.length} spots claimed
        </p>
        {claims.length < slots.length && (
          <p className="text-xs font-bold text-emerald-300">Tap a slot to claim your spot</p>
        )}
        {claims.length === slots.length && (
          <p className="text-xs font-bold text-emerald-300">Full squad confirmed</p>
        )}
      </div>

      {pendingSaveContext && !confirmation && (
        <div className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-950/40 p-3 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-200">
            Your card is ready
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium leading-5 text-emerald-50/80">
              Save {pendingSaveContext.displayName}&apos;s {pendingSaveContext.role} card to keep the claimed spot attached to your profile.
            </p>
            <a
              href={buildSavePlayerCardHref(pendingSaveContext)}
              className="inline-flex min-h-9 items-center justify-center rounded-md bg-white px-3 py-2 text-xs font-black text-emerald-950 transition hover:bg-emerald-100"
            >
              Save player card
            </a>
          </div>
        </div>
      )}

      {/* Claim sheet */}
      {activeSlot !== null && (
        <ClaimSheet
          slot={slots[activeSlot]}
          slotIndex={activeSlot}
          plannedName={names[activeSlot] ?? ""}
          color={color}
          formatLabel={formatLabel}
          loading={loadingSlot === activeSlot}
          onClaim={(name) => handleClaim(activeSlot, name)}
          onClose={() => {
            setActiveSlot(null);
            // Fix 5: mark dismissed so the 15s poll can't reopen it
            setAutoOpenDismissed(true);
          }}
        />
      )}

      {/* Already-claimed notification — slot was taken between render and submit */}
      {takenBy !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setTakenBy(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <button
              type="button"
              onClick={() => setTakenBy(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
              Slot taken
            </p>
            <h3 className="mt-2 text-xl font-black text-slate-950">
              {takenBy.name} already claimed {slots[takenBy.positionIndex]?.role ?? "this spot"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Pick a different position or ask the organiser to reassign this slot.
            </p>
            <button
              type="button"
              onClick={() => setTakenBy(null)}
              className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:border-emerald-500 hover:text-emerald-700"
            >
              Choose another spot
            </button>
          </div>
        </div>
      )}

      {/* Confirmation sheet */}
      {confirmation && (
        <ConfirmationSheet
          displayName={confirmation.displayName}
          role={confirmation.role}
          color={color}
          formatLabel={formatLabel}
          remixUrl={confirmation.remixUrl}
          onClose={() => setConfirmation(null)}
          slug={slug}
          formation={formation}
          positionIndex={confirmation.positionIndex}
          remixSlug={confirmation.remixSlug}
          claimToken={confirmation.claimToken}
        />
      )}
    </>
  );
}
