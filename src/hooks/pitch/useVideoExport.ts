"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export type VideoExportState = "idle" | "recording" | "processing" | "done";

export interface UseVideoExportOptions {
  /** Target FPS for frame capture. Lower = smaller file. Default: 12 */
  fps?: number;
  /** Maximum recording duration in seconds. Default: 10 */
  maxDuration?: number;
  /** Video MIME type. Falls back if not supported. */
  mimeType?: string;
}

export interface UseVideoExportReturn {
  state: VideoExportState;
  progress: number; // 0-1 during recording
  videoUrl: string | null;
  startRecording: (element: HTMLElement) => Promise<void>;
  stopRecording: () => void;
  downloadVideo: (filename?: string) => void;
  reset: () => void;
  isSupported: boolean;
}

/**
 * Hook for recording a DOM element as a WebM video using
 * html-to-image frame capture + MediaRecorder on an offscreen canvas.
 *
 * Usage:
 *   const video = useVideoExport({ fps: 12, maxDuration: 10 });
 *   video.startRecording(pitchRef.current);
 *   // ... later
 *   video.stopRecording();
 *   video.downloadVideo('my-formation.webm');
 */
export function useVideoExport(
  opts: UseVideoExportOptions = {}
): UseVideoExportReturn {
  const { fps = 12, maxDuration = 10, mimeType: preferredMime } = opts;

  const [state, setState] = useState<VideoExportState>("idle");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(null);

  // Check browser support
  const isSupported =
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameTimerRef.current) clearInterval(frameTimerRef.current);
      if (durationTimerRef.current) clearTimeout(durationTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const getMimeType = useCallback((): string => {
    if (preferredMime && MediaRecorder.isTypeSupported(preferredMime)) {
      return preferredMime;
    }
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
      return "video/webm;codecs=vp9";
    }
    if (MediaRecorder.isTypeSupported("video/webm")) {
      return "video/webm";
    }
    return "video/webm";
  }, [preferredMime]);

  const startRecording = useCallback(
    async (element: HTMLElement) => {
      if (!isSupported || state === "recording") return;

      try {
        setState("recording");
        setProgress(0);
        setVideoUrl(null);
        elementRef.current = element;

        // Get element dimensions
        const rect = element.getBoundingClientRect();
        const width = Math.round(rect.width);
        const height = Math.round(rect.height);

        // Create offscreen canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        canvasRef.current = canvas;
        ctxRef.current = ctx;

        // Create stream from canvas
        const stream = canvas.captureStream(fps);
        streamRef.current = stream;

        // Setup MediaRecorder
        const mimeType = getMimeType();
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 2_500_000,
        });
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setState("done");

          // Cleanup stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
          }
        };

        recorder.start(100); // collect in 100ms chunks

        // Capture frames at the target FPS
        const frameInterval = 1000 / fps;
        startTimeRef.current = Date.now();

        const { toCanvas } = await import("html-to-image");

        const captureFrame = async () => {
          if (!elementRef.current || !ctxRef.current) return;
          try {
            const frameCanvas = await toCanvas(elementRef.current, {
              cacheBust: true,
              pixelRatio: 1,
              backgroundColor: "#0b1322",
            });
            ctxRef.current.clearRect(0, 0, width, height);
            ctxRef.current.drawImage(frameCanvas, 0, 0, width, height);

            // Update progress
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            setProgress(Math.min(1, elapsed / maxDuration));
          } catch {
            // Skip frame on error
          }
        };

        // Capture first frame immediately
        await captureFrame();

        // Schedule subsequent frames
        frameTimerRef.current = setInterval(captureFrame, frameInterval);

        // Auto-stop at max duration
        durationTimerRef.current = setTimeout(() => {
          stopRecording();
        }, maxDuration * 1000);
      } catch (err) {
        console.error("Failed to start recording:", err);
        setState("idle");
      }
    },
    [isSupported, state, fps, maxDuration, getMimeType]
  );

  const stopRecording = useCallback(() => {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearTimeout(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (
      recorderRef.current &&
      recorderRef.current.state !== "inactive"
    ) {
      setState("processing");
      recorderRef.current.stop();
    }
  }, []);

  const downloadVideo = useCallback(
    (filename = "sportwarren-formation.webm") => {
      if (!videoUrl) return;
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = filename;
      a.click();
    },
    [videoUrl]
  );

  const reset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setState("idle");
    setProgress(0);
    chunksRef.current = [];
  }, [videoUrl]);

  return {
    state,
    progress,
    videoUrl,
    startRecording,
    stopRecording,
    downloadVideo,
    reset,
    isSupported,
  };
}
