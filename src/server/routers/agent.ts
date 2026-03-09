import { z } from 'zod';
import OpenAI from 'openai';
import { createTRPCRouter, publicProcedure } from '../trpc';

// Venice AI (privacy-first) with OpenAI as fallback
const veniceClient = process.env.VENICE_API_KEY
  ? new OpenAI({
      apiKey: process.env.VENICE_API_KEY,
      baseURL: 'https://api.venice.ai/api/v1',
    })
  : null;

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Venice model for chat; OpenAI fallback model
const VENICE_MODEL = 'llama-3.3-70b';
const OPENAI_MODEL = 'gpt-4o-mini';

const STAFF_PERSONAS: Record<string, string> = {
  'agent-1': `You are The Agent — a sharp, streetwise contract negotiator for a Hackney-based football club in a Web3 sports management game called SportWarren. You specialise in reputation-based valuations, contract negotiations, and transfer market intelligence. You speak with confidence and dry wit. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question to drive the conversation forward.`,
  'scout-1': `You are The Scout — a talent identification specialist for a Hackney-based football club in SportWarren. You have deep knowledge of youth academies, rival teams, and emerging prospects. You speak with enthusiasm and precision. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
  'coach-1': `You are Coach Kite — the Tactical Director for a Hackney-based football club in SportWarren. You are analytical, direct, and passionate about formations and player development. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
  'physio-1': `You are The Physio — the Health & Recovery specialist for a Hackney-based football club in SportWarren. You monitor player fitness, injury risk, and recovery protocols. You speak with calm authority and medical precision. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
  'commercial-1': `You are the Commercial Lead — responsible for sponsorships, PR, and the club's Lens reputation score in SportWarren. You are polished, commercially savvy, and always thinking about brand value. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
};

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
    }))
    .mutation(async ({ input }) => {
      const { staffId, message, squadContext } = input;

      const persona = STAFF_PERSONAS[staffId] ?? STAFF_PERSONAS['agent-1'];

      const contextBlock = squadContext ? [
        squadContext.squadName && `Club: ${squadContext.squadName}`,
        squadContext.balance !== undefined && `Treasury: ${squadContext.balance.toLocaleString()} credits`,
        squadContext.memberCount !== undefined && `Squad size: ${squadContext.memberCount} players`,
        squadContext.avgLevel !== undefined && `Average player level: ${squadContext.avgLevel}`,
        squadContext.formation && `Current formation: ${squadContext.formation}`,
        squadContext.members?.length && `Squad: ${squadContext.members.map(m => `${m.name} (Lvl ${m.level ?? 1}, ${m.matches ?? 0} matches)`).join(', ')}`,
      ].filter(Boolean).join('\n') : '';

      const systemPrompt = [
        persona,
        contextBlock && `\n\nCurrent squad data:\n${contextBlock}`,
      ].filter(Boolean).join('');

      const client = veniceClient ?? openaiClient;
      const model = veniceClient ? VENICE_MODEL : OPENAI_MODEL;

      if (!client) {
        return { reply: "I'll look into that and get back to you, Boss. (No AI provider configured — set VENICE_API_KEY or OPENAI_API_KEY.)" };
      }

      let reply: string;
      try {
        const completion = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 200,
          temperature: 0.7,
        });
        reply = completion.choices[0]?.message?.content?.trim() ?? "I'll look into that and get back to you, Boss.";
      } catch (veniceErr) {
        // Venice failed — fall back to OpenAI if available
        if (veniceClient && openaiClient) {
          const fallback = await openaiClient.chat.completions.create({
            model: OPENAI_MODEL,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message },
            ],
            max_tokens: 200,
            temperature: 0.7,
          });
          reply = fallback.choices[0]?.message?.content?.trim() ?? "I'll look into that and get back to you, Boss.";
        } else {
          throw veniceErr;
        }
      }
      return { reply };
    }),
});
