import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { readTelegramMiniAppMediaThumb } from '@/server/services/communication/media';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, context: { params: { mediaId: string } }) {
  const mediaId = context.params.mediaId;
  const token = new URL(_request.url).searchParams.get('token') || '';
  if (!token) return new NextResponse('Missing token', { status: 400 });

  try {
    const { buffer, mimeType } = await readTelegramMiniAppMediaThumb(prisma, { token, mediaId });
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Read failed';
    const status = message === 'MEDIA_NOT_FOUND' ? 404 : message === 'FORBIDDEN' ? 403 : 400;
    return new NextResponse(message, { status });
  }
}

