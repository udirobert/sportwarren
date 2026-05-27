import { NextRequest, NextResponse } from 'next/server';
import {
  giveFeedback,
  getAgentSummary,
  getGoatExplorerUrl,
  isGoatErc8004Configured,
} from '@/server/services/blockchain/goat-erc8004';

export async function POST(request: NextRequest) {
  if (!isGoatErc8004Configured()) {
    return NextResponse.json(
      { error: 'GOAT Network ERC-8004 not configured (missing private key)' },
      { status: 503 },
    );
  }

  let body: {
    agentId?: number;
    value?: number;
    valueDecimals?: number;
    tag1?: string;
    tag2?: string;
    endpoint?: string;
    feedbackURI?: string;
    feedbackHash?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.agentId === undefined || body.value === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields: agentId, value' },
      { status: 400 },
    );
  }

  try {
    const result = await giveFeedback({
      agentId: body.agentId,
      value: body.value,
      valueDecimals: body.valueDecimals,
      tag1: body.tag1 || 'sportwarren',
      tag2: body.tag2 || 'scout',
      endpoint: body.endpoint || '/api/x402/scout',
      feedbackURI: body.feedbackURI,
      feedbackHash: body.feedbackHash,
    });

    return NextResponse.json({
      success: true,
      feedbackIndex: result.feedbackIndex,
      txHash: result.txHash,
      explorerUrl: getGoatExplorerUrl(result.txHash),
    });
  } catch (error) {
    console.error('GOAT Network feedback submission failed:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const agentId = Number(request.nextUrl.searchParams.get('agentId'));
  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId parameter' }, { status: 400 });
  }

  try {
    const summary = await getAgentSummary(agentId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('GOAT Network agent summary fetch failed:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
