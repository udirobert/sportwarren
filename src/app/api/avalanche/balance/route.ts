import { NextResponse } from 'next/server';
import { getAvalancheBalance } from '@/lib/avalanche';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

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
