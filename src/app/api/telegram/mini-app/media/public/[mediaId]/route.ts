import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';
import { getStorageAdapter } from '@/server/services/storage';
import { getMasterKey, unwrapKeyWithMaster, tryDecryptMedia } from '@/server/services/security/crypto';

export const dynamic = 'force-dynamic';

function getShareKey(): Buffer {
  const b64 = (process.env.MEDIA_SHARE_SECRET || process.env.MEDIA_MASTER_KEY || '').trim();
  if (!b64) throw new Error('MEDIA_SHARE_SECRET or MEDIA_MASTER_KEY required');
  const buf = Buffer.from(b64, 'base64');
  if (buf.length < 32) throw new Error('Share secret must be >=32 bytes base64');
  return buf;
}

export async function GET(request: NextRequest, context: { params: { mediaId: string } }) {
  try {
    const mediaId = context.params.mediaId;
    const url = new URL(request.url);
    const exp = Number(url.searchParams.get('exp') || '0');
    const sig = url.searchParams.get('sig') || '';
    if (!exp || !sig) return new NextResponse('Bad Request', { status: 400 });
    if (Math.floor(Date.now() / 1000) > exp) return new NextResponse('Expired', { status: 410 });
    const payload = `${mediaId}.${exp}`;
    const expect = crypto.createHmac('sha256', getShareKey()).update(payload).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expect))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const media = await prisma.squadMedia.findUnique({ where: { id: mediaId } });
    if (!media || media.deletedAt) return new NextResponse('Not Found', { status: 404 });

    const storage = getStorageAdapter();
    const stored = await storage.readByKey(media.storageKey);
    const master = getMasterKey();
    const secret = await prisma.squadSecret.findUnique({ where: { squadId_kind: { squadId: media.squadId, kind: 'media_enc' } } });
    const key = secret ? unwrapKeyWithMaster(secret.keyEnc, master) : Buffer.alloc(32);
    const buffer = tryDecryptMedia(stored, key);
    return new NextResponse(buffer, {
      status: 200,
      headers: { 'Content-Type': media.mimeType, 'Cache-Control': 'public, max-age=300' },
    });
  } catch {
    return new NextResponse('Server Error', { status: 500 });
  }
}

