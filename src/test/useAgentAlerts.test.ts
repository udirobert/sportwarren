import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAgentAlerts } from '@/hooks/squad/useAgentAlerts';

type Member = { id: string; name: string; role: 'captain' | 'vice_captain' | 'player'; stats?: { matches: number; goals: number; level: number } };

const baseMember = (overrides: Partial<Member> = {}): Member => ({
    id: 'm1', name: 'Marcus', role: 'player', stats: { matches: 10, goals: 2, level: 5 }, ...overrides,
});

describe('useAgentAlerts', () => {
    it('returns empty array when dataReady is false', () => {
        const { result } = renderHook(() => useAgentAlerts({
            members: [baseMember()],
            treasury: { balance: 100 },
            tactics: { formation: '4-4-2' },
            dataReady: false,
        }));
        expect(result.current).toHaveLength(0);
    });

    it('returns empty array when no members and no treasury', () => {
        const { result } = renderHook(() => useAgentAlerts({
            members: [],
            treasury: null,
            tactics: null,
            dataReady: true,
        }));
        expect(result.current).toHaveLength(0);
    });

    it('fires contract expiry alert when member has many matches', () => {
        const { result } = renderHook(() => useAgentAlerts({
            members: [baseMember({ stats: { matches: 42, goals: 5, level: 8 } })],
            treasury: { balance: 5000 },
            tactics: null,
            dataReady: true,
        }));
        const contractAlerts = result.current.filter(a => a.staffId === 'agent-1');
        expect(contractAlerts.length).toBeGreaterThan(0);
    });

    it('fires low budget alert when balance is below threshold', () => {
        const { result } = renderHook(() => useAgentAlerts({
            members: [baseMember()],
            treasury: { balance: 500 },
            tactics: null,
            dataReady: true,
        }));
        const agentAlerts = result.current.filter(a => a.staffId === 'agent-1');
        const lowBudget = agentAlerts.some(a => a.text.toLowerCase().includes('budget') || a.text.toLowerCase().includes('credit'));
        expect(lowBudget).toBe(true);
    });

    it('fires squad depth alert when fewer than 7 members', () => {
        const members = [baseMember({ id: 'm1' }), baseMember({ id: 'm2' }), baseMember({ id: 'm3' })];
        const { result } = renderHook(() => useAgentAlerts({
            members,
            treasury: { balance: 5000 },
            tactics: null,
            dataReady: true,
        }));
        const scoutAlerts = result.current.filter(a => a.staffId === 'scout-1');
        expect(scoutAlerts.length).toBeGreaterThan(0);
    });

    it('does not fire squad depth alert when 7+ members', () => {
        const members = Array.from({ length: 8 }, (_, i) => baseMember({ id: `m${i}`, name: `Player ${i}` }));
        const { result } = renderHook(() => useAgentAlerts({
            members,
            treasury: { balance: 5000 },
            tactics: null,
            dataReady: true,
        }));
        const scoutAlerts = result.current.filter(a => a.staffId === 'scout-1');
        expect(scoutAlerts.length).toBe(0);
    });

    it('fires injury risk alert when a member has high match load', () => {
        const { result } = renderHook(() => useAgentAlerts({
            members: [baseMember({ stats: { matches: 35, goals: 3, level: 7 } })],
            treasury: { balance: 5000 },
            tactics: null,
            dataReady: true,
        }));
        const physioAlerts = result.current.filter(a => a.staffId === 'physio-1');
        expect(physioAlerts.length).toBeGreaterThan(0);
    });

    it('all alerts have required fields', () => {
        const { result } = renderHook(() => useAgentAlerts({
            members: [baseMember({ stats: { matches: 42, goals: 5, level: 8 } })],
            treasury: { balance: 400 },
            tactics: null,
            dataReady: true,
        }));
        for (const alert of result.current) {
            expect(alert).toHaveProperty('staffId');
            expect(alert).toHaveProperty('sender');
            expect(alert).toHaveProperty('text');
            expect(typeof alert.text).toBe('string');
            expect(alert.text.length).toBeGreaterThan(0);
        }
    });

    it('memoises — same inputs produce same reference', () => {
        const members = [baseMember()];
        const treasury = { balance: 5000 };
        const { result, rerender } = renderHook(
            (props) => useAgentAlerts(props),
            { initialProps: { members, treasury, tactics: null, dataReady: true } }
        );
        const first = result.current;
        rerender({ members, treasury, tactics: null, dataReady: true });
        expect(result.current).toBe(first);
    });
});
