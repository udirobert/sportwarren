import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTelegramMiniAppIdentity } from '@/server/services/communication/telegram-mini-app';
import { getSquadMembership, isSquadLeader } from '@/server/services/permissions';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getShareKey(): Buffer {
  const b64 = (process.env.MEDIA_SHARE_SECRET || process.env.MEDIA_MASTER_KEY || '').trim();
  if (!b64) throw new Error('MEDIA_SHARE_SECRET or MEDIA_MASTER_KEY required');
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < 32) throw new Error('Share secret must be >=32 bytes base64');
  return buf;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { token?: string; mediaId?: string; expiresInSec?: number } | null;
  const token = body?.token || '';
  const mediaId = body?.mediaId || '';
  const expiresInSec = Math.min(1800, Math.max(60, Number(body?.expiresInSec) || 600));
  if (!token || !mediaId) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  try {
    const identity = await requireTelegramMiniAppIdentity(prisma, token);
    const media = await prisma.squadMedia.findUnique({ where: { id: mediaId } });
    if (!media || media.deletedAt) return NextResponse.json({ error: 'MEDIA_NOT_FOUND' }, { status: 404 });
    const membership = await getSquadMembership(prisma as any, media.squadId, identity.user.id);
    const allowed = media.uploaderId === identity.user.id || isSquadLeader(membership?.role);
    if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

    const exp = Math.floor(Date.now() / 1000) + expiresInSec;
    const payload = `${mediaId}.${exp}`;
    const sig = crypto.createHmac('sha256', getShareKey()).update(payload).digest('hex');
    const base = process.env.NEXT_PUBLIC_APP_URL || '';
    const url = `${base}/api/telegram/mini-app/media/public/${mediaId}?exp=${exp}&sig=${sig}`;
    return NextResponse.json({ url, exp });
  } catch {
    return NextResponse.json({ error: 'Failed to create share URL' }, { status: 400 });
  }
}

