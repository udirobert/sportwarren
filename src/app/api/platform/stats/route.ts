import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Extend with live waitlist count; keep others honest/minimal for now
    const waitlistTotal = await prisma.waitlistSignup.count().catch(() => 0);
    return NextResponse.json({
      totalPlayers: 0,
      totalMatches: 0,
      totalAgents: 0,
      waitlistTotal,
    });
  } catch {
    return NextResponse.json({ totalPlayers: 0, totalMatches: 0, totalAgents: 0, waitlistTotal: 0 });
  }
}
