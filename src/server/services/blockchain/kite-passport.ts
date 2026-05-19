import axios from 'axios';

const DEFAULT_KITE_MCP_URL = 'https://neo.dev.gokite.ai/v1/mcp';

type JsonRpcResponse<T> = {
  result?: T;
  error?: { code?: number; message?: string; data?: unknown };
};

type ToolContent = {
  type?: string;
  text?: string;
};

type ToolResult = {
  content?: ToolContent[];
  structuredContent?: unknown;
  isError?: boolean;
};

export type KitePassportPaymentApproval = {
  xPayment: string;
  payer: string;
};

function readMcpConfig() {
  return {
    url: process.env.KITE_MCP_URL || DEFAULT_KITE_MCP_URL,
    authToken: process.env.KITE_MCP_AUTH_TOKEN?.trim(),
  };
}

function parseMcpBody<T>(body: unknown): JsonRpcResponse<T> {
  if (typeof body === 'string') {
    const dataLine = body
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith('data:'));
    return JSON.parse((dataLine ?? body).replace(/^data:\s*/, '')) as JsonRpcResponse<T>;
  }
  return body as JsonRpcResponse<T>;
}

function parseToolJson(result: ToolResult): any {
  if (result.isError) {
    const message = result.content?.map((item) => item.text).filter(Boolean).join(' ') || 'Kite MCP tool returned an error';
    throw new Error(message);
  }
  if (result.structuredContent && typeof result.structuredContent === 'object') {
    return result.structuredContent;
  }
  const text = result.content?.find((item) => item.type === 'text' && item.text)?.text;
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

async function callKiteMcpTool<T = any>(name: string, args: Record<string, unknown>): Promise<T> {
  const cfg = readMcpConfig();
  if (!cfg.authToken) {
    throw new Error('KITE_MCP_AUTH_TOKEN is required for Kite Passport payments');
  }

  const res = await axios.request({
    url: cfg.url,
    method: 'POST',
    headers: {
      Accept: 'application/json, text/event-stream',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.authToken}`,
    },
    data: {
      jsonrpc: '2.0',
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      method: 'tools/call',
      params: { name, arguments: args },
    },
    timeout: 15_000,
    validateStatus: () => true,
  });

  if (res.status >= 400) {
    throw new Error(`Kite MCP ${name} failed: ${res.status} ${typeof res.data === 'string' ? res.data : JSON.stringify(res.data)}`);
  }

  const body = parseMcpBody<ToolResult>(res.data);
  if (body.error) {
    throw new Error(`Kite MCP ${name} failed: ${body.error.message ?? body.error.code ?? 'unknown error'}`);
  }
  return parseToolJson(body.result ?? {}) as T;
}

export async function approveKitePassportPayment(input: {
  payTo: string;
  amount: string;
  tokenType?: string;
  merchantName?: string;
}): Promise<KitePassportPaymentApproval> {
  const payerResult = await callKiteMcpTool<{ payer_addr?: string; payerAddr?: string }>('get_payer_addr', {});
  const payer = payerResult.payer_addr ?? payerResult.payerAddr;
  if (!payer) throw new Error('Kite MCP get_payer_addr did not return payer_addr');

  const approval = await callKiteMcpTool<{ x_payment?: string; xPayment?: string }>('approve_payment', {
    payer_addr: payer,
    payee_addr: input.payTo,
    amount: input.amount,
    token_type: input.tokenType ?? 'USDC',
    merchant_name: input.merchantName,
  });
  const xPayment = approval.x_payment ?? approval.xPayment;
  if (!xPayment) throw new Error('Kite MCP approve_payment did not return x_payment');

  return { xPayment, payer };
}

export function isKitePassportConfigured(): boolean {
  return Boolean(readMcpConfig().authToken);
}
