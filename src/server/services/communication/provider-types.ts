export type CommunicationPlatform = 'telegram' | 'whatsapp' | 'spectrum';

export interface MatchAvailabilityRequest {
  matchId: string;
  matchDetails: string;
}

export interface MessagingButton {
  id: string;
  title: string;
}

export interface MessagingListSection {
  title?: string;
  rows: {
    id: string;
    title: string;
    description?: string;
  }[];
}

export interface MessagingProvider {
  platform: CommunicationPlatform;
  sendText(target: string, text: string): Promise<void>;
  sendAvailabilityRequest?(target: string, request: MatchAvailabilityRequest): Promise<void>;
  sendButtons?(target: string, text: string, buttons: MessagingButton[], footer?: string): Promise<void>;
  sendList?(target: string, text: string, buttonText: string, sections: MessagingListSection[], title?: string, footer?: string): Promise<void>;
  sendImage?(target: string, url: string, caption?: string): Promise<void>;
  isConfigured?(): boolean;
}
