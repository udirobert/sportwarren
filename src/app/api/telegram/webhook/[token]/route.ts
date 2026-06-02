import { NextRequest, NextResponse } from 'next/server';
import { getTelegramService } from '@/server/services/communication/telegram';

export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const expectedSuffix = process.env.TELEGRAM_BOT_TOKEN?.slice(-8);

  if (!expectedSuffix || token !== expectedSuffix) {
    return new NextResponse('Not found', { status: 404 });
  }

  const telegramService = getTelegramService();
  if (!telegramService) {
    return new NextResponse('Telegram not configured', { status: 503 });
  }

  try {
    const body = await req.json();
    telegramService.getBot().processUpdate(body);
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('[TELEGRAM WEBHOOK] processing error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
