import { NextResponse } from 'next/server';

export async function GET() {
  // Return honest numbers - no fake data
  return NextResponse.json({
    totalPlayers: 0,
    totalMatches: 0,
    totalAgents: 0,
  });
}
