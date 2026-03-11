import { Client, IdentifierKind } from '@xmtp/browser-sdk';
import { ethers } from 'ethers';

export class XMTPClient {
  private client: Client | null = null;
  private address: string | null = null;

  async initialize(privateKey?: string): Promise<void> {
    try {
      let signer;

      // Use provided private key or connect to user's wallet
      if (privateKey) {
        const wallet = new ethers.Wallet(privateKey);
        this.address = wallet.address;
        signer = {
          type: 'EOA' as const,
          getIdentifier: () => ({ identifier: wallet.address, identifierKind: IdentifierKind.Ethereum }),
          signMessage: async (message: string) => ethers.getBytes(await wallet.signMessage(message)),
        };
      } else {
        // Connect to user's wallet (MetaMask, etc.)
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const ethersSigner = await provider.getSigner();
          this.address = await ethersSigner.getAddress();
          const addr = this.address;
          signer = {
            type: 'EOA' as const,
            getIdentifier: () => ({ identifier: addr, identifierKind: IdentifierKind.Ethereum }),
            signMessage: async (message: string) => ethers.getBytes(await ethersSigner.signMessage(message)),
          };
        } else {
          throw new Error('No wallet found');
        }
      }

      // Create XMTP V3 browser client
      // Note: dbEncryptionKey is not used in browser-sdk (uses OPFS)
      this.client = await Client.create(signer, {
        env: (process.env.NEXT_PUBLIC_XMTP_ENV || 'dev') as 'dev' | 'production',
      });

      // Sync conversations
      await this.client.conversations.sync();

      console.log('✅ XMTP V3 browser client initialized');
      console.log('🆔 XMTP Inbox ID:', this.client.inboxId);
    } catch (error) {
      console.error('❌ Failed to initialize XMTP V3:', error);
      throw error;
    }
  }

  async sendMessage(targetId: string, message: string): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    try {
      await this.client.conversations.sync();
      
      // Check if it's a group ID
      const groups = await this.client.conversations.listGroups();
      const group = groups.find(g => g.id === targetId);

      if (group) {
        await group.sendText(message);
        return;
      }

      // Fallback to DM
      const dm = await this.client.conversations.createDm(targetId);
      await dm.sendText(message);
    } catch (error) {
      console.error('Failed to send XMTP message:', error);
      throw error;
    }
  }

  async sendMatchUpdate(groupId: string, matchData: any): Promise<void> {
    const message = {
      type: 'match_update',
      data: matchData,
      timestamp: Date.now(),
    };

    await this.sendMessage(groupId, JSON.stringify(message));
  }

  async listenForMessages(callback: (message: any) => void): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    try {
      const stream = await this.client.conversations.streamAllMessages();
      
      for await (const message of stream) {
        if (message.senderInboxId === this.client.inboxId) continue;

        const content = message.fallback || '';
        let parsedContent = content;
        try {
          parsedContent = JSON.parse(content);
        } catch {
          // Keep as string
        }

        callback({
          from: message.senderInboxId,
          content: parsedContent,
          timestamp: Number(message.sentAtNs / 1000000n), // BigInt handling
        });
      }
    } catch (error) {
      console.error('Error listening for XMTP messages:', error);
    }
  }

  getAddress(): string | null {
    return this.address;
  }

  isInitialized(): boolean {
    return this.client !== null;
  }
}

export const xmtpClient = new XMTPClient();
