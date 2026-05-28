"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useVideoExport } from "@/hooks/pitch/useVideoExport";
import { Download, Share2, Video, Square, Loader2, Check } from "lucide-react";
import type { Formation } from "@/types";

interface ExportPanelProps {
  pitchRef: React.RefObject<HTMLElement | null>;
  formation: Formation;
  playStyle: string;
  /** Called when a share action completes */
  onShare?: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  pitchRef,
  formation,
  playStyle,
  onShare,
}) => {
  const video = useVideoExport({ fps: 12, maxDuration: 8 });
  const [pngExporting, setPngExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExportPng = useCallback(async () => {
    if (!pitchRef.current || pngExporting) return;
    setPngExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(pitchRef.current, {
        quality: 0.95,
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0b1322",
      });
      const link = document.createElement("a");
      link.download = `sportwarren-${formation}-${playStyle}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setPngExporting(false);
    }
  }, [pitchRef, formation, playStyle, pngExporting]);

  const handleShare = useCallback(async () => {
    if (!pitchRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(pitchRef.current, {
        quality: 0.95,
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0b1322",
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `sportwarren-${formation}.png`, {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My SportWarren Formation",
          text: `Check out my ${formation} setup! Can you beat it?`,
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      onShare?.();
    } catch (err) {
      console.error("Share failed:", err);
    }
  }, [pitchRef, formation, onShare]);

  const handleVideoToggle = useCallback(async () => {
    if (video.state === "recording") {
      video.stopRecording();
    } else if (video.state === "idle" || video.state === "done") {
      video.reset();
      if (pitchRef.current) {
        await video.startRecording(pitchRef.current);
      }
    }
  }, [video, pitchRef]);

  return (
    <div className="flex items-center gap-1.5">
      {/* PNG Download */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleExportPng}
        disabled={pngExporting}
        className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
        title="Download PNG"
      >
        {pngExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
      </Button>

      {/* Share */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="h-7 px-2 text-gray-400 hover:text-white hover:bg-white/10"
        title="Share"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
      </Button>

      {/* Video Record */}
      {video.isSupported && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVideoToggle}
          className={`h-7 px-2 transition-colors ${
            video.state === "recording"
              ? "text-red-400 hover:text-red-300 hover:bg-red-500/10"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title={
            video.state === "recording"
              ? "Stop recording"
              : video.state === "done"
              ? "Record again"
              : "Record animation"
          }
        >
          {video.state === "recording" ? (
            <Square className="w-3.5 h-3.5" fill="currentColor" />
          ) : video.state === "processing" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Video className="w-3.5 h-3.5" />
          )}
        </Button>
      )}

      {/* Download video (when ready) */}
      {video.state === "done" && video.videoUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            video.downloadVideo(
              `sportwarren-${formation}-${playStyle}.webm`
            )
          }
          className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-500/10"
          title="Download video"
        >
          <Download className="w-3.5 h-3.5" />
        </Button>
      )}

      {/* Recording progress bar */}
      {video.state === "recording" && (
        <div className="flex items-center gap-1.5 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <div className="w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 rounded-full transition-all duration-300"
              style={{ width: `${video.progress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
