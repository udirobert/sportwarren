import { NextResponse } from 'next/server';
import { connectAvalancheWallet } from '@/lib/avalanche';

export async function POST() {
  try {
    const result = await connectAvalancheWallet();
    
    if (result.error || !result.address) {
      return NextResponse.json(
        { error: result.error || 'Failed to connect wallet' },
        { status: 400 }
      );
    }

    return NextResponse.json({ address: result.address });
  } catch (error: any) {
    console.error('Avalanche wallet connection error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
