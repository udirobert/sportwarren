import OpenAI from 'openai';

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

const VENICE_MODEL = 'llama-3.3-70b';
const OPENAI_MODEL = 'gpt-4o-mini';

export const STAFF_PERSONAS: Record<string, { staffId: string; name: string; emoji: string; persona: string }> = {
  'agent-1': {
    staffId: 'agent-1',
    name: 'The Agent',
    emoji: '💼',
    persona: `You are The Agent — a sharp, streetwise contract negotiator for a grassroots football club in a Web3 sports management game called SportWarren. You specialise in reputation-based valuations, contract negotiations, and transfer market intelligence. You speak with confidence and dry wit. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question to drive the conversation forward.`,
  },
  'scout': {
    staffId: 'scout',
    name: 'The Scout',
    emoji: '🔭',
    persona: `You are The Scout — a talent identification specialist for a grassroots football club in SportWarren. You have deep knowledge of youth academies, rival teams, and emerging prospects. You speak with enthusiasm and precision. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
  },
  'coach': {
    staffId: 'coach',
    name: 'Coach Kite',
    emoji: '🪁',
    persona: `You are Coach Kite — the Tactical Director for a grassroots football club in SportWarren. You are analytical, direct, and passionate about formations and player development. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
  },
  'physio': {
    staffId: 'physio',
    name: 'The Physio',
    emoji: '🏥',
    persona: `You are The Physio — the Health & Recovery specialist for a grassroots football club in SportWarren. You monitor player fitness, injury risk, and recovery protocols. You speak with calm authority and medical precision. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
  },
  'analyst': {
    staffId: 'analyst',
    name: 'The Analyst',
    emoji: '📊',
    persona: `You are The Analyst — the performance data specialist for a grassroots football club in SportWarren. You track player stats, trends, and progression. You are precise, numbers-driven, and always back your insights with data. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
  },
  'commercial': {
    staffId: 'commercial',
    name: 'Commercial Lead',
    emoji: '📈',
    persona: `You are the Commercial Lead — responsible for treasury operations, sponsorships, and financial health in SportWarren. You are polished, commercially savvy, and always thinking about treasury operations and brand value. You always address the manager as "Boss". Keep responses concise (3–5 sentences max) and always end with a clear recommendation or question.`,
  },
};

// Aliases for retro-compatibility with web router 
STAFF_PERSONAS['scout-1'] = STAFF_PERSONAS['scout'];
STAFF_PERSONAS['coach-1'] = STAFF_PERSONAS['coach'];
STAFF_PERSONAS['physio-1'] = STAFF_PERSONAS['physio'];
STAFF_PERSONAS['commercial-1'] = STAFF_PERSONAS['commercial'];

export interface GenerateStaffReplyParams {
  staffId: string;
  message: string;
  contextBlock?: string;
  decisionBlock?: string;
  signalContext?: string;
}

export async function generateStaffReply({
  staffId,
  message,
  contextBlock,
  decisionBlock,
  signalContext,
}: GenerateStaffReplyParams): Promise<{ reply: string; staff: typeof STAFF_PERSONAS[string] }> {
  // Resolve persona
  const resolvedId = staffId.toLowerCase().trim();
  let staff = STAFF_PERSONAS[resolvedId];

  // Try robust fuzzy matching if not found
  if (!staff) {
    for (const [id, s] of Object.entries(STAFF_PERSONAS)) {
      if (s.name.toLowerCase().includes(resolvedId) || resolvedId.includes(id)) {
        staff = s;
        break;
      }
    }
  }

  // Fallback to coach
  if (!staff) {
    staff = STAFF_PERSONAS['coach'];
  }

  // Construct Prompt
  const promptParts = [
    staff.persona,
    contextBlock && `\n\nCurrent squad data:\n${contextBlock}`,
    signalContext && `\n\nActive insights algorithm:\n${signalContext}`,
    decisionBlock,
  ];

  const systemPrompt = promptParts.filter(Boolean).join('');

  const client = veniceClient ?? openaiClient;
  const model = veniceClient ? VENICE_MODEL : OPENAI_MODEL;

  if (!client) {
    return { 
      reply: "I'll look into that and get back to you, Boss. (No AI provider configured — set VENICE_API_KEY or OPENAI_API_KEY.)",
      staff
    };
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
      try {
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
      } catch (openaiErr) {
        console.error('[AI] OpenAI fallback failed after Venice error', openaiErr);
        throw openaiErr;
      }
    } else {
      console.error('[AI] Venice inference failed (no fallback)', veniceErr);
      throw veniceErr;
    }
  }

  return { reply, staff };
}
