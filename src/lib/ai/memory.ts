
interface NarrativeEntry {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

interface NarrativeLedger {
    userId: string;
    history: NarrativeEntry[];
    keyInsights: string[];
    lastMatchResult?: string;
}

// Simple in-memory ledger for server-side persistence during the session
// In production, this would be backed by Redis or Postgres
const globalLedger: Record<string, NarrativeLedger> = {};

export const getNarrativeLedger = (userId: string): NarrativeLedger => {
    if (!globalLedger[userId]) {
        globalLedger[userId] = {
            userId,
            history: [],
            keyInsights: [],
        };
    }
    return globalLedger[userId];
};

export const updateNarrativeLedger = (userId: string, entry: NarrativeEntry) => {
    const ledger = getNarrativeLedger(userId);
    ledger.history.push(entry);

    // Keep only last 20 messages for context window management
    if (ledger.history.length > 20) {
        ledger.history = ledger.history.slice(-20);
    }

    return ledger;
};

export const addKeyInsight = (userId: string, insight: string) => {
    const ledger = getNarrativeLedger(userId);
    if (!ledger.keyInsights.includes(insight)) {
        ledger.keyInsights.push(insight);
    }
    return ledger;
};
