"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { submitWaitlist } from '@/lib/waitlist';
import { trackEvent, trackCoreGrowthEvent } from '@/lib/analytics';

type Variant = 'hero' | 'inline' | 'footer';

interface WaitlistFormProps {
  variant?: Variant;
  source?: string; // analytics source tag override
  autoFocus?: boolean;
  onDone?: () => void; // optional callback when successfully joined
}

export function WaitlistForm({ variant = 'inline', source, autoFocus, onDone }: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    trackEvent('waitlist_viewed', { surface: source || variant });
  }, [source, variant]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setLoading(true);
    trackEvent('waitlist_started', { surface: source || variant });
    const res = await submitWaitlist({ email, source: source || variant, context: { pathname: typeof window !== 'undefined' ? window.location.pathname : '' } });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      trackCoreGrowthEvent('waitlist_joined', { surface: source || variant, email: email.split('@')[1] }); // track domain for general info
      try { onDone?.(); } catch { /* ignore */ }
    } else {
      setError(res.error || 'Failed to join waitlist');
    }
  };

  const base = variant === 'hero'
    ? 'w-full max-w-xl mx-auto'
    : variant === 'footer'
      ? 'w-full max-w-md'
      : 'w-full max-w-lg';

  if (done) {
    return (
      <div className={`${base} inline-flex items-center justify-center rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-200 text-sm`}>✅ You’re in. We’ll email you early access.</div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`${base} flex flex-col sm:flex-row items-stretch gap-2`}>
      <input
        ref={inputRef}
        type="email"
        inputMode="email"
        placeholder="Enter your email"
        className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
      />
      <Button type="submit" disabled={loading} className="rounded-xl px-5 py-3 h-auto font-bold sm:w-auto w-full">
        {loading ? 'Joining…' : 'Get early access'}
      </Button>
      {error && (
        <div className="w-full text-xs text-red-400 mt-2" role="alert">{error}</div>
      )}
    </form>
  );
}
