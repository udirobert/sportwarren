import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { generateStaffReply } from '../services/ai/staff-chat';

export const agentRouter = createTRPCRouter({
  chat: publicProcedure
    .input(z.object({
      staffId: z.string(),
      message: z.string().max(500),
      squadContext: z.object({
        squadName: z.string().optional(),
        balance: z.number().optional(),
        memberCount: z.number().optional(),
        avgLevel: z.number().optional(),
        formation: z.string().optional(),
        members: z.array(z.object({
          name: z.string(),
          level: z.number().optional(),
          matches: z.number().optional(),
          role: z.string().optional(),
        })).optional(),
      }).optional(),
    recentDecisions: z.array(z.object({
      action: z.string(),
      decision: z.enum(['confirmed', 'declined']),
      context: z.string().optional(),
      timestamp: z.string(),
    })).optional(),
    }))
    .mutation(async ({ input }) => {
      const { staffId, message, squadContext, recentDecisions } = input;

      const contextBlock = squadContext ? [
        squadContext.squadName && `Club: ${squadContext.squadName}`,
        squadContext.balance !== undefined && `Treasury: ${squadContext.balance.toLocaleString()} credits`,
        squadContext.memberCount !== undefined && `Squad size: ${squadContext.memberCount} players`,
        squadContext.avgLevel !== undefined && `Average player level: ${squadContext.avgLevel}`,
        squadContext.formation && `Current formation: ${squadContext.formation}`,
        squadContext.members?.length && `Squad: ${squadContext.members.map(m => `${m.name} (Lvl ${m.level ?? 1}, ${m.matches ?? 0} matches)`).join(', ')}`,
      ].filter(Boolean).join('\n') : '';

      const decisionBlock = recentDecisions?.length
        ? `\n\nRecent manager decisions (use these to personalise your response — reference them naturally when relevant):\n${recentDecisions.map(d => `- ${d.decision === 'confirmed' ? '✅' : '❌'} "${d.action}" on ${new Date(d.timestamp).toLocaleDateString()}${d.context ? ` (${d.context})` : ''}`).join('\n')}`
        : '';

      try {
        const { reply } = await generateStaffReply({
          staffId,
          message,
          contextBlock,
          decisionBlock,
        });
        return { reply };
      } catch (error) {
        console.error('[TRPC-AGENT] Chat failed:', error);
        return { reply: "AI staff is warming up. Try again in a moment." };
      }
    }),
});
