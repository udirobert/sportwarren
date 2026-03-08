import { prisma } from '../db';

export interface NarrativeEntry {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

export interface NarrativeLedger {
    userId: string;
    history: NarrativeEntry[];
    keyInsights: string[];
    lastMatchResult?: string;
}

export const getNarrativeLedger = async (userId: string): Promise<NarrativeLedger> => {
    let memory = await prisma.aiMemory.findUnique({
        where: { userId }
    });

    if (!memory) {
        memory = await prisma.aiMemory.create({
            data: {
                userId,
                history: [],
                keyInsights: []
            }
        });
    }

    return {
        userId: memory.userId,
        history: Array.isArray(memory.history) ? (memory.history as any as NarrativeEntry[]) : [],
        keyInsights: Array.isArray(memory.keyInsights) ? (memory.keyInsights as any as string[]) : [],
    };
};

export const updateNarrativeLedger = async (userId: string, entry: NarrativeEntry) => {
    const ledger = await getNarrativeLedger(userId);
    ledger.history.push(entry);

    // Keep only last 20 messages for context window management
    if (ledger.history.length > 20) {
        ledger.history = ledger.history.slice(-20);
    }

    await prisma.aiMemory.update({
        where: { userId },
        data: {
            history: ledger.history as any
        }
    });

    return ledger;
};

export const addKeyInsight = async (userId: string, insight: string) => {
    const ledger = await getNarrativeLedger(userId);
    if (!ledger.keyInsights.includes(insight)) {
        ledger.keyInsights.push(insight);

        await prisma.aiMemory.update({
            where: { userId },
            data: {
                keyInsights: ledger.keyInsights as any
            }
        });
    }
    return ledger;
};
