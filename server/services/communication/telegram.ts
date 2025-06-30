import TelegramBot from 'node-telegram-bot-api';

export class TelegramService {
  private bot: TelegramBot;

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.setupCommands();
    this.setupEventHandlers();
  }

  private setupCommands(): void {
    // Set bot commands for better UX
    this.bot.setMyCommands([
      { command: 'start', description: 'Start using SportWarren bot' },
      { command: 'log', description: 'Log a match result' },
      { command: 'score', description: 'Update live score' },
      { command: 'lineup', description: 'Set team lineup' },
      { command: 'motm', description: 'Vote for Man of the Match' },
      { command: 'stats', description: 'Get player/team statistics' },
      { command: 'fixtures', description: 'View upcoming matches' },
      { command: 'help', description: 'Show available commands' },
    ]);
  }

  private setupEventHandlers(): void {
    // Handle /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `🏆 Welcome to SportWarren!\n\n` +
        `Track your grassroots football with zero hassle.\n\n` +
        `Available commands:\n` +
        `⚽ /log - Log match results\n` +
        `📊 /stats - View statistics\n` +
        `📅 /fixtures - Upcoming matches\n` +
        `🏆 /motm - Vote for MOTM\n` +
        `❓ /help - Show all commands`;

      await this.bot.sendMessage(chatId, welcomeMessage);
    });

    // Handle /log command
    this.bot.onText(/\/log (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const matchText = match?.[1];

      if (matchText) {
        await this.handleMatchLog(chatId, matchText, msg.from);
      } else {
        await this.bot.sendMessage(chatId, '❌ Please provide match details. Example: /log 4-2 win vs Red Lions');
      }
    });

    // Handle /score command for live updates
    this.bot.onText(/\/score (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const scoreUpdate = match?.[1];

      if (scoreUpdate) {
        await this.handleScoreUpdate(chatId, scoreUpdate);
      }
    });

    // Handle /motm command
    this.bot.onText(/\/motm/, async (msg) => {
      await this.handleMotmVoting(msg.chat.id, msg.from);
    });

    // Handle /stats command
    this.bot.onText(/\/stats(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const playerName = match?.[1];
      await this.handleStatsRequest(chatId, playerName, msg.from);
    });

    // Handle /fixtures command
    this.bot.onText(/\/fixtures/, async (msg) => {
      await this.handleFixturesRequest(msg.chat.id, msg.from);
    });

    // Handle inline queries for quick actions
    this.bot.on('inline_query', async (query) => {
      await this.handleInlineQuery(query);
    });

    // Handle callback queries from inline keyboards
    this.bot.on('callback_query', async (query) => {
      await this.handleCallbackQuery(query);
    });
  }

  private async handleMatchLog(chatId: number, matchText: string, user: any): Promise<void> {
    try {
      const matchData = this.parseMatchResult(matchText);
      
      if (matchData) {
        // Create inline keyboard for confirmation
        const keyboard = {
          inline_keyboard: [
            [
              { text: '✅ Confirm', callback_data: `confirm_match_${JSON.stringify(matchData)}` },
              { text: '❌ Cancel', callback_data: 'cancel_match' },
            ],
            [
              { text: '✏️ Edit Details', callback_data: `edit_match_${JSON.stringify(matchData)}` },
            ],
          ],
        };

        const message = `📝 **Match Log Confirmation**\n\n` +
          `⚽ Result: ${matchData.homeScore}-${matchData.awayScore}\n` +
          `🏆 Outcome: ${matchData.result}\n` +
          `⚔️ Opponent: ${matchData.opponent}\n` +
          `🏠 Home: ${matchData.isHome ? 'Yes' : 'No'}\n\n` +
          `Confirm to save this match?`;

        await this.bot.sendMessage(chatId, message, { reply_markup: keyboard });
      } else {
        await this.bot.sendMessage(chatId, 
          '❌ Could not parse match details.\n\n' +
          'Try formats like:\n' +
          '• "4-2 win vs Red Lions"\n' +
          '• "lost 1-3 to Sunday Legends"\n' +
          '• "drew 2-2 with Park Rangers"'
        );
      }
    } catch (error) {
      console.error('Error handling match log:', error);
      await this.bot.sendMessage(chatId, '❌ Error processing match log. Please try again.');
    }
  }

  private async handleScoreUpdate(chatId: number, scoreUpdate: string): Promise<void> {
    // Parse score updates like "+1 home", "-1 away", "2-1"
    const patterns = [
      /([+-]\d+)\s+(home|away)/i,
      /(\d+)-(\d+)/,
    ];

    for (const pattern of patterns) {
      const match = scoreUpdate.match(pattern);
      if (match) {
        // Process score update
        await this.bot.sendMessage(chatId, `⚽ Score updated: ${scoreUpdate}`);
        return;
      }
    }

    await this.bot.sendMessage(chatId, '❌ Invalid score format. Try "+1 home" or "2-1"');
  }

  private async handleMotmVoting(chatId: number, user: any): Promise<void> {
    // Create poll for MOTM voting
    const pollOptions = [
      'Marcus Johnson',
      'Sarah Martinez', 
      'Jamie Thompson',
      'Emma Wilson',
      'Ryan Murphy',
    ];

    try {
      await this.bot.sendPoll(
        chatId,
        '🏆 Vote for Man of the Match',
        pollOptions,
        {
          is_anonymous: false,
          allows_multiple_answers: false,
        }
      );
    } catch (error) {
      console.error('Error creating MOTM poll:', error);
      await this.bot.sendMessage(chatId, '❌ Error creating poll. Please try again.');
    }
  }

  private async handleStatsRequest(chatId: number, playerName?: string, user?: any): Promise<void> {
    // Mock stats data - in real app, fetch from database
    const statsMessage = playerName 
      ? `📊 **${playerName} Stats**\n\n⚽ Goals: 18\n🎯 Assists: 11\n⭐ Rating: 8.2\n🏆 Matches: 24`
      : `📊 **Team Stats**\n\n⚽ Total Goals: 45\n🎯 Total Assists: 38\n📈 Win Rate: 67%\n🏆 Matches: 24`;

    await this.bot.sendMessage(chatId, statsMessage);
  }

  private async handleFixturesRequest(chatId: number, user?: any): Promise<void> {
    const fixturesMessage = `📅 **Upcoming Fixtures**\n\n` +
      `🗓️ Jan 20, 2:00 PM\n⚔️ vs Grass Roots United\n🏟️ Regent's Park\n\n` +
      `🗓️ Jan 27, 3:30 PM\n⚔️ vs Borough Rovers\n🏟️ Hampstead Heath`;

    await this.bot.sendMessage(chatId, fixturesMessage);
  }

  private async handleInlineQuery(query: any): Promise<void> {
    const queryText = query.query.toLowerCase();
    const results = [];

    if (queryText.includes('log') || queryText.includes('match')) {
      results.push({
        type: 'article',
        id: '1',
        title: 'Log Match Result',
        description: 'Quickly log a match result',
        input_message_content: {
          message_text: '/log ',
        },
      });
    }

    if (queryText.includes('stats')) {
      results.push({
        type: 'article',
        id: '2',
        title: 'View Stats',
        description: 'Check player or team statistics',
        input_message_content: {
          message_text: '/stats',
        },
      });
    }

    await this.bot.answerInlineQuery(query.id, results);
  }

  private async handleCallbackQuery(query: any): Promise<void> {
    const data = query.data;
    const chatId = query.message?.chat.id;

    if (!chatId) return;

    if (data.startsWith('confirm_match_')) {
      const matchData = JSON.parse(data.replace('confirm_match_', ''));
      await this.processMatchLog(matchData, chatId, query.from);
      await this.bot.editMessageText('✅ Match logged successfully!', {
        chat_id: chatId,
        message_id: query.message?.message_id,
      });
    } else if (data === 'cancel_match') {
      await this.bot.editMessageText('❌ Match logging cancelled.', {
        chat_id: chatId,
        message_id: query.message?.message_id,
      });
    }

    await this.bot.answerCallbackQuery(query.id);
  }

  private parseMatchResult(text: string): any | null {
    // Same parsing logic as WhatsApp service
    const patterns = [
      /(\d+)-(\d+)\s+(win|won)\s+(?:vs|against)\s+(.+)/i,
      /(?:lost|lose)\s+(\d+)-(\d+)\s+(?:to|vs|against)\s+(.+)/i,
      /(?:drew|draw)\s+(\d+)-(\d+)\s+(?:with|vs|against)\s+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const [, score1, score2, result, opponent] = match;
        return {
          homeScore: parseInt(score1),
          awayScore: parseInt(score2),
          result: result.toLowerCase(),
          opponent: opponent.trim(),
          isHome: !result.toLowerCase().includes('lost'),
        };
      }
    }

    return null;
  }

  private async processMatchLog(matchData: any, chatId: number, user: any): Promise<void> {
    // Send to main application system
    console.log('Processing match log from Telegram:', { matchData, chatId, user });
  }

  async sendMatchNotification(chatId: string, message: string): Promise<void> {
    try {
      await this.bot.sendMessage(parseInt(chatId), message);
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
    }
  }

  async sendMatchUpdate(chatId: string, update: any): Promise<void> {
    const message = `⚽ **Live Update**\n\n` +
      `${update.homeTeam} ${update.homeScore} - ${update.awayScore} ${update.awayTeam}\n` +
      `${update.event}\n` +
      `⏱️ ${update.minute}'`;

    await this.sendMatchNotification(chatId, message);
  }
}