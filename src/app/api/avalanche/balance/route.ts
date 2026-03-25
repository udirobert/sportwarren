import { NextResponse, NextRequest } from 'next/server';
import { getAvalancheBalance } from '@/lib/avalanche';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const balance = await getAvalancheBalance(address);
    return NextResponse.json({ balance });
  } catch (error: any) {
    console.error('Avalanche balance error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
