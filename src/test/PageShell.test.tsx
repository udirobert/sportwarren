import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageShell } from '@/components/common/PageShell';

describe('PageShell', () => {
  it('renders children inside a <main> element', () => {
    render(<PageShell><p>test content</p></PageShell>);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('test content');
  });

  it('defaults to max-w-6xl', () => {
    render(<PageShell><p>content</p></PageShell>);
    const main = screen.getByRole('main');
    expect(main.className).toContain('max-w-6xl');
  });

  it('uses max-w-4xl when maxWidth is 4xl', () => {
    render(<PageShell maxWidth="4xl"><p>content</p></PageShell>);
    const main = screen.getByRole('main');
    expect(main.className).toContain('max-w-4xl');
    expect(main.className).not.toContain('max-w-6xl');
  });

  it('uses max-w-2xl when maxWidth is 2xl', () => {
    render(<PageShell maxWidth="2xl"><p>content</p></PageShell>);
    const main = screen.getByRole('main');
    expect(main.className).toContain('max-w-2xl');
  });

  it('includes nav-spacer classes', () => {
    render(<PageShell><p>content</p></PageShell>);
    const main = screen.getByRole('main');
    expect(main.className).toContain('nav-spacer-top');
    expect(main.className).toContain('nav-spacer-bottom');
  });

  it('includes text-gray-900 and dark:text-gray-100', () => {
    render(<PageShell><p>content</p></PageShell>);
    const main = screen.getByRole('main');
    expect(main.className).toContain('text-gray-900');
    expect(main.className).toContain('dark:text-gray-100');
  });

  it('applies additional className', () => {
    render(<PageShell className="space-y-6"><p>content</p></PageShell>);
    const main = screen.getByRole('main');
    expect(main.className).toContain('space-y-6');
  });
});
