"use client";

import React, { forwardRef } from "react";
import type { Formation, PlayStyle } from "@/types";

interface ShareCardProps {
  formation: Formation;
  playStyle: PlayStyle;
  children: React.ReactNode;
  /** Show the branded watermark. Default: true */
  showWatermark?: boolean;
  /** Show CTA link. Default: true */
  showCta?: boolean;
}

/**
 * Branded export frame for formation cards.
 * Wraps the pitch in a card with SportWarren branding and a CTA.
 * Render this inside the element you capture with html-to-image.
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard(
    {
      formation,
      playStyle,
      children,
      showWatermark = true,
      showCta = true,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className="relative bg-[#0b1322] rounded-xl overflow-hidden"
        style={{ minWidth: 480 }}
      >
        {/* Pitch content */}
        <div className="p-4">{children}</div>

        {/* Bottom brand bar */}
        {showWatermark && (
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/80 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-wider text-green-400 uppercase">
                SportWarren
              </span>
              <span className="text-[10px] text-gray-500">|</span>
              <span className="text-[10px] font-mono text-gray-400">
                {formation}
              </span>
              <span className="text-[10px] text-gray-600 capitalize">
                {playStyle.replace("_", " ")}
              </span>
            </div>
            {showCta && (
              <span className="text-[10px] text-green-400/70 font-bold tracking-wide">
                sportwarren.com/play
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);
