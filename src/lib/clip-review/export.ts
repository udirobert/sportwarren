/**
 * Clip export support — pure MIME picker.
 *
 * MediaRecorder support varies (Chrome/Edge desktop record WebM; Safari
 * prefers MP4; older browsers have no MediaRecorder at all). The component
 * hides the export action when this returns null instead of failing loudly.
 */
const EXPORT_MIME_CANDIDATES = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];

export function pickExportMime(isSupported: (mime: string) => boolean): string | null {
  for (const mime of EXPORT_MIME_CANDIDATES) {
    try {
      if (isSupported(mime)) return mime;
    } catch {
      // A throwing capability probe means "not supported" — keep looking.
    }
  }
  return null;
}

export function exportFileExtension(mime: string): string {
  return mime.includes('mp4') ? 'mp4' : 'webm';
}
