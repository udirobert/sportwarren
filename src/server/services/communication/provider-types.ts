export type CommunicationPlatform = 'telegram' | 'whatsapp' | 'spectrum';

export interface MatchAvailabilityRequest {
  matchId: string;
  matchDetails: string;
}

export interface MessagingProvider {
  platform: CommunicationPlatform;
  sendText(target: string, text: string): Promise<void>;
  sendAvailabilityRequest?(target: string, request: MatchAvailabilityRequest): Promise<void>;
  isConfigured?(): boolean;
}
