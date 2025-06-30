import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

export class XMTPService {
  private client: Client | null = null;
  private wallet: ethers.Wallet;

  constructor() {
    // Initialize with environment wallet or create new one
    const privateKey = process.env.XMTP_PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;
    this.wallet = new ethers.Wallet(privateKey);
  }

  async initialize(): Promise<void> {
    try {
      // Create XMTP client
      this.client = await Client.create(this.wallet, {
        env: process.env.NODE_ENV === 'production' ? 'production' : 'dev',
      });
      
      console.log('✅ XMTP client initialized');
      console.log('📧 XMTP address:', this.client.address);
    } catch (error) {
      console.error('❌ Failed to initialize XMTP:', error);
      throw error;
    }
  }

  async createSquadGroup(squadId: string, memberAddresses: string[]): Promise<string> {
    if (!this.client) throw new Error('XMTP client not initialized');

    try {
      // Create group conversation
      const conversation = await this.client.conversations.newConversation(
        memberAddresses[0] // Start with first member, others will be added
      );

      // Store group metadata
      await this.sendMessage(conversation.peerAddress, JSON.stringify({
        type: 'squad_group_init',
        squadId,
        members: memberAddresses,
        timestamp: Date.now(),
      }));

      return conversation.peerAddress;
    } catch (error) {
      console.error('Failed to create XMTP squad group:', error);
      throw error;
    }
  }

  async sendMessage(peerAddress: string, message: string): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    try {
      const conversation = await this.client.conversations.newConversation(peerAddress);
      await conversation.send(message);
    } catch (error) {
      console.error('Failed to send XMTP message:', error);
      throw error;
    }
  }

  async sendMatchUpdate(squadGroupAddress: string, matchData: any): Promise<void> {
    const message = {
      type: 'match_update',
      data: matchData,
      timestamp: Date.now(),
    };

    await this.sendMessage(squadGroupAddress, JSON.stringify(message));
  }

  async sendAchievementNotification(userAddress: string, achievement: any): Promise<void> {
    const message = {
      type: 'achievement_unlocked',
      data: achievement,
      timestamp: Date.now(),
    };

    await this.sendMessage(userAddress, JSON.stringify(message));
  }

  async listenForMessages(callback: (message: any) => void): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    try {
      // Listen for new conversations
      for await (const conversation of await this.client.conversations.stream()) {
        console.log(`New XMTP conversation with ${conversation.peerAddress}`);
        
        // Listen for messages in this conversation
        for await (const message of await conversation.streamMessages()) {
          try {
            const parsedMessage = JSON.parse(message.content);
            callback({
              from: message.senderAddress,
              content: parsedMessage,
              timestamp: message.sent,
            });
          } catch (error) {
            // Handle plain text messages
            callback({
              from: message.senderAddress,
              content: message.content,
              timestamp: message.sent,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error listening for XMTP messages:', error);
    }
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }
}