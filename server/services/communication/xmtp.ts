import { Client } from '@xmtp/node-sdk';
import { ethers } from 'ethers';
import * as path from 'path';
import * as fs from 'fs';

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
      const dbPath = path.join(process.cwd(), '.xmtp_db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }

      // Use a consistent encryption key for the local DB
      // In production, this MUST be a 32-byte hex string in process.env.XMTP_DB_ENCRYPTION_KEY
      let encryptionKey: Uint8Array;
      if (process.env.XMTP_DB_ENCRYPTION_KEY) {
        encryptionKey = ethers.getBytes(process.env.XMTP_DB_ENCRYPTION_KEY);
      } else {
        console.warn('⚠️ XMTP_DB_ENCRYPTION_KEY not set. Using a temporary key. Data will not persist across restarts.');
        encryptionKey = new Uint8Array(32).fill(1);
      }

      const signer = {
        getAddress: () => this.wallet.getAddress(),
        signMessage: (message: string) => this.wallet.signMessage(message),
      };

      // Create XMTP V3 client
      this.client = await Client.create(signer, encryptionKey, {
        env: (process.env.NODE_ENV === 'production' ? 'production' : 'dev') as 'dev' | 'production',
        dbPath: path.join(dbPath, `${this.wallet.address}.db`),
      });
      
      // Sync with network
      await this.client.conversations.sync();

      console.log('✅ XMTP V3 client initialized');
      console.log('📧 XMTP address:', this.wallet.address);
      console.log('🆔 XMTP Inbox ID:', this.client.inboxId);
    } catch (error) {
      console.error('❌ Failed to initialize XMTP V3:', error);
      throw error;
    }
  }

  async createSquadGroup(squadId: string, memberAddresses: string[]): Promise<string> {
    if (!this.client) throw new Error('XMTP client not initialized');

    try {
      // In V3, we create a real group
      // We should check if members are registered on XMTP first
      // But for the demo, we'll try to create it directly
      const group = await this.client.conversations.createGroup(memberAddresses);

      // Store group metadata/init message
      await group.send(JSON.stringify({
        type: 'squad_group_init',
        squadId,
        members: memberAddresses,
        timestamp: Date.now(),
      }));

      console.log(`✅ Created XMTP V3 group for squad ${squadId}: ${group.id}`);
      return group.id;
    } catch (error) {
      console.error('Failed to create XMTP squad group:', error);
      throw error;
    }
  }

  async sendMessage(targetId: string, message: string): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    try {
      // Refresh conversations
      await this.client.conversations.sync();

      // Check if it's a group ID
      const groups = await this.client.conversations.listGroups();
      const group = groups.find(g => g.id === targetId);

      if (group) {
        await group.send(message);
        return;
      }

      // If not a group, try to find/create a 1:1 dm
      // In V3 DMs are also MLS-powered "groups" with 2 members
      const dm = await this.client.conversations.newDm(targetId);
      await dm.send(message);
    } catch (error) {
      console.error('Failed to send XMTP message:', error);
      throw error;
    }
  }

  async sendMatchUpdate(squadGroupId: string, matchData: any): Promise<void> {
    const message = {
      type: 'match_update',
      data: matchData,
      timestamp: Date.now(),
    };

    await this.sendMessage(squadGroupId, JSON.stringify(message));
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
      console.log('📡 Starting XMTP message stream...');
      
      // Stream all messages from all conversations (groups and DMs)
      const stream = await this.client.conversations.streamAllMessages();
      
      for await (const message of stream) {
        if (message.senderInboxId === this.client.inboxId) continue;

        try {
          const content = message.fallback || ''; // Fallback for encrypted content
          // In V3, message.content might be more complex if using content types
          // For now, we'll use fallback or try to parse
          
          let parsedContent = content;
          try {
            parsedContent = JSON.parse(content);
          } catch {
            // Keep as string
          }

          callback({
            from: message.senderInboxId,
            content: parsedContent,
            timestamp: message.sentAtNs / 1000000, // Convert ns to ms
          });
        } catch (error) {
          console.error('Error processing XMTP message:', error);
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
