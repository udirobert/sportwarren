"use client";

import { useState, useCallback, useEffect } from "react";
import { CheckCircle2, UserPlus, X } from "lucide-react";
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
}

interface ClaimSheetProps {
  slot: SlotData;
  onClaim: (name: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

function ClaimSheet({ slot, onClaim, onClose, loading }: ClaimSheetProps) {
  const [name, setName] = useState("");

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
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
          Claim position
        </p>
        <h3 className="mt-2 text-xl font-black text-slate-950">
          You&apos;re taking {slot.role}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter your name so the organiser sees you&apos;ve confirmed.
        </p>
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
            {loading ? "Claiming…" : "Confirm spot"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface ConfirmationSheetProps {
  displayName: string;
  role: string;
  remixUrl: string;
  onClose: () => void;
}

function ConfirmationSheet({ displayName, role, remixUrl, onClose }: ConfirmationSheetProps) {
  const [copied, setCopied] = useState(false);

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
      <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
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
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Share your personalised link so everyone knows you&apos;ve confirmed.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
          >
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
}: ClaimablePitchProps) {
  const [claims, setClaims] = useState<ShareClaimRecord[]>(initialClaims);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState<{
    displayName: string;
    role: string;
    remixUrl: string;
  } | null>(null);

  // Auto-open claim sheet if ?me= is in the URL and not already claimed
  useEffect(() => {
    if (meIndex !== null) {
      const alreadyClaimed = claims.some((c) => c.positionIndex === meIndex);
      if (!alreadyClaimed) {
        setActiveSlot(meIndex);
      }
    }
  }, [meIndex, claims]);

  // Poll for new claims every 15s (simple, no websocket needed at this scale)
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
          remixUrl: string;
          alreadyClaimed: boolean;
        };
        if (data.ok) {
          setClaims((prev) => {
            const updated = prev.filter((c) => c.positionIndex !== positionIndex);
            updated.push(data.claim);
            return updated;
          });
          setActiveSlot(null);
          setConfirmation({
            displayName,
            role: slots[positionIndex]?.role ?? "this position",
            remixUrl: data.remixUrl,
          });
        }
      } finally {
        setLoadingSlot(null);
      }
    },
    [slug, slots],
  );

  const claimMap = new Map(claims.map((c) => [c.positionIndex, c]));

  return (
    <>
      <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-white/30 bg-[linear-gradient(180deg,#197047,#116036)]">
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
                {slot.role}
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

      {/* Claim sheet */}
      {activeSlot !== null && (
        <ClaimSheet
          slot={slots[activeSlot]}
          loading={loadingSlot === activeSlot}
          onClaim={(name) => handleClaim(activeSlot, name)}
          onClose={() => setActiveSlot(null)}
        />
      )}

      {/* Confirmation sheet */}
      {confirmation && (
        <ConfirmationSheet
          displayName={confirmation.displayName}
          role={confirmation.role}
          remixUrl={confirmation.remixUrl}
          onClose={() => setConfirmation(null)}
        />
      )}
    </>
  );
}
