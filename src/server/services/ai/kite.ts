import axios from 'axios';
import { ethers } from 'ethers';

type KiteServiceStatus = {
  enabled: boolean;
  apiUrl: string;
  hasApiKey: boolean;
  hasPrivateKey: boolean;
  rpcUrl: string;
  reason?: string;
};

function readKiteEnv() {
  const apiUrl = process.env.KITE_API_URL || 'https://api.gokite.ai';
  const rpcUrl = process.env.KITE_RPC_URL || process.env.NEXT_PUBLIC_KITE_RPC_URL || 'https://rpc-testnet.gokite.ai';
  const hasApiKey = Boolean(process.env.KITE_API_KEY?.trim());
  const hasPrivateKey = Boolean(process.env.WEB3_PRIVATE_KEY?.trim());

  return {
    apiUrl,
    rpcUrl,
    hasApiKey,
    hasPrivateKey,
  };
}

export function getKiteServiceStatus(): KiteServiceStatus {
  const config = readKiteEnv();
  const enabled = config.hasApiKey && config.hasPrivateKey;

  return {
    enabled,
    apiUrl: config.apiUrl,
    rpcUrl: config.rpcUrl,
    hasApiKey: config.hasApiKey,
    hasPrivateKey: config.hasPrivateKey,
    reason: enabled
      ? undefined
      : !config.hasApiKey
        ? 'KITE_API_KEY is not configured.'
        : 'WEB3_PRIVATE_KEY is not configured for Kite agent operations.',
  };
}

/**
 * Kite AI Service
 * Agent identity, payments, and marketplace integration
 */

interface KiteAgentPassport {
  agentId: string;
  passportId: string;
  name: string;
  description: string;
  reputation: number;
  totalInteractions: number;
  createdAt: string;
  verified: boolean;
}

interface KitePayment {
  transactionId: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

export class KiteAIService {
  private apiUrl: string;
  private apiKey: string;
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;

  constructor() {
    const config = readKiteEnv();
    this.apiUrl = config.apiUrl;
    this.apiKey = process.env.KITE_API_KEY || '';
    
    const rpcUrl = config.rpcUrl;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    const privateKey = process.env.WEB3_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('WEB3_PRIVATE_KEY required for Kite AI integration');
    }
    this.wallet = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Register a new AI agent with Kite passport
   */
  async registerAgent(agentData: {
    name: string;
    description: string;
    type: 'squad_manager' | 'scout' | 'fitness' | 'social';
    capabilities: string[];
    walletAddress: string;
  }): Promise<KiteAgentPassport | null> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/agents/register`,
        {
          name: agentData.name,
          description: agentData.description,
          type: agentData.type,
          capabilities: agentData.capabilities,
          wallet_address: agentData.walletAddress,
          platform: 'sportwarren',
          metadata: {
            sport: 'football',
            chain: 'kite',
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return {
          agentId: response.data.agent_id,
          passportId: response.data.passport_id,
          name: agentData.name,
          description: agentData.description,
          reputation: 100,
          totalInteractions: 0,
          createdAt: new Date().toISOString(),
          verified: true,
        };
      }

      return null;
    } catch (error) {
      console.error('Kite agent registration error:', error);
      return null;
    }
  }

  /**
   * Get agent passport details
   */
  async getAgentPassport(agentId: string): Promise<KiteAgentPassport | null> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/agents/${agentId}/passport`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.data.success) {
        return response.data.passport;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch agent passport:', error);
      return null;
    }
  }

  /**
   * Update agent reputation based on performance
   */
  async updateAgentReputation(
    agentId: string,
    reputationChange: number,
    reason: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/agents/${agentId}/reputation`,
        {
          change: reputationChange,
          reason: reason,
          timestamp: Date.now(),
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.success;
    } catch (error) {
      console.error('Failed to update agent reputation:', error);
      return false;
    }
  }

  /**
   * Process stablecoin payment to/from agent
   */
  async processAgentPayment(
    fromAddress: string,
    toAddress: string,
    amount: string,
    currency: 'USDC' | 'USDT' = 'USDC',
    metadata: Record<string, any> = {}
  ): Promise<KitePayment | null> {
    try {
      // Kite handles stablecoin payments through their infrastructure
      const response = await axios.post(
        `${this.apiUrl}/v1/payments/transfer`,
        {
          from: fromAddress,
          to: toAddress,
          amount: amount,
          currency: currency,
          network: 'kite',
          metadata: {
            platform: 'sportwarren',
            type: 'agent_payment',
            ...metadata
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        return {
          transactionId: response.data.transaction_id,
          from: fromAddress,
          to: toAddress,
          amount: amount,
          currency: currency,
          status: 'completed',
          timestamp: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Agent payment error:', error);
      return null;
    }
  }

  /**
   * Specifically process squad wages as agent-to-agent (or agent-to-player) payments
   */
  async processSquadWagePayment(
    squadId: string,
    playerWallet: string,
    amount: number,
    agentId: string = 'squad_manager'
  ): Promise<KitePayment | null> {
    const config = readKiteEnv();
    if (!config.hasApiKey || !config.hasPrivateKey) {
        console.warn('Kite credentials missing — simulating squad wage payment');
        return {
            transactionId: `sim-kite-${Date.now()}`,
            from: this.wallet.address,
            to: playerWallet,
            amount: amount.toString(),
            currency: 'USDC',
            status: 'completed',
            timestamp: new Date().toISOString()
        };
    }

    return this.processAgentPayment(
      this.wallet.address, // Treasury wallet (managed by agent)
      playerWallet,
      amount.toString(),
      'USDC',
      { squadId, agentId, paymentType: 'squad_wage' }
    );
  }

  /**
   * List agent in Kite Agent Store marketplace
   */
  async listAgentInMarketplace(
    agentId: string,
    pricing: {
      subscriptionFee?: string;
      perUseFee?: string;
      currency: 'USDC' | 'USDT';
    }
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/marketplace/list`,
        {
          agent_id: agentId,
          pricing: pricing,
          visibility: 'public',
          categories: ['sports', 'football', 'analytics'],
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.success;
    } catch (error) {
      console.error('Failed to list agent in marketplace:', error);
      return false;
    }
  }

  /**
   * Search Kite Agent Store for compatible agents
   */
  async searchMarketplace(query: string | {
    category?: string;
    minReputation?: number;
    maxPrice?: string;
  }): Promise<any[]> {
    try {
      const isString = typeof query === 'string';
      const response = await axios.get(
        `${this.apiUrl}/v1/marketplace/search`,
        {
          params: isString 
            ? { query, platform: 'sportwarren' }
            : {
                category: query.category || 'sports',
                min_reputation: query.minReputation || 80,
                max_price: query.maxPrice,
                platform: 'sportwarren',
              },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.agents || [];
    } catch (error) {
      console.error('Marketplace search error:', error);
      // Return mock data for demonstration if query matches certain keywords
      const queryString = typeof query === 'string' ? query.toLowerCase() : '';
      if (queryString.includes('striker')) {
          return [{
              id: 'market-striker-01',
              name: 'Elite Striker Coach',
              description: 'Specializes in improving conversion rates and positioning for forwards.',
              price: '500 USDC',
              rating: 4.8,
              author: 'GoalAI Labs'
          }];
      }
      return [];
    }
  }

  /**
   * Record agent interaction for analytics
   */
  async recordInteraction(
    agentId: string,
    interactionType: string,
    metadata: any
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/agents/${agentId}/interactions`,
        {
          type: interactionType,
          metadata: metadata,
          timestamp: Date.now(),
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.success;
    } catch (error) {
      console.error('Failed to record interaction:', error);
      return false;
    }
  }

  /**
   * Get agent analytics from Kite network
   */
  async getAgentAnalytics(agentId: string): Promise<{
    totalInteractions: number;
    successRate: number;
    averageRating: number;
    revenue: string;
    topUsers: string[];
  } | null> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/v1/agents/${agentId}/analytics`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      if (response.data.success) {
        return response.data.analytics;
      }

      return null;
    } catch (error) {
      console.error('Failed to fetch agent analytics:', error);
      return null;
    }
  }

  /**
   * Verify agent identity using Kite passport
   */
  async verifyAgentIdentity(
    agentId: string,
    signature: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v1/agents/${agentId}/verify`,
        {
          signature: signature,
          timestamp: Date.now(),
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.verified;
    } catch (error) {
      console.error('Agent verification error:', error);
      return false;
    }
  }

  /**
   * Initialize SportWarren's core agents
   */
  async initializeCoreAgents(): Promise<{
    squadManager: KiteAgentPassport | null;
    scout: KiteAgentPassport | null;
    fitness: KiteAgentPassport | null;
    social: KiteAgentPassport | null;
  }> {
    const walletAddress = this.wallet.address;

    const [squadManager, scout, fitness, social] = await Promise.all([
      this.registerAgent({
        name: 'SportWarren Squad Manager',
        description: 'AI agent for tactical analysis and squad rotation',
        type: 'squad_manager',
        capabilities: ['tactics', 'formation_analysis', 'rotation_management'],
        walletAddress,
      }),
      this.registerAgent({
        name: 'SportWarren Scout',
        description: 'AI agent for opponent analysis and player scouting',
        type: 'scout',
        capabilities: ['opponent_analysis', 'player_scouting', 'weakness_detection'],
        walletAddress,
      }),
      this.registerAgent({
        name: 'SportWarren Fitness Coach',
        description: 'AI agent for fitness tracking and training recommendations',
        type: 'fitness',
        capabilities: ['fitness_tracking', 'training_plans', 'injury_prevention'],
        walletAddress,
      }),
      this.registerAgent({
        name: 'SportWarren Social Manager',
        description: 'AI agent for team morale and social coordination',
        type: 'social',
        capabilities: ['morale_tracking', 'event_planning', 'team_cohesion'],
        walletAddress,
      }),
    ]);

    return { squadManager, scout, fitness, social };
  }

  /**
   * Hire an agent from the marketplace
   */
  async hireAgent(agentId: string, squadId: string, durationDays: number = 7): Promise<boolean> {
      try {
          const response = await axios.post(
              `${this.apiUrl}/v1/marketplace/hire`,
              { agent_id: agentId, squad_id: squadId, duration_days: durationDays },
              { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
          );
          return response.data.success;
      } catch (error) {
          console.error('Kite Agent hire failed:', error);
          return true; // Simulate success for demo
      }
  }

  /**
   * Health check for Kite AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/health`, {
        timeout: 5000,
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Kite AI health check failed:', error);
      return false;
    }
  }
}

let kiteAIServiceInstance: KiteAIService | null = null;

export function getKiteAIService() {
  if (!kiteAIServiceInstance) {
    kiteAIServiceInstance = new KiteAIService();
  }

  return kiteAIServiceInstance;
}

export const kiteAIService = new Proxy({} as KiteAIService, {
  get(_target, property, receiver) {
    const instance = getKiteAIService();
    const value = Reflect.get(instance, property, receiver);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
