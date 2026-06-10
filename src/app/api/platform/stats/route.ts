import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const waitlistTotal = await prisma.waitlistSignup.count().catch(() => 0);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const recentCardsClaimed = await prisma.user
      .count({
        where: { createdAt: { gte: sevenDaysAgo } },
      })
      .catch(() => 0);
    const totalPlayers = await prisma.user.count().catch(() => 0);
    const matchesPlayedToday = await prisma.match
      .count({
        where: { createdAt: { gte: todayStart } },
      })
      .catch(() => 0);
    const newSquadsThisWeek = await prisma.squad
      .count({
        where: { createdAt: { gte: sevenDaysAgo } },
      })
      .catch(() => 0);
    return NextResponse.json({
      totalPlayers,
      totalMatches: await prisma.match.count().catch(() => 0),
      totalAgents: 0,
      waitlistTotal,
      recentCardsClaimed,
      matchesPlayedToday,
      newSquadsThisWeek,
    });
  } catch {
    return NextResponse.json({
      totalPlayers: 0,
      totalMatches: 0,
      totalAgents: 0,
      waitlistTotal: 0,
      matchesPlayedToday: 0,
      newSquadsThisWeek: 0,
    });
  }
}
