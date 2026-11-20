'use client';

import { useEffect } from 'react';
import { trackCoreGrowthEvent } from '@/lib/analytics';

export function RecapViewedTracker({ sessionId }: { sessionId: string }) {
  useEffect(() => {
    trackCoreGrowthEvent('recap_opened', { session_id: sessionId });
  }, [sessionId]);

  return null;
}
