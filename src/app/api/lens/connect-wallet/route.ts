import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  try {
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    const response = await fetch(`${serverUrl}/api/lens/connect-wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Lens connect-wallet error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect Lens wallet' },
      { status: 500 }
    );
  }
}
