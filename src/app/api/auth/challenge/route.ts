import { NextResponse } from 'next/server';
import { generateAuthMessage } from '@/server/trpc';

/**
 * GET /api/auth/challenge
 * Returns a time-limited signed message challenge for wallet authentication.
 * The client signs this message locally and sends the signature back via
 * x-wallet-signature headers on subsequent TRPC requests.
 */
export async function GET() {
    const { message, timestamp } = generateAuthMessage();
    return NextResponse.json({ message, timestamp });
}
