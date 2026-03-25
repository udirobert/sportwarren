import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { findTelegramMiniAppConnectionByToken } from '@/server/services/communication/platform-connections';
import { generateStaffReply } from '@/server/services/ai/staff-chat';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  token: z.string().min(1, 'Mini App token is required'),
  staffId: z.string().min(1),
  message: z.string().min(1).max(500),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Invalid request' },
      { status: 400 },
    );
  }

  const { token, staffId: rawStaffId, message } = parsed.data;

  // Validate token
  const connection = await findTelegramMiniAppConnectionByToken(prisma, token);
  if (!connection?.squadId || !connection.squad) {
    return NextResponse.json(
      { error: 'That Telegram session expired. Re-open from Telegram.' },
      { status: 404 },
    );
  }

  // Build light squad context from connection data
  const squadMembers = await prisma.squadMember.findMany({
    where: { squadId: connection.squadId },
    include: {
      user: {
        select: { name: true, position: true },
        include: { playerProfile: { select: { level: true, totalMatches: true } } },
      },
    },
    take: 10,
  });

  const treasury = connection.squad.treasury;
  const recentTransactions = treasury?.transactions ?? [];

  const contextLines = [
    `Club: ${connection.squad.name}`,
    `Squad size: ${squadMembers.length} players`,
    squadMembers.length > 0 &&
      `Squad: ${squadMembers.map((m) => `${m.user.name || 'Player'} (Lvl ${m.user.playerProfile?.level ?? 1}, ${m.user.playerProfile?.totalMatches ?? 0} matches)`).join(', ')}`,
    treasury && `Treasury: ${treasury.balance} TON`,
  ].filter(Boolean).join('\n');

  const signalContext = [
    treasury && treasury.balance < 100 && 'Treasury risk: low runway (<100 TON). Prioritise conservative recommendations.',
    squadMembers.length < 8 && 'Squad depth risk: fewer than 8 players available.',
    squadMembers.length >= 14 && 'Squad depth signal: broad rotation options are available.',
    squadMembers.length > 0 && `Average tracked level: ${Math.round(squadMembers.reduce((sum, member) => sum + (member.user.playerProfile?.level ?? 1), 0) / squadMembers.length)}`,
  ].filter(Boolean).join('\n');

  const decisionBlock = recentTransactions.length
    ? `\n\nRecent treasury actions (use this to personalise practical advice):\n${recentTransactions.slice(0, 5).map((transaction) => `- ${transaction.type} ${transaction.amount} TON on ${new Date(transaction.createdAt).toLocaleDateString()}`).join('\n')}`
    : '';

  try {
    const { reply, staff } = await generateStaffReply({
      staffId: rawStaffId,
      message,
      contextBlock: contextLines,
      signalContext,
      decisionBlock,
    });

    return NextResponse.json({
      staffId: staff.staffId,
      staffName: staff.name,
      staffEmoji: staff.emoji,
      reply,
    });
  } catch (error) {
    console.error('[TELEGRAM-ASK] AI query failed:', error);
    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' },
      { status: 503 },
    );
  }
}
