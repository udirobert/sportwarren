/**
 * Narrative service — generates one-paragraph summaries for the unified
 * identity card.
 *
 * Two flavours live in this module:
 *   - `generatePlayerNarrative` / `generateSquadNarrative` — fast deterministic
 *     stubs that just compose a sentence from the live state. Used by hot read
 *     paths (e.g. `squad.getStats`) where calling an LLM on every request
 *     would be wasteful and slow.
 *   - `buildRichPlayerNarrative` / `buildRichSquadNarrative` — LLM-driven
 *     versions consumed by `IdentityService` for the identity card. They
 *     prompt the shared `generateInference` orchestrator with the full
 *     state snapshot, and cache the result in Redis for 1h.
 *
 * The cache key hashes the *content* the prompt was built from, so a state
 * change (e.g. level up) busts the cache naturally.
 */

import { generateInference, type AIMessage } from '@/lib/ai/inference';
import { redisService } from '@/server/services/redis';
import type { AttributeKey } from './twin-types';

// ────────────────────────────────────────────────────────────────────────────
// Snapshot types — pre-loaded by callers, so narrative generation never
// touches Prisma. This lets the LLM call run cheaply from a card render.
// ────────────────────────────────────────────────────────────────────────────

export interface PlayerNarrativeContext {
  name: string;
  twin: {
    level: number;
    xp: number;
    prestige: number;
    baseAttributes: Record<AttributeKey, number>;
    reputation: number;
    attestationCount: number;
  } | null;
  matches: number;
  goals: number;
  assists: number;
}

export interface SquadNarrativeContext {
  name: string;
  twin: {
    level: number;
    xp: number;
    prestige: number;
    baseAttributes: Record<AttributeKey, number>;
    energy: number;
    energyMax: number;
    reputation: number;
  } | null;
  matches: number;
  consensusTags: Record<string, number>;
}

// ────────────────────────────────────────────────────────────────────────────
// Deterministic stubs (fast, no LLM)
// ────────────────────────────────────────────────────────────────────────────

export function generatePlayerNarrative(ctx: PlayerNarrativeContext): string {
  if (!ctx.twin) {
    return `${ctx.name} is a fresh profile — no twin yet. Play matches, log results, and the digital twin comes online with the first attestation.`;
  }
  const attrs = topTwo(ctx.twin.baseAttributes);
  return `${ctx.name} — Level ${ctx.twin.level} player twin, ${ctx.matches} match${
    ctx.matches === 1 ? '' : 'es'
  }, ${ctx.goals}G/${ctx.assists}A, reputation ${ctx.twin.reputation}. Standout attributes: ${attrs}.`;
}

export function generateSquadNarrative(ctx: SquadNarrativeContext): string {
  if (!ctx.twin) {
    return `${ctx.name} is a fresh squad — no twin yet. Add members and log your first verified match to bring the squad twin online.`;
  }
  return `${ctx.name} — Level ${ctx.twin.level} squad twin, ${ctx.matches} verified match${
    ctx.matches === 1 ? '' : 'es'
  } on the books, prestige at ${ctx.twin.prestige}. Energy ${ctx.twin.energy}/${ctx.twin.energyMax}.`;
}

// ────────────────────────────────────────────────────────────────────────────
// LLM-driven rich versions (used by the identity card)
// ────────────────────────────────────────────────────────────────────────────

const NARRATIVE_SYSTEM_PROMPT = `You are the SportWarren identity narrator. Write a single, vivid paragraph (max 60 words) that captures a footballer's or squad's identity at this moment in their season. Reference level, attributes, and reputation when relevant. Avoid generic phrasing. No hashtags. No bullet points. Match the tone of a seasoned analyst on a club documentary, not a social media post.`;

const CACHE_TTL_SECONDS = 3600;

export async function buildRichPlayerNarrative(
  profileId: string,
  ctx: PlayerNarrativeContext,
): Promise<string> {
  const cacheKey = `ai:cache:narrative:player:${profileId}:${hashCtx(ctx)}`;
  return cachedOrGenerate(cacheKey, () => promptPlayer(ctx), ctx.name);
}

export async function buildRichSquadNarrative(
  squadId: string,
  ctx: SquadNarrativeContext,
): Promise<string> {
  const cacheKey = `ai:cache:narrative:squad:${squadId}:${hashCtx(ctx)}`;
  return cachedOrGenerate(cacheKey, () => promptSquad(ctx), ctx.name);
}

// ────────────────────────────────────────────────────────────────────────────
// Prompt construction
// ────────────────────────────────────────────────────────────────────────────

function promptPlayer(ctx: PlayerNarrativeContext): AIMessage[] {
  const attrs = topTwo(ctx.twin?.baseAttributes ?? null);
  const user = `Player: ${ctx.name}
Level: ${ctx.twin?.level ?? 1}
XP: ${ctx.twin?.xp ?? 0}
Prestige: ${ctx.twin?.prestige ?? 0}
Reputation: ${ctx.twin?.reputation ?? 0}
Attestations: ${ctx.twin?.attestationCount ?? 0}
Matches: ${ctx.matches}
Goals: ${ctx.goals}
Assists: ${ctx.assists}
Standout attributes: ${attrs}
Raw base attributes: ${JSON.stringify(ctx.twin?.baseAttributes ?? {})}`;

  return [{ role: 'user', content: user }];
}

function promptSquad(ctx: SquadNarrativeContext): AIMessage[] {
  const topTags = Object.entries(ctx.consensusTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => `${tag}(${count})`)
    .join(', ');
  const user = `Squad: ${ctx.name}
Level: ${ctx.twin?.level ?? 1}
XP: ${ctx.twin?.xp ?? 0}
Prestige: ${ctx.twin?.prestige ?? 0}
Energy: ${ctx.twin?.energy ?? 100}/${ctx.twin?.energyMax ?? 100}
Reputation: ${ctx.twin?.reputation ?? 0}
Verified matches: ${ctx.matches}
Top consensus tags: ${topTags || 'none yet'}
Raw base attributes: ${JSON.stringify(ctx.twin?.baseAttributes ?? {})}`;

  return [{ role: 'user', content: user }];
}

// ────────────────────────────────────────────────────────────────────────────
// Cache + LLM plumbing
// ────────────────────────────────────────────────────────────────────────────

async function cachedOrGenerate(
  cacheKey: string,
  buildMessages: () => AIMessage[],
  fallbackName: string,
): Promise<string> {
  try {
    const cached = await redisService.get(cacheKey);
    if (cached) return cached;
  } catch (e) {
    console.warn('[Narrative] Redis cache lookup failed:', e);
  }

  let result: { content: string } | null = null;
  try {
    const inf = await generateInference(buildMessages(), {
      systemPrompt: NARRATIVE_SYSTEM_PROMPT,
      temperature: 0.6,
      max_tokens: 180,
      tier: 'text',
    });
    result = inf;
  } catch (e) {
    console.error('[Narrative] Inference failed:', e);
  }

  if (!result) {
    return `${fallbackName} — narrative temporarily unavailable.`;
  }

  try {
    await redisService.set(cacheKey, result.content, CACHE_TTL_SECONDS);
  } catch (e) {
    console.warn('[Narrative] Redis cache write failed:', e);
  }

  return result.content;
}

function hashCtx(ctx: object): string {
  // Truncated base64 hash of the JSON-encoded context. Good enough for cache
  // busting; collisions only mean a stale narrative for ~1h.
  return Buffer.from(JSON.stringify(ctx)).toString('base64').slice(0, 32);
}

function topTwo(attrs: Record<AttributeKey, number> | null): string {
  if (!attrs) return 'unrated';
  const sorted = (Object.entries(attrs) as Array<[AttributeKey, number]>)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k, v]) => `${k} ${v}`);
  return sorted.length ? sorted.join(', ') : 'unrated';
}
