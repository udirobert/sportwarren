export class LensServiceUnavailableError extends Error {
  constructor(message = 'Lens social publishing is not enabled on this deployment.') {
    super(message);
    this.name = 'LensServiceUnavailableError';
  }
}

/**
 * Lens Protocol service placeholder.
 * The previous implementation fabricated profiles, balances, and post IDs.
 * Until a real Lens SDK / chain integration exists, these methods must fail
 * honestly so the UI can present an unavailable state instead of fake success.
 */
export class LensService {
  isEnabled(): boolean {
    const value = process.env.ENABLE_LENS_SOCIAL ?? process.env.NEXT_PUBLIC_LENS_SOCIAL_ENABLED;
    if (!value) {
      return false;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
  }

  private assertAvailable(): never {
    throw new LensServiceUnavailableError();
  }

  async generateChallenge(_address: string): Promise<string> {
    this.assertAvailable();
  }

  async authenticate(_address: string, _signature: string, _message: string): Promise<never> {
    this.assertAvailable();
  }

  async createPost(_profileId: string, _content: string, _imageUrl?: string): Promise<never> {
    this.assertAvailable();
  }

  async hasProfile(_address: string): Promise<boolean> {
    return false;
  }
}

export const lensService = new LensService();
