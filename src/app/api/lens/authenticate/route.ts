import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { address, signature, message } = await request.json();

        if (!address || !signature || !message) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
        }

        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000';
        const response = await fetch(`${serverUrl}/api/lens/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, signature, message }),
        });

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Lens authenticate error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to authenticate with Lens' },
            { status: 500 }
        );
    }
}
