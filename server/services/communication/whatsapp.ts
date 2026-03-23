import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import type { Client as ClientType, Message } from 'whatsapp-web.js';

export class WhatsAppService {
  private client: ClientType | null = null;
  private isReady = false;

  private isEnabled(): boolean {
    const value = process.env.ENABLE_WHATSAPP;
    if (!value) return false;
    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
  }

  async initialize(): Promise<void> {
    if (!this.isEnabled()) {
      console.log('ℹ️ WhatsApp disabled (set ENABLE_WHATSAPP=true to enable)');
      return;
    }

    this.client = new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    this.setupEventHandlers();

    try {
      await this.client.initialize();
    } catch (error) {
      console.error('⚠️ WhatsApp client initialization failed (non-fatal):', error);
      this.client = null;
    }
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('qr', (_qr) => {
      console.log('📱 WhatsApp QR Code generated. Scan with your phone.');
    });

    this.client.on('ready', () => {
      console.log('✅ WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('message', async (message) => {
      await this.handleIncomingMessage(message);
    });

    this.client.on('disconnected', (reason) => {
      console.log('❌ WhatsApp client disconnected:', reason);
      this.isReady = false;
    });

    this.client.on('auth_failure', (msg) => {
      console.error('❌ WhatsApp authentication failure:', msg);
      this.isReady = false;
    });
  }

  private async handleIncomingMessage(message: Message): Promise<void> {
    const chat = await message.getChat();
    const contact = await message.getContact();

    if (message.body.startsWith('/')) {
      await this.handleCommand(message, chat, contact);
    } else {
      await this.parseMatchUpdate(message, chat);
    }
  }

  private async handleCommand(message: Message, chat: any, contact: any): Promise<void> {
    const [command, ...args] = message.body.slice(1).split(' ');

    switch (command.toLowerCase()) {
      case 'log':
        await this.handleLogCommand(args, chat, contact);
        break;
      case 'score':
        await this.handleScoreCommand(args, chat);
        break;
      case 'lineup':
        await this.handleLineupCommand(args, chat);
        break;
      case 'motm':
        await this.handleMotmCommand(args, chat);
        break;
      default:
        await chat.sendMessage('❓ Unknown command. Try /log, /score, /lineup, or /motm');
    }
  }

  private async handleLogCommand(args: string[], chat: any, contact: any): Promise<void> {
    try {
      const matchText = args.join(' ');
      const matchData = this.parseMatchResult(matchText);

      if (matchData) {
        await this.processMatchLog(matchData, chat.id._serialized, contact.number);
        await chat.sendMessage(`✅ Match logged: ${matchData.result} vs ${matchData.opponent}`);
      } else {
        await chat.sendMessage('❌ Could not parse match. Try: /log 4-2 win vs Red Lions');
      }
    } catch (error) {
      console.error('Error handling log command:', error);
      await chat.sendMessage('❌ Error logging match. Please try again.');
    }
  }

  private async handleScoreCommand(args: string[], chat: any): Promise<void> {
    const [action, team] = args;

    if (action && (action.startsWith('+') || action.startsWith('-'))) {
      const change = parseInt(action);
      await this.updateLiveScore(chat.id._serialized, team, change);
      await chat.sendMessage(`⚽ Score updated: ${team} ${action}`);
    }
  }

  private async handleLineupCommand(_args: string[], chat: any): Promise<void> {
    await chat.sendMessage('📋 Lineup management logic would go here');
  }

  private async handleMotmCommand(_args: string[], chat: any): Promise<void> {
    await chat.sendMessage('🏆 MOTM voting would go here');
  }

  private parseMatchResult(text: string): any | null {
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

  async sendMatchReminder(chatId: string, matchDetails: any): Promise<void> {
    if (!this.isReady || !this.client) return;

    const message = `🏆 **Match Reminder**\n\n` +
      `📅 ${matchDetails.date} at ${matchDetails.time}\n` +
      `🏟️ ${matchDetails.venue}\n` +
      `⚔️ vs ${matchDetails.opponent}\n\n` +
      `Reply with your availability:\n` +
      `✅ "Yes" or "Available"\n` +
      `❌ "No" or "Unavailable"\n` +
      `❓ "Maybe" or "Unsure"`;

    try {
      await this.client.sendMessage(chatId, message);
    } catch (error) {
      console.error('Failed to send WhatsApp reminder:', error);
    }
  }

  async sendMatchUpdate(chatId: string, update: any): Promise<void> {
    if (!this.isReady || !this.client) return;

    const message = `⚽ **Live Update**\n\n` +
      `${update.homeTeam} ${update.homeScore} - ${update.awayScore} ${update.awayTeam}\n` +
      `${update.event}\n` +
      `⏱️ ${update.minute}'`;

    try {
      await this.client.sendMessage(chatId, message);
    } catch (error) {
      console.error('Failed to send WhatsApp update:', error);
    }
  }

  private async processMatchLog(matchData: any, chatId: string, userPhone: string): Promise<void> {
    console.log('Processing match log from WhatsApp:', { matchData, chatId, userPhone });
  }

  private async updateLiveScore(chatId: string, team: string, change: number): Promise<void> {
    console.log('Updating live score:', { chatId, team, change });
  }

  private async parseMatchUpdate(message: Message, chat: any): Promise<void> {
    const body = message.body.toLowerCase();
    if (body.includes('goal') || body.includes('scored')) {
      await chat.sendMessage('🏆 Event detected: Goal! Please confirm details.');
    }
  }
}
