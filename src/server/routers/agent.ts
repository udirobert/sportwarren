import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { generateStaffReply } from '../services/ai/staff-chat';
import { kiteAIService } from '../services/ai/kite';

export const agentRouter = createTRPCRouter({
  chat: publicProcedure
    .input(z.object({
      staffId: z.string(),
      message: z.string().max(500),
      chatHistory: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })).optional(),
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
      const { staffId, message, chatHistory, squadContext, recentDecisions } = input;

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
          chatHistory,
          contextBlock,
          decisionBlock,
        });
        return { reply };
      } catch (error) {
        console.error('[TRPC-AGENT] Chat failed:', error);
        return { reply: "AI staff is warming up. Try again in a moment." };
      }
    }),

  searchMarketplace: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
    }))
    .query(async ({ input }) => {
      try {
        const agents = await kiteAIService.searchMarketplace(input.query);
        return { agents };
      } catch (error) {
        console.error('[TRPC-AGENT] Marketplace search failed:', error);
        return { agents: [] };
      }
    }),

  hireMarketplaceAgent: protectedProcedure
    .input(z.object({
      agentId: z.string(),
      squadId: z.string(),
      durationDays: z.number().default(7),
    }))
    .mutation(async ({ input }) => {
      try {
        const success = await kiteAIService.hireAgent(input.agentId, input.squadId, input.durationDays);
        return { success };
      } catch (error) {
        console.error('[TRPC-AGENT] Hire failed:', error);
        return { success: false };
      }
    }),
});
