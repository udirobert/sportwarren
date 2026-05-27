import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChainLabel, getChainLabel } from '@/components/common/ChainLabel';

describe('ChainLabel', () => {
  it('renders the human-readable label by default', () => {
    render(<ChainLabel chain="algorand" />);
    expect(screen.getByText('Verification Network')).toBeInTheDocument();
  });

  it('renders the technical name when showTechnical is true', () => {
    render(<ChainLabel chain="algorand" showTechnical />);
    expect(screen.getByText('Algorand')).toBeInTheDocument();
  });

  it('renders in badge variant', () => {
    const { container } = render(<ChainLabel chain="kite" variant="badge" />);
    const badge = container.querySelector('.rounded-full');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Agent Network');
  });

  it('renders in tooltip variant with hover text', () => {
    render(<ChainLabel chain="yellow" variant="tooltip" />);
    expect(screen.getByText('Settlement Rail')).toBeInTheDocument();
  });

  it('shows technical name in parentheses for inline variant', () => {
    render(<ChainLabel chain="lens" />);
    expect(screen.getByText('(Lens)')).toBeInTheDocument();
  });

  it('hides technical name in parentheses when showTechnical is true', () => {
    render(<ChainLabel chain="lens" showTechnical />);
    expect(screen.queryByText('(Lens)')).not.toBeInTheDocument();
  });

  it('renders all chain types without error', () => {
    const chains = ['algorand', 'goat', 'kite', 'ton', 'yellow', 'lens'] as const;
    for (const chain of chains) {
      const { container } = render(<ChainLabel chain={chain} />);
      expect(container.firstChild).toBeInTheDocument();
    }
  });
});

describe('getChainLabel', () => {
  it('returns human-readable label by default', () => {
    expect(getChainLabel('algorand')).toBe('Verification Network');
    expect(getChainLabel('goat')).toBe('Governance Chain');
    expect(getChainLabel('kite')).toBe('Agent Network');
    expect(getChainLabel('ton')).toBe('Treasury Network');
    expect(getChainLabel('yellow')).toBe('Settlement Rail');
    expect(getChainLabel('lens')).toBe('Social Layer');
  });

  it('returns technical name when showTechnical is true', () => {
    expect(getChainLabel('algorand', true)).toBe('Algorand');
    expect(getChainLabel('goat', true)).toBe('GOAT Network');
    expect(getChainLabel('kite', true)).toBe('Kite AI');
    expect(getChainLabel('ton', true)).toBe('TON');
    expect(getChainLabel('yellow', true)).toBe('Yellow');
    expect(getChainLabel('lens', true)).toBe('Lens');
  });
});
