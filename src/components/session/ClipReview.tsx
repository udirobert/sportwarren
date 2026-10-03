'use client';

/**
 * ClipReview — broadcast overlay on session footage (pilot).
 *
 * `<video>` with a `<canvas>` on top, synced per animation frame to the
 * nearest sampled detection (see docs/plans/2026-10-03-clip-review-overlay.md).
 * Base layer: rings under every player, ball ring, carrier ring, dashed
 * pressure line with est. distance, PRESSURE badge. Style layer: one of five
 * overlay styles (Marker / Pundit / Hype / Strap / Data) built as overlay
 * items from the pressure events. Hype layer: slow-mo pulse + flash on
 * squeeze entry, per-event replay. Export: the same draw path composited
 * onto a capture canvas → WebM for the group chat. Commentary: one
 * commentator line per event, explicit tap, deterministic fallback.
 *
 * Privacy: shows ring indices only — never names, numbers, or tokens.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  PRESSURE_THRESHOLD_M,
  detectPressureEvents,
  frameAt,
  pressureForFrame,
  type ClipFrame,
  type PressureEvent,
} from '@/lib/clip-review/detections';
import { OVERLAY_STYLES, buildOverlay, itemsAt, type OverlayStyleId } from '@/lib/clip-review/styles';
import { drawClipFrame } from '@/lib/clip-review/overlay-draw';
import { exportFileExtension, pickExportMime } from '@/lib/clip-review/export';
import { PALETTE, TYPE, TRACKING, V3CTAButton, V3HollowCard, V3MiniButton } from '@/components/v3';
import { commentOnPressure } from '@/app/session/[sessionId]/analysis/[playerToken]/_actions';

interface ClipReviewProps {
  src: string;
  detections: ClipFrame[];
  pitchWidthM?: number;
  sessionId?: string;
  playerToken?: string;
}

const SLOWMO_RATE = 0.35;
const SLOWMO_MS = 1200;

export function ClipReview({ src, detections, pitchWidthM = 50, sessionId, playerToken }: ClipReviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevUnderRef = useRef(false);
  const lastSeekRef = useRef(0);
  const slowmoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [style, setStyle] = useState<OverlayStyleId>('role-marker');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localSrc, setLocalSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [flash, setFlash] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [calls, setCalls] = useState<Record<string, { pending: boolean; line?: string }>>({});
  const playingSrc = localSrc ?? src;
  const canComment = Boolean(sessionId && playerToken);

  // State mirrors for the rAF closure — assigned alongside state below.
  const flashRef = useRef(flash);
  flashRef.current = flash;
  const exportingRef = useRef(exporting);
  exportingRef.current = exporting;

  const events = useMemo(() => detectPressureEvents(detections, { pitchWidthM }), [detections, pitchWidthM]);
  const clipDuration = duration || detections[detections.length - 1]?.t || 8;
  const overlayItems = useMemo(
    () => buildOverlay(events, clipDuration, style),
    [events, clipDuration, style],
  );
  const activeBlurb = OVERLAY_STYLES.find((s) => s.id === style)?.blurb ?? '';
  // Null on browsers with no MediaRecorder (older mobile Safari) — the
  // export action hides itself instead of failing loudly.
  const exportMime = useMemo(
    () =>
      typeof MediaRecorder === 'undefined'
        ? null
        : pickExportMime((m) => MediaRecorder.isTypeSupported(m)),
    [],
  );

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.clientWidth > 0) {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const w = video.clientWidth;
        const h = video.clientHeight;
        if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
          canvas.width = Math.round(w * dpr);
          canvas.height = Math.round(h * dpr);
        }
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, w, h);
          const frame = frameAt(detections, video.currentTime);
          if (frame) {
            const pressure = pressureForFrame(frame, pitchWidthM);
            // Hype pulse: entering a squeeze drops to slow-mo + white flash.
            const under = pressure?.under ?? false;
            if (under && !prevUnderRef.current && !video.paused && !exportingRef.current) {
              if (Date.now() - lastSeekRef.current > 800) {
                video.playbackRate = SLOWMO_RATE;
                setFlash(true);
                if (slowmoTimerRef.current) clearTimeout(slowmoTimerRef.current);
                slowmoTimerRef.current = setTimeout(() => {
                  if (videoRef.current) videoRef.current.playbackRate = 1;
                  setFlash(false);
                }, SLOWMO_MS);
              }
            }
            prevUnderRef.current = under;
            drawClipFrame(ctx, w, h, {
              frame,
              items: itemsAt(overlayItems, video.currentTime),
              carrierIdx: pressure?.carrierIdx ?? null,
              pressure: pressure ? { oppIdx: pressure.oppIdx, under: pressure.under, dM: pressure.dM } : null,
              pitchWidthM,
              flash: flashRef.current,
            });
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      if (slowmoTimerRef.current) clearTimeout(slowmoTimerRef.current);
    };
    // flashRef/exportingRef mirror state for the rAF closure (declared above).
  }, [detections, pitchWidthM, overlayItems]);

  const seek = (t: number, id: string | null) => {
    const video = videoRef.current;
    lastSeekRef.current = Date.now();
    if (slowmoTimerRef.current) clearTimeout(slowmoTimerRef.current);
    setFlash(false);
    if (video) {
      video.playbackRate = 1;
      video.currentTime = Math.max(0, t);
      void video.play().catch(() => undefined);
    }
    setActiveId(id);
  };

  const replay = (e: PressureEvent) => seek(e.t - 3, e.id);

  const getCall = (e: PressureEvent) => {
    if (!sessionId || !playerToken || calls[e.id]?.pending) return;
    setCalls((c) => ({ ...c, [e.id]: { pending: true } }));
    commentOnPressure(playerToken, sessionId, e.mmss, e.distM).then((res) => {
      setCalls((c) => ({ ...c, [e.id]: { pending: false, line: res.ok ? res.line : undefined } }));
    });
  };

  const exportClip = async () => {
    const video = videoRef.current;
    if (!video || exporting || !exportMime) return;
    setExporting(true);
    setExportProgress(0);
    setExportUrl(null);
    try {
      const vw = video.videoWidth || 640;
      const vh = video.videoHeight || 360;
      const scale = Math.min(1, 640 / vw);
      const W = Math.max(2, Math.round((vw * scale) / 2) * 2);
      const H = Math.max(2, Math.round((vh * scale) / 2) * 2);
      const cap = document.createElement('canvas');
      cap.width = W;
      cap.height = H;
      const cctx = cap.getContext('2d');
      if (!cctx) throw new Error('no 2d context');
      const stream = cap.captureStream(12);
      const mime = exportMime;
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunks.push(ev.data);
      };
      const stopped = new Promise<Blob>((resolve) => {
        rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
      });
      video.playbackRate = 1;
      video.currentTime = 0;
      await video.play().catch(() => undefined);
      rec.start(200);
      const dur = video.duration || clipDuration;
      const deadline = Date.now() + (dur + 8) * 1000;
      await new Promise<void>((resolve) => {
        const tick = () => {
          setExportProgress(Math.min(1, (video.currentTime || 0) / (dur || 1)));
          const frame = frameAt(detections, video.currentTime);
          cctx.drawImage(video, 0, 0, W, H);
          if (frame) {
            const pressure = pressureForFrame(frame, pitchWidthM);
            drawClipFrame(cctx, W, H, {
              frame,
              items: itemsAt(overlayItems, video.currentTime),
              carrierIdx: pressure?.carrierIdx ?? null,
              pressure: pressure ? { oppIdx: pressure.oppIdx, under: pressure.under, dM: pressure.dM } : null,
              pitchWidthM,
            });
          }
          if (video.ended || video.paused || Date.now() > deadline) resolve();
          else setTimeout(tick, 1000 / 12);
        };
        tick();
      });
      if (rec.state !== 'inactive') rec.stop();
      const blob = await stopped;
      const url = URL.createObjectURL(blob);
      setExportUrl(url);
      const ext = exportFileExtension(mime);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sportwarren-clip-review.${ext}`;
      a.click();
    } catch (err) {
      console.error('Clip export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      {/* Style switcher — one style at a time, never mixed. */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }} role="group" aria-label="Overlay style">
        {OVERLAY_STYLES.map((s) => (
          <V3MiniButton key={s.id} active={s.id === style} title={s.blurb} onClick={() => setStyle(s.id)}>
            {s.label}
          </V3MiniButton>
        ))}
      </div>
      <p
        aria-live="polite"
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          lineHeight: 1.5,
          color: PALETTE.inkLight,
          fontStyle: 'italic',
          margin: '0 0 10px',
        }}
      >
        {activeBlurb}
      </p>

      <div style={{ position: 'relative', background: '#000', border: `2px solid ${PALETTE.ink}` }}>
        <video
          ref={videoRef}
          src={playingSrc}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          style={{ display: 'block', width: '100%', aspectRatio: '16/9', background: '#000' }}
        />
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      </div>

      {/* Your-footage slot — the unknown-slot doctrine: show the blank and how to fill it. */}
      <div style={{ marginTop: 12 }}>
        <V3HollowCard>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: TRACKING.capWide,
              textTransform: 'uppercase',
              color: PALETTE.navy,
              marginBottom: 6,
            }}
          >
            Your footage · ?
          </div>
          <p style={{ fontFamily: TYPE.mono, fontSize: 12, lineHeight: 1.6, color: PALETTE.ink, margin: '0 0 10px' }}>
            This overlay is sitting on a demo clip. Film the game from one fixed spot — phone on the
            fence, wide enough to hold play — 60 to 90 seconds is plenty. Pick the file to watch
            your own footage play under these rings.
          </p>
          <V3MiniButton as="label">
            Watch your own clip…
            <input
              type="file"
              accept="video/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  if (localSrc?.startsWith('blob:')) URL.revokeObjectURL(localSrc);
                  setLocalSrc(URL.createObjectURL(f));
                }
              }}
            />
          </V3MiniButton>
          {localSrc && (
            <p style={{ fontFamily: TYPE.mono, fontSize: 10, color: PALETTE.inkLight, margin: '8px 0 0' }}>
              Own clip loaded — the overlay is still demo detections, not your players.
            </p>
          )}
        </V3HollowCard>
      </div>

      {/* Keepsake export — the peak-end takeaway for the group chat. */}
      <div style={{ marginTop: 12 }}>
        {exportMime ? (
          <>
            <V3CTAButton onClick={exportClip} disabled={exporting}>
              {exporting ? `Keeping it ${(exportProgress * 100).toFixed(0)}%…` : 'Keep this clip →'}
            </V3CTAButton>
            <p style={{ fontFamily: TYPE.mono, fontSize: 10, lineHeight: 1.6, color: PALETTE.inkLight, margin: '8px 0 0' }}>
              A silent {exportFileExtension(exportMime)} for the group chat — exactly what you just
              watched.
              {exportUrl && (
                <>
                  {' '}
                  <a
                    href={exportUrl}
                    download={`sportwarren-clip-review.${exportFileExtension(exportMime)}`}
                    style={{ color: PALETTE.navy }}
                  >
                    Download again
                  </a>
                </>
              )}
            </p>
          </>
        ) : (
          <V3HollowCard>
            <p style={{ fontFamily: TYPE.mono, fontSize: 12, lineHeight: 1.6, color: PALETTE.ink, margin: 0 }}>
              Clip export needs a browser that records video — try Chrome or Edge on desktop. The
              events below still play fine here.
            </p>
          </V3HollowCard>
        )}
      </div>

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: TRACKING.capWide,
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            marginBottom: 4,
          }}
        >
          Pressure events · {events.length} · distances estimated
        </div>
        <p style={{ fontFamily: TYPE.mono, fontSize: 10, lineHeight: 1.6, color: PALETTE.inkLight, fontStyle: 'italic', margin: '0 0 8px' }}>
          Illustrative — nothing here counts yet. With your footage, squeezes become evidence the
          group verifies before any card moves.
        </p>
        {events.length === 0 ? (
          <p style={{ fontFamily: TYPE.mono, fontSize: 12, color: PALETTE.inkLight }}>
            No squeezes under {PRESSURE_THRESHOLD_M}m in this clip.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {events.map((e) => {
              const active = e.id === activeId;
              const call = calls[e.id];
              return (
                <div
                  key={e.id}
                  style={{
                    background: active ? PALETTE.ink : PALETTE.cream,
                    color: active ? PALETTE.cream : PALETTE.ink,
                    border: `1.5px solid ${active ? PALETTE.ink : 'rgba(0,0,0,0.15)'}`,
                    borderLeft: `5px solid ${PALETTE.red}`,
                  }}
                >
                  <button
                    onClick={() => seek(e.t, e.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      textAlign: 'left',
                      fontFamily: TYPE.mono,
                      fontSize: 12,
                      padding: '9px 12px',
                      cursor: 'pointer',
                      background: 'transparent',
                      color: 'inherit',
                      border: 'none',
                    }}
                  >
                    <span style={{ fontWeight: 800 }}>{e.mmss}</span>
                    <span style={{ opacity: 0.85 }}>squeeze · {e.distM.toFixed(1)}m est.</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.7 }}>tap to watch →</span>
                  </button>
                  {/* Doctrine guard: demo events are watch-only. Confirm/dispute voting
                      arrives with real footage — voting on synthetic squeezes would
                      manufacture evidence, which the stat-immutability rule forbids. */}
                  <div style={{ display: 'flex', gap: 6, padding: '0 12px 9px', flexWrap: 'wrap' }}>
                    <V3MiniButton tone={active ? 'dark' : 'light'} onClick={() => replay(e)}>↺ Replay −3s</V3MiniButton>
                    {canComment && (
                      <V3MiniButton tone={active ? 'dark' : 'light'} onClick={() => getCall(e)} disabled={call?.pending}>
                        {call?.pending ? 'Calling it…' : call?.line ? 'Another call' : 'Get the call'}
                      </V3MiniButton>
                    )}
                  </div>
                  {call?.line && (
                    <p
                      aria-live="polite"
                      style={{
                        fontFamily: TYPE.mono,
                        fontSize: 12,
                        fontStyle: 'italic',
                        lineHeight: 1.55,
                        padding: '0 12px 10px',
                        margin: 0,
                        opacity: 0.9,
                      }}
                    >
                      “{call.line}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
