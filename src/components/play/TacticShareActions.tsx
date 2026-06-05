"use client";

import { useState } from "react";
import Link from "next/link";
import { Clipboard, MessageCircle, Save, Trophy } from "lucide-react";
import { trackCoreGrowthEvent, trackFeatureUsed } from "@/lib/analytics";

interface TacticShareActionsProps {
  slug: string;
  shareUrl: string;
  shareText: string;
  saveHref: string;
  matchHref: string;
  formation: string;
  style: string;
  size: number;
}

export function TacticShareActions({
  slug,
  shareUrl,
  shareText,
  saveHref,
  matchHref,
  formation,
  style,
  size,
}: TacticShareActionsProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "shared" | "error">("idle");

  const recordCopy = async (method: "clipboard" | "web_share" | "whatsapp") => {
    fetch("/api/tactics/share", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, method }),
    }).catch(() => {});

    trackFeatureUsed("tactic_share_opened", { slug, formation, style, size, method });
    trackCoreGrowthEvent("playground_plan_shared", {
      slug,
      formation,
      style,
      size,
      source: `play_page_${method}`,
    });
  };

  const handleCopy = async () => {
    try {
      if (navigator.share && window.matchMedia("(max-width: 1024px)").matches) {
        await navigator.share({
          title: "SportWarren tactical setup",
          text: shareText,
          url: shareUrl,
        });
        setCopyState("shared");
        await recordCopy("web_share");
        return;
      }

      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopyState("copied");
      await recordCopy("clipboard");
    } catch {
      setCopyState("error");
    }
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Link
        href={saveHref}
        onClick={() => trackCoreGrowthEvent("playground_setup_saved", { slug, formation, style, size, source: "play_page" })}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-500"
      >
        <Save className="h-4 w-4" />
        Save this setup
      </Link>
      <Link
        href={matchHref}
        onClick={() => trackFeatureUsed("log_match_from_shared_plan_clicked", { slug, formation, style, size })}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-emerald-500 hover:text-emerald-700"
      >
        <Trophy className="h-4 w-4" />
        Log result
      </Link>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-900 transition hover:border-emerald-500 hover:text-emerald-700"
      >
        <Clipboard className="h-4 w-4" />
        {copyState === "copied" ? "Copied" : copyState === "shared" ? "Shared" : "Copy invite"}
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        onClick={() => recordCopy("whatsapp")}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
      {copyState === "error" && (
        <p className="text-xs font-medium text-rose-600 sm:basis-full">
          Couldn&apos;t open sharing on this device. Use the WhatsApp button or copy from your browser bar.
        </p>
      )}
    </div>
  );
}
