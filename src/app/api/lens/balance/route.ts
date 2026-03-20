import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    const response = await fetch(`${serverUrl}/api/lens/balance?address=${address}`);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Lens balance error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Lens balance' },
      { status: 500 }
    );
  }
}
