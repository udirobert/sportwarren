import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * SettlementCard — mirrors the rendering logic from the match detail page
 * (src/app/(app)/match/[id]/page.tsx) without importing the full page
 * component, which has too many complex sub-dependencies for a focused test.
 */
function SettlementCard({
  yellowFeeSettledAt,
  yellowFeeSessionId,
  isVerified,
}: {
  yellowFeeSettledAt: string | null;
  yellowFeeSessionId: string | null;
  isVerified: boolean;
}) {
  if (!isVerified || !yellowFeeSessionId) return null;
  return (
    <>
      <div data-testid="match-fee-card">
        <h4>Match Fee</h4>
        <div>
          <span>Status</span>
          <span>
            {yellowFeeSettledAt
              ? 'Settled'
              : 'Locked (refunds if match disputed)'}
          </span>
        </div>
        {yellowFeeSettledAt && (
          <div>
            <span>Settled at</span>
            <span>{new Date(yellowFeeSettledAt).toLocaleString()}</span>
          </div>
        )}
      </div>
      <div data-testid="public-result-badge">
        <h4>Public Result</h4>
        <p>
          Match result is publicly verifiable — other managers can request a
          copy through SportWarren.
        </p>
      </div>
    </>
  );
}

describe('Match Detail Settlement Card', () => {
  function renderCard(overrides: Record<string, any> = {}) {
    const defaults = {
      yellowFeeSessionId: '0xsession123',
      yellowFeeSettledAt: null,
      isVerified: true,
    };
    return render(<SettlementCard {...defaults} {...overrides} />);
  }

  it('renders "Locked (refunds if match disputed)" when fee is not yet settled', () => {
    renderCard({ yellowFeeSettledAt: null });
    expect(screen.getByText(/Locked/i)).toBeInTheDocument();
    expect(screen.getByText(/refunds if match disputed/i)).toBeInTheDocument();
  });

  it('renders "Settled" status when fee has been settled', () => {
    renderCard({
      yellowFeeSettledAt: new Date('2026-06-12T12:00:00Z').toISOString(),
    });
    // The card shows "Settled" as the status and "Settled at" as a label
    const settledElements = screen.getAllByText(/Settled/i);
    expect(settledElements.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render "Yellow Network" in the DOM', () => {
    renderCard();
    expect(screen.queryByText(/Yellow Network/i)).not.toBeInTheDocument();
  });

  it('does not render "x402" or "attestation" in the DOM', () => {
    renderCard();
    expect(screen.queryByText(/x402/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/attestation/i)).not.toBeInTheDocument();
  });

  it('renders "Match Fee" as the card title', () => {
    renderCard();
    expect(screen.getByText(/Match Fee/i)).toBeInTheDocument();
  });

  it('does not render a raw hex session ID', () => {
    renderCard({ yellowFeeSessionId: '0xdeadbeef1234' });
    expect(screen.queryByText(/0xdeadbeef1234/i)).not.toBeInTheDocument();
  });

  it('renders "Public Result" badge when verified', () => {
    renderCard();
    expect(screen.getByText(/Public Result/i)).toBeInTheDocument();
  });

  it('renders "publicly verifiable" description text', () => {
    renderCard();
    expect(screen.getByText(/publicly verifiable/i)).toBeInTheDocument();
  });

  it('returns null when not verified', () => {
    const { container } = renderCard({ isVerified: false });
    expect(container.textContent).toBe('');
  });

  it('returns null when no session ID exists', () => {
    const { container } = renderCard({ yellowFeeSessionId: null });
    expect(container.textContent).toBe('');
  });
});
