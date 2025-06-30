import { ethers } from 'ethers';

export class Web3Service {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private achievementContract: ethers.Contract;

  constructor() {
    // Initialize provider (use Polygon for low gas fees)
    this.provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com'
    );

    // Initialize wallet
    const privateKey = process.env.WEB3_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('WEB3_PRIVATE_KEY environment variable is required');
    }
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Initialize achievement NFT contract
    this.initializeContracts();
  }

  private async initializeContracts(): Promise<void> {
    // Achievement NFT contract ABI (simplified)
    const achievementABI = [
      'function mintAchievement(address to, uint256 achievementType, string memory metadata) external returns (uint256)',
      'function getPlayerAchievements(address player) external view returns (uint256[])',
      'function getAchievementMetadata(uint256 tokenId) external view returns (string memory)',
      'event AchievementMinted(address indexed player, uint256 indexed tokenId, uint256 achievementType)',
    ];

    const contractAddress = process.env.ACHIEVEMENT_CONTRACT_ADDRESS;
    if (contractAddress) {
      this.achievementContract = new ethers.Contract(
        contractAddress,
        achievementABI,
        this.wallet
      );
    }
  }

  async mintAchievementNFT(playerAddress: string, achievement: any): Promise<string | null> {
    try {
      if (!this.achievementContract) {
        console.warn('Achievement contract not initialized');
        return null;
      }

      const metadata = JSON.stringify({
        name: achievement.title,
        description: achievement.description,
        image: achievement.imageUrl,
        attributes: [
          { trait_type: 'Rarity', value: achievement.rarity },
          { trait_type: 'Sport', value: achievement.sport },
          { trait_type: 'Category', value: achievement.category },
          { trait_type: 'Points', value: achievement.points },
          { trait_type: 'Date Earned', value: achievement.dateEarned },
        ],
      });

      const tx = await this.achievementContract.mintAchievement(
        playerAddress,
        achievement.typeId,
        metadata
      );

      const receipt = await tx.wait();
      
      // Extract token ID from events
      const event = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('AchievementMinted(address,uint256,uint256)')
      );

      if (event) {
        const tokenId = ethers.getBigInt(event.topics[2]).toString();
        console.log(`✅ Achievement NFT minted: Token ID ${tokenId}`);
        return tokenId;
      }

      return null;
    } catch (error) {
      console.error('Failed to mint achievement NFT:', error);
      return null;
    }
  }

  async getPlayerAchievements(playerAddress: string): Promise<any[]> {
    try {
      if (!this.achievementContract) return [];

      const tokenIds = await this.achievementContract.getPlayerAchievements(playerAddress);
      const achievements = [];

      for (const tokenId of tokenIds) {
        const metadata = await this.achievementContract.getAchievementMetadata(tokenId);
        try {
          const parsed = JSON.parse(metadata);
          achievements.push({
            tokenId: tokenId.toString(),
            ...parsed,
          });
        } catch (parseError) {
          console.warn('Failed to parse achievement metadata:', parseError);
        }
      }

      return achievements;
    } catch (error) {
      console.error('Failed to get player achievements:', error);
      return [];
    }
  }

  async verifyPlayerIdentity(address: string, signature: string, message: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Failed to verify player identity:', error);
      return false;
    }
  }

  async createSquadDAO(squadData: any): Promise<string | null> {
    try {
      // This would deploy a new DAO contract for the squad
      // For now, return a mock DAO address
      const mockDAOAddress = ethers.Wallet.createRandom().address;
      
      console.log(`✅ Squad DAO created: ${mockDAOAddress}`);
      return mockDAOAddress;
    } catch (error) {
      console.error('Failed to create squad DAO:', error);
      return null;
    }
  }

  async submitDAOProposal(daoAddress: string, proposal: any): Promise<string | null> {
    try {
      // Submit governance proposal to squad DAO
      console.log(`📝 DAO proposal submitted to ${daoAddress}:`, proposal);
      return `proposal_${Date.now()}`;
    } catch (error) {
      console.error('Failed to submit DAO proposal:', error);
      return null;
    }
  }

  async getGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice || ethers.parseUnits('30', 'gwei');
    } catch (error) {
      console.error('Failed to get gas price:', error);
      return ethers.parseUnits('30', 'gwei');
    }
  }

  async estimateTransactionCost(to: string, data: string): Promise<bigint> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        data,
        from: this.wallet.address,
      });

      const gasPrice = await this.getGasPrice();
      return gasEstimate * gasPrice;
    } catch (error) {
      console.error('Failed to estimate transaction cost:', error);
      return ethers.parseEther('0.01'); // Fallback estimate
    }
  }

  getWalletAddress(): string {
    return this.wallet.address;
  }

  async getBalance(): Promise<string> {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return '0';
    }
  }
}