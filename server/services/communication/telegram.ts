import { randomBytes } from 'crypto';
import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/lib/db';
import { getSquadMembership, isSquadLeader } from '@/server/services/permissions';
import { createPendingMatchSubmission } from '../match-submission.js';
import {
  connectTelegramChatByToken,
  createTelegramMiniAppSession,
  extractTelegramConnectToken,
  findTelegramConnectionByChatId,
  isTelegramConnectToken,
} from './platform-connections.js';
import { parseTelegramMatchResult, type ParsedTelegramMatchResult } from './telegram-match-parser.js';
import {
  cancelPendingTreasuryActivity,
  ensureSquadTreasury,
  recordPendingTreasuryActivity,
  settlePendingTreasuryActivity,
  TreasuryBalanceError,
} from '../economy/treasury-ledger.js';

interface PendingMatchDraft extends ParsedTelegramMatchResult {
  id: string;
  chatId: number;
  squadId: string;
  submittedBy: string;
  createdAt: number;
}

type LinkedTelegramChat = NonNullable<Awaited<ReturnType<typeof findTelegramConnectionByChatId>>>;
type AuthorizedLinkedTelegramChat = LinkedTelegramChat & {
  squadId: string;
  platformUserId: string;
};
type AuthorizedTelegramCaptainActor =
  | { error: string }
  | {
      linkedChat: AuthorizedLinkedTelegramChat;
      membership: NonNullable<Awaited<ReturnType<typeof getSquadMembership>>>;
    };

const MATCH_DRAFT_TTL_MS = 15 * 60 * 1000;
const MATCH_FEE_TON = 1;

function readMetadataString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

export class TelegramService {
  private bot: TelegramBot;
  private pendingMatchDrafts = new Map<string, PendingMatchDraft>();

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }

    const useWebhook = process.env.TELEGRAM_WEBHOOK_URL?.trim();

    this.bot = new TelegramBot(token, { polling: !useWebhook });

    if (!useWebhook) {
      this.bot.on('polling_error', (error: Error) => {
        if (!error.message.includes('409 Conflict')) {
          console.error('Telegram polling error:', error.message);
        }
      });
    }

    this.setupCommands();
    this.setupEventHandlers();
  }

  getBot(): TelegramBot {
    return this.bot;
  }

  async setWebhook(webhookUrl: string): Promise<void> {
    try {
      await this.bot.setWebHook(webhookUrl);
      console.log(`✅ Telegram webhook set to ${webhookUrl}`);
    } catch (error) {
      console.error('❌ Failed to set Telegram webhook:', error);
      throw error;
    }
  }

  async deleteWebhook(): Promise<void> {
    try {
      await this.bot.deleteWebHook();
      console.log('✅ Telegram webhook deleted');
    } catch (error) {
      console.error('❌ Failed to delete Telegram webhook:', error);
    }
  }

  private setupCommands(): void {
    this.bot.setMyCommands([
      { command: 'start', description: 'Link Telegram to your SportWarren squad' },
      { command: 'log', description: 'Submit a match result for verification' },
      { command: 'fee', description: 'Propose a match fee from the treasury' },
      { command: 'stats', description: 'View real player or squad stats' },
      { command: 'fixtures', description: 'View scheduled squad fixtures' },
      { command: 'treasury', description: 'Open the Telegram Mini App for TON treasury top-ups' },
      { command: 'help', description: 'Show Telegram commands and linking help' },
    ]).catch((error: Error) => {
      console.warn('Failed to register Telegram commands:', error.message);
    });
  }

  private setupEventHandlers(): void {
    this.bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const startParam = match?.[1]?.trim();

      if (startParam && isTelegramConnectToken(startParam)) {
        await this.handleConnectStart(chatId, extractTelegramConnectToken(startParam), msg.from);
        return;
      }

      await this.bot.sendMessage(chatId, this.buildHelpMessage());
    });

    this.bot.onText(/\/help/, async (msg) => {
      await this.bot.sendMessage(msg.chat.id, this.buildHelpMessage());
    });

    this.bot.onText(/\/log(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const matchText = match?.[1]?.trim();

      if (!matchText) {
        await this.bot.sendMessage(
          chatId,
          'Please include the result. Example: /log 4-2 win vs Red Lions'
        );
        return;
      }

      await this.handleMatchLog(chatId, matchText);
    });

    this.bot.onText(/\/stats(?:\s+(.+))?/, async (msg, match) => {
      await this.handleStatsRequest(msg.chat.id, match?.[1]?.trim());
    });

    this.bot.onText(/\/fixtures/, async (msg) => {
      await this.handleFixturesRequest(msg.chat.id);
    });

    this.bot.onText(/\/fee(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const args = match?.[1]?.trim();

      if (!args) {
        await this.bot.sendMessage(
          chatId,
          'Usage: /fee <matchId> [amount]\n\nExample: /fee abc123 2\n\nProposes a match fee (in TON) to be paid from the squad treasury.'
        );
        return;
      }

      await this.handleFeeProposal(chatId, args, msg.from);
    });

    this.bot.onText(/\/treasury/, async (msg) => {
      await this.handleTreasuryMiniAppRequest(msg.chat.id);
    });

    this.bot.on('inline_query', async (query) => {
      await this.handleInlineQuery(query);
    });

    this.bot.on('callback_query', async (query) => {
      await this.handleCallbackQuery(query);
    });
  }

  private buildHelpMessage(): string {
    return [
      'SportWarren Telegram',
      '',
      'Use Telegram as a real squad operations surface once you link it from Settings in the app.',
      '',
      'Commands:',
      '/log 4-2 win vs Red Lions',
      '/stats',
      '/stats Marcus',
      '/fixtures',
      '/treasury',
      '/help',
      '',
      'Linking:',
      'Open SportWarren Settings > Connections > Telegram and use the generated link.',
    ].join('\n');
  }

  private async handleTreasuryMiniAppRequest(chatId: number): Promise<void> {
    const linkedChat = await this.requireLinkedChat(chatId);
    if (!linkedChat?.squadId) {
      await this.bot.sendMessage(chatId, 'This chat is not linked to a SportWarren squad yet. Link Telegram from Settings before opening the treasury Mini App.');
      return;
    }

    try {
      const session = await createTelegramMiniAppSession(prisma, linkedChat.id);
      const keyboard = {
        inline_keyboard: [[
          {
            text: 'Open Treasury Mini App',
            web_app: { url: session.url },
          },
        ]],
      };

      await this.bot.sendMessage(
        chatId,
        [
          `${linkedChat.squad?.name || 'Squad'} treasury`,
          '',
          'Open the Telegram Mini App to connect a TON wallet and submit a squad treasury top-up.',
          'Top-ups are recorded as pending until they are reconciled on-chain.',
        ].join('\n'),
        { reply_markup: keyboard }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The Telegram Mini App is not configured on this deployment.';
      await this.bot.sendMessage(chatId, message);
    }
  }

  private pruneExpiredDrafts(): void {
    const cutoff = Date.now() - MATCH_DRAFT_TTL_MS;
    for (const [draftId, draft] of this.pendingMatchDrafts.entries()) {
      if (draft.createdAt < cutoff) {
        this.pendingMatchDrafts.delete(draftId);
      }
    }
  }

  private createDraftId(): string {
    return randomBytes(6).toString('hex');
  }

  private async requireLinkedChat(chatId: number) {
    return findTelegramConnectionByChatId(prisma, String(chatId));
  }

  private async requireLinkedCaptainActor(chatId: number, telegramUserId: string): Promise<AuthorizedTelegramCaptainActor> {
    const linkedChat = await this.requireLinkedChat(chatId);
    if (!linkedChat?.squadId) {
      return {
        error: 'This chat is not linked to a SportWarren squad yet.',
      };
    }

    if (!linkedChat.platformUserId || linkedChat.platformUserId !== telegramUserId) {
      return {
        error: 'Only the Telegram account that linked this squad can manage treasury actions right now.',
      };
    }

    const membership = await getSquadMembership(prisma, linkedChat.squadId, linkedChat.userId);
    if (!membership || !isSquadLeader(membership.role)) {
      return {
        error: 'Only squad captains can manage treasury actions.',
      };
    }

    return {
      linkedChat: linkedChat as AuthorizedLinkedTelegramChat,
      membership,
    };
  }

  private async handleConnectStart(chatId: number, token: string, user: TelegramBot.User | undefined): Promise<void> {
    if (!user) {
      await this.bot.sendMessage(chatId, 'We could not read your Telegram account. Please try again from the Telegram app.');
      return;
    }

    const result = await connectTelegramChatByToken(prisma, token, {
      chatId: String(chatId),
      platformUserId: String(user.id),
      username: user.username,
    });

    if (!result) {
      await this.bot.sendMessage(
        chatId,
        'That link is no longer valid. Generate a fresh Telegram link from SportWarren Settings and try again.'
      );
      return;
    }

    await this.bot.sendMessage(
      chatId,
      'Telegram is now linked to your SportWarren squad. You can return to the app, or start with /log, /stats, or /fixtures.'
    );
  }

  private async handleMatchLog(chatId: number, matchText: string): Promise<void> {
    try {
      this.pruneExpiredDrafts();

      const linkedChat = await this.requireLinkedChat(chatId);
      if (!linkedChat?.squadId) {
        await this.bot.sendMessage(
          chatId,
          'This chat is not linked to a SportWarren squad yet. Link Telegram from Settings before logging matches.'
        );
        return;
      }

      const parsed = parseTelegramMatchResult(matchText);
      if (!parsed) {
        await this.bot.sendMessage(
          chatId,
          [
            'Could not parse that result.',
            '',
            'Try one of these formats:',
            '4-2 win vs Red Lions',
            'lost 1-3 to Sunday Legends',
            'drew 2-2 with Park Rangers',
          ].join('\n')
        );
        return;
      }

      const draftId = this.createDraftId();
      const draft: PendingMatchDraft = {
        id: draftId,
        chatId,
        squadId: linkedChat.squadId,
        submittedBy: linkedChat.userId,
        createdAt: Date.now(),
        ...parsed,
      };

      this.pendingMatchDrafts.set(draftId, draft);

      const keyboard = {
        inline_keyboard: [[
          { text: 'Confirm', callback_data: `confirm_match:${draftId}` },
          { text: 'Cancel', callback_data: `cancel_match:${draftId}` },
        ]],
      };

      const squadLabel = linkedChat.squad?.name || 'Your squad';
      const message = [
        'Match log draft',
        '',
        `${squadLabel} ${draft.teamScore} - ${draft.opponentScore} ${draft.opponent}`,
        `Outcome: ${draft.outcome}`,
        '',
        'Submit this result to the verification queue?',
      ].join('\n');

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
    } catch (error) {
      console.error('Error handling Telegram match log:', error);
      await this.bot.sendMessage(chatId, 'We could not prepare that match log. Please try again.');
    }
  }

  private async resolveOpponentSquad(squadId: string, opponentName: string) {
    const exactMatch = await prisma.squad.findFirst({
      where: {
        id: { not: squadId },
        OR: [
          { name: { equals: opponentName, mode: 'insensitive' } },
          { shortName: { equals: opponentName, mode: 'insensitive' } },
        ],
      },
    });

    if (exactMatch) {
      return exactMatch;
    }

    const closeMatches = await prisma.squad.findMany({
      where: {
        id: { not: squadId },
        OR: [
          { name: { contains: opponentName, mode: 'insensitive' } },
          { shortName: { contains: opponentName, mode: 'insensitive' } },
        ],
      },
      take: 2,
      orderBy: { createdAt: 'asc' },
    });

    if (closeMatches.length === 1) {
      return closeMatches[0];
    }

    return null;
  }

  private async processMatchLog(draft: PendingMatchDraft): Promise<{ id: string; shareSlug: string | null; opponentName: string }> {
    const membership = await getSquadMembership(prisma, draft.squadId, draft.submittedBy);
    if (!membership || !isSquadLeader(membership.role)) {
      throw new Error('Only current squad captains can submit Telegram match logs.');
    }

    const squad = await prisma.squad.findUnique({
      where: { id: draft.squadId },
    });

    if (!squad) {
      throw new Error('The linked SportWarren squad no longer exists.');
    }

    const opponent = await this.resolveOpponentSquad(draft.squadId, draft.opponent);
    if (!opponent) {
      throw new Error(`We could not find a squad named "${draft.opponent}". Use the exact SportWarren squad name and try again.`);
    }

    const match = await createPendingMatchSubmission({
      prisma,
      homeSquadId: squad.id,
      awaySquadId: opponent.id,
      homeScore: draft.teamScore,
      awayScore: draft.opponentScore,
      submittedBy: draft.submittedBy,
      matchDate: new Date(),
    });

    this.pendingMatchDrafts.delete(draft.id);

    return {
      id: match.id,
      shareSlug: match.shareSlug ?? null,
      opponentName: opponent.name,
    };
  }

  private async handleStatsRequest(chatId: number, playerName?: string): Promise<void> {
    const linkedChat = await this.requireLinkedChat(chatId);
    if (!linkedChat?.squadId) {
      await this.bot.sendMessage(chatId, 'Link this chat from SportWarren Settings before requesting live stats.');
      return;
    }

    if (playerName) {
      const profile = await prisma.playerProfile.findFirst({
        where: {
          user: {
            squads: {
              some: { squadId: linkedChat.squadId },
            },
            name: {
              contains: playerName,
              mode: 'insensitive',
            },
          },
        },
        include: {
          user: {
            select: { name: true },
          },
        },
      });

      if (!profile) {
        await this.bot.sendMessage(chatId, `No player named "${playerName}" was found in the linked squad.`);
        return;
      }

      await this.bot.sendMessage(
        chatId,
        [
          `${profile.user.name || 'Player'} stats`,
          '',
          `Matches: ${profile.totalMatches}`,
          `Goals: ${profile.totalGoals}`,
          `Assists: ${profile.totalAssists}`,
          `Reputation: ${profile.reputationScore}`,
          `Season XP: ${profile.seasonXP}`,
        ].join('\n')
      );
      return;
    }

    const squad = await prisma.squad.findUnique({
      where: { id: linkedChat.squadId },
      select: { name: true },
    });

    const matches = await prisma.match.findMany({
      where: {
        status: { in: ['verified', 'finalized'] },
        OR: [
          { homeSquadId: linkedChat.squadId },
          { awaySquadId: linkedChat.squadId },
        ],
      },
      select: {
        homeSquadId: true,
        awaySquadId: true,
        homeScore: true,
        awayScore: true,
      },
    });

    const totals = matches.reduce(
      (summary, match) => {
        const isHome = match.homeSquadId === linkedChat.squadId;
        const goalsFor = isHome ? match.homeScore ?? 0 : match.awayScore ?? 0;
        const goalsAgainst = isHome ? match.awayScore ?? 0 : match.homeScore ?? 0;

        summary.goalsFor += goalsFor;
        summary.goalsAgainst += goalsAgainst;

        if (goalsFor > goalsAgainst) summary.wins += 1;
        else if (goalsFor < goalsAgainst) summary.losses += 1;
        else summary.draws += 1;

        return summary;
      },
      { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
    );

    const winRate = matches.length > 0 ? Math.round((totals.wins / matches.length) * 100) : 0;

    await this.bot.sendMessage(
      chatId,
      [
        `${squad?.name || 'Squad'} stats`,
        '',
        `Verified matches: ${matches.length}`,
        `Record: ${totals.wins}-${totals.draws}-${totals.losses}`,
        `Goals scored: ${totals.goalsFor}`,
        `Goals conceded: ${totals.goalsAgainst}`,
        `Win rate: ${winRate}%`,
      ].join('\n')
    );
  }

  private async handleFixturesRequest(chatId: number): Promise<void> {
    const linkedChat = await this.requireLinkedChat(chatId);
    if (!linkedChat?.squadId) {
      await this.bot.sendMessage(chatId, 'Link this chat from SportWarren Settings before requesting fixtures.');
      return;
    }

    const challenges = await prisma.matchChallenge.findMany({
      where: {
        proposedDate: { gte: new Date() },
        OR: [
          { fromSquadId: linkedChat.squadId },
          { toSquadId: linkedChat.squadId },
        ],
        status: { in: ['pending', 'accepted'] },
      },
      include: {
        fromSquad: { select: { name: true } },
        toSquad: { select: { name: true } },
        pitch: { select: { name: true, location: true } },
      },
      orderBy: { proposedDate: 'asc' },
      take: 3,
    });

    if (challenges.length === 0) {
      await this.bot.sendMessage(chatId, 'No scheduled fixtures are currently stored for this squad.');
      return;
    }

    const message = challenges.map((challenge) => {
      const isHome = challenge.fromSquadId === linkedChat.squadId;
      const opponent = isHome ? challenge.toSquad.name : challenge.fromSquad.name;
      const pitch = challenge.pitch?.name || challenge.pitch?.location || 'Pitch TBD';

      return [
        challenge.proposedDate.toLocaleString(),
        `vs ${opponent}`,
        pitch,
      ].join('\n');
    }).join('\n\n');

    await this.bot.sendMessage(chatId, `Upcoming fixtures\n\n${message}`);
  }

  private async handleFeeProposal(chatId: number, args: string, user: TelegramBot.User | undefined): Promise<void> {
    if (!user) {
      await this.bot.sendMessage(chatId, 'Could not read your Telegram account.');
      return;
    }

    const actor = await this.requireLinkedCaptainActor(chatId, String(user.id));
    if ('error' in actor) {
      await this.bot.sendMessage(chatId, actor.error);
      return;
    }

    const { linkedChat } = actor;

    const parts = args.split(/\s+/);
    const matchId = parts[0]?.trim() || '';
    const feeAmount = Number(parts[1]) || MATCH_FEE_TON;

    if (!matchId) {
      await this.bot.sendMessage(chatId, 'Provide a match ID. Example: /fee abc123 2');
      return;
    }

    if (feeAmount <= 0 || feeAmount > 100) {
      await this.bot.sendMessage(chatId, 'Fee amount must be between 0 and 100 TON.');
      return;
    }

    try {
      const match = await prisma.match.findUnique({
        where: { id: matchId },
        select: {
          id: true,
          homeSquadId: true,
          awaySquadId: true,
          homeSquad: { select: { name: true } },
          awaySquad: { select: { name: true } },
          homeScore: true,
          awayScore: true,
        },
      });

      if (!match) {
        await this.bot.sendMessage(chatId, `Match "${matchId}" not found. Use /log to create a match first.`);
        return;
      }

      if (match.homeSquadId !== linkedChat.squadId && match.awaySquadId !== linkedChat.squadId) {
        await this.bot.sendMessage(chatId, 'That match does not belong to your squad.');
        return;
      }

      const treasury = await ensureSquadTreasury(prisma, linkedChat.squadId);
      if (treasury.balance < feeAmount) {
        await this.bot.sendMessage(chatId, `Insufficient treasury balance (${treasury.balance} TON) for a ${feeAmount} TON fee.`);
        return;
      }

      const feeReference = `telegram-match-fee:${linkedChat.squadId}:${match.id}:${feeAmount}`;
      const feeTx = await recordPendingTreasuryActivity({
        prisma,
        squadId: linkedChat.squadId,
        type: 'expense',
        category: 'match_fee_pending',
        amount: feeAmount,
        description: `Match fee for ${match.homeSquad.name} vs ${match.awaySquad.name}`,
        txHash: feeReference,
        metadata: {
          source: 'telegram-match-fee',
          matchId: match.id,
          proposedByUserId: linkedChat.userId,
          proposedByTelegramUserId: String(user.id),
          homeSquad: match.homeSquad.name,
          awaySquad: match.awaySquad.name,
          score: `${match.homeScore ?? '?'}-${match.awayScore ?? '?'}`,
          feeReference,
        },
      });

      const keyboard = {
        inline_keyboard: [[
          { text: `✅ Approve ${feeAmount} TON`, callback_data: `approve_fee:${feeTx.transaction.id}` },
          { text: '❌ Reject', callback_data: `reject_fee:${feeTx.transaction.id}` },
        ]],
      };

      const message = [
        `⚽ Match Fee Proposal`,
        '',
        `${match.homeSquad.name} vs ${match.awaySquad.name}`,
        `Score: ${match.homeScore ?? '?'} - ${match.awayScore ?? '?'}`,
        '',
        `Fee: ${feeAmount} TON from squad treasury`,
        `Balance: ${treasury.balance} TON`,
        '',
        'Approve to deduct from treasury?',
      ].join('\n');

      await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
    } catch (error) {
      console.error('Error handling fee proposal:', error);
      await this.bot.sendMessage(chatId, 'Could not create the fee proposal. Please try again.');
    }
  }

  private async handleFeeCallback(
    query: TelegramBot.CallbackQuery,
    action: 'approve_fee' | 'reject_fee',
    transactionId: string,
  ): Promise<void> {
    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;
    const telegramUserId = String(query.from.id);

    if (!chatId || !messageId || !query.id || !transactionId) {
      if (query.id) {
        await this.bot.answerCallbackQuery(query.id);
      }
      return;
    }

    const actor = await this.requireLinkedCaptainActor(chatId, telegramUserId);
    if ('error' in actor) {
      await this.bot.answerCallbackQuery(query.id, {
        text: actor.error,
        show_alert: true,
      });
      return;
    }

    const { linkedChat } = actor;
    const pendingTransaction = await prisma.treasuryTransaction.findFirst({
      where: {
        id: transactionId,
        treasury: {
          squadId: linkedChat.squadId,
        },
      },
      include: {
        treasury: true,
      },
    });

    if (
      !pendingTransaction
      || pendingTransaction.type !== 'expense'
      || pendingTransaction.category !== 'match_fee_pending'
    ) {
      await this.bot.answerCallbackQuery(query.id, {
        text: 'That fee proposal is no longer pending.',
        show_alert: false,
      });
      return;
    }

    const homeSquad = readMetadataString(pendingTransaction.metadata, 'homeSquad') ?? 'Home Squad';
    const awaySquad = readMetadataString(pendingTransaction.metadata, 'awaySquad') ?? 'Away Squad';
    const score = readMetadataString(pendingTransaction.metadata, 'score') ?? '?-?';
    const matchId = readMetadataString(pendingTransaction.metadata, 'matchId') ?? 'unknown';

    try {
      if (action === 'reject_fee') {
        await cancelPendingTreasuryActivity({
          prisma,
          squadId: linkedChat.squadId,
          transactionId,
          expectedType: 'expense',
          expectedCategory: 'match_fee_pending',
        });

        await this.bot.editMessageText(
          [
            'Match fee rejected.',
            '',
            `${homeSquad} vs ${awaySquad}`,
            `Score: ${score}`,
            `Match ID: ${matchId}`,
            '',
            'No treasury funds were moved.',
          ].join('\n'),
          {
            chat_id: chatId,
            message_id: messageId,
          }
        );
        await this.bot.answerCallbackQuery(query.id, { text: 'Fee rejected' });
        return;
      }

      const settled = await settlePendingTreasuryActivity({
        prisma,
        squadId: linkedChat.squadId,
        transactionId,
        settledByUserId: linkedChat.userId,
        settledTxHash: pendingTransaction.txHash,
        expectedType: 'expense',
        expectedCategory: 'match_fee_pending',
        nextCategory: 'match_fee',
        metadataPatch: {
          approvedByTelegramUserId: telegramUserId,
          approvedVia: 'telegram',
        },
      });

      await this.bot.editMessageText(
        [
          'Match fee approved.',
          '',
          `${homeSquad} vs ${awaySquad}`,
          `Score: ${score}`,
          `Match ID: ${matchId}`,
          '',
          `Deducted: ${pendingTransaction.amount} TON`,
          `Updated balance: ${settled.treasury.balance} TON`,
        ].join('\n'),
        {
          chat_id: chatId,
          message_id: messageId,
        }
      );
      await this.bot.answerCallbackQuery(query.id, { text: 'Fee approved' });
    } catch (error) {
      const message = error instanceof TreasuryBalanceError
        ? 'Treasury balance is no longer sufficient for that fee.'
        : error instanceof Error
          ? error.message
          : 'Could not update the fee proposal.';

      await this.bot.answerCallbackQuery(query.id, {
        text: message,
        show_alert: false,
      });
    }
  }

  private async handleInlineQuery(query: TelegramBot.InlineQuery): Promise<void> {
    const queryText = query.query.toLowerCase();
    const results: TelegramBot.InlineQueryResultArticle[] = [];

    if (queryText.includes('log') || queryText.includes('match')) {
      results.push({
        type: 'article',
        id: 'log-match',
        title: 'Log match result',
        description: 'Insert a SportWarren match log command',
        input_message_content: {
          message_text: '/log 4-2 win vs Red Lions',
        },
      });
    }

    if (queryText.includes('stats')) {
      results.push({
        type: 'article',
        id: 'view-stats',
        title: 'View squad stats',
        description: 'Insert the SportWarren stats command',
        input_message_content: {
          message_text: '/stats',
        },
      });
    }

    await this.bot.answerInlineQuery(query.id, results);
  }

  private async handleCallbackQuery(query: TelegramBot.CallbackQuery): Promise<void> {
    const data = query.data;
    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;

    if (!data || !chatId || !messageId) {
      if (query.id) {
        await this.bot.answerCallbackQuery(query.id);
      }
      return;
    }

    this.pruneExpiredDrafts();

    const [action, draftId] = data.split(':');

    if (action === 'approve_fee' || action === 'reject_fee') {
      await this.handleFeeCallback(query, action, draftId);
      return;
    }

    const draft = draftId ? this.pendingMatchDrafts.get(draftId) : undefined;

    if (!draft || draft.chatId !== chatId) {
      await this.bot.answerCallbackQuery(query.id, {
        text: 'That draft expired. Send /log again.',
        show_alert: false,
      });
      return;
    }

    if (action === 'cancel_match') {
      this.pendingMatchDrafts.delete(draft.id);
      await this.bot.editMessageText('Match logging cancelled.', {
        chat_id: chatId,
        message_id: messageId,
      });
      await this.bot.answerCallbackQuery(query.id);
      return;
    }

    if (action !== 'confirm_match') {
      await this.bot.answerCallbackQuery(query.id);
      return;
    }

    try {
      const match = await this.processMatchLog(draft);
      await this.bot.editMessageText(
        `Match submitted successfully.\n\nMatch ID: ${match.id}\nOpponent: ${match.opponentName}\nStatus: pending verification`,
        {
          chat_id: chatId,
          message_id: messageId,
        }
      );
      await this.bot.answerCallbackQuery(query.id, { text: 'Match submitted' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not submit that match.';
      await this.bot.editMessageText(`Telegram match logging failed.\n\n${message}`, {
        chat_id: chatId,
        message_id: messageId,
      });
      await this.bot.answerCallbackQuery(query.id, {
        text: 'Submission failed',
        show_alert: false,
      });
    }
  }

  async sendMatchNotification(chatId: string, message: string): Promise<void> {
    const numericChatId = Number.parseInt(chatId, 10);
    if (Number.isNaN(numericChatId)) {
      console.warn('Invalid Telegram chat ID:', chatId);
      return;
    }

    try {
      await this.bot.sendMessage(numericChatId, message);
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  }

  async sendMatchUpdate(chatId: string, update: any): Promise<void> {
    const message = [
      'Live update',
      '',
      `${update.homeTeam} ${update.homeScore} - ${update.awayScore} ${update.awayTeam}`,
      update.event || 'No event details provided.',
      update.minute ? `${update.minute}'` : 'Minute unavailable',
    ].join('\n');

    await this.sendMatchNotification(chatId, message);
  }
}
