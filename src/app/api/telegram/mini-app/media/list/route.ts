import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { listTelegramMiniAppMedia } from '@/server/services/communication/media';

export const dynamic = 'force-dynamic';

const schema = z.object({ token: z.string().min(1) });

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const items = await listTelegramMiniAppMedia(prisma, parsed.data.token);
    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'List failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

