"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MiniAppContext } from './TelegramMiniAppShell';
import { Image as ImageIcon, Upload, Loader2, Share2 } from 'lucide-react';
import { useLens } from '@/contexts/LensContext';

type MediaItem = {
  id: string;
  title: string | null;
  kind: string;
  mimeType: string;
  size: number;
  visibility: string;
  createdAt: string;
  uploader: { id: string; name: string | null };
  hasThumb?: boolean;
};

export function TelegramMediaTab({ context, onRefresh: _onRefresh }: { context: MiniAppContext; onRefresh: () => void }) {
  const lens = useLens();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [visibility, setVisibility] = useState<'squad' | 'private'>('squad');

  const token = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    return url.searchParams.get('token') || '';
  }, []);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/telegram/mini-app/media/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Failed to load media');
      setItems(data.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;
    // Client-side size guard (keeps UX responsive; server also validates)
    const MAX_BYTES = 25 * 1024 * 1024; // 25MB
    if (file.size > MAX_BYTES) {
      setError('File too large. Max 25MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    (window as any).__swMediaAbort = controller; // simple per-upload reference
    try {
      const thumb = await createThumbnail(file).catch(() => null);
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const res = await fetch('/api/telegram/mini-app/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, title: file.name, mimeType: file.type, dataBase64: base64, visibility, thumbBase64: thumb?.base64, thumbMimeType: thumb?.mimeType }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      delete (window as any).__swMediaAbort;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-10 border-b border-white/5 bg-[#09111f]/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-emerald-300" />
            <h2 className="text-sm font-semibold text-white">Squad Media</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-0.5 text-[11px] text-white">
              <button
                onClick={() => setVisibility('squad')}
                className={`rounded-md px-2 py-1 ${visibility === 'squad' ? 'bg-emerald-500/20 text-emerald-200' : 'text-slate-200'}`}
              >
                Squad
              </button>
              <button
                onClick={() => setVisibility('private')}
                className={`rounded-md px-2 py-1 ${visibility === 'private' ? 'bg-emerald-500/20 text-emerald-200' : 'text-slate-200'}`}
              >
                Private
              </button>
            </div>
            <button
              onClick={onPickFile}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-400"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={onFileSelected} />
        </div>
      </div>

      {error && (
        <div className="mx-4 my-3 rounded-lg border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{error}</div>
      )}

      <div className="grid grid-cols-3 gap-2 p-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              const src = `/api/telegram/mini-app/media/${item.id}?token=${encodeURIComponent(token)}`;
              openLightbox(src, item.title || 'Squad media', item.mimeType);
            }}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left"
          >
            {item.kind === 'image' ? (
              <img
                src={(item.hasThumb ? `/api/telegram/mini-app/media/thumb/${item.id}?token=${encodeURIComponent(token)}` : `/api/telegram/mini-app/media/${item.id}?token=${encodeURIComponent(token)}`)}
                alt={item.title || 'Squad media'}
                className="h-28 w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-28 items-center justify-center text-xs text-slate-400">Video</div>
            )}
            <div className="p-2">
              <p className="truncate text-[11px] text-white">{item.title || (item.kind === 'image' ? 'Image' : 'Media')}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{item.visibility}</p>
              <ItemActions
                token={token}
                item={item}
                myUserId={context.userId}
                myRole={context.squad.members.find(m => m.userId === context.userId)?.role || 'player'}
                onChanged={load}
                onShareToLens={async () => {
                  try {
                    if (!lens.isAvailable) return;
                    if (!lens.isConnected) {
                      await lens.login();
                    }
                    const confirmShare = confirm('Share this media to Lens? A temporary signed link will be used.');
                    if (!confirmShare) return;
                    const res = await fetch('/api/telegram/mini-app/media/share-url', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ token, mediaId: item.id, expiresInSec: 600 }),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok || !data.url) throw new Error(data?.error || 'Failed to get share link');
                    const content = `📸 ${context.squad.name} shared a highlight on SportWarren`;
                    const postRes = await fetch('/api/lens/post', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${lens.accessToken}` },
                      body: JSON.stringify({ profileId: lens.profile?.id, content, imageUrl: data.url }),
                    });
                    if (!postRes.ok) throw new Error('Lens post failed');
                    alert('Posted to Lens');
                  } catch (e) {
                    alert(e instanceof Error ? e.message : 'Share failed');
                  }
                }}
              />
            </div>
          </button>
        ))}
        {items.length === 0 && !loading && (
          <div className="col-span-3 py-10 text-center text-xs text-slate-400">No media yet. Upload the first photo for {context.squad.name}.</div>
        )}
      </div>
      {loading && (
        <div className="fixed inset-x-0 bottom-0 z-10 mx-auto mb-5 w-[90%] rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur">
          <div className="flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</div>
            <button
              onClick={() => {
                const c = (window as any).__swMediaAbort as AbortController | undefined;
                c?.abort();
              }}
              className="rounded-md bg-rose-500/90 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function openLightbox(src: string, title: string, mimeType?: string) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4';
  overlay.addEventListener('click', () => document.body.removeChild(overlay));

  const container = document.createElement('div');
  container.className = 'max-w-[92vw] max-h-[80vh]';
  let mediaEl: HTMLImageElement | HTMLVideoElement;
  if (mimeType && mimeType.startsWith('video/')) {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.className = 'max-h-[80vh] max-w-[92vw] rounded-lg shadow-2xl bg-black';
    mediaEl = video;
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = title;
    img.loading = 'eager';
    img.className = 'max-h-[80vh] max-w-[92vw] rounded-lg shadow-2xl';
    mediaEl = img;
  }

  const caption = document.createElement('div');
  caption.className = 'mt-2 text-center text-[12px] text-slate-200';
  caption.innerText = title;

  container.appendChild(mediaEl);
  container.appendChild(caption);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
}

async function createThumbnail(file: File): Promise<{ base64: string; mimeType: string } | null> {
  const MAX_W = 480;
  const mime = 'image/jpeg';
  if (file.type.startsWith('image/')) {
    const img = await loadImageFromFile(file);
    const { canvas, ctx } = prepareCanvas(img.naturalWidth, img.naturalHeight, MAX_W);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL(mime, 0.7).split(',')[1] || '';
    return { base64, mimeType: mime };
  }
  if (file.type.startsWith('video/')) {
    try {
      const frame = await grabVideoFrame(file);
      const { canvas, ctx } = prepareCanvas(frame.width, frame.height, MAX_W);
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL(mime, 0.7).split(',')[1] || '';
      return { base64, mimeType: mime };
    } catch {
      return null;
    }
  }
  return null;
}

function prepareCanvas(w: number, h: number, maxW: number) {
  const ratio = Math.min(1, maxW / w);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(w * ratio));
  canvas.height = Math.max(1, Math.round(h * ratio));
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}

function grabVideoFrame(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      // Seek a bit into the video to get a non-black frame
      const t = Math.min(0.1, (video.duration || 1) * 0.05);
      video.currentTime = t;
    };
    video.onseeked = () => { URL.revokeObjectURL(url); resolve(video); };
    video.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
    video.src = url;
  });
}

function ItemActions({ token, item, myUserId, myRole, onChanged, onShareToLens }: { token: string; item: MediaItem; myUserId: string; myRole: string; onChanged: () => void; onShareToLens?: () => void }) {
  const canManage = item.uploader.id === myUserId || myRole === 'captain' || myRole === 'vice_captain';
  const [busy, setBusy] = useState(false);
  if (!canManage) return null;
  const toggleLabel = item.visibility === 'squad' ? 'Make Private' : 'Make Squad';
  const nextVisibility = item.visibility === 'squad' ? 'private' : 'squad';
  const onToggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/telegram/mini-app/media/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, visibility: nextVisibility }),
      });
      if (!res.ok) throw new Error('Failed to update');
      onChanged();
    } catch { /* ignore */ } finally { setBusy(false); }
  };
  const onDelete = async () => {
    if (!confirm('Delete this item?')) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/telegram/mini-app/media/${item.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error('Failed to delete');
      onChanged();
    } catch { /* ignore */ } finally { setBusy(false); }
  };
  return (
    <div className="mt-2 flex items-center gap-2 text-[10px]">
      <button onClick={() => void onToggle()} disabled={busy} className="rounded-md border border-white/10 px-2 py-0.5 text-emerald-200 hover:bg-white/5 disabled:opacity-50">{toggleLabel}</button>
      <button onClick={() => void onDelete()} disabled={busy} className="rounded-md border border-white/10 px-2 py-0.5 text-rose-300 hover:bg-white/5 disabled:opacity-50">Delete</button>
      {onShareToLens && (
        <button onClick={() => onShareToLens()} disabled={busy} className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-0.5 text-cyan-200 hover:bg-white/5 disabled:opacity-50">
          <Share2 className="h-3 w-3" /> Share
        </button>
      )}
    </div>
  );
}
