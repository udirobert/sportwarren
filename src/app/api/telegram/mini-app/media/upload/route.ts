import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { uploadTelegramMiniAppMedia } from '@/server/services/communication/media';

export const dynamic = 'force-dynamic';

const schema = z.object({
  token: z.string().min(1),
  title: z.string().max(140).optional(),
  mimeType: z.string().min(3),
  dataBase64: z.string().min(10),
  visibility: z.enum(['private', 'squad', 'public']).optional(),
  thumbBase64: z.string().min(10).optional(),
  thumbMimeType: z.string().min(3).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const result = await uploadTelegramMiniAppMedia(prisma, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    const status = message.startsWith('FORBIDDEN') ? 403 : message.startsWith('MEDIA_') ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
