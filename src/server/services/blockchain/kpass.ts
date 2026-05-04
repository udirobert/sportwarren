/**
 * kpass CLI wrapper — Passport session management.
 *
 * Wraps the `kpass` CLI for creating and managing spending sessions.
 * Falls back to DB-only mode when kpass is not installed (dev/demo).
 *
 * CLI reference: https://docs.gokite.ai/kite-agent-passport/cli-reference
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface KpassSessionInput {
  agentId: string;
  taskSummary: string;
  maxPerTxUsdc: number;
  maxTotalUsdc: number;
  ttlSeconds: number;
  scope?: Record<string, unknown>;
}

export interface KpassSession {
  sessionId: string;
  agentId: string;
  status: string;
  maxPerTx: string;
  maxTotal: string;
  expiresAt: string;
}

export interface KpassExecuteResult {
  success: boolean;
  data?: unknown;
  txHash?: string;
  error?: string;
}

let kpassAvailable: boolean | null = null;

async function isKpassAvailable(): Promise<boolean> {
  if (kpassAvailable !== null) return kpassAvailable;
  try {
    await execFileAsync('kpass', ['--version'], { timeout: 5_000 });
    kpassAvailable = true;
  } catch {
    kpassAvailable = false;
  }
  return kpassAvailable;
}

/**
 * Create a spending session via kpass CLI.
 * Returns null if kpass is not installed (DB-only fallback).
 */
export async function createKpassSession(input: KpassSessionInput): Promise<KpassSession | null> {
  if (!(await isKpassAvailable())) return null;

  try {
    const { stdout } = await execFileAsync('kpass', [
      'agent:session', 'create',
      '--agent-id', input.agentId,
      '--task', input.taskSummary,
      '--max-per-tx', `${input.maxPerTxUsdc}`,
      '--max-total', `${input.maxTotalUsdc}`,
      '--ttl', `${input.ttlSeconds}`,
      ...(input.scope ? ['--scope', JSON.stringify(input.scope)] : []),
      '--output', 'json',
    ], { timeout: 15_000 });

    return JSON.parse(stdout) as KpassSession;
  } catch (err) {
    console.warn('[kpass] session create failed:', (err as Error).message);
    return null;
  }
}

/**
 * Execute a paid request through a kpass session.
 * This is the CLI equivalent of the x402 paidFetch flow.
 */
export async function executeKpassSession(input: {
  sessionId: string;
  url: string;
  method?: string;
  body?: unknown;
}): Promise<KpassExecuteResult> {
  if (!(await isKpassAvailable())) {
    return { success: false, error: 'kpass CLI not installed' };
  }

  try {
    const args = [
      'agent:session', 'execute',
      '--session-id', input.sessionId,
      '--url', input.url,
      '--method', input.method ?? 'POST',
      '--output', 'json',
    ];

    if (input.body) {
      args.push('--body', JSON.stringify(input.body));
    }

    const { stdout } = await execFileAsync('kpass', args, { timeout: 30_000 });
    return JSON.parse(stdout) as KpassExecuteResult;
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Search the Kite service catalog via ksearch CLI.
 */
export async function searchKiteServices(query: string): Promise<Array<{
  id: string;
  name: string;
  description: string;
  price: string;
  url?: string;
}>> {
  try {
    const { stdout } = await execFileAsync('ksearch', [
      'services', 'list',
      '--query', query,
      '--payment-approach', 'x402_http',
      '--asset', 'USDC',
      '--limit', '10',
      '--output', 'json',
    ], { timeout: 10_000 });

    const parsed = JSON.parse(stdout);
    const services = Array.isArray(parsed) ? parsed : (parsed?.services ?? parsed?.results ?? []);
    return services.map((s: any) => ({
      id: s.id ?? s.serviceId ?? s.url,
      name: s.name ?? s.merchantName ?? 'Unknown',
      description: s.description ?? '',
      price: s.price ?? s.maxAmountRequired ?? 'variable',
      url: s.url ?? s.endpoint,
    }));
  } catch {
    return [];
  }
}
