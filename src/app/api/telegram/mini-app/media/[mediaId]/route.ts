import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { readTelegramMiniAppMedia, Visibility } from '@/server/services/communication/media';
import { requireTelegramMiniAppIdentity } from '@/server/services/communication/telegram-mini-app';
import { getSquadMembership, isSquadLeader } from '@/server/services/permissions';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: { mediaId: string } }) {
  const mediaId = context.params.mediaId;
  const token = new URL(_request.url).searchParams.get('token') || '';
  if (!token) return new NextResponse('Missing token', { status: 400 });

  try {
    const { buffer, mimeType } = await readTelegramMiniAppMedia(prisma, { token, mediaId });
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'private, max-age=60',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Read failed';
    const status = message === 'MEDIA_NOT_FOUND' ? 404 : message === 'FORBIDDEN' ? 403 : 400;
    return new NextResponse(message, { status });
  }
}

export async function PATCH(request: NextRequest, context: { params: { mediaId: string } }) {
  const mediaId = context.params.mediaId;
  const body = await request.json().catch(() => null);
  const token = body?.token as string | undefined;
  const visibility = body?.visibility as Visibility | undefined;
  if (!token || !visibility) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  try {
    const identity = await requireTelegramMiniAppIdentity(prisma, token);
    const media = await prisma.squadMedia.findUnique({ where: { id: mediaId } });
    if (!media || media.deletedAt) return NextResponse.json({ error: 'MEDIA_NOT_FOUND' }, { status: 404 });

    const membership = await getSquadMembership(prisma as any, media.squadId, identity.user.id);
    const allowed = media.uploaderId === identity.user.id || isSquadLeader(membership?.role);
    if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

    await prisma.squadMedia.update({ where: { id: mediaId }, data: { visibility } });
    console.log('[MEDIA] visibility updated', { mediaId, by: identity.user.id, visibility });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { mediaId: string } }) {
  const mediaId = context.params.mediaId;
  const body = await request.json().catch(() => null);
  const token = body?.token as string | undefined;
  if (!token) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  try {
    const identity = await requireTelegramMiniAppIdentity(prisma, token);
    const media = await prisma.squadMedia.findUnique({ where: { id: mediaId } });
    if (!media) return NextResponse.json({ error: 'MEDIA_NOT_FOUND' }, { status: 404 });
    const membership = await getSquadMembership(prisma as any, media.squadId, identity.user.id);
    const allowed = media.uploaderId === identity.user.id || isSquadLeader(membership?.role);
    if (!allowed) return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

    await prisma.squadMedia.update({ where: { id: mediaId }, data: { deletedAt: new Date(), deletedBy: identity.user.id } });
    console.log('[MEDIA] deleted', { mediaId, by: identity.user.id });
    // Note: Storage GC can run separately to avoid adapter coupling here.
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
