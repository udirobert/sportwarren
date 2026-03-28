import { useState, useEffect, useCallback } from 'react';
import { trackFeatureUsed } from '@/lib/analytics';
import { exportElementAsImage } from '@/lib/utils/export';
import { STORAGE_KEYS, EXPORT_FILENAME_PREFIX, PITCH_BACKGROUND_COLOR } from '@/lib/pitch.constants';

export type ExportFormat = 'png' | 'webp';
export type ExportScope = 'card' | 'panel';

export function usePitchExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>(() => {
    if (typeof window === 'undefined') return 'png';
    return window.localStorage.getItem(STORAGE_KEYS.EXPORT_FORMAT) === 'webp' ? 'webp' : 'png';
  });
  const [hdExport, setHdExport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEYS.HD) === '1';
  });
  const [exportScope, setExportScope] = useState<ExportScope>(() => {
    if (typeof window === 'undefined') return 'card';
    return window.localStorage.getItem(STORAGE_KEYS.EXPORT_SCOPE) === 'panel' ? 'panel' : 'card';
  });

  // Persist export settings
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(STORAGE_KEYS.EXPORT_FORMAT, exportFormat);
      window.localStorage.setItem(STORAGE_KEYS.HD, hdExport ? '1' : '0');
      window.localStorage.setItem(STORAGE_KEYS.EXPORT_SCOPE, exportScope);
    } catch {}
  }, [exportFormat, hdExport, exportScope]);

  const handleExport = useCallback(
    async (
      targetRef: React.RefObject<HTMLDivElement | null>,
      fallbackRef: React.RefObject<HTMLDivElement | null>,
      formation: string,
      meta: { style: string; showNames: boolean; blurFaces: boolean },
    ) => {
      const target = exportScope === 'panel' && fallbackRef.current ? fallbackRef.current : targetRef.current;
      if (!target) return;
      setIsExporting(true);
      try {
        const devicePR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const dm = (typeof navigator !== 'undefined' && (navigator as any).deviceMemory) || 0;
        const isDesktop = typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px)').matches;
        const allowedMax = (isDesktop || dm >= 4) ? 3 : 2;
        const basePR = exportFormat === 'webp' ? Math.max(1.5, devicePR) : Math.max(1, devicePR);
        let pixelRatio = Math.min(allowedMax, hdExport ? Math.max(2, basePR * 1.5) : Math.min(2, basePR));

        let success = false;
        let finalFormat: ExportFormat = exportFormat;
        const filename = `${EXPORT_FILENAME_PREFIX}-${formation}`;
        const opts = { pixelRatio, backgroundColor: PITCH_BACKGROUND_COLOR };

        try { success = await exportElementAsImage(target, filename, finalFormat, opts); } catch {}
        if (!success && finalFormat === 'webp') {
          finalFormat = 'png';
          try { success = await exportElementAsImage(target, filename, 'png', opts); } catch {}
        }
        if (!success && pixelRatio > 2) {
          pixelRatio = 2;
          try { success = await exportElementAsImage(target, filename, 'png', { ...opts, pixelRatio: 2 }); } catch {}
        }
        if (!success) {
          try { success = await exportElementAsImage(target, filename, 'png', { ...opts, pixelRatio: 1 }); } catch {}
        }

        trackFeatureUsed('tactics_preview_export', {
          formation, style: meta.style, format: finalFormat, pixelRatio,
          hd: hdExport, scope: exportScope, namesShown: meta.showNames, blurred: meta.blurFaces, success,
        });

        if (success) {
          const tip = document.createElement('div');
          tip.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-md border border-white/10 bg-black/80 px-3 py-1.5 text-xs text-white shadow-xl';
          tip.textContent = 'Saved';
          document.body.appendChild(tip);
          setTimeout(() => { try { document.body.removeChild(tip); } catch {} }, 1200);
        }
      } finally {
        setIsExporting(false);
      }
    },
    [exportFormat, hdExport, exportScope],
  );

  return { isExporting, exportFormat, setExportFormat, hdExport, setHdExport, exportScope, setExportScope, handleExport };
}
