export class LensServiceUnavailableError extends Error {
  constructor(message = 'Lens social publishing is not enabled on this deployment.') {
    super(message);
    this.name = 'LensServiceUnavailableError';
  }
}

type LensAuthResult = {
  accessToken: string;
  profile: { id: string; handle?: string; name?: string | null } | null;
};

/**
 * Lens Protocol service with HTTP adapter behind env flags.
 * - Enhancement-first: replaces prior stub without faking responses.
 * - Consolidation: single service used by server and API.
 * - Modular: pluggable base URL, simple contract, clear error semantics.
 */
export class LensService {
  private readonly enabled: boolean;
  private readonly baseUrl: string | null;
  private readonly apiKey: string | null;

  constructor() {
    const flag = process.env.ENABLE_LENS_SOCIAL ?? process.env.NEXT_PUBLIC_LENS_SOCIAL_ENABLED;
    this.enabled = !!flag && ['1', 'true', 'yes', 'on'].includes(flag.trim().toLowerCase());
    this.baseUrl = (process.env.LENS_GATEWAY_URL || process.env.LENS_API_BASE || '').trim() || null;
    this.apiKey = (process.env.LENS_API_KEY || '').trim() || null;
  }

  isEnabled(): boolean {
    return this.enabled && !!this.baseUrl;
  }

  private requireEnabled(): void {
    if (!this.isEnabled()) throw new LensServiceUnavailableError();
  }

  private buildHeaders(extra?: Record<string, string>) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(extra || {}),
    };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
    return headers;
  }

  async generateChallenge(address: string): Promise<string> {
    this.requireEnabled();
    const url = `${this.baseUrl}/api/lens/challenge`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ address }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.text) {
      throw new Error(data?.error || 'Lens challenge request failed');
    }
    return data.text as string;
  }

  async authenticate(address: string, signature: string, message: string): Promise<LensAuthResult> {
    this.requireEnabled();
    const url = `${this.baseUrl}/api/lens/authenticate`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ address, signature, message }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.accessToken) {
      throw new Error(data?.error || 'Lens authentication failed');
    }
    return { accessToken: data.accessToken, profile: data.profile ?? null };
  }

  async createPost(profileId: string, content: string, imageUrl?: string): Promise<string> {
    this.requireEnabled();
    const url = `${this.baseUrl}/api/lens/post`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({ profileId, content, imageUrl }),
    });
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.pubId) {
      throw new Error(data?.error || 'Lens post failed');
    }
    return data.pubId as string;
  }

  async hasProfile(_address: string): Promise<boolean> {
    // Optional: implement if needed via gateway
    return false;
  }
}

export const lensService = new LensService();
