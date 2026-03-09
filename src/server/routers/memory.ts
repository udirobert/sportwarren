import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

const DecisionSchema = z.object({
  staffId: z.string(),
  action: z.string(),
  decision: z.enum(['confirmed', 'declined']),
  context: z.string().optional(),
  timestamp: z.string(),
});

export type StaffDecision = z.infer<typeof DecisionSchema>;

type MemoryHistory = Record<string, StaffDecision[]>;

export const memoryRouter = createTRPCRouter({
  // Log a manager decision for a specific staff member
  logDecision: publicProcedure
    .input(DecisionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = (ctx as { userId?: string }).userId;
      if (!userId) return { ok: false };

      const existing = await ctx.prisma.aiMemory.findUnique({ where: { userId } });
      const history: MemoryHistory = existing
        ? (existing.history as MemoryHistory)
        : {};

      const staffLog: StaffDecision[] = history[input.staffId] ?? [];
      // Keep last 20 decisions per staff member to avoid unbounded growth
      const updated = [...staffLog, input].slice(-20);

      await ctx.prisma.aiMemory.upsert({
        where: { userId },
        create: {
          userId,
          history: { ...history, [input.staffId]: updated },
          keyInsights: [],
        },
        update: {
          history: { ...history, [input.staffId]: updated },
        },
      });

      return { ok: true };
    }),

  // Fetch recent decisions for a specific staff member
  getDecisions: publicProcedure
    .input(z.object({ staffId: z.string(), limit: z.number().min(1).max(20).default(5) }))
    .query(async ({ ctx, input }) => {
      const userId = (ctx as { userId?: string }).userId;
      if (!userId) return { decisions: [] as StaffDecision[] };

      const existing = await ctx.prisma.aiMemory.findUnique({ where: { userId } });
      if (!existing) return { decisions: [] as StaffDecision[] };

      const history = existing.history as MemoryHistory;
      const staffLog = history[input.staffId] ?? [];
      return { decisions: staffLog.slice(-input.limit) };
    }),
});
