import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalPlayers: 10247,
    totalMatches: 5432,
    totalAgents: 528,
  });
}
