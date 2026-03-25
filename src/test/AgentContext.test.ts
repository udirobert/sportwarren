import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AgentProvider, useAgentContext } from '@/context/AgentContext';

// ── Reducer unit tests (via hook) ────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(AgentProvider, null, children);

describe('AgentContext reducer', () => {
    it('initialises with all flags null', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        const { state } = result.current;
        expect(state.flaggedProspect).toBeNull();
        expect(state.flaggedInjury).toBeNull();
        expect(state.closedDeal).toBeNull();
        expect(state.activeFormation).toBeNull();
        expect(state.pendingOnChainAction).toBeNull();
    });

    it('SET_PROSPECT sets flaggedProspect with flaggedAt timestamp', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({
                type: 'SET_PROSPECT',
                payload: { name: 'Test Player', position: 'MF', age: 18, potential: '⭐⭐⭐', trialCost: 200 },
            });
        });
        const { flaggedProspect } = result.current.state;
        expect(flaggedProspect).not.toBeNull();
        expect(flaggedProspect?.name).toBe('Test Player');
        expect(flaggedProspect?.position).toBe('MF');
        expect(typeof flaggedProspect?.flaggedAt).toBe('number');
    });

    it('CLEAR_PROSPECT nullifies flaggedProspect', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({ type: 'SET_PROSPECT', payload: { name: 'X', position: 'ST', age: 20, potential: '⭐⭐', trialCost: 100 } });
        });
        act(() => {
            result.current.dispatch({ type: 'CLEAR_PROSPECT' });
        });
        expect(result.current.state.flaggedProspect).toBeNull();
    });

    it('SET_INJURY sets flaggedInjury', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({ type: 'SET_INJURY', payload: { playerName: 'Sarah', riskLevel: 'High', recoveryDays: 14 } });
        });
        expect(result.current.state.flaggedInjury?.playerName).toBe('Sarah');
        expect(result.current.state.flaggedInjury?.riskLevel).toBe('High');
    });

    it('CLEAR_INJURY nullifies flaggedInjury', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({ type: 'SET_INJURY', payload: { playerName: 'Sarah', riskLevel: 'High', recoveryDays: 14 } });
        });
        act(() => {
            result.current.dispatch({ type: 'CLEAR_INJURY' });
        });
        expect(result.current.state.flaggedInjury).toBeNull();
    });

    it('SET_DEAL_CLOSED sets closedDeal', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({ type: 'SET_DEAL_CLOSED', payload: { brand: 'Hackney Brew', value: 5000, duration: '8 weeks' } });
        });
        expect(result.current.state.closedDeal?.brand).toBe('Hackney Brew');
        expect(result.current.state.closedDeal?.value).toBe(5000);
    });

    it('SET_FORMATION sets activeFormation', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({ type: 'SET_FORMATION', payload: { formation: '4-3-3', winRate: 71 } });
        });
        expect(result.current.state.activeFormation?.formation).toBe('4-3-3');
        expect(result.current.state.activeFormation?.winRate).toBe(71);
    });

    it('QUEUE_ONCHAIN_ACTION sets pendingOnChainAction', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({
                type: 'QUEUE_ONCHAIN_ACTION',
                payload: { id: 'trial-1', type: 'yellow_payment', description: 'Trial fee', amount: 200, assetSymbol: 'USDC' },
            });
        });
        const action = result.current.state.pendingOnChainAction;
        expect(action?.id).toBe('trial-1');
        expect(action?.type).toBe('yellow_payment');
        expect(action?.amount).toBe(200);
        expect(typeof action?.queuedAt).toBe('number');
    });

    it('CLEAR_ONCHAIN_ACTION nullifies pendingOnChainAction', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({ type: 'QUEUE_ONCHAIN_ACTION', payload: { id: 'x', type: 'lens_post', description: 'Post', postText: 'Hello' } });
        });
        act(() => {
            result.current.dispatch({ type: 'CLEAR_ONCHAIN_ACTION' });
        });
        expect(result.current.state.pendingOnChainAction).toBeNull();
    });

    it('dispatches do not mutate other state slices', () => {
        const { result } = renderHook(() => useAgentContext(), { wrapper });
        act(() => {
            result.current.dispatch({ type: 'SET_FORMATION', payload: { formation: '3-5-2', winRate: 58 } });
        });
        expect(result.current.state.flaggedProspect).toBeNull();
        expect(result.current.state.flaggedInjury).toBeNull();
        expect(result.current.state.closedDeal).toBeNull();
        expect(result.current.state.pendingOnChainAction).toBeNull();
    });

    it('throws when used outside AgentProvider', () => {
        expect(() => renderHook(() => useAgentContext())).toThrow('useAgentContext must be used within AgentProvider');
    });
});
