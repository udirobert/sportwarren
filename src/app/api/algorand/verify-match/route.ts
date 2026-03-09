import { NextResponse } from 'next/server';
import { runMatchVerification } from '@/server/services/blockchain/cre/match-verification';

const APP_ID = parseInt(process.env.ALGORAND_MATCH_VERIFICATION_APP_ID || '756828208', 10);
const EXPLORER_BASE = 'https://testnet.algoexplorer.io';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, timestamp, homeTeam, awayTeam } = body;

    if (!latitude || !longitude || !homeTeam || !awayTeam) {
      return NextResponse.json({ error: 'Missing required fields: latitude, longitude, homeTeam, awayTeam' }, { status: 400 });
    }

    const result = await runMatchVerification({
      latitude,
      longitude,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
      homeTeam,
      awayTeam,
    });

    return NextResponse.json({
      ...result,
      appId: APP_ID,
      appExplorerUrl: `${EXPLORER_BASE}/application/${APP_ID}`,
    });
  } catch (error: any) {
    console.error('Match verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
