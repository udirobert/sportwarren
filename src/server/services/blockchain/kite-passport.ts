import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type KpassExecuteResponse = {
  status: string;
  session_id?: string;
  session_status?: string;
  usage?: {
    spent_total?: string;
    reserved_total?: string;
  };
  delegation?: {
    payment_policy?: {
      max_total_amount?: string;
    };
  };
  payment_requirement?: {
    asset?: string;
    amount?: string;
  };
  x402?: {
    status_code?: number;
    response_body?: string;
    parsed_response_body?: unknown;
    wallet_address?: string;
    chain_id?: number;
  };
  error?: string;
  hint?: string;
};

export type KitePassportExecuteResult<T = unknown> = {
  status: number;
  data: T;
  walletAddress?: string;
  chainId?: number;
  raw: KpassExecuteResponse;
};

function kpassBin(): string {
  return process.env.KPASS_BIN || process.env.KITE_PASSPORT_BIN || 'kpass';
}

export async function executeKitePassportRequest<T = unknown>(input: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}): Promise<KitePassportExecuteResult<T>> {
  const args = [
    'agent:session',
    'execute',
    '--url',
    input.url,
    '--method',
    input.method ?? 'POST',
    '--output',
    'json',
  ];

  if (input.headers && Object.keys(input.headers).length > 0) {
    args.push('--headers', JSON.stringify(input.headers));
  }
  if (input.body !== undefined) {
    args.push('--body', JSON.stringify(input.body));
  }

  let parsed: KpassExecuteResponse;
  try {
    const { stdout } = await execFileAsync(kpassBin(), args, {
      timeout: 300_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    parsed = JSON.parse(stdout) as KpassExecuteResponse;
  } catch (err) {
    throw new Error(`Kite Passport execute failed: ${(err as Error).message}`);
  }

  if (parsed.status !== 'success') {
    throw new Error(parsed.error || parsed.hint || 'Kite Passport execute failed');
  }

  const status = parsed.x402?.status_code ?? 500;
  const data = parsed.x402?.parsed_response_body !== undefined
    ? parsed.x402.parsed_response_body
    : parseResponseBody(parsed.x402?.response_body);

  return {
    status,
    data: data as T,
    walletAddress: parsed.x402?.wallet_address,
    chainId: parsed.x402?.chain_id,
    raw: parsed,
  };
}

function parseResponseBody(body: string | undefined): unknown {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

export async function isKitePassportConfigured(): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync(kpassBin(), ['status', '--output', 'json'], {
      timeout: 10_000,
      maxBuffer: 1024 * 1024,
    });
    const status = JSON.parse(stdout);
    return Boolean(status?.user?.jwt_valid && status?.agent?.registered && status?.session?.active);
  } catch {
    return false;
  }
}
