import { NextRequest, NextResponse } from 'next/server';
import {
  registerAgent,
  buildAgentRegistrationJSON,
  getAgentRegistryIdentifier,
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
    name?: string;
    description?: string;
    imageUrl?: string;
    serviceEndpoints?: Array<{
      name: string;
      endpoint: string;
      version: string;
    }>;
    agentURI?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.name) {
    return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
  }

  try {
    let agentURI = body.agentURI;

    if (!agentURI) {
      const registrationJSON = buildAgentRegistrationJSON({
        name: body.name,
        description: body.description || `SportWarren agent: ${body.name}`,
        imageUrl: body.imageUrl,
        serviceEndpoints: body.serviceEndpoints || [
          {
            name: 'x402',
            endpoint: `${process.env.NEXT_PUBLIC_APP_URL || 'https://api.sportwarren.com'}/api/x402/scout`,
            version: '1.0.0',
          },
        ],
        x402Support: true,
      });

      agentURI = `data:application/json;base64,${Buffer.from(JSON.stringify(registrationJSON)).toString('base64')}`;
    }

    const result = await registerAgent(agentURI);

    return NextResponse.json({
      success: true,
      agentId: result.agentId,
      txHash: result.txHash,
      explorerUrl: getGoatExplorerUrl(result.txHash),
      agentRegistryIdentifier: getAgentRegistryIdentifier(),
      agentURI,
    });
  } catch (error) {
    console.error('GOAT Network agent registration failed:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
