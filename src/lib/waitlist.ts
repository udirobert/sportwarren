import { trackEvent, trackCoreGrowthEvent } from '@/lib/analytics';

export interface WaitlistPayload {
  email: string;
  source?: string; // e.g. hero/problem/solution/footer/exit/telegram
  context?: Record<string, unknown>;
}

export async function submitWaitlist({ email, source, context }: WaitlistPayload): Promise<{ ok: boolean; id?: string; error?: string; }>{
  try {
    const res = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source, context }),
    });

    const data = await res.json();
    if (!res.ok || !data?.ok) {
      trackEvent('waitlist_submit_failed', { source: source || 'unknown', error: data?.error || String(res.status) });
      return { ok: false, error: data?.error || 'Failed' };
    }
    trackEvent('waitlist_submitted', { source: source || 'unknown' });
    trackCoreGrowthEvent('identity_connected', { method: 'waitlist', source: source || 'unknown' });
    return { ok: true, id: data.id };
  } catch (e: any) {
    trackEvent('waitlist_submit_failed', { source: source || 'unknown', error: e?.message || 'network' });
    return { ok: false, error: 'Network error' };
  }
}
