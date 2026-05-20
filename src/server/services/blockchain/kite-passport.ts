import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { homedir } from 'node:os';

const execFileAsync = promisify(execFile);

function kpassHome(): string {
  return process.env.KPASS_HOME || process.env.HOME || homedir();
}

function kpassExecOpts(timeout = 300_000): { timeout: number; maxBuffer: number; env: NodeJS.ProcessEnv; cwd: string } {
  const home = kpassHome();
  return {
    timeout,
    maxBuffer: 10 * 1024 * 1024,
    env: {
      ...process.env,
      HOME: home,
      PATH: `${home}/.kpass/bin:${process.env.PATH || '/usr/local/bin:/usr/bin:/bin'}`,
    },
    cwd: home,
  };
}

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
    payment_response?: {
      success?: boolean;
      transaction?: string;
      network?: string;
      payer?: string;
    };
  };
  error?: string;
  hint?: string;
};

export type KitePassportExecuteResult<T = unknown> = {
  status: number;
  data: T;
  walletAddress?: string;
  chainId?: number;
  txHash?: string;
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
    '--no-interactive',
  ];

  if (input.headers && Object.keys(input.headers).length > 0) {
    args.push('--headers', JSON.stringify(input.headers));
  }
  if (input.body !== undefined) {
    args.push('--body', JSON.stringify(input.body));
  }

  let parsed: KpassExecuteResponse | undefined;
  try {
    const { stdout } = await execFileAsync(kpassBin(), args, kpassExecOpts(300_000));
    parsed = JSON.parse(stdout) as KpassExecuteResponse;
  } catch (err: unknown) {
    const execErr = err as { stdout?: string; stderr?: string; message?: string };
    const rawOut = execErr.stdout?.trim();
    if (rawOut) {
      try {
        parsed = JSON.parse(rawOut) as KpassExecuteResponse;
      } catch { /* not JSON */ }
    }
    if (!parsed) {
      const detail = execErr.stderr?.trim() || execErr.message || 'Unknown error';
      throw new Error(`Kite Passport execute failed: ${detail}`);
    }
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
    txHash: parsed.x402?.payment_response?.transaction,
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
    const { stdout } = await execFileAsync(kpassBin(), ['status', '--output', 'json', '--no-interactive'], kpassExecOpts(10_000));
    const status = JSON.parse(stdout);
    return Boolean(status?.user?.jwt_valid && status?.agent?.registered && status?.session?.active);
  } catch {
    return false;
  }
}
