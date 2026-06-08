import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const waitlistTotal = await prisma.waitlistSignup.count().catch(() => 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCardsClaimed = await prisma.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    }).catch(() => 0);
    return NextResponse.json({
      totalPlayers: 0,
      totalMatches: 0,
      totalAgents: 0,
      waitlistTotal,
      recentCardsClaimed,
    });
  } catch {
    return NextResponse.json({ totalPlayers: 0, totalMatches: 0, totalAgents: 0, waitlistTotal: 0 });
  }
}
