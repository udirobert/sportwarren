import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { recordTelegramTonTopUp } from '@/server/services/communication/telegram-mini-app';

export const dynamic = 'force-dynamic';

const topUpSchema = z.object({
  token: z.string().min(1, 'Mini App token is required'),
  senderAddress: z.string().min(1, 'Sender address is required'),
  amountTon: z.number().int().positive('Amount must be a positive whole TON value'),
  boc: z.string().min(1, 'Signed BOC is required'),
  comment: z.string().min(1, 'TON memo is required'),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = topUpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid request body' },
      { status: 400 }
    );
  }

  try {
    const result = await recordTelegramTonTopUp(prisma, parsed.data);
    return NextResponse.json({
      duplicate: result.duplicate,
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        description: result.transaction.description,
        verified: result.transaction.verified,
        txHash: result.transaction.txHash,
        createdAt: result.transaction.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record TON top-up' },
      { status: 400 }
    );
  }
}
