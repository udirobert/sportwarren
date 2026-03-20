import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { profileId, content, imageUrl } = await request.json();
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
    const response = await fetch(`${serverUrl}/api/lens/post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, content, imageUrl }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Lens post error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to post on Lens' },
      { status: 500 }
    );
  }
}
