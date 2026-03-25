import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getTelegramMiniAppContext } from '@/server/services/communication/telegram-mini-app';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  token: z.string().min(1, 'Mini App token is required'),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    token: request.nextUrl.searchParams.get('token'),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid request' },
      { status: 400 }
    );
  }

  const context = await getTelegramMiniAppContext(prisma, parsed.data.token);
  if (!context) {
    return NextResponse.json(
      { error: 'That Telegram Mini App session expired. Re-open it from Telegram.' },
      { status: 404 }
    );
  }

  return NextResponse.json(context, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
