import { Address as TonAddress, Cell } from '@ton/core';

const DEFAULT_TONCENTER_API_BASE_URL = 'https://toncenter.com/api/v3';
const TONCENTER_TIMEOUT_MS = 8_000;
const TON_NANO_MULTIPLIER = 1_000_000_000n;

interface TonCenterMessage {
  destination?: string | null;
  source?: string | null;
  value?: string | null;
  out_msg_tx_hash?: string | null;
}

interface TonCenterTransaction {
  account?: string | null;
  hash?: string | null;
  in_msg?: TonCenterMessage | null;
  out_msgs?: TonCenterMessage[];
  description?: {
    aborted?: boolean;
    action?: {
      success?: boolean;
    };
    compute_ph?: {
      success?: boolean;
      skipped?: boolean;
    };
  };
}

interface TonCenterTransactionsResponse {
  transactions?: TonCenterTransaction[];
}

export interface VerifyTonTopUpTransferInput {
  expectedDestinationAddress: string;
  expectedAmountTon: number;
  expectedSenderAddress?: string | null;
  boc?: string;
  messageHash?: string;
  transactionHash?: string | null;
}

export interface TonTransferVerificationResult {
  confirmed: boolean;
  messageHash?: string;
  transactionHash?: string | null;
  sourceAddress?: string | null;
  destinationAddress?: string | null;
  amountNano?: string;
  lookup: 'message' | 'transaction' | null;
  reason?: 'missing_lookup' | 'not_found' | 'mismatch';
}

function getTonCenterApiBaseUrl() {
  return (process.env.TONCENTER_API_BASE_URL?.trim() || DEFAULT_TONCENTER_API_BASE_URL).replace(/\/$/, '');
}

function getTonCenterHeaders() {
  const headers = new Headers({
    Accept: 'application/json',
  });

  const apiKey = process.env.TONCENTER_API_KEY?.trim();
  if (apiKey) {
    headers.set('X-API-Key', apiKey);
  }

  return headers;
}

function normalizeTonAddress(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return TonAddress.parse(value).toString({ urlSafe: true, bounceable: false });
  } catch {
    return null;
  }
}

function toNanoString(amountTon: number) {
  return (BigInt(Math.round(amountTon)) * TON_NANO_MULTIPLIER).toString();
}

function transactionSucceeded(transaction: TonCenterTransaction) {
  if (transaction.description?.aborted) {
    return false;
  }

  if (transaction.description?.compute_ph?.success === false) {
    return false;
  }

  if (transaction.description?.action?.success === false) {
    return false;
  }

  return true;
}

function matchesExpectedTransfer({
  sourceAddress,
  destinationAddress,
  value,
  expectedDestinationAddress,
  expectedAmountNano,
  expectedSenderAddress,
}: {
  sourceAddress: string | null;
  destinationAddress: string | null;
  value: string | null | undefined;
  expectedDestinationAddress: string;
  expectedAmountNano: string;
  expectedSenderAddress: string | null;
}) {
  if (!destinationAddress || destinationAddress !== expectedDestinationAddress) {
    return false;
  }

  if (!value || value !== expectedAmountNano) {
    return false;
  }

  if (expectedSenderAddress && sourceAddress !== expectedSenderAddress) {
    return false;
  }

  return true;
}

async function fetchTonCenterTransactions(
  path: string,
  params: Record<string, string | undefined>,
): Promise<TonCenterTransaction[]> {
  const url = new URL(`${getTonCenterApiBaseUrl()}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    headers: getTonCenterHeaders(),
    signal: AbortSignal.timeout(TONCENTER_TIMEOUT_MS),
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`TON Center request failed (${response.status}) for ${path}`);
  }

  const data = await response.json() as TonCenterTransactionsResponse;
  return data.transactions || [];
}

export function computeTonMessageHashFromBoc(boc: string) {
  return Cell.fromBase64(boc).hash().toString('hex');
}

async function verifyByMessageHash({
  messageHash,
  expectedDestinationAddress,
  expectedAmountNano,
  expectedSenderAddress,
}: {
  messageHash: string;
  expectedDestinationAddress: string;
  expectedAmountNano: string;
  expectedSenderAddress: string | null;
}): Promise<TonTransferVerificationResult> {
  const transactions = await fetchTonCenterTransactions('transactionsByMessage', {
    msg_hash: messageHash,
    direction: 'in',
    limit: '10',
  });

  if (!transactions.length) {
    return {
      confirmed: false,
      messageHash,
      lookup: 'message',
      reason: 'not_found',
    };
  }

  for (const transaction of transactions) {
    if (!transactionSucceeded(transaction)) {
      continue;
    }

    const fallbackSource = normalizeTonAddress(transaction.account);
    for (const outMessage of transaction.out_msgs || []) {
      const destinationAddress = normalizeTonAddress(outMessage.destination);
      const sourceAddress = normalizeTonAddress(outMessage.source) || fallbackSource;

      if (!matchesExpectedTransfer({
        sourceAddress,
        destinationAddress,
        value: outMessage.value,
        expectedDestinationAddress,
        expectedAmountNano,
        expectedSenderAddress,
      })) {
        continue;
      }

      return {
        confirmed: true,
        messageHash,
        transactionHash: outMessage.out_msg_tx_hash ?? transaction.hash ?? null,
        sourceAddress,
        destinationAddress,
        amountNano: outMessage.value ?? expectedAmountNano,
        lookup: 'message',
      };
    }
  }

  return {
    confirmed: false,
    messageHash,
    lookup: 'message',
    reason: 'mismatch',
  };
}

async function verifyByTransactionHash({
  transactionHash,
  messageHash,
  expectedDestinationAddress,
  expectedAmountNano,
  expectedSenderAddress,
}: {
  transactionHash: string;
  messageHash?: string;
  expectedDestinationAddress: string;
  expectedAmountNano: string;
  expectedSenderAddress: string | null;
}): Promise<TonTransferVerificationResult> {
  const transactions = await fetchTonCenterTransactions('transactions', {
    hash: transactionHash,
    limit: '10',
  });

  if (!transactions.length) {
    return {
      confirmed: false,
      messageHash,
      transactionHash,
      lookup: 'transaction',
      reason: 'not_found',
    };
  }

  for (const transaction of transactions) {
    if (!transactionSucceeded(transaction)) {
      continue;
    }

    const destinationAddress = normalizeTonAddress(transaction.in_msg?.destination) || normalizeTonAddress(transaction.account);
    const sourceAddress = normalizeTonAddress(transaction.in_msg?.source);

    if (!matchesExpectedTransfer({
      sourceAddress,
      destinationAddress,
      value: transaction.in_msg?.value,
      expectedDestinationAddress,
      expectedAmountNano,
      expectedSenderAddress,
    })) {
      continue;
    }

    return {
      confirmed: true,
      messageHash,
      transactionHash: transaction.hash ?? transactionHash,
      sourceAddress,
      destinationAddress,
      amountNano: transaction.in_msg?.value ?? expectedAmountNano,
      lookup: 'transaction',
    };
  }

  return {
    confirmed: false,
    messageHash,
    transactionHash,
    lookup: 'transaction',
    reason: 'mismatch',
  };
}

export async function verifyTonTopUpTransfer({
  expectedDestinationAddress,
  expectedAmountTon,
  expectedSenderAddress,
  boc,
  messageHash,
  transactionHash,
}: VerifyTonTopUpTransferInput): Promise<TonTransferVerificationResult> {
  const normalizedDestinationAddress = normalizeTonAddress(expectedDestinationAddress);
  const normalizedSenderAddress = normalizeTonAddress(expectedSenderAddress);

  if (!normalizedDestinationAddress) {
    throw new Error('TON verification requires a valid destination address.');
  }

  const nextMessageHash = boc
    ? computeTonMessageHashFromBoc(boc)
    : messageHash?.trim() || undefined;
  const expectedAmountNano = toNanoString(expectedAmountTon);

  if (nextMessageHash) {
    const messageVerification = await verifyByMessageHash({
      messageHash: nextMessageHash,
      expectedDestinationAddress: normalizedDestinationAddress,
      expectedAmountNano,
      expectedSenderAddress: normalizedSenderAddress,
    });

    if (messageVerification.confirmed) {
      return messageVerification;
    }

    if (!transactionHash) {
      return messageVerification;
    }
  }

  if (transactionHash?.trim()) {
    return verifyByTransactionHash({
      transactionHash: transactionHash.trim(),
      messageHash: nextMessageHash,
      expectedDestinationAddress: normalizedDestinationAddress,
      expectedAmountNano,
      expectedSenderAddress: normalizedSenderAddress,
    });
  }

  return {
    confirmed: false,
    messageHash: nextMessageHash,
    lookup: null,
    reason: 'missing_lookup',
  };
}
