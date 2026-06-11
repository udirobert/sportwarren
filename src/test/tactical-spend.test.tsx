import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TacticalSpend } from '@/components/player/TacticalSpend';

describe('TacticalSpend — jargon cleanup', () => {
  const defaultProps = {
    currentBudget: 10,
    spentThisWeek: 3,
    onUpdateBudget: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Scout Budget" as the heading', () => {
    render(<TacticalSpend {...defaultProps} />);
    expect(screen.getByText('Scout Budget')).toBeInTheDocument();
  });

  it('does not render "x402" anywhere in the component', () => {
    const { container } = render(<TacticalSpend {...defaultProps} />);
    expect(container.textContent).not.toMatch(/x402/i);
  });

  it('does not render "USDC" anywhere in the component', () => {
    const { container } = render(<TacticalSpend {...defaultProps} />);
    expect(container.textContent).not.toMatch(/USDC/i);
  });

  it('does not render "Kite" anywhere in the component', () => {
    const { container } = render(<TacticalSpend {...defaultProps} />);
    expect(container.textContent).not.toMatch(/Kite/i);
  });

  it('renders scout count instead of dollar amounts in the adjust view', () => {
    render(<TacticalSpend {...defaultProps} />);
    // The subtitle "Weekly scout reports" and the allowance value both contain "scouts"
    const scoutElements = screen.getAllByText(/scouts/i);
    expect(scoutElements.length).toBeGreaterThanOrEqual(2);
    // The allowance value reads "10 scouts" — check for the number in context
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows used and remaining in scout counts', () => {
    render(<TacticalSpend {...defaultProps} />);
    expect(screen.getByText(/Used: 3 scouts/i)).toBeInTheDocument();
    expect(screen.getByText(/Remaining: 7 scouts/i)).toBeInTheDocument();
  });

  it('shows "Weekly Allowance" label', () => {
    render(<TacticalSpend {...defaultProps} />);
    expect(screen.getByText('Weekly Allowance')).toBeInTheDocument();
  });

  it('shows "Weekly scout reports" subtitle', () => {
    render(<TacticalSpend {...defaultProps} />);
    expect(screen.getByText('Weekly scout reports')).toBeInTheDocument();
  });

  it('calls onUpdateBudget when confirming budget change', async () => {
    const onUpdateBudget = vi.fn().mockResolvedValue(undefined);
    render(<TacticalSpend currentBudget={10} spentThisWeek={3} onUpdateBudget={onUpdateBudget} />);

    // Navigate to confirm step
    fireEvent.click(screen.getByText('Update Allowance'));

    // Confirm text should appear
    expect(screen.getByText(/you authorize/i)).toBeInTheDocument();

    // Click confirm
    fireEvent.click(screen.getByText('Confirm & Sign'));

    expect(onUpdateBudget).toHaveBeenCalledWith(10);
  });

  it('shows "Updating Policy" during submission', async () => {
    // onUpdateBudget that never resolves so we can see the loading state
    const onUpdateBudget = vi.fn().mockImplementation(() => new Promise(() => {}));
    render(<TacticalSpend currentBudget={10} spentThisWeek={3} onUpdateBudget={onUpdateBudget} />);

    fireEvent.click(screen.getByText('Update Allowance'));
    fireEvent.click(screen.getByText('Confirm & Sign'));

    expect(await screen.findByText('Updating Policy')).toBeInTheDocument();
  });
});
