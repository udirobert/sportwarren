import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ subjectType: string; subjectId: string }> },
) {
  try {
    const { subjectType, subjectId } = await params;

    if (subjectType !== 'player' && subjectType !== 'squad') {
      return NextResponse.json({ error: 'subjectType must be player or squad' }, { status: 400 });
    }

    const url = new URL(_req.url);
    const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') ?? '30', 10) || 30), 100);
    const cursor = url.searchParams.get('cursor') ?? undefined;
    const kind = url.searchParams.get('kind') ?? undefined; // optional filter

    const where: Record<string, unknown> = { subjectType, subjectId };
    if (kind) where.kind = kind;

    const moments = await prisma.moment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // fetch one extra to detect if there's a next page
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    const hasMore = moments.length > limit;
    const data = moments.slice(0, limit);
    const nextCursor = hasMore ? data[data.length - 1]?.id : null;

    // Also return available distinct kinds and a total count for filter UX
    const [distinctKinds, totalCount] = await Promise.all([
      prisma.moment.findMany({
        where: { subjectType, subjectId },
        select: { kind: true },
        distinct: ['kind'],
      }),
      prisma.moment.count({ where: { subjectType, subjectId } }),
    ]);

    return NextResponse.json({
      moments: data.map((m) => ({
        id: m.id,
        kind: m.kind,
        tier: m.tier,
        label: m.label,
        detail: m.detail,
        renderedKey: m.renderedKey,
        renderedAt: m.renderedAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
      })),
      nextCursor,
      hasMore,
      kinds: distinctKinds.map((k) => k.kind),
      totalCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch moments';
    console.error('[MOMENTS] List error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
