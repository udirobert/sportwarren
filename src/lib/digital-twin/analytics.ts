import { trackCoreGrowthEvent, trackEvent } from '@/lib/analytics';
import type { DigitalTwin3DAccessResult } from '@/lib/digital-twin/access';

interface TrackDigitalTwin3DInteractionInput {
  action:
    | 'gate_viewed'
    | 'cta_clicked'
    | 'broadcast_opened'
    | 'broadcast_state_viewed'
    | 'feedback_started'
    | 'feedback_submitted'
    | 'ghost_match_simulated';
  squadId?: string;
  access?: DigitalTwin3DAccessResult;
  source: 'dashboard_gate' | 'digital_twin_widget' | 'broadcast_page';
  highlightTone?: 'calm' | 'pressure' | 'surge';
  phaseLabel?: string;
  feedbackValue?: string;
  feedbackCategory?: 'useful' | 'unclear' | 'exciting' | 'bug';
  dwellMs?: number;
}

export function trackDigitalTwin3DInteraction({
  action,
  squadId,
  access,
  source,
  highlightTone,
  phaseLabel,
  feedbackValue,
  feedbackCategory,
  dwellMs,
}: TrackDigitalTwin3DInteractionInput) {
  trackEvent('digital_twin_3d_interaction', {
    action,
    squad_id: squadId,
    source,
    access_state: access?.state,
    can_launch: access?.canLaunch,
    reason: access?.reason,
    highlight_tone: highlightTone,
    phase_label: phaseLabel,
    feedback_value: feedbackValue,
    feedback_category: feedbackCategory,
    dwell_ms: dwellMs,
  });

  if (action === 'cta_clicked' || action === 'broadcast_opened') {
    trackCoreGrowthEvent('waitlist_joined', {
      method: 'digital_twin_3d',
      source,
      squad_id: squadId,
      access_state: access?.state,
    });
  }
}
