import { Agent, type Signer } from '@xmtp/agent-sdk';
import { ethers } from 'ethers';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const IDENTIFIER_KIND_ETHEREUM = 0;

export interface IncomingXmtpMessage {
  from: string;
  content: string | Record<string, unknown>;
  timestamp: number;
  conversationId: string;
}

export type XmtpPayload =
  | { type: 'match_update'; squadId: string; data: Record<string, unknown>; timestamp: number }
  | { type: 'achievement'; squadId: string; data: Record<string, unknown>; timestamp: number }
  | { type: 'reminder'; squadId: string; data: Record<string, unknown>; timestamp: number }
  | { type: 'general'; squadId?: string; data: string; timestamp: number };

export class XMTPBotService {
  private agent: Agent | null = null;
  private wallet: ethers.Wallet;

  constructor() {
    const privateKey = process.env.XMTP_PRIVATE_KEY;
    if (!privateKey) {
      console.warn('⚠️ XMTP_PRIVATE_KEY not set. Using a randomly generated wallet.');
    }
    this.wallet = new ethers.Wallet(privateKey || ethers.Wallet.createRandom().privateKey);
  }

  async initialize(): Promise<void> {
    try {
      const dbDir = join(process.cwd(), '.xmtp_db');
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }

      if (!process.env.XMTP_DB_ENCRYPTION_KEY) {
        console.warn('⚠️ XMTP_DB_ENCRYPTION_KEY not set. Using random key — data will not persist across restarts.');
      }

      const signer: Signer = {
        type: 'EOA' as const,
        getIdentifier: () => ({
          identifier: this.wallet.address,
          identifierKind: IDENTIFIER_KIND_ETHEREUM,
        }),
        signMessage: async (message: string) => ethers.getBytes(await this.wallet.signMessage(message)),
      };

      this.agent = await Agent.create(signer, {
        env: (process.env.XMTP_ENV || (process.env.NODE_ENV === 'production' ? 'production' : 'dev')) as 'dev' | 'production',
        dbPath: join(dbDir, 'sportwarren-bot.db3'),
        dbEncryptionKey: process.env.XMTP_DB_ENCRYPTION_KEY as `0x${string}` | undefined,
        appVersion: 'sportwarren-agent/1.0.0',
      });

      await this.agent.client.conversations.sync();

      console.log('✅ XMTP Agent initialized');
      console.log('📧 XMTP address:', this.wallet.address);
      console.log('🆔 XMTP Inbox ID:', this.agent.client.inboxId);
    } catch (error) {
      console.error('❌ Failed to initialize XMTP Agent:', error);
      throw error;
    }
  }

  async start(onMessage: (msg: IncomingXmtpMessage) => Promise<void>): Promise<void> {
    if (!this.agent) throw new Error('XMTP agent not initialized');

    this.agent.on('text', async (ctx) => {
      const message = ctx.message;
      if (message.senderInboxId === this.agent!.client.inboxId) return;

      let content: string | Record<string, unknown> = message.content as string;
      try {
        content = JSON.parse(content as string);
      } catch {
        // keep as string
      }

      await onMessage({
        from: message.senderInboxId,
        content,
        timestamp: Number(message.sentAtNs) / 1_000_000,
        conversationId: ctx.conversation.id,
      });
    });

    await this.agent.start();
  }

  async createSquadGroup(squadId: string, memberInboxIds: string[]): Promise<string> {
    if (!this.agent) throw new Error('XMTP agent not initialized');

    const group = await this.agent.client.conversations.createGroup(memberInboxIds);

    await group.sendText(JSON.stringify({
      type: 'squad_group_init',
      squadId,
      members: memberInboxIds,
      timestamp: Date.now(),
    }));

    console.log(`✅ Created XMTP group for squad ${squadId}: ${group.id}`);
    return group.id;
  }

  async sendGroupMessage(groupId: string, payload: XmtpPayload): Promise<void> {
    if (!this.agent) throw new Error('XMTP agent not initialized');

    await this.agent.client.conversations.sync();
    const groups = await this.agent.client.conversations.listGroups();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error(`Group ${groupId} not found`);

    await group.sendText(JSON.stringify(payload));
  }

  async sendDirectMessage(inboxId: string, payload: XmtpPayload): Promise<void> {
    if (!this.agent) throw new Error('XMTP agent not initialized');

    await this.agent.client.conversations.sync();
    const dm = await this.agent.client.conversations.createDm(inboxId);
    await dm.sendText(JSON.stringify(payload));
  }

  getInboxId(): string | null {
    return this.agent?.client.inboxId ?? null;
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }
}
