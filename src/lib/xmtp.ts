import { Client, IdentifierKind } from '@xmtp/browser-sdk';
import { ethers } from 'ethers';

type SignerInput = {
  getAddress: () => Promise<string>;
  signMessage: (msg: string) => Promise<string>;
};

export class XMTPClient {
  private client: Client | null = null;
  private address: string | null = null;
  private env = (process.env.NEXT_PUBLIC_XMTP_ENV || 'dev') as 'dev' | 'production';

  private async createClient(
    address: string,
    signFn: (message: string) => Promise<Uint8Array>,
  ): Promise<void> {
    this.address = address;

    const signer = {
      type: 'EOA' as const,
      getIdentifier: () => ({
        identifier: address,
        identifierKind: IdentifierKind.Ethereum,
      }),
      signMessage: signFn,
    };

    this.client = await Client.create(signer, { env: this.env });
    await this.client.conversations.sync();
  }

  async initializeWithSigner(signerInput: SignerInput): Promise<void> {
    const address = await signerInput.getAddress();
    await this.createClient(address, async (message: string) =>
      ethers.getBytes(await signerInput.signMessage(message)),
    );
  }

  async initializeWithKey(privateKey: string): Promise<void> {
    const wallet = new ethers.Wallet(privateKey);
    await this.createClient(wallet.address, async (message: string) =>
      ethers.getBytes(await wallet.signMessage(message)),
    );
  }

  async sendGroupMessage(groupId: string, message: string): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    await this.client.conversations.sync();
    const groups = await this.client.conversations.listGroups();
    const group = groups.find((g) => g.id === groupId);
    if (!group) throw new Error(`Group ${groupId} not found`);
    await group.sendText(message);
  }

  async sendDirectMessage(inboxId: string, message: string): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    await this.client.conversations.sync();
    const dm = await this.client.conversations.createDm(inboxId);
    await dm.sendText(message);
  }

  async listenForMessages(
    callback: (message: { from: string; content: unknown; timestamp: number }) => void,
  ): Promise<void> {
    if (!this.client) throw new Error('XMTP client not initialized');

    const stream = await this.client.conversations.streamAllMessages();

    for await (const message of stream) {
      if (message.senderInboxId === this.client.inboxId) continue;

      const content = message.fallback || '';
      let parsedContent: unknown = content;
      try {
        parsedContent = JSON.parse(content);
      } catch {
        // Keep as string
      }

      callback({
        from: message.senderInboxId,
        content: parsedContent,
        timestamp: Number(message.sentAtNs / 1_000_000n),
      });
    }
  }

  getInboxId(): string | null {
    return this.client?.inboxId ?? null;
  }

  getAddress(): string | null {
    return this.address;
  }

  isInitialized(): boolean {
    return this.client !== null;
  }
}

export const xmtpClient = new XMTPClient();
