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

const resolveNarrativeUserId = async (userRef: string): Promise<string | null> => {
    const directUser = await prisma.user.findUnique({
        where: { id: userRef },
        select: { id: true }
    });

    if (directUser) {
        return directUser.id;
    }

    const walletUser = await prisma.user.findUnique({
        where: { walletAddress: userRef },
        select: { id: true }
    });

    return walletUser?.id ?? null;
};

export const getNarrativeLedger = async (userRef: string): Promise<NarrativeLedger | null> => {
    const userId = await resolveNarrativeUserId(userRef);
    if (!userId) {
        return null;
    }

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

export const updateNarrativeLedger = async (userRef: string, entry: NarrativeEntry) => {
    const ledger = await getNarrativeLedger(userRef);
    if (!ledger) {
        return null;
    }

    ledger.history.push(entry);

    // Keep only last 20 messages for context window management
    if (ledger.history.length > 20) {
        ledger.history = ledger.history.slice(-20);
    }

    await prisma.aiMemory.update({
        where: { userId: ledger.userId },
        data: {
            history: ledger.history as any
        }
    });

    return ledger;
};

export const addKeyInsight = async (userRef: string, insight: string) => {
    const ledger = await getNarrativeLedger(userRef);
    if (!ledger) {
        return null;
    }

    if (!ledger.keyInsights.includes(insight)) {
        ledger.keyInsights.push(insight);

        await prisma.aiMemory.update({
            where: { userId: ledger.userId },
            data: {
                keyInsights: ledger.keyInsights as any
            }
        });
    }
    return ledger;
};
