import { NextResponse, NextRequest } from 'next/server';
import { getAccountInfo } from '@/lib/algorand';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const address = request.nextUrl.searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const info = await getAccountInfo(address);
    return NextResponse.json(info);
  } catch (error: any) {
    console.error('Algorand account info error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch account info' },
      { status: 500 }
    );
  }
}
