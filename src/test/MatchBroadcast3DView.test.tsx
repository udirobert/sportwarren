import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MatchBroadcast3DView } from '@/components/match3d';
import type { DigitalTwin3DAccessResult } from '@/lib/digital-twin/access';

const trackDigitalTwin3DInteraction = vi.fn();

vi.mock('@/lib/digital-twin/analytics', () => ({
  trackDigitalTwin3DInteraction: (...args: unknown[]) => trackDigitalTwin3DInteraction(...args),
}));

const unlockedAccess: DigitalTwin3DAccessResult = {
  state: 'unlocked',
  canSeeEntryPoint: true,
  canLaunch: true,
  reason: 'eligible',
};

describe('MatchBroadcast3DView', () => {
  beforeEach(() => {
    trackDigitalTwin3DInteraction.mockReset();
  });

  it('tracks state visibility and feedback submission with broadcast context', () => {
    render(
      <MatchBroadcast3DView
        squadId="squad-1"
        access={unlockedAccess}
        twin={{
          energy: 91,
          prestige: 18,
          baseAttributes: { pace: 75, shooting: 82, passing: 77, defending: 71, dribbling: 73, physical: 70 },
        }}
      />
    );

    expect(trackDigitalTwin3DInteraction).toHaveBeenCalledWith(expect.objectContaining({
      action: 'broadcast_state_viewed',
      squadId: 'squad-1',
      source: 'broadcast_page',
      highlightTone: 'surge',
      phaseLabel: 'Pre-match',
    }));

    fireEvent.click(screen.getByRole('button', { name: 'Useful' }));
    fireEvent.change(screen.getByPlaceholderText('What felt clear, confusing, or promising in this broadcast beta?'), {
      target: { value: 'Highlight language makes sense.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit feedback' }));

    expect(trackDigitalTwin3DInteraction).toHaveBeenCalledWith(expect.objectContaining({
      action: 'feedback_started',
      feedbackCategory: 'useful',
      squadId: 'squad-1',
    }));

    expect(trackDigitalTwin3DInteraction).toHaveBeenCalledWith(expect.objectContaining({
      action: 'feedback_submitted',
      feedbackCategory: 'useful',
      feedbackValue: 'Highlight language makes sense.',
      squadId: 'squad-1',
      source: 'broadcast_page',
    }));

    expect(screen.getByText('Feedback captured for this beta session.')).toBeInTheDocument();
  });

  it('shows rollout guidance for gated preview states', () => {
    render(
      <MatchBroadcast3DView
        squadId="squad-2"
        access={{
          state: 'locked',
          canSeeEntryPoint: true,
          canLaunch: false,
          reason: 'upgrade_required',
        }}
        twin={{
          squadEnergy: 42,
          seasonPoints: 6,
          digitalAttributes: { attack: 64, defense: 59, teamwork: 61 },
        }}
      />
    );

    expect(screen.getAllByText('Rollout preview only').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/The shell is visible so beta users can understand the offer/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Context included: locked, Pre-match/i)).toBeInTheDocument();
  });
});
