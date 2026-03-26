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

  try {
    const context = await getTelegramMiniAppContext(prisma, parsed.data.token);
    if (!context) {
      return NextResponse.json(
        { error: 'That Telegram Mini App session expired. Re-open it from Telegram.', code: 'SESSION_EXPIRED' },
        { status: 404 }
      );
    }

    return NextResponse.json(context, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load Mini App context';

    if (message.startsWith('NO_SQUAD:')) {
      return NextResponse.json(
        {
          error: message.replace(/^NO_SQUAD:/, ''),
          code: 'NO_SQUAD',
        },
        { status: 409 },
      );
    }

    if (message.toLowerCase().includes('expired')) {
      return NextResponse.json(
        { error: message, code: 'SESSION_EXPIRED' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: message, code: 'CONTEXT_ERROR' },
      { status: 400 },
    );
  }
}
