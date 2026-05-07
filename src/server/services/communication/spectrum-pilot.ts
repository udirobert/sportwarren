import type { MatchAvailabilityRequest, MessagingProvider } from './provider-types.js';

export interface SpectrumPilotConfig {
  projectId?: string;
  projectSecret?: string;
  defaultPlatform?: string;
}

export class SpectrumPilotProvider implements MessagingProvider {
  readonly platform = 'spectrum' as const;
  private projectId: string;
  private projectSecret: string;
  private defaultPlatform: string;

  constructor(config: SpectrumPilotConfig = {}) {
    this.projectId = config.projectId || process.env.SPECTRUM_PROJECT_ID || '';
    this.projectSecret = config.projectSecret || process.env.SPECTRUM_PROJECT_SECRET || '';
    this.defaultPlatform = config.defaultPlatform || process.env.SPECTRUM_PILOT_PLATFORM || 'whatsapp';
  }

  isConfigured(): boolean {
    return Boolean(this.projectId && this.projectSecret);
  }

  async sendText(target: string, text: string): Promise<void> {
    const status = this.isConfigured() ? 'configured-but-not-wired' : 'not-configured';

    console.info('[SPECTRUM PILOT] Message scaffold invoked', {
      status,
      platform: this.defaultPlatform,
      target,
      preview: text.slice(0, 120),
    });
  }

  async sendAvailabilityRequest(target: string, request: MatchAvailabilityRequest): Promise<void> {
    await this.sendText(
      target,
      `Availability pilot scaffold for match ${request.matchId}: ${request.matchDetails}`,
    );
  }
}
