import { XMTPService } from './xmtp.js';
import { WhatsAppService } from './whatsapp.js';
import { TelegramService } from './telegram.js';

export interface CrossPlatformMessage {
  id: string;
  squadId: string;
  content: string;
  type: 'match_update' | 'achievement' | 'reminder' | 'general';
  sender: {
    platform: 'xmtp' | 'whatsapp' | 'telegram' | 'app';
    address: string;
    name?: string;
  };
  timestamp: number;
  metadata?: Record<string, any>;
}

export class CommunicationBridge {
  private xmtp: XMTPService;
  private whatsapp: WhatsAppService;
  private telegram: TelegramService;
  private messageQueue: CrossPlatformMessage[] = [];

  constructor() {
    this.xmtp = new XMTPService();
    this.whatsapp = new WhatsAppService();
    this.telegram = new TelegramService();
  }

  async initialize(): Promise<void> {
    try {
      // Initialize all communication services
      await Promise.all([
        this.xmtp.initialize(),
        this.whatsapp.initialize(),
        // Telegram initializes automatically
      ]);

      // Set up message listeners
      this.setupMessageListeners();
      
      console.log('✅ Communication bridge initialized');
    } catch (error) {
      console.error('❌ Failed to initialize communication bridge:', error);
      throw error;
    }
  }

  private setupMessageListeners(): void {
    // Listen for XMTP messages
    this.xmtp.listenForMessages((message) => {
      this.handleIncomingMessage({
        id: `xmtp_${Date.now()}`,
        squadId: 'unknown', // Extract from message metadata
        content: message.content,
        type: 'general',
        sender: {
          platform: 'xmtp',
          address: message.from,
        },
        timestamp: message.timestamp,
      });
    });

    // WhatsApp and Telegram messages are handled in their respective services
    // but can be bridged through this service
  }

  private async handleIncomingMessage(message: CrossPlatformMessage): Promise<void> {
    // Process and potentially bridge the message to other platforms
    this.messageQueue.push(message);
    
    // Determine if message should be bridged
    if (this.shouldBridgeMessage(message)) {
      await this.bridgeMessage(message);
    }

    // Process message for application logic
    await this.processMessage(message);
  }

  private shouldBridgeMessage(message: CrossPlatformMessage): boolean {
    // Define rules for when to bridge messages between platforms
    return message.type === 'match_update' || message.type === 'achievement';
  }

  private async bridgeMessage(message: CrossPlatformMessage): Promise<void> {
    const bridgePromises = [];

    // Get squad communication preferences
    const squadPrefs = await this.getSquadCommunicationPreferences(message.squadId);

    // Bridge to XMTP if enabled
    if (squadPrefs.xmtp && message.sender.platform !== 'xmtp') {
      bridgePromises.push(
        this.xmtp.sendMessage(squadPrefs.xmtp.groupAddress, this.formatMessageForXMTP(message))
      );
    }

    // Bridge to WhatsApp if enabled
    if (squadPrefs.whatsapp && message.sender.platform !== 'whatsapp') {
      bridgePromises.push(
        this.whatsapp.sendMatchUpdate(squadPrefs.whatsapp.chatId, this.formatMessageForWhatsApp(message))
      );
    }

    // Bridge to Telegram if enabled
    if (squadPrefs.telegram && message.sender.platform !== 'telegram') {
      bridgePromises.push(
        this.telegram.sendMatchNotification(squadPrefs.telegram.chatId, this.formatMessageForTelegram(message))
      );
    }

    await Promise.allSettled(bridgePromises);
  }

  private formatMessageForXMTP(message: CrossPlatformMessage): string {
    return JSON.stringify({
      type: 'bridged_message',
      originalPlatform: message.sender.platform,
      content: message.content,
      timestamp: message.timestamp,
    });
  }

  private formatMessageForWhatsApp(message: CrossPlatformMessage): any {
    return {
      homeTeam: 'Squad',
      awayTeam: 'Opponent',
      homeScore: 0,
      awayScore: 0,
      event: message.content,
      minute: 0,
    };
  }

  private formatMessageForTelegram(message: CrossPlatformMessage): string {
    return `🔄 **Bridged from ${message.sender.platform.toUpperCase()}**\n\n${message.content}`;
  }

  private async processMessage(message: CrossPlatformMessage): Promise<void> {
    // Send to main application for processing
    // This would integrate with your GraphQL/Socket system
    console.log('Processing cross-platform message:', message);
  }

  private async getSquadCommunicationPreferences(squadId: string): Promise<any> {
    // Mock data - in real app, fetch from database
    return {
      xmtp: {
        enabled: true,
        groupAddress: '0x1234...5678',
      },
      whatsapp: {
        enabled: true,
        chatId: 'whatsapp_group_id',
      },
      telegram: {
        enabled: true,
        chatId: 'telegram_chat_id',
      },
    };
  }

  // Public methods for sending messages across platforms
  async broadcastMatchUpdate(squadId: string, matchData: any): Promise<void> {
    const message: CrossPlatformMessage = {
      id: `broadcast_${Date.now()}`,
      squadId,
      content: `Match Update: ${matchData.homeTeam} ${matchData.homeScore} - ${matchData.awayScore} ${matchData.awayTeam}`,
      type: 'match_update',
      sender: {
        platform: 'app',
        address: 'system',
        name: 'SportWarren',
      },
      timestamp: Date.now(),
      metadata: matchData,
    };

    await this.bridgeMessage(message);
  }

  async broadcastAchievement(squadId: string, achievement: any): Promise<void> {
    const message: CrossPlatformMessage = {
      id: `achievement_${Date.now()}`,
      squadId,
      content: `🏆 ${achievement.playerName} unlocked: ${achievement.title}!`,
      type: 'achievement',
      sender: {
        platform: 'app',
        address: 'system',
        name: 'SportWarren',
      },
      timestamp: Date.now(),
      metadata: achievement,
    };

    await this.bridgeMessage(message);
  }

  async sendMatchReminder(squadId: string, matchDetails: any): Promise<void> {
    const message: CrossPlatformMessage = {
      id: `reminder_${Date.now()}`,
      squadId,
      content: `📅 Match Reminder: ${matchDetails.opponent} on ${matchDetails.date}`,
      type: 'reminder',
      sender: {
        platform: 'app',
        address: 'system',
        name: 'SportWarren',
      },
      timestamp: Date.now(),
      metadata: matchDetails,
    };

    await this.bridgeMessage(message);
  }
}