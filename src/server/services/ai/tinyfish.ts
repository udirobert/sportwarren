/**
 * TinyFish web agent — search, fetch, and browse the real web.
 *
 * Three APIs (no SDK, raw fetch):
 *   Search  — free, structured results  (GET https://api.search.tinyfish.ai)
 *   Fetch   — free, page content         (POST https://api.fetch.tinyfish.ai)
 *   Agent   — paid, goal-based browsing  (POST https://agent.tinyfish.ai/v1/automation/run)
 *
 * Scout (combines Search + Fetch into a structured report) is the primary
 * integration point for the WhatsApp agent and auto-scout cron.
 */
import { redisService } from '../redis';

// ── Types ─────────────────────────────────────────────────────────────

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  position?: number;
}

export interface FetchResult {
  url: string;
  content: string;
  format: 'markdown' | 'text' | 'html';
  error?: string;
}

export interface ScoutReport {
  opponent: string;
  summary: string;
  sources: Array<{ title: string; url: string }>;
  snippets: Array<{ title: string; snippet: string; url: string }>;
  generatedAt: string;
}

interface TinyFishSearchResponse {
  results?: Array<{
    title?: string;
    snippet?: string;
    url?: string;
    position?: number;
  }>;
}

interface TinyFishFetchResponse {
  results?: Array<{
    url?: string;
    content?: string;
    format?: string;
    error?: string;
  }>;
  errors?: Array<{ url?: string; error?: string }>;
}

// ── Config ───────────────────────────────────────────────────────────

const BASE_SEARCH = 'https://api.search.tinyfish.ai';
const BASE_FETCH = 'https://api.fetch.tinyfish.ai';
const BASE_AGENT = 'https://agent.tinyfish.ai/v1/automation';

function apiKey(): string | null {
  return process.env.TINYFISH_API_KEY?.trim() || null;
}

export function tinyfishConfigured(): boolean {
  return Boolean(apiKey());
}

const CACHE_TTL = 300; // 5 minutes for search/fetch results

// ── Service ──────────────────────────────────────────────────────────

export class TinyFishService {
  /**
   * Search the web. Free. Results cached in Redis for 5 min.
   */
  async search(query: string, opts?: { location?: string; language?: string; count?: number }): Promise<SearchResult[]> {
    const key = apiKey();
    if (!key) throw new Error('TINYFISH_API_KEY not configured');

    // Check cache
    const cacheKey = `tinyfish:search:${query.toLowerCase().replace(/\s+/g, '_')}`;
    try {
      const cached = await redisService.get(cacheKey);
      if (cached) return JSON.parse(cached) as SearchResult[];
    } catch { /* miss */ }

    const params = new URLSearchParams({ query });
    if (opts?.location) params.set('location', opts.location);
    if (opts?.language) params.set('language', opts.language);
    if (opts?.count) params.set('count', String(opts.count));

    const res = await fetch(`${BASE_SEARCH}?${params}`, {
      headers: { 'X-API-Key': key },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      throw new Error(`TinyFish search failed: ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as TinyFishSearchResponse;
    const results: SearchResult[] = (body.results || []).map((r) => ({
      title: r.title || '',
      snippet: r.snippet || '',
      url: r.url || '',
      position: r.position,
    }));

    // Cache
    try {
      await redisService.set(cacheKey, JSON.stringify(results), CACHE_TTL);
    } catch { /* best-effort */ }

    return results;
  }

  /**
   * Fetch page content from URLs. Free. Results cached in Redis for 5 min.
   */
  async fetch(urls: string[], opts?: { format?: 'markdown' | 'text' | 'html' }): Promise<FetchResult[]> {
    const key = apiKey();
    if (!key) throw new Error('TINYFISH_API_KEY not configured');

    const format = opts?.format || 'markdown';
    const results: FetchResult[] = [];
    const uncached: string[] = [];
    const cacheKeys: string[] = [];

    // Check cache for each URL
    for (const url of urls) {
      const cacheKey = `tinyfish:fetch:${Buffer.from(url).toString('base64url')}`;
      cacheKeys.push(cacheKey);
      try {
        const cached = await redisService.get(cacheKey);
        if (cached) {
          results.push(JSON.parse(cached) as FetchResult);
          continue;
        }
      } catch { /* miss */ }
      uncached.push(url);
    }

    if (uncached.length === 0) return results;

    const res = await fetch(BASE_FETCH, {
      method: 'POST',
      headers: {
        'X-API-Key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls: uncached, format }),
      signal: AbortSignal.timeout(150_000),
    });
    if (!res.ok) {
      throw new Error(`TinyFish fetch failed: ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as TinyFishFetchResponse;
    const fetched: FetchResult[] = (body.results || []).map((r, i) => ({
      url: r.url || uncached[i] || '',
      content: r.content || '',
      format: (r.format as FetchResult['format']) || format,
      error: r.error,
    }));

    // Merge errors from separate errors array
    if (body.errors) {
      for (const err of body.errors) {
        if (err.url && !fetched.find((f) => f.url === err.url)) {
          fetched.push({ url: err.url, content: '', format, error: err.error || 'Unknown error' });
        }
      }
    }

    // Cache individual results
    for (let i = 0; i < fetched.length; i++) {
      try {
        await redisService.set(cacheKeys[uncached.indexOf(fetched[i].url)], JSON.stringify(fetched[i]), CACHE_TTL);
      } catch { /* best-effort */ }
    }

    // Reconstruct in original URL order
    const resultMap = new Map<string, FetchResult>();
    for (const r of fetched) resultMap.set(r.url, r);
    for (const r of results) resultMap.set(r.url, r);
    return urls.map((url) => resultMap.get(url)).filter(Boolean) as FetchResult[];
  }

  /**
   * Scout an opponent — search the web for recent info and fetch the top results.
   * Free (uses Search + Fetch APIs, not Agent API). Results cached.
   */
  async scout(opponent: string): Promise<ScoutReport> {
    const queries = [
      `"${opponent}" football team recent results 2026`,
      `"${opponent}" squad players stats`,
      `"${opponent}" football form`,
    ];

    // Collect search results across multiple queries
    const allResults: SearchResult[] = [];
    const seen = new Set<string>();
    for (const q of queries) {
      try {
        const results = await this.search(q, { count: 5 });
        for (const r of results) {
          if (!seen.has(r.url) && r.snippet) {
            seen.add(r.url);
            allResults.push(r);
          }
        }
      } catch {
        continue; // best-effort per query
      }
    }

    // Take top unique results and fetch their content
    const topUrls = allResults.slice(0, 4).map((r) => r.url);
    const fetchedPages = topUrls.length > 0 ? await this.fetch(topUrls, { format: 'text' }) : [];

    // Build summary from snippets and fetched content
    const snippets = allResults.slice(0, 8).map((r) => ({
      title: r.title,
      snippet: r.snippet,
      url: r.url,
    }));

    const sources = allResults.slice(0, 4).map((r) => ({
      title: r.title,
      url: r.url,
    }));

    // Synthesize a concise summary from the top snippets
    const topSnippets = allResults.slice(0, 3).map((r) => r.snippet).filter(Boolean);
    const pageExcerpts = fetchedPages
      .filter((p) => !p.error)
      .map((p) => {
        const clean = p.content.replace(/\s+/g, ' ').slice(0, 600).trim();
        return clean ? `[From ${p.url}]: ${clean}` : '';
      })
      .filter(Boolean);

    const summaryParts: string[] = [];
    if (topSnippets.length) summaryParts.push(`Recent mentions:\n• ${topSnippets.slice(0, 2).join('\n• ')}`);
    if (pageExcerpts.length) summaryParts.push(`\nExtracted details:\n${pageExcerpts.slice(0, 2).join('\n\n')}`);
    const summary = summaryParts.length > 0
      ? summaryParts.join('\n\n')
      : `No specific web results found for "${opponent}". Try a more specific search.`;

    return {
      opponent,
      summary,
      sources,
      snippets,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Run a goal-based browser automation (Agent API — costs credits).
   * Use for complex multi-step tasks like filling forms or navigating
   * authenticated pages.
   */
  async agentRun(url: string, goal: string, opts?: {
    browserProfile?: 'standard' | 'stealth';
    proxyCountry?: string;
    timeout?: number;
  }): Promise<{ status: string; result?: unknown; error?: string }> {
    const key = apiKey();
    if (!key) throw new Error('TINYFISH_API_KEY not configured');

    const body: Record<string, unknown> = { url, goal };
    if (opts?.browserProfile) body.browser_profile = opts.browserProfile;
    if (opts?.proxyCountry) body.proxy_config = { enabled: true, country_code: opts.proxyCountry };

    const res = await fetch(`${BASE_AGENT}/run`, {
      method: 'POST',
      headers: {
        'X-API-Key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(opts?.timeout || 120_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { status: 'FAILED', error: `Agent API error ${res.status}: ${text.slice(0, 200)}` };
    }

    const result = await res.json() as { status?: string; result?: unknown; error?: string };
    return {
      status: result.status || 'COMPLETED',
      result: result.result,
      error: result.error,
    };
  }
}

export const tinyfishService = new TinyFishService();
