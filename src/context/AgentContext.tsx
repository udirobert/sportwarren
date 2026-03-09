"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ProspectFlag {
    name: string;
    position: string;
    age: number;
    potential: string;
    trialCost: number;
    flaggedAt: number; // timestamp
}

export interface InjuryFlag {
    playerName: string;
    riskLevel: string;
    recoveryDays: number;
    flaggedAt: number;
}

export interface DealFlag {
    brand: string;
    value: number;
    duration: string;
    flaggedAt: number;
}

export interface FormationFlag {
    formation: string;
    winRate: number;
    flaggedAt: number;
}

export interface AgentContextState {
    flaggedProspect: ProspectFlag | null;
    flaggedInjury: InjuryFlag | null;
    closedDeal: DealFlag | null;
    activeFormation: FormationFlag | null;
}

type AgentAction =
    | { type: 'SET_PROSPECT'; payload: Omit<ProspectFlag, 'flaggedAt'> }
    | { type: 'CLEAR_PROSPECT' }
    | { type: 'SET_INJURY'; payload: Omit<InjuryFlag, 'flaggedAt'> }
    | { type: 'CLEAR_INJURY' }
    | { type: 'SET_DEAL_CLOSED'; payload: Omit<DealFlag, 'flaggedAt'> }
    | { type: 'CLEAR_DEAL' }
    | { type: 'SET_FORMATION'; payload: Omit<FormationFlag, 'flaggedAt'> }
    | { type: 'CLEAR_FORMATION' };

// ── Reducer ──────────────────────────────────────────────────────────────────

const initialState: AgentContextState = {
    flaggedProspect: null,
    flaggedInjury: null,
    closedDeal: null,
    activeFormation: null,
};

function agentReducer(state: AgentContextState, action: AgentAction): AgentContextState {
    switch (action.type) {
        case 'SET_PROSPECT':
            return { ...state, flaggedProspect: { ...action.payload, flaggedAt: Date.now() } };
        case 'CLEAR_PROSPECT':
            return { ...state, flaggedProspect: null };
        case 'SET_INJURY':
            return { ...state, flaggedInjury: { ...action.payload, flaggedAt: Date.now() } };
        case 'CLEAR_INJURY':
            return { ...state, flaggedInjury: null };
        case 'SET_DEAL_CLOSED':
            return { ...state, closedDeal: { ...action.payload, flaggedAt: Date.now() } };
        case 'CLEAR_DEAL':
            return { ...state, closedDeal: null };
        case 'SET_FORMATION':
            return { ...state, activeFormation: { ...action.payload, flaggedAt: Date.now() } };
        case 'CLEAR_FORMATION':
            return { ...state, activeFormation: null };
        default:
            return state;
    }
}

// ── Context ──────────────────────────────────────────────────────────────────

interface AgentContextValue {
    state: AgentContextState;
    dispatch: React.Dispatch<AgentAction>;
}

const AgentContext = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(agentReducer, initialState);
    return (
        <AgentContext.Provider value={{ state, dispatch }}>
            {children}
        </AgentContext.Provider>
    );
}

export function useAgentContext(): AgentContextValue {
    const ctx = useContext(AgentContext);
    if (!ctx) throw new Error('useAgentContext must be used within AgentProvider');
    return ctx;
}
