import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getStorageAdapter } from '@/server/services/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const olderHoursParam = new URL(request.url).searchParams.get('olderHours');
  const olderHours = Math.max(1, Math.min(720, Number(olderHoursParam) || 24));
  const cutoff = new Date(Date.now() - olderHours * 3600 * 1000);

  const toPurge = await prisma.squadMedia.findMany({
    where: { deletedAt: { lte: cutoff } },
    select: { id: true, storageKey: true, thumbStorageKey: true },
    take: 200,
  });

  const storage = getStorageAdapter();
  let removed = 0;
  for (const m of toPurge) {
    try {
      if (m.storageKey) await storage.removeByKey?.(m.storageKey);
      if (m.thumbStorageKey) await storage.removeByKey?.(m.thumbStorageKey);
      await prisma.squadMedia.delete({ where: { id: m.id } });
      removed++;
    } catch (e) {
      console.warn('[MEDIA-GC] Failed to purge', m.id, e);
    }
  }
  return NextResponse.json({ removed, scanned: toPurge.length, olderHours });
}

