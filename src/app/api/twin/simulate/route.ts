/**
 * Twin Simulation API — run overnight tournaments between player twins.
 *
 * POST /api/twin/simulate
 *   Body: { name, twinIds, entryFeeUsdc? }
 *   → Creates a round-robin simulation, runs matches, distributes prizes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPlayerTwinService } from '@/server/services/ai/twin';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, twinIds, entryFeeUsdc } = body;

    if (!name || !Array.isArray(twinIds) || twinIds.length < 2) {
      return NextResponse.json(
        { error: 'Need a name and at least 2 twinIds' },
        { status: 400 },
      );
    }

    const twinService = getPlayerTwinService();
    const result = await twinService.runSimulation({
      name,
      twinIds,
      entryFeeUsdc: entryFeeUsdc ?? 0,
    });

    return NextResponse.json({
      simulationId: result.simulation.id,
      status: result.simulation.status,
      matchCount: result.matches.length,
      totalPrize: result.simulation.totalPrizeUsdc,
    });
  } catch (error: any) {
    console.error('Twin simulation failed:', error);
    return NextResponse.json(
      { error: error.message ?? 'Simulation failed' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const simulationId = request.nextUrl.searchParams.get('id');

  if (simulationId) {
    const simulation = await prisma.twinSimulation.findUnique({
      where: { id: simulationId },
      include: {
        participants: { orderBy: { points: 'desc' } },
        matches: { orderBy: { round: 'asc' } },
      },
    });
    if (!simulation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ simulation });
  }

  const simulations = await prisma.twinSimulation.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { _count: { select: { participants: true, matches: true } } },
  });

  return NextResponse.json({ simulations });
}
