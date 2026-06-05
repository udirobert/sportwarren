import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { endSeason } from '@/server/services/personalization/season';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expiredSeasons = await prisma.season.findMany({
      where: { status: 'active', endDate: { lte: new Date() } },
    });

    let totalSettled = 0;
    for (const season of expiredSeasons) {
      const settled = await endSeason(season.id);
      totalSettled += settled;
    }

    return NextResponse.json({
      success: true,
      seasonsEnded: expiredSeasons.length,
      twinsSettled: totalSettled,
    });
  } catch (error) {
    console.error('[Cron] Season end failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
