const PREVIEW_CLAIM_KEY = 'sw_preview_claim';

export interface PreviewClaimData {
  previewToken: string;
  userId: string;
  name: string | null;
  squadName: string | null;
}

export function storePreviewClaim(data: PreviewClaimData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PREVIEW_CLAIM_KEY, JSON.stringify(data));
  } catch {
    // ignore storage failures; sign-up can still continue without prefill
  }
}

export function getPreviewClaim(): PreviewClaimData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREVIEW_CLAIM_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PreviewClaimData;
  } catch {
    return null;
  }
}

export function clearPreviewClaim(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREVIEW_CLAIM_KEY);
}
