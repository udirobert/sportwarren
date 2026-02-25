import { Client } from '@xmtp/xmtp-js';
import { ethers } from 'ethers';

export class XMTPClient {
  private client: Client | null = null;
  private wallet: ethers.Wallet | null = null;

  async initialize(privateKey?: string): Promise<void> {
    try {
      // Use provided private key or connect to user's wallet
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey);
      } else {
        // Connect to user's wallet (MetaMask, etc.)
        if (typeof window.ethereum !== 'undefined') {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          this.wallet = signer as any; // Type assertion for compatibility
        } else {
          throw new Error('No wallet found');
        }
      }

      this.client = await Client.create(this.wallet, {
        env: process.env.NODE_ENV === 'production' ? 'production' : 'dev',
      });

      console.log('✅ XMTP client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize XMTP:', error);
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

  async sendMatchUpdate(groupAddress: string, matchData: any): Promise<void> {
    const message = {
      type: 'match_update',
      data: matchData,
      timestamp: Date.now(),
    };

    await this.sendMessage(groupAddress, JSON.stringify(message));
  }

  async listenForMessages(callback: (message: any) => void): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    try {
      for await (const conversation of await this.client.conversations.stream()) {
        for await (const message of await conversation.streamMessages()) {
          try {
            const parsedMessage = JSON.parse(message.content);
            callback({
              from: message.senderAddress,
              content: parsedMessage,
              timestamp: message.sent,
            });
          } catch (error) {
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

  getAddress(): string | null {
    return this.wallet?.address || null;
  }

  isInitialized(): boolean {
    return this.client !== null;
  }
}

export const xmtpClient = new XMTPClient();